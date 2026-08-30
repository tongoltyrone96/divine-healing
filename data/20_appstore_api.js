// Talks to the App Store Connect API.
//
// We have no Mac and no access to Certificates, Identifiers & Profiles in the
// developer portal — that is a separate permission the account holder did not
// grant. The API reaches the same resources with the team key she did create,
// so bundle IDs and signing assets go through here instead.
//
// Run:
//   node data/20_appstore_api.js whoami
//   node data/20_appstore_api.js register-bundle-id com.divinehealing.app "Divine Healing"
//   node data/20_appstore_api.js list-bundle-ids
//
// Note: apps cannot be created through this API — see the create-app case.
//
// Credentials come from divine_healing/.env:
//   APPSTORE_ISSUER_ID, APPSTORE_KEY_ID, APPSTORE_P8_PATH

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { execFileSync } = require('child_process');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const ISSUER = process.env.APPSTORE_ISSUER_ID;
const KEY_ID = process.env.APPSTORE_KEY_ID;
const P8 = process.env.APPSTORE_P8_PATH;

if (!ISSUER || !KEY_ID || !P8) {
  console.error(
    'Missing APPSTORE_ISSUER_ID / APPSTORE_KEY_ID / APPSTORE_P8_PATH in ' +
      'divine_healing/.env',
  );
  process.exit(1);
}

const BASE = 'https://api.appstoreconnect.apple.com';
const BUNDLE_ID = 'com.divinehealing.app';

/// Apple wants an ES256 JWT, and specifically the JOSE signature form — a bare
/// r||s pair. Node signs EC keys as DER by default, which Apple rejects as
/// malformed with no explanation, so the encoding has to be stated.
function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = {
    iss: ISSUER,
    iat: now,
    exp: now + 15 * 60, // Apple caps this at 20 minutes.
    aud: 'appstoreconnect-v1',
  };
  const b64 = (o) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const signature = crypto
    .sign('sha256', Buffer.from(signingInput), {
      key: fs.readFileSync(P8),
      dsaEncoding: 'ieee-p1363',
    })
    .toString('base64url');
  return `${signingInput}.${signature}`;
}

async function api(method, endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Apple returns HTML for some auth failures.
  }
  if (!res.ok) {
    const detail =
      json?.errors?.map((e) => `${e.title}: ${e.detail}`).join('; ') ||
      text.slice(0, 300);
    throw new Error(`HTTP ${res.status} — ${detail}`);
  }
  return json;
}

const [, , command, ...args] = process.argv;

(async () => {
  switch (command) {
    case 'whoami': {
      // Any authenticated read proves the key, the issuer and the signature
      // format all line up.
      const apps = await api('GET', '/v1/apps?limit=10');
      console.log(`Authenticated. ${apps.data.length} app(s) on the team:`);
      for (const app of apps.data) {
        console.log(
          `  ${app.attributes.bundleId}  ${app.attributes.name}`,
        );
      }
      if (!apps.data.length) console.log('  (none yet)');
      break;
    }

    case 'list-bundle-ids': {
      const ids = await api('GET', '/v1/bundleIds?limit=200');
      console.log(`${ids.data.length} bundle ID(s):`);
      for (const b of ids.data) {
        console.log(
          `  ${b.attributes.identifier.padEnd(34)} ${b.attributes.name}`,
        );
      }
      break;
    }

    case 'register-bundle-id': {
      const [identifier, name] = args;
      if (!identifier || !name) {
        console.error(
          'usage: register-bundle-id <com.example.app> "<Display Name>"',
        );
        process.exit(1);
      }
      const existing = await api(
        'GET',
        `/v1/bundleIds?filter[identifier]=${encodeURIComponent(identifier)}`,
      );
      if (existing.data.length) {
        console.log(`Already registered: ${identifier}`);
        break;
      }
      const created = await api('POST', '/v1/bundleIds', {
        data: {
          type: 'bundleIds',
          attributes: { identifier, name, platform: 'IOS' },
        },
      });
      console.log(
        `Registered ${created.data.attributes.identifier} ` +
          `(id ${created.data.id})`,
      );
      break;
    }

    case 'list-certificates': {
      const c = await api('GET', '/v1/certificates?limit=200');
      console.log(`${c.data.length} certificate(s):`);
      for (const x of c.data) {
        const a = x.attributes;
        console.log(
          `  ${a.certificateType.padEnd(26)} ${a.name} ` +
            `(expires ${a.expirationDate.slice(0, 10)})`,
        );
      }
      if (!c.data.length) console.log('  (none)');
      break;
    }

    case 'list-profiles': {
      const c = await api('GET', '/v1/profiles?limit=200');
      console.log(`${c.data.length} profile(s):`);
      for (const x of c.data) {
        const a = x.attributes;
        console.log(
          `  ${a.profileType.padEnd(22)} ${a.profileState.padEnd(8)} ${a.name}`,
        );
      }
      if (!c.data.length) console.log('  (none)');
      break;
    }

    case 'get': {
      // Escape hatch for endpoints that have not earned a command yet.
      //   node data/20_appstore_api.js get '/v1/builds?limit=5'
      if (!args[0]) {
        console.error("usage: get '/v1/<endpoint>'");
        process.exit(1);
      }
      console.log(JSON.stringify(await api('GET', args[0]), null, 2));
      break;
    }

    case 'list-builds': {
      // Processing takes a few minutes after altool reports success, and a
      // build is not testable until it leaves PROCESSING.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      if (!app.data.length) throw new Error('No app record for ' + BUNDLE_ID);
      const builds = await api('GET',
        '/v1/builds?filter[app]=' + app.data[0].id + '&limit=10');
      console.log(app.data[0].attributes.name + ' — ' +
        builds.data.length + ' build(s):');
      for (const b of builds.data) {
        const a = b.attributes;
        console.log('  build ' + String(a.version).padEnd(6) +
          a.processingState.padEnd(12) +
          'uploaded ' + a.uploadedDate.slice(0, 16).replace('T', ' '));
      }
      if (!builds.data.length) console.log('  (none yet)');
      break;
    }

    case 'refresh-profile': {
      // A provisioning profile is a snapshot of the bundle ID's capabilities
      // at the moment it was created. Turning a capability on does nothing to
      // profiles that already exist, so anything signed with the old one is
      // rejected for claiming an entitlement the profile does not carry.
      // Run this after changing capabilities, then replace APPSTORE_PROFILE.
      const identifier = args[0] || BUNDLE_ID;
      const capability = args[1] || 'APPLE_ID_AUTH'; // Sign in with Apple
      const out = path.join(__dirname, '..', 'divine_healing', '.signing');
      fs.mkdirSync(out, { recursive: true });

      const bundle = await api('GET',
        '/v1/bundleIds?filter[identifier]=' + encodeURIComponent(identifier));
      if (!bundle.data.length) {
        throw new Error('Bundle ID not registered: ' + identifier);
      }
      const bundleDbId = bundle.data[0].id;

      const caps = await api('GET',
        '/v1/bundleIds/' + bundleDbId + '/bundleIdCapabilities');
      const have = caps.data.map((c) => c.attributes.capabilityType);
      if (have.includes(capability)) {
        console.log(capability + ' already enabled.');
      } else {
        await api('POST', '/v1/bundleIdCapabilities', {
          data: {
            type: 'bundleIdCapabilities',
            attributes: {
              capabilityType: capability,
              // Apple refuses the capability without one: "Please select at
              // least one configuration for Sign In with Apple." This is the
              // primary-app choice, which is what a standalone app wants —
              // the alternative groups it under another app's consent.
              settings: capability === 'APPLE_ID_AUTH'
                ? [{
                    key: 'APPLE_ID_AUTH_APP_CONSENT',
                    options: [{ key: 'PRIMARY_APP_CONSENT' }],
                  }]
                : undefined,
            },
            relationships: {
              bundleId: { data: { type: 'bundleIds', id: bundleDbId } },
            },
          },
        });
        console.log('Enabled ' + capability + ' on ' + identifier);
      }

      const certs = await api('GET',
        '/v1/certificates?filter[certificateType]=DISTRIBUTION');
      if (!certs.data.length) {
        throw new Error('No distribution certificate. Run create-distribution.');
      }

      const name = 'Divine Healing App Store';
      const existing = await api('GET', '/v1/profiles?limit=200');
      for (const pr of existing.data) {
        if (pr.attributes.name === name) {
          await api('DELETE', '/v1/profiles/' + pr.id);
        }
      }
      const profile = await api('POST', '/v1/profiles', {
        data: {
          type: 'profiles',
          attributes: { name, profileType: 'IOS_APP_STORE' },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundleDbId } },
            certificates: {
              data: [{ type: 'certificates', id: certs.data[0].id }],
            },
          },
        },
      });
      fs.writeFileSync(path.join(out, 'profile.mobileprovision'),
        Buffer.from(profile.data.attributes.profileContent, 'base64'));

      console.log('Profile reissued: ' + profile.data.attributes.name +
        '  (' + profile.data.attributes.uuid + ')');
      console.log('Now update the secret:');
      console.log('  base64 -w0 divine_healing/.signing/' +
        'profile.mobileprovision | gh secret set APPSTORE_PROFILE');
      break;
    }

    case 'create-distribution': {
      // Builds everything needed to sign for the App Store, without a Mac.
      //
      // Xcode's automatic signing was tried first and kept asking Apple for a
      // *development* profile, which enumerates permitted devices — this team
      // has none, so every archive failed. It also littered the account with
      // two stray development certificates. Creating the distribution pair
      // explicitly removes the guesswork: CI signs with exactly these.
      const identifier = args[0] || 'com.divinehealing.app';
      const out = path.join(__dirname, '..', 'divine_healing', '.signing');
      fs.mkdirSync(out, { recursive: true });
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dh-signing-'));
      const at = (f) => path.join(tmp, f);
      const openssl = (a) => execFileSync('openssl', a, { stdio: 'pipe' });

      // 1. A key that never leaves here, and the request Apple signs.
      openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes',
        '-keyout', at('key.pem'), '-out', at('csr.pem'),
        '-subj', '/CN=Divine Healing Distribution/O=Strawberry Hope/C=AU']);

      // 2. Apple only ever holds the public half.
      let cert;
      const existing = await api(
        'GET', '/v1/certificates?filter[certificateType]=DISTRIBUTION');
      if (existing.data.length) {
        // A certificate cannot be re-downloaded with its private key, and the
        // key here is new, so an existing one is useless to us. Apple allows
        // very few distribution certificates, hence the explicit stop.
        throw new Error(
          'A distribution certificate already exists (' +
            existing.data[0].attributes.name + '). Its private key is not on ' +
            'this machine. Revoke it in App Store Connect -> Certificates, ' +
            'then re-run — or recover the original .p12.');
      }
      cert = await api('POST', '/v1/certificates', {
        data: {
          type: 'certificates',
          attributes: {
            certificateType: 'DISTRIBUTION',
            csrContent: fs.readFileSync(at('csr.pem'), 'utf8'),
          },
        },
      });
      fs.writeFileSync(at('cert.cer'),
        Buffer.from(cert.data.attributes.certificateContent, 'base64'));
      openssl(['x509', '-inform', 'DER', '-in', at('cert.cer'),
        '-out', at('cert.pem')]);

      // 3. Certificate plus private key, in the one format a keychain imports.
      // The old PBE algorithms are named on purpose: OpenSSL 3 defaults to
      // AES-256 with PBKDF2, which some `security import` builds still refuse.
      const password = crypto.randomBytes(16).toString('hex');
      openssl(['pkcs12', '-export', '-legacy',
        '-inkey', at('key.pem'), '-in', at('cert.pem'),
        '-out', at('dist.p12'), '-passout', 'pass:' + password,
        '-name', 'Divine Healing Distribution']);

      // 4. The profile ties bundle ID and certificate together.
      const bundle = await api('GET',
        '/v1/bundleIds?filter[identifier]=' + encodeURIComponent(identifier));
      if (!bundle.data.length) {
        throw new Error('Bundle ID not registered: ' + identifier);
      }
      const name = 'Divine Healing App Store';
      const stale = await api('GET', '/v1/profiles?limit=200');
      for (const pr of stale.data) {
        if (pr.attributes.name === name) {
          // A profile is pinned to a certificate; the old one now points at
          // nothing we hold.
          await api('DELETE', '/v1/profiles/' + pr.id);
        }
      }
      const profile = await api('POST', '/v1/profiles', {
        data: {
          type: 'profiles',
          attributes: { name, profileType: 'IOS_APP_STORE' },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundle.data[0].id } },
            certificates: {
              data: [{ type: 'certificates', id: cert.data.id }],
            },
          },
        },
      });
      fs.writeFileSync(path.join(out, 'dist.p12'),
        fs.readFileSync(at('dist.p12')));
      fs.writeFileSync(path.join(out, 'profile.mobileprovision'),
        Buffer.from(profile.data.attributes.profileContent, 'base64'));
      fs.writeFileSync(path.join(out, 'password.txt'), password);
      fs.rmSync(tmp, { recursive: true, force: true });

      console.log('Distribution certificate and profile created.');
      console.log('  certificate  ' + cert.data.attributes.name);
      console.log('  expires      ' +
        cert.data.attributes.expirationDate.slice(0, 10));
      console.log('  profile      ' + profile.data.attributes.name +
        '  (' + profile.data.attributes.uuid + ')');
      console.log('  written to   divine_healing/.signing/  — gitignored');
      break;
    }

    case 'create-app': {
      // Apple refuses this, and the refusal is worth keeping so nobody
      // spends another hour on it:
      //   HTTP 403 — The resource 'apps' does not allow 'CREATE'.
      //   Allowed operations are: GET_COLLECTION, GET_INSTANCE, UPDATE
      // Not a permissions problem — the API simply has no app-creation
      // endpoint. The record has to be made in the browser, once, and
      // everything after it (builds, TestFlight, metadata) is scriptable.
      console.log(
        'The App Store Connect API cannot create apps. Create the record at\n' +
          '  https://appstoreconnect.apple.com/apps  ->  +  ->  New App\n' +
          'The bundle ID is already registered, so it appears in the dropdown.',
      );
      break;
    }

    default:
      console.error(
        'commands: whoami | list-bundle-ids | register-bundle-id <id> <name>\n' +
          '          list-certificates | list-profiles | create-distribution\n' +
          '          list-builds | refresh-profile | get <endpoint>',
      );
      process.exit(1);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

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
// Credentials come from divine_healing/.env:
//   APPSTORE_ISSUER_ID, APPSTORE_KEY_ID, APPSTORE_P8_PATH

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

    default:
      console.error(
        'commands: whoami | list-bundle-ids | register-bundle-id <id> <name>',
      );
      process.exit(1);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

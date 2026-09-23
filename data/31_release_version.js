// Releases an approved version to the App Store.
//
//   node data/31_release_version.js          # shows what it would release
//   node data/31_release_version.js --apply
//
// The app is set to manual release, so Apple approving a version leaves it
// in PENDING_DEVELOPER_RELEASE and invisible to everyone. This is the press
// of the button — an appStoreVersionReleaseRequest, which is the one thing
// in the submission path the API does allow, unlike submitting and
// resubmitting.
//
// It is not reversible in the ordinary sense. Pulling an app back means
// removing it from sale, which is a different and more visible act than
// never having released it, so this refuses to run without --apply.

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const ISSUER = process.env.APPSTORE_ISSUER_ID;
const KEY_ID = process.env.APPSTORE_KEY_ID;
const P8 = process.env.APPSTORE_P8_PATH;
const BUNDLE_ID = 'com.divinehealing.app';
const BASE = 'https://api.appstoreconnect.apple.com';
const APPLY = process.argv.includes('--apply');

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }) +
    '.' +
    // 15 minutes, not Apple's 20-minute cap: the boundary is rejected, and
    // it says so as "credentials are missing or invalid".
    b64url({ iss: ISSUER, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' });
  const sig = crypto
    .sign('sha256', Buffer.from(unsigned), {
      key: fs.readFileSync(P8),
      dsaEncoding: 'ieee-p1363',
    })
    .toString('base64url');
  return unsigned + '.' + sig;
}

async function api(method, url, body) {
  const res = await fetch(url.startsWith('http') ? url : BASE + url, {
    method,
    headers: {
      authorization: 'Bearer ' + token(),
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

(async () => {
  const app = await api('GET', '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
  const appId = app.data[0].id;

  const versions = await api('GET', '/v1/apps/' + appId
    + '/appStoreVersions?limit=1&fields[appStoreVersions]=versionString,appStoreState'
    + '&include=build&fields[builds]=version');
  const version = versions.data[0];
  const build = (versions.included || []).find((i) => i.type === 'builds');

  console.log('  version   ' + version.attributes.versionString
    + '  build ' + (build ? build.attributes.version : '?'));
  console.log('  state     ' + version.attributes.appStoreState);

  if (version.attributes.appStoreState !== 'PENDING_DEVELOPER_RELEASE') {
    throw new Error('Not awaiting release — nothing to do.');
  }

  if (!APPLY) {
    console.log('');
    console.log('Dry run. Re-run with --apply to put this on the App Store.');
    return;
  }

  await api('POST', '/v1/appStoreVersionReleaseRequests', {
    data: {
      type: 'appStoreVersionReleaseRequests',
      relationships: {
        appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } },
      },
    },
  });

  const after = await api('GET', '/v1/appStoreVersions/' + version.id
    + '?fields[appStoreVersions]=appStoreState');
  console.log('  released  -> ' + after.data.attributes.appStoreState);
  console.log('');
  console.log('Apple propagates to the store within a few hours.');
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

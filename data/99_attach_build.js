// One-off: attach a specific build to the app's current App Store version.
// Needed when a REJECTED version still has an old build attached and a
// newer, already-verified build should go up for the next review instead.
//
//   node data/99_attach_build.js <buildVersion>

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const ISSUER = process.env.APPSTORE_ISSUER_ID;
const KEY_ID = process.env.APPSTORE_KEY_ID;
const P8 = process.env.APPSTORE_P8_PATH;
const PRIVATE_KEY = fs.readFileSync(P8, 'utf8');
const BUNDLE_ID = 'com.divinehealing.app';
const BASE = 'https://api.appstoreconnect.apple.com';
const TARGET_VERSION = process.argv[2];

if (!TARGET_VERSION) {
  console.error('Usage: node data/99_attach_build.js <buildVersion>');
  process.exit(1);
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }) +
    '.' +
    b64url({ iss: ISSUER, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' });
  const sig = crypto
    .createSign('SHA256')
    .update(unsigned)
    .sign({ key: PRIVATE_KEY, dsaEncoding: 'ieee-p1363' })
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
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${text}`);
  return text ? JSON.parse(text) : {};
}

(async () => {
  const app = await api('GET', '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
  const appId = app.data[0].id;

  const versions = await api('GET', '/v1/apps/' + appId
    + '/appStoreVersions?limit=1&fields[appStoreVersions]=versionString,appStoreState');
  const version = versions.data[0];
  console.log('version ' + version.attributes.versionString + '  '
    + version.attributes.appStoreState);

  const builds = await api('GET', '/v1/builds?filter[app]=' + appId
    + '&filter[version]=' + encodeURIComponent(TARGET_VERSION));
  const build = builds.data[0];
  if (!build) throw new Error('Build ' + TARGET_VERSION + ' not found');
  console.log('build   ' + build.attributes.version + '  ' + build.attributes.processingState);

  await api('PATCH', '/v1/appStoreVersions/' + version.id, {
    data: {
      type: 'appStoreVersions',
      id: version.id,
      relationships: {
        build: { data: { type: 'builds', id: build.id } },
      },
    },
  });
  console.log('  attached build ' + TARGET_VERSION + ' to version ' + version.attributes.versionString);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

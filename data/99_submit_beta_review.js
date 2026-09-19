// One-off: attach a specific build to the "Public Link" TestFlight group and
// submit it for Beta App Review. Reuses the same auth as 20_appstore_api.js
// but skips touching betaAppReviewDetails/betaAppLocalizations, which are
// already set from the 2026-09-04 external-group run and unchanged.
//
//   node data/99_submit_beta_review.js <buildVersion>

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const ISSUER = process.env.APPSTORE_ISSUER_ID;
const KEY_ID = process.env.APPSTORE_KEY_ID;
const P8 = process.env.APPSTORE_P8_PATH;
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync(P8, 'utf8');
const BUNDLE_ID = 'com.divinehealing.app';
const BASE = 'https://api.appstoreconnect.apple.com';
const TARGET_VERSION = process.argv[2];

if (!TARGET_VERSION) {
  console.error('Usage: node data/99_submit_beta_review.js <buildVersion>');
  process.exit(1);
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }) +
    '.' +
    b64url({
      iss: ISSUER,
      iat: now,
      // Apple caps this at 20 minutes and rejects the boundary: exactly 1200
      // came back as "credentials are missing or invalid", which reads as a
      // bad key rather than as a clock.
      exp: now + 15 * 60,
      aud: 'appstoreconnect-v1',
    });
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

  const groups = await api('GET', '/v1/betaGroups?limit=200');
  const group = groups.data.find((g) => g.attributes.name === 'Public Link');
  if (!group) throw new Error('Public Link group not found');
  console.log('group   ' + group.id + '  ' + (group.attributes.publicLink || '(pending)'));

  const builds = await api('GET', '/v1/builds?filter[app]=' + appId
    + '&filter[version]=' + encodeURIComponent(TARGET_VERSION));
  const build = builds.data[0];
  if (!build) throw new Error('Build ' + TARGET_VERSION + ' not found');
  console.log('build   ' + build.attributes.version + '  ' + build.attributes.processingState);

  try {
    await api('POST', '/v1/betaGroups/' + group.id + '/relationships/builds', {
      data: [{ type: 'builds', id: build.id }],
    });
    console.log('  attached to Public Link group');
  } catch (e) {
    console.log('  attach: ' + e.message);
  }

  try {
    await api('POST', '/v1/betaAppReviewSubmissions', {
      data: {
        type: 'betaAppReviewSubmissions',
        relationships: { build: { data: { type: 'builds', id: build.id } } },
      },
    });
    console.log('  submitted for Beta App Review');
  } catch (e) {
    console.log('  submit: ' + e.message);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

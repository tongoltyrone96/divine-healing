// Uploads the release bundle to a Play track with the service account.
//
//   node data/25_play_upload.js                 # shows what it would do
//   node data/25_play_upload.js --apply
//   node data/25_play_upload.js --apply --track alpha
//
// Play's publishing API works through an "edit": open one, make changes,
// commit. Nothing is visible until the commit, and an abandoned edit costs
// nothing, so the dry run opens one and throws it away.
//
// The bundle must be signed with the upload key, which is what
// automation/wsl/03_build_android.sh does. Play never reuses a versionCode,
// so bump `version:` in pubspec before rebuilding.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const KEY = path.join(ROOT, 'divine_healing', '.signing', 'play-service-account.json');
const AAB = path.join(
  ROOT, 'divine_healing', 'build', 'app', 'outputs', 'bundle', 'release',
  'app-release.aab',
);
const PACKAGE = 'com.divinehealing.app';
const BASE = 'https://androidpublisher.googleapis.com';

const APPLY = process.argv.includes('--apply');
const trackFlag = process.argv.indexOf('--track');
const TRACK = trackFlag !== -1 ? process.argv[trackFlag + 1] : 'internal';

for (const f of [KEY, AAB]) {
  if (!fs.existsSync(f)) {
    console.error('Missing: ' + f);
    process.exit(1);
  }
}
const key = JSON.parse(fs.readFileSync(KEY, 'utf8'));

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    b64({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    });
  const sig = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(key.private_key)
    .toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + sig,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error_description || JSON.stringify(body));
  return body.access_token;
}

let ACCESS;

async function api(method, url, body, contentType) {
  const res = await fetch(url.startsWith('http') ? url : BASE + url, {
    method,
    headers: {
      authorization: 'Bearer ' + ACCESS,
      ...(contentType ? { 'content-type': contentType } : {}),
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text).error.message; } catch { /* keep the raw body */ }
    // Play answers 403 both for a missing permission and for a rejected
    // artifact, so the hint is only useful when the message says nothing.
    if (res.status === 403 && /does not have permission/i.test(msg)) {
      msg += '\n\nThe service account cannot publish. In Play Console ->' +
        '\nUsers and permissions -> ' + key.client_email +
        '\n-> App permissions -> Divine Healing -> tick' +
        '\n   "Release apps to testing tracks"';
    }
    throw new Error(`HTTP ${res.status} — ${msg}`);
  }
  return text ? JSON.parse(text) : {};
}

(async () => {
  const size = fs.statSync(AAB).size;
  console.log(APPLY ? 'Applying.' : 'Dry run — the edit is discarded.');
  console.log(`  bundle   ${path.relative(ROOT, AAB)}  ${(size / 1e6).toFixed(1)} MB`);
  console.log(`  package  ${PACKAGE}`);
  console.log(`  track    ${TRACK}`);
  console.log('');

  ACCESS = await token();
  const edit = await api('POST', `/androidpublisher/v3/applications/${PACKAGE}/edits`);
  console.log('  edit opened      ' + edit.id);

  if (!APPLY) {
    await api('DELETE', `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}`);
    console.log('  edit discarded');
    console.log('');
    console.log('Re-run with --apply to upload.');
    return;
  }

  console.log('  uploading…       (66 MB, slow on a throttled link)');
  const bundle = await api(
    'POST',
    `${BASE}/upload/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}/bundles?uploadType=media`,
    fs.readFileSync(AAB),
    'application/octet-stream',
  );
  console.log('  uploaded         versionCode ' + bundle.versionCode);

  await api(
    'PUT',
    `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}/tracks/${TRACK}`,
    JSON.stringify({
      track: TRACK,
      releases: [{ versionCodes: [String(bundle.versionCode)], status: 'completed' }],
    }),
    'application/json',
  );
  console.log('  assigned         ' + TRACK);

  await api('POST', `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}:commit`);
  console.log('  committed');
  console.log('');
  console.log('Live on the ' + TRACK + ' track. Testers get it within minutes.');
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

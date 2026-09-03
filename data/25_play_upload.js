// Uploads the release bundle to a Play track with the service account.
//
//   node data/25_play_upload.js                 # shows what it would do
//   node data/25_play_upload.js --apply
//   node data/25_play_upload.js --apply --track alpha
//   node data/25_play_upload.js --apply --track alpha --promote 5
//
// --promote puts a bundle Play already holds onto another track. Play never
// reuses a version code, so re-uploading the same build to a second track is
// refused; the bundle only has to be uploaded once.
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
const promoteFlag = process.argv.indexOf('--promote');
const PROMOTE = promoteFlag !== -1 ? process.argv[promoteFlag + 1] : null;

for (const f of PROMOTE ? [KEY] : [KEY, AAB]) {
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
  console.log(APPLY ? 'Applying.' : 'Dry run — the edit is discarded.');
  if (PROMOTE) {
    console.log(`  promote  versionCode ${PROMOTE}, already uploaded`);
  } else {
    const size = fs.statSync(AAB).size;
    console.log(`  bundle   ${path.relative(ROOT, AAB)}  ${(size / 1e6).toFixed(1)} MB`);
  }
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

  let versionCode = PROMOTE;
  if (!PROMOTE) {
    console.log('  uploading…       (66 MB, slow on a throttled link)');
    const bundle = await api(
      'POST',
      `${BASE}/upload/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}/bundles?uploadType=media`,
      fs.readFileSync(AAB),
      'application/octet-stream',
    );
    versionCode = bundle.versionCode;
    console.log('  uploaded         versionCode ' + versionCode);
  }

  // An app that has never been published is a draft, and Play accepts only
  // draft releases on a closed track until it has been reviewed — internal
  // testing is the exception, which is why that track took 'completed'.
  const assign = (status) =>
    api(
      'PUT',
      `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}/tracks/${TRACK}`,
      JSON.stringify({
        track: TRACK,
        releases: [{ versionCodes: [String(versionCode)], status }],
      }),
      'application/json',
    );

  const commit = () =>
    api('POST', `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}:commit`);

  // The refusal comes from the commit, not from the assignment, so the track
  // has to be rewritten inside the same edit and committed again.
  let status = 'completed';
  await assign(status);
  try {
    await commit();
  } catch (e) {
    if (!/status draft may be created on draft app/i.test(e.message)) throw e;
    status = 'draft';
    await assign(status);
    await commit();
  }
  console.log('  committed        ' + TRACK + '  (' + status + ')');
  console.log('');
  if (status === 'draft') {
    console.log('The app has never been published, so Play will only take a');
    console.log('draft release on this track. Testers cannot install it until');
    console.log('the app itself has been through review: Play Console ->');
    console.log('Publishing overview -> Send app for review.');
  } else {
    console.log('Live on the ' + TRACK + ' track. Testers get it within minutes.');
  }
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

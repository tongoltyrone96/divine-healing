// Replaces the Play listing screenshots.
//
//   node data/26_play_screenshots_upload.js            # shows what it would do
//   node data/26_play_screenshots_upload.js --apply
//
// Play keeps a separate set per form factor and treats them as required, so
// the tablet shots are not optional decoration. The 9:16 tablet capture goes
// into both tablet slots: it is inside the 7-inch and the 10-inch ranges, and
// Play accepts the same image in both.
//
// Needs `Manage store presence` on the service account — the same permission
// the listing text needs, which is not among the ones RevenueCat asks for.
//
// That is enough to upload but not to commit: the commit is a publish, and
// Play refuses it with a bare 403 after all twelve images have gone up
// successfully. Granting `Release to production` would fix it and is far more
// than swapping screenshots is worth, so this waits for a console pass or a
// deliberate decision to widen the grant.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const KEY = path.join(ROOT, 'divine_healing', '.signing', 'play-service-account.json');
const PACKAGE = 'com.divinehealing.app';
const BASE = 'https://androidpublisher.googleapis.com';
const APPLY = process.argv.includes('--apply');

// Play's own names for the slots, and where our captures live.
const SETS = [
  { type: 'phoneScreenshots', dir: path.join(ROOT, 'store', 'play') },
  { type: 'sevenInchScreenshots', dir: path.join(ROOT, 'store', 'play', 'tablet') },
  { type: 'tenInchScreenshots', dir: path.join(ROOT, 'store', 'play', 'tablet') },
];

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
    try { msg = JSON.parse(text).error.message; } catch { /* keep the body */ }
    if (res.status === 403) {
      msg += '\n\nThe service account needs "Manage store presence" on the app.';
    }
    throw new Error(`HTTP ${res.status} — ${msg}`);
  }
  return text ? JSON.parse(text) : {};
}

const shots = (dir) =>
  fs.readdirSync(dir)
    .filter((f) => /^\d\d-.*\.png$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));

(async () => {
  console.log(APPLY ? 'Applying.' : 'Dry run — the edit is discarded.');
  for (const set of SETS) {
    const files = shots(set.dir);
    console.log(`  ${set.type.padEnd(22)} ${files.length} image(s) from ` +
      path.relative(ROOT, set.dir));
  }
  console.log('');

  ACCESS = await token();
  const edit = await api('POST',
    `/androidpublisher/v3/applications/${PACKAGE}/edits`);

  if (!APPLY) {
    await api('DELETE',
      `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}`);
    console.log('Re-run with --apply to replace them.');
    return;
  }

  for (const set of SETS) {
    // Under listings, not images. Google's own reference documents the
    // deleteall and upload paths as /edits/{id}/images/{lang}/{type}, and
    // that route does not exist — it answers with an HTML 404 rather than an
    // API error, which reads like the app or the edit is wrong.
    const base = `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}` +
      `/listings/en-US/${set.type}`;
    // Play appends rather than replaces, and the slots have a limit of eight,
    // so the old set has to go first.
    await api('DELETE', base);
    for (const file of shots(set.dir)) {
      await api(
        'POST',
        `${BASE}/upload${base}?uploadType=media`,
        fs.readFileSync(file),
        'image/png',
      );
      console.log(`  uploaded  ${set.type}  ${path.basename(file)}`);
    }
  }

  await api('POST',
    `/androidpublisher/v3/applications/${PACKAGE}/edits/${edit.id}:commit`);
  console.log('');
  console.log('Committed. Play reviews listing changes before they show.');
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

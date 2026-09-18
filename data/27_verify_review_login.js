// Proves the reviewer's own sign-in path still works.
//
//   node data/27_verify_review_login.js <password>
//
// Apple rejected build 23 under 2.1(a) — "an error message was displayed
// when we tapped on login button" — because appreview@divinehealing.app had
// stopped existing in Supabase auth. The credentials in both store consoles
// were still the old ones, so the reviewer got "Invalid login credentials",
// which the app rendered as a generic failure. Nothing on our side noticed,
// because nothing had ever checked.
//
// This checks the same three things the reviewer depends on, over the public
// anon key rather than the admin key, so it exercises the real path:
//
//   1. the password grant succeeds
//   2. sh_has_full_access() returns true for that session
//   3. a paid session's audio actually signs
//
// Run it before every submission that carries reviewer credentials.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const EMAIL = 'appreview@divinehealing.app';
const PASSWORD = process.argv[2];

if (!URL || !ANON) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in divine_healing/.env');
  process.exit(1);
}
if (!PASSWORD) {
  console.error('Usage: node data/27_verify_review_login.js <password>');
  console.error('The password is printed by 23_make_review_account.js --apply');
  process.exit(1);
}

(async () => {
  // 1. The password grant — exactly what AuthService.signInWithPassword does.
  const auth = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const session = await auth.json();
  if (!auth.ok) {
    console.error(`  sign in         FAILED — ${session.error_description || session.msg || auth.status}`);
    console.error('');
    console.error('This is what the reviewer sees. Re-run');
    console.error('data/23_make_review_account.js --apply and update both consoles.');
    process.exit(1);
  }
  const token = session.access_token;
  console.log(`  sign in         ok as ${session.user.email}`);

  // 2. The entitlement the Storage policies read.
  const rpc = await fetch(`${URL}/rest/v1/rpc/sh_has_full_access`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: '{}',
  });
  const hasAccess = await rpc.json();
  console.log(`  full access     ${hasAccess === true ? 'true' : 'FALSE — the paywall would hold them out'}`);
  if (hasAccess !== true) process.exit(1);

  // 3. A paid session's audio. Signing is the thing that actually has to
  //    work; the entitlement being true only implies it.
  const paid = await fetch(
    `${URL}/rest/v1/sh_content?select=title,content_body&is_preview=eq.false&content_body=not.is.null&limit=1`,
    { headers: { apikey: ANON, authorization: `Bearer ${token}` } },
  );
  const rows = await paid.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log('  paid audio      no paid row with audio found — skipped');
    return;
  }
  const { title, content_body: objectPath } = rows[0];
  const signed = await fetch(
    `${URL}/storage/v1/object/sign/sh-audio/${encodeURI(objectPath)}`,
    {
      method: 'POST',
      headers: {
        apikey: ANON,
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 60 }),
    },
  );
  console.log(
    `  paid audio      ${signed.ok ? 'signs' : 'REFUSED (' + signed.status + ')'}  — ${title}`,
  );
  if (!signed.ok) process.exit(1);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

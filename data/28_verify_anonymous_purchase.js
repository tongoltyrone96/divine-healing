// Checks the path a guest takes, which App Review's 5.1.1(v) rejection
// forced into existence: buy without an account, and still be held out of
// the paid audio until the purchase lands.
//
//   node data/28_verify_anonymous_purchase.js
//
// Four things, in the order they have to hold:
//
//   1. an anonymous session comes up at all
//   2. it has a uid and no email — nothing personal was collected
//   3. sh_has_full_access() is false for it, and a paid session refuses to
//      sign. The paywall has to survive the change that let guests in.
//   4. a free preview still signs, because that is what a guest came for
//
// It writes nothing. The purchase half cannot be exercised from here — it
// needs a real store transaction — but everything around it can.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;

if (!URL || !ANON) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in divine_healing/.env');
  process.exit(1);
}

const headers = (token) => ({
  apikey: ANON,
  authorization: `Bearer ${token ?? ANON}`,
  'content-type': 'application/json',
});

async function signAudio(token, objectPath) {
  const res = await fetch(
    `${URL}/storage/v1/object/sign/sh-audio/${encodeURI(objectPath)}`,
    { method: 'POST', headers: headers(token), body: JSON.stringify({ expiresIn: 60 }) },
  );
  return res.ok;
}

let failed = false;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failed = true;
}

(async () => {
  // 1. The session the app opens on launch.
  const res = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: '{}', // no email, no password — this is what signInAnonymously sends
  });
  const session = await res.json();
  if (!res.ok || !session.access_token) {
    check('anonymous sign-in', false,
      session.error_description || session.msg || `HTTP ${res.status}`);
    console.error('');
    console.error('Enable Authentication -> Providers -> Allow anonymous sign-ins.');
    process.exit(1);
  }
  const token = session.access_token;
  const user = session.user ?? {};
  check('anonymous sign-in', true, user.id);

  // 2. A uid, and nothing about the person.
  check('is anonymous, no email', user.is_anonymous === true && !user.email,
    `is_anonymous=${user.is_anonymous} email=${user.email ?? 'none'}`);

  // 3. The paywall still holds. This is the one that matters: the migration
  //    widened sh_has_full_access() to accept a uid, and widening it wrongly
  //    would hand the whole library to every guest.
  const rpc = await fetch(`${URL}/rest/v1/rpc/sh_has_full_access`, {
    method: 'POST', headers: headers(token), body: '{}',
  });
  const entitled = await rpc.json();
  check('no entitlement before paying', entitled === false, `returned ${entitled}`);

  const paid = await fetch(
    `${URL}/rest/v1/sh_content?select=title,content_body&is_preview=eq.false&content_body=not.is.null&limit=1`,
    { headers: headers(token) },
  );
  const paidRows = await paid.json();
  if (Array.isArray(paidRows) && paidRows.length) {
    const ok = !(await signAudio(token, paidRows[0].content_body));
    check('paid audio refused', ok, paidRows[0].title);
  }

  // 4. And the free tier still works, or a guest has nothing to listen to.
  const free = await fetch(
    `${URL}/rest/v1/sh_content?select=title,content_body&is_preview=eq.true&content_body=not.is.null&limit=1`,
    { headers: headers(token) },
  );
  const freeRows = await free.json();
  if (Array.isArray(freeRows) && freeRows.length) {
    const ok = await signAudio(token, freeRows[0].content_body);
    check('free preview signs', ok, freeRows[0].title);
  }

  console.log('');
  console.log(failed ? 'Something above is wrong.' : 'Guest path is sound.');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

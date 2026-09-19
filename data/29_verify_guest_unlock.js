// Proves that paying unlocks the library for someone who never registered.
//
//   node data/29_verify_guest_unlock.js
//
// 28_verify_anonymous_purchase.js checks the half that must stay shut: a
// guest with no purchase is refused the paid audio. This checks the half
// that must open. Between them they bracket the change App Review's
// 5.1.1(v) rejection forced — sh_has_full_access() now accepts an auth uid,
// and that has to mean exactly the people who paid and nobody else.
//
// A real store transaction cannot be driven from here, so this writes the
// row the RevenueCat webhook would write — same shape, same columns — and
// then checks what the anonymous session can reach. It deletes the row
// afterwards, including when a check fails partway.
//
// Needs the admin key, unlike 28, which deliberately uses only the anon key.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !ADMIN) {
  console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY / admin key in divine_healing/.env');
  process.exit(1);
}

const db = createClient(URL, ADMIN, { auth: { persistSession: false } });

let failed = false;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failed = true;
}

const headers = (token) => ({
  apikey: ANON,
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
});

async function entitled(token) {
  const r = await fetch(`${URL}/rest/v1/rpc/sh_has_full_access`, {
    method: 'POST', headers: headers(token), body: '{}',
  });
  return r.json();
}

async function signs(token, objectPath) {
  const r = await fetch(
    `${URL}/storage/v1/object/sign/sh-audio/${encodeURI(objectPath)}`,
    { method: 'POST', headers: headers(token), body: JSON.stringify({ expiresIn: 60 }) },
  );
  return r.ok;
}

(async () => {
  // The session the app opens on launch for someone who never signs in.
  const res = await fetch(`${URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: ANON, 'content-type': 'application/json' },
    body: '{}',
  });
  const session = await res.json();
  if (!session.access_token) {
    console.error('Anonymous sign-in failed:', session.error_description || session.msg);
    process.exit(1);
  }
  const token = session.access_token;
  const uid = session.user.id;
  console.log(`  guest uid       ${uid}`);

  const paid = await fetch(
    `${URL}/rest/v1/sh_content?select=title,content_body&is_preview=eq.false&content_body=not.is.null&limit=1`,
    { headers: headers(token) },
  );
  const [session0] = await paid.json();

  try {
    check('locked before paying', (await entitled(token)) === false);

    // What the webhook writes for a purchase carrying no email.
    const { error } = await db.from('sh_subscribers').insert({
      user_id: uid,
      user_email: `${uid}@anonymous.divinehealing.app`,
      subscription_status: 'active',
      plan_name: 'Monthly',
      current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
      store: 'app_store_sandbox',
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    console.log('  wrote the row the webhook would write');

    check('entitled after paying', (await entitled(token)) === true);
    if (session0) {
      check('paid audio signs', await signs(token, session0.content_body),
        session0.title);
    }

    // The Profile screen reads this row directly to show the plan, and only
    // the policy added by the migration lets a guest see their own.
    const own = await fetch(
      `${URL}/rest/v1/sh_subscribers?select=plan_name,subscription_status&user_id=eq.${uid}`,
      { headers: headers(token) },
    );
    const rows = await own.json();
    check('guest can read their own row', Array.isArray(rows) && rows.length === 1,
      JSON.stringify(rows).slice(0, 80));

    // And nobody else's.
    const others = await fetch(
      `${URL}/rest/v1/sh_subscribers?select=user_email&user_id=neq.${uid}`,
      { headers: headers(token) },
    );
    const leak = await others.json();
    check('and nobody else\'s', Array.isArray(leak) && leak.length === 0,
      `saw ${Array.isArray(leak) ? leak.length : '?'} other rows`);
  } finally {
    await db.from('sh_subscribers').delete().eq('user_id', uid);
    const after = await entitled(token);
    check('locked again once the row is gone', after === false);
    // The anonymous auth user itself is left behind deliberately: deleting
    // users is the one thing worth not automating against a live project.
    console.log(`  cleaned up      (auth user ${uid} left in place)`);
  }

  console.log('');
  console.log(failed ? 'Something above is wrong.' : 'Guest purchase unlocks correctly.');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

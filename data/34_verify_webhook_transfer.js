// Proves a guest's purchase follows them when they sign in.
//
//   node data/34_verify_webhook_transfer.js
//
// Signing in does not promote the anonymous Supabase user, it replaces it,
// so a guest who bought and then signed in has a new uid while their row
// still names the old one, and the library is locked for someone who paid.
// Restore Purchases makes RevenueCat move the purchase to the new app user
// id and report a TRANSFER. The webhook used to drop that event.
//
// This posts what RevenueCat would post, against the live function, using
// real throwaway accounts so the receiving side resolves an actual address
// and can sign in to ask sh_has_full_access() itself. Everything it makes is
// deleted at the end, and nothing is charged.
//
// Also covers an address arriving with capitals, which collided with the
// lower(user_email) index from 20260924_01 instead of matching its row.

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
  quiet: true,
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SECRET || !ADMIN) {
  console.error('Need SUPABASE_URL, SUPABASE_ANON_KEY, REVENUECAT_WEBHOOK_SECRET and the admin key in divine_healing/.env');
  process.exit(1);
}

const db = createClient(URL, ADMIN, { auth: { persistSession: false } });
const ENDPOINT = `${URL}/functions/v1/revenuecat-webhook`;

let failed = false;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failed = true;
}

async function post(event) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { authorization: SECRET, 'content-type': 'application/json' },
    body: JSON.stringify({ event: { id: 'evt_' + crypto.randomUUID(), ...event } }),
  });
  return { status: res.status, body: await res.text() };
}

const purchase = (uid, extra = {}) => post({
  type: 'INITIAL_PURCHASE',
  app_user_id: uid,
  product_id: 'com.divinehealing.app.monthly',
  period_type: 'NORMAL',
  store: 'APP_STORE',
  environment: 'SANDBOX',
  expiration_at_ms: Date.now() + 30 * 864e5,
  original_transaction_id: 'txn_' + Date.now(),
  ...extra,
});

const transfer = (from, to) => post({
  type: 'TRANSFER',
  transferred_from: [from],
  transferred_to: [to],
  store: 'APP_STORE',
  environment: 'SANDBOX',
});

const rowsWhere = async (column, value) => {
  const { data, error } = await db
    .from('sh_subscribers')
    .select('id,user_id,user_email,subscription_status,plan_name,store')
    .eq(column, value);
  if (error) throw error;
  return data ?? [];
};

async function makeAccount(label) {
  const email = `transfer-check-${label}-${crypto.randomUUID().slice(0, 8)}@example.com`;
  const password = crypto.randomBytes(18).toString('base64url');
  const { data, error } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

async function hasFullAccess(account) {
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({
    email: account.email, password: account.password,
  });
  if (error) throw error;
  const { data, error: rpcError } = await client.rpc('sh_has_full_access');
  if (rpcError) throw rpcError;
  return data === true;
}

(async () => {
  const guestA = crypto.randomUUID();
  const guestB = crypto.randomUUID();
  const guestC = crypto.randomUUID();
  const made = [];

  try {
    // 1. A guest buys, then signs in to a fresh account and restores.
    console.log('1. guest buys, signs in, restores');
    const plain = await makeAccount('plain');
    made.push(plain);
    check('guest purchase accepted', (await purchase(guestA)).status === 200);
    check('row written against the guest uid', (await rowsWhere('user_id', guestA)).length === 1);
    check('the new account is locked before the transfer', !(await hasFullAccess(plain)));

    const t1 = await transfer(guestA, plain.id);
    check('transfer accepted', t1.status === 200, `HTTP ${t1.status} ${t1.body.slice(0, 80)}`);
    const moved = await rowsWhere('user_id', plain.id);
    check('row now names the signed-in account', moved.length === 1, `${moved.length} rows`);
    check('nothing left on the guest uid', (await rowsWhere('user_id', guestA)).length === 0);
    if (moved[0]) {
      check('real address replaces the synthetic one', moved[0].user_email === plain.email, moved[0].user_email);
      check('still active', moved[0].subscription_status === 'active', moved[0].subscription_status);
    }
    check('the signed-in account can now hear paid sessions', await hasFullAccess(plain));

    // 2. The receiving account already has a row of its own, here a gift.
    console.log('2. receiving account already has a gift row');
    const gifted = await makeAccount('gifted');
    made.push(gifted);
    const { error: giftError } = await db.from('sh_subscribers').insert({
      user_email: gifted.email,
      subscription_status: 'active',
      plan_name: 'Annual',
      current_period_end: new Date(Date.now() + 365 * 864e5).toISOString(),
      store: 'gift',
      updated_at: new Date().toISOString(),
    });
    if (giftError) throw giftError;
    check('guest purchase accepted', (await purchase(guestB)).status === 200);
    const t2 = await transfer(guestB, gifted.id);
    check('transfer accepted', t2.status === 200, `HTTP ${t2.status} ${t2.body.slice(0, 80)}`);
    const merged = await rowsWhere('user_email', gifted.email);
    check('one row for the person, not two', merged.length === 1, `${merged.length} rows`);
    check('that row carries the uid', merged[0]?.user_id === gifted.id, String(merged[0]?.user_id));
    check('nothing left on the guest uid', (await rowsWhere('user_id', guestB)).length === 0);

    // 3. An address arriving with capitals.
    console.log('3. address with capitals');
    const mixed = `Transfer-Check-${guestC.slice(0, 8)}@Example.COM`;
    const p3 = await purchase(guestC, { subscriber_attributes: { $email: { value: mixed } } });
    check('purchase accepted', p3.status === 200, `HTTP ${p3.status} ${p3.body.slice(0, 80)}`);
    const [lowered] = await rowsWhere('user_id', guestC);
    check('stored lower-cased', lowered?.user_email === mixed.toLowerCase(), String(lowered?.user_email));
  } finally {
    for (const uid of [guestA, guestB, guestC]) {
      await db.from('sh_subscribers').delete().eq('user_id', uid);
    }
    for (const account of made) {
      await db.from('sh_subscribers').delete().eq('user_id', account.id);
      await db.from('sh_subscribers').delete().eq('user_email', account.email);
      await db.auth.admin.deleteUser(account.id);
    }
    console.log('  cleaned up      test rows and accounts removed');
  }

  console.log('');
  console.log(failed ? 'Something above is wrong.' : 'A guest\'s purchase follows them when they sign in.');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

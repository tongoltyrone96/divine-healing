// Fires a guest purchase at the deployed webhook and checks what it wrote.
//
//   node data/30_verify_webhook_guest_event.js
//
// The webhook was rewritten for App Review's 5.1.1(v) fix: it keys rows on
// the Supabase uid rather than upserting on user_email, because an anonymous
// buyer has no address. That rewrite had never run — 29 proves the row
// *shape* unlocks the library, but nothing proved the function produces that
// shape from a real event, and the failure mode is the worst one available:
// the store takes the money and the library stays locked.
//
// So this posts the payload RevenueCat would post for a guest, against the
// live function, and then reads the row back. It deletes the row and, unlike
// a real purchase, nothing was charged.
//
// Also covers the bug the rewrite was for: the same buyer signing in later
// starts resolving to a real address, and the old code would have written a
// second row and left the first one claiming `active` forever. The second
// event here carries an email and must land on the same row.

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const SECRET = process.env.REVENUECAT_WEBHOOK_SECRET;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SECRET || !ADMIN) {
  console.error('Need SUPABASE_URL, REVENUECAT_WEBHOOK_SECRET and the admin key in divine_healing/.env');
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
    body: JSON.stringify({ event }),
  });
  return { status: res.status, body: await res.text() };
}

const rowFor = async (uid) => {
  const { data } = await db
    .from('sh_subscribers')
    .select('user_id,user_email,subscription_status,plan_name,store')
    .eq('user_id', uid);
  return data ?? [];
};

(async () => {
  // A uid that looks exactly like an anonymous Supabase user's.
  const uid = crypto.randomUUID();
  console.log(`  guest uid       ${uid}`);

  try {
    // 1. The purchase, with no email anywhere in it.
    const buy = await post({
      type: 'INITIAL_PURCHASE',
      id: 'evt_' + crypto.randomUUID(),
      app_user_id: uid,
      product_id: 'com.divinehealing.app.monthly',
      period_type: 'NORMAL',
      store: 'APP_STORE',
      environment: 'SANDBOX',
      expiration_at_ms: Date.now() + 30 * 864e5,
      original_transaction_id: 'txn_' + Date.now(),
    });
    check('webhook accepted the purchase', buy.status === 200,
      `HTTP ${buy.status} ${buy.body.slice(0, 80)}`);

    const [row] = await rowFor(uid);
    check('row written against the uid', !!row);
    if (row) {
      check('status active', row.subscription_status === 'active', row.subscription_status);
      check('plan resolved', row.plan_name === 'Monthly', String(row.plan_name));
      check('synthetic address, not a real one',
        row.user_email === `${uid}@anonymous.divinehealing.app`, row.user_email);
      check('sandbox marked', row.store === 'app_store_sandbox', String(row.store));
    }

    // 2. The same person signs in later, so RevenueCat now knows an address.
    //    This must update the row it already wrote, not make a second one.
    const email = `guest-check-${uid.slice(0, 8)}@example.com`;
    const renew = await post({
      type: 'RENEWAL',
      id: 'evt_' + crypto.randomUUID(),
      app_user_id: uid,
      product_id: 'com.divinehealing.app.monthly',
      period_type: 'NORMAL',
      store: 'APP_STORE',
      environment: 'SANDBOX',
      expiration_at_ms: Date.now() + 60 * 864e5,
      subscriber_attributes: { $email: { value: email } },
    });
    check('webhook accepted the renewal', renew.status === 200, `HTTP ${renew.status}`);

    const after = await rowFor(uid);
    check('still exactly one row', after.length === 1, `${after.length} rows`);
    check('address filled in on the same row', after[0]?.user_email === email,
      String(after[0]?.user_email));

    // 3. Cancelling has to reach that row, which is the bug the rewrite fixed.
    const expire = await post({
      type: 'EXPIRATION',
      id: 'evt_' + crypto.randomUUID(),
      app_user_id: uid,
      product_id: 'com.divinehealing.app.monthly',
      store: 'APP_STORE',
      environment: 'SANDBOX',
      expiration_at_ms: Date.now() - 1000,
    });
    check('webhook accepted the expiry', expire.status === 200, `HTTP ${expire.status}`);
    const [gone] = await rowFor(uid);
    check('access actually ends', gone?.subscription_status === 'canceled',
      String(gone?.subscription_status));
  } finally {
    await db.from('sh_subscribers').delete().eq('user_id', uid);
    console.log('  cleaned up      test row removed');
  }

  console.log('');
  console.log(failed ? 'Something above is wrong.' : 'Deployed webhook handles a guest purchase.');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

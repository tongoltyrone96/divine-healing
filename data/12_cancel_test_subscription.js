// Emergency cancel for test subscriptions.
//
// After you sign up for a real 7-day trial to verify the webhook works,
// run this script to immediately cancel the subscription. The trial
// coverage means no money changes hands as long as you cancel before day 7,
// but cancelling right away is cleanest.
//
// Usage:
//   node 12_cancel_test_subscription.js <user_email>
//
// Env: reads STRIPE_SECRET_KEY from ../divine_healing/.env

const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}
const stripe = new Stripe(SECRET);

const email = process.argv[2];
if (!email) {
  console.error('Usage: node 12_cancel_test_subscription.js <user_email>');
  process.exit(1);
}

(async () => {
  console.log(`\nSearching Stripe for customer: ${email}\n`);

  // 1. Find customer(s) by email.
  const customers = await stripe.customers.list({ email, limit: 10 });
  if (customers.data.length === 0) {
    console.log('No customer found. Nothing to cancel.');
    return;
  }

  for (const cus of customers.data) {
    console.log(`Customer: ${cus.id}  (${cus.email})`);
    const subs = await stripe.subscriptions.list({
      customer: cus.id,
      status: 'all',
      limit: 10,
    });
    if (subs.data.length === 0) {
      console.log('  (no subscriptions)');
      continue;
    }
    for (const s of subs.data) {
      console.log(`  Subscription: ${s.id}  status=${s.status}`);
      if (s.status === 'canceled') {
        console.log('    already canceled — skipping');
        continue;
      }
      const canceled = await stripe.subscriptions.cancel(s.id);
      console.log(`    ✔ canceled — new status: ${canceled.status}`);
    }
  }

  console.log('\nDone. Webhook should fire customer.subscription.deleted next,');
  console.log('which will update sh_subscribers.subscription_status to "canceled".');
})().catch((e) => { console.error(e); process.exit(1); });

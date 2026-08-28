// Trigger the webhook by making a benign metadata update on the existing
// subscription. This fires customer.subscription.updated, which the newly
// redeployed webhook handler will pick up and upsert into sh_subscribers.
//
// Usage:
//   node 14_trigger_webhook_test.js <user_email>

const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const email = process.argv[2];
if (!email) {
  console.error('Usage: node 14_trigger_webhook_test.js <user_email>');
  process.exit(1);
}

(async () => {
  console.log(`Looking up Stripe customer(s) for: ${email}\n`);
  const customers = await stripe.customers.list({ email, limit: 10 });
  if (customers.data.length === 0) {
    console.log('No customer found in Stripe.');
    return;
  }

  for (const cus of customers.data) {
    console.log(`Customer: ${cus.id}`);
    const subs = await stripe.subscriptions.list({
      customer: cus.id,
      status: 'all',
      limit: 10,
    });
    for (const s of subs.data) {
      if (s.status === 'canceled') {
        console.log(`  Skipping canceled sub ${s.id}`);
        continue;
      }
      console.log(`  Bumping ${s.id}  (status=${s.status})`);
      const updated = await stripe.subscriptions.update(s.id, {
        metadata: {
          webhook_test_ts: new Date().toISOString(),
        },
      });
      console.log(`    ✔ update sent — Stripe will fire subscription.updated`);
      console.log(`    Watch Supabase Function logs and sh_subscribers table.`);
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });

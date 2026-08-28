// Delete the current webhook endpoint and recreate it fresh, so we get a
// brand-new signing secret. Any hidden whitespace / newline in the previously
// pasted Supabase secret is thus guaranteed replaced.

const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_URL =
  'https://buzdtsupgmytqokgfsbn.supabase.co/functions/v1/stripe-webhook';

const EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

(async () => {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  for (const w of list.data) {
    if (w.url === WEBHOOK_URL) {
      console.log(`Deleting old endpoint ${w.id}`);
      await stripe.webhookEndpoints.del(w.id);
    }
  }
  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: EVENTS,
    description: 'Divine Healing app — sync subscriptions to Supabase',
    api_version: '2024-06-20',
  });
  console.log(`\nCreated fresh endpoint ${created.id}\n`);
  console.log('New signing secret (copy the ENTIRE line, no leading/trailing spaces):');
  console.log('');
  console.log(created.secret);
  console.log('');
})().catch((e) => { console.error(e); process.exit(1); });

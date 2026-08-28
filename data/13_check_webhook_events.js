// Check recent webhook delivery attempts.
// Reads via the Stripe API — no dashboard access needed.

const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_URL =
  'https://buzdtsupgmytqokgfsbn.supabase.co/functions/v1/stripe-webhook';

(async () => {
  // Find our endpoint.
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const endpoint = list.data.find((w) => w.url === WEBHOOK_URL);
  if (!endpoint) {
    console.log('Endpoint not registered!');
    return;
  }
  console.log(`Endpoint: ${endpoint.id}  status=${endpoint.status}`);
  console.log(`Events: ${endpoint.enabled_events.join(', ')}\n`);

  // Recent events (any) to see what happened lately.
  const events = await stripe.events.list({ limit: 15 });
  console.log('Last 15 Stripe events:');
  for (const e of events.data) {
    const at = new Date(e.created * 1000).toISOString();
    console.log(`  ${at}  ${e.type}  id=${e.id}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });

// Programmatically create the Stripe → Supabase webhook endpoint.
//
// We use the client's STRIPE_SECRET_KEY (in .env) to hit Stripe's REST API
// directly — no Dashboard access required. This also gives us back the
// signing secret in plain text so we can paste it into Supabase Function
// Secrets as STRIPE_WEBHOOK_SIGNING_SECRET.
//
// Idempotent: reuses any existing endpoint pointing at the same URL.
//
// Env:
//   STRIPE_SECRET_KEY=sk_live_...   (from .env, LIVE mode)

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

const WEBHOOK_URL =
  'https://buzdtsupgmytqokgfsbn.supabase.co/functions/v1/stripe-webhook';

const EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

(async () => {
  console.log(`\nStripe key: ${SECRET.substring(0, 12)}...`);
  console.log(`Mode:       ${SECRET.startsWith('sk_live_') ? 'LIVE (real money)' : 'test'}`);
  console.log(`Target URL: ${WEBHOOK_URL}\n`);

  // 1. Look for an existing endpoint at the same URL.
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = list.data.find((w) => w.url === WEBHOOK_URL);

  let endpoint;
  if (existing) {
    console.log(`Reusing existing endpoint ${existing.id}`);
    // Ensure the event list is up to date.
    endpoint = await stripe.webhookEndpoints.update(existing.id, {
      enabled_events: EVENTS,
      disabled: false,
    });
    console.log('Events updated.');
  } else {
    endpoint = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: EVENTS,
      description: 'Divine Healing app — sync subscriptions to Supabase',
      api_version: '2024-06-20',
    });
    console.log(`Created endpoint ${endpoint.id}`);
  }

  // 2. Fetch the signing secret.
  // NOTE: `secret` is only exposed on the newly-created object OR when we
  // fetch a fresh copy from the API. For reused endpoints, we may need to
  // rotate the secret to see it — we don't want to break existing secrets
  // silently, so we only surface the secret if it's readable.
  if (!endpoint.secret) {
    console.log(
      '\nWARNING: signing secret is not visible on this reused endpoint.',
    );
    console.log(
      'If this is a fresh setup, roll the secret via the Stripe Dashboard,',
    );
    console.log(
      'or delete the endpoint (id above) and rerun this script to recreate.',
    );
    process.exit(0);
  }

  console.log('\n────────────────────────────────────────────────');
  console.log('DONE.\n');
  console.log('Endpoint ID:    ', endpoint.id);
  console.log('Signing Secret: ', endpoint.secret);
  console.log('\nNext step:');
  console.log('  1. Copy the signing secret above.');
  console.log('  2. Go to Supabase Dashboard → Edge Functions → Secrets.');
  console.log('  3. Add a new secret:');
  console.log('       Name:  STRIPE_WEBHOOK_SIGNING_SECRET');
  console.log('       Value: (paste the secret)');
  console.log('  4. Save.');
  console.log('');
})().catch((e) => { console.error(e); process.exit(1); });

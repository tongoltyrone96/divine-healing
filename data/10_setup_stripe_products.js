// Provision the two Divine Healing subscription products in Stripe
// and generate reusable Payment Links so the Flutter app can open them
// without a backend server.
//
// Idempotent: uses lookup_key + metadata to check-and-create. Safe to re-run.
//
// Env:
//   STRIPE_SECRET_KEY=sk_live_...   (from client, kept in .env)

const Stripe = require('stripe');

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}

const stripe = new Stripe(SECRET);

const APP_HOME = 'https://divine-healing-iota.vercel.app';

const PLANS = [
  {
    lookupKey: 'divine_healing_monthly',
    name: 'Divine Healing — Monthly',
    description: 'Full access to all guided meditations, shadow work sessions, chakra healing, and Reiki. Cancel any time.',
    unitAmount: 1900,     // CAD $19.00
    interval: 'month',
    trialDays: 7,
  },
  {
    lookupKey: 'divine_healing_annual',
    name: 'Divine Healing — Annual',
    description: 'Full access, save 35% vs monthly. 7-day free trial, cancel any time.',
    unitAmount: 14900,    // CAD $149.00
    interval: 'year',
    trialDays: 7,
  },
];

async function findOrCreateProduct(plan) {
  // Look up existing by lookup_key on the Price (Product itself has no
  // lookup_key, but we tag the Product with metadata for idempotency).
  const search = await stripe.products.search({
    query: `metadata['lookup_key']:'${plan.lookupKey}'`,
    limit: 1,
  });
  if (search.data.length > 0) {
    console.log(`Reusing product ${search.data[0].id}  (${plan.name})`);
    return search.data[0];
  }
  const created = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { lookup_key: plan.lookupKey },
  });
  console.log(`Created product ${created.id}    (${plan.name})`);
  return created;
}

async function findOrCreatePrice(plan, productId) {
  const existing = await stripe.prices.list({
    lookup_keys: [plan.lookupKey],
    limit: 1,
  });
  if (existing.data.length > 0) {
    console.log(`Reusing price   ${existing.data[0].id}`);
    return existing.data[0];
  }
  const created = await stripe.prices.create({
    product: productId,
    unit_amount: plan.unitAmount,
    currency: 'cad',
    lookup_key: plan.lookupKey,
    recurring: {
      interval: plan.interval,
      trial_period_days: plan.trialDays,
    },
  });
  console.log(`Created price   ${created.id}`);
  return created;
}

async function findOrCreatePaymentLink(plan, priceId) {
  const list = await stripe.paymentLinks.list({ limit: 100 });
  const match = list.data.find(
    (pl) => pl.metadata && pl.metadata.lookup_key === plan.lookupKey && pl.active,
  );
  if (match) {
    console.log(`Reusing link    ${match.url}`);
    return match;
  }
  const created = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: plan.trialDays,
    },
    after_completion: {
      type: 'redirect',
      redirect: { url: `${APP_HOME}/#/profile?checkout=success` },
    },
    metadata: { lookup_key: plan.lookupKey },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });
  console.log(`Created link    ${created.url}`);
  return created;
}

(async () => {
  console.log(`\nStripe key: ${SECRET.substring(0, 12)}...`);
  console.log(`Mode:       ${SECRET.startsWith('sk_live_') ? '⚠️  LIVE (real money)' : 'test'}\n`);

  const results = {};
  for (const plan of PLANS) {
    console.log(`\n── ${plan.name} ─────────────────────────────`);
    const product = await findOrCreateProduct(plan);
    const price = await findOrCreatePrice(plan, product.id);
    const link = await findOrCreatePaymentLink(plan, price.id);
    results[plan.lookupKey] = {
      productId: product.id,
      priceId: price.id,
      paymentLinkId: link.id,
      paymentLinkUrl: link.url,
    };
  }

  console.log('\n────────────────────────────────────────────────');
  console.log('DONE. Save these Payment Link URLs into the Flutter app:\n');
  for (const [key, r] of Object.entries(results)) {
    console.log(`  ${key.padEnd(25)}  ${r.paymentLinkUrl}`);
  }
  console.log('');
})().catch((e) => { console.error(e); process.exit(1); });

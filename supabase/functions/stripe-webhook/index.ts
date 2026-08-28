// Supabase Edge Function — Stripe webhook receiver
//
// Handles the four events we care about for the subscription lifecycle:
//   - checkout.session.completed       (initial signup, links customer to email)
//   - customer.subscription.created    (safety net, in case checkout is missed)
//   - customer.subscription.updated    (status changes: trialing → active → canceled)
//   - customer.subscription.deleted    (final cancellation)
//
// For each event we upsert into public.sh_subscribers keyed on user_email.
//
// Env (set via `supabase secrets set` or Dashboard → Functions → stripe-webhook):
//   STRIPE_SECRET_KEY           — sk_live_... (client's key, server-side only)
//   STRIPE_WEBHOOK_SIGNING_SECRET— whsec_... (from Stripe Dashboard → Webhook)
//   SUPABASE_URL                — auto-populated by the Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY   — auto-populated by the Supabase runtime

// Use Deno's built-in npm: specifier — this is Supabase's officially
// recommended import path for Edge Functions and avoids the esm.sh bundling
// issues that broke both microtask support and payload byte-exact matching.
import Stripe from 'npm:stripe@17.3.1';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!;

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  // Read raw bytes — decoding to text first can corrupt the signature check
  // if the runtime normalises the encoding.
  const rawBody = new Uint8Array(await req.arrayBuffer());
  const body = new TextDecoder().decode(rawBody);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch (e) {
    console.error('Signature verification failed:', e.message);
    return new Response(`Signature verification failed: ${e.message}`, {
      status: 400,
    });
  }

  console.log(`▶ ${event.type}  id=${event.id}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ['items.data.price.product'] },
        );
        const email =
          session.customer_details?.email ??
          (await lookupCustomerEmail(sub.customer as string));
        await upsertSubscriber(email, sub);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const full = await stripe.subscriptions.retrieve(sub.id, {
          expand: ['items.data.price.product'],
        });
        const email = await lookupCustomerEmail(sub.customer as string);
        await upsertSubscriber(email, full);
        break;
      }
      default:
        // Ignore other events silently — no work to do.
        break;
    }
  } catch (e) {
    console.error('Handler error:', e);
    return new Response(`Handler error: ${e.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
});

async function lookupCustomerEmail(customerId: string): Promise<string | null> {
  if (!customerId) return null;
  const cus = await stripe.customers.retrieve(customerId);
  if ((cus as Stripe.DeletedCustomer).deleted) return null;
  return (cus as Stripe.Customer).email ?? null;
}

async function upsertSubscriber(
  email: string | null,
  sub: Stripe.Subscription,
) {
  if (!email) {
    console.warn(`No email for subscription ${sub.id}, skipping upsert.`);
    return;
  }

  const item = sub.items.data[0];
  const price = item?.price;
  const product = price?.product as Stripe.Product | undefined;

  let planName: string | null = null;
  if (price?.recurring?.interval === 'month') planName = 'Monthly';
  else if (price?.recurring?.interval === 'year') planName = 'Annual';
  else if (product && typeof product === 'object' && 'name' in product) {
    planName = product.name;
  }

  const row = {
    user_email: email,
    stripe_customer_id: sub.customer as string,
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    plan_name: planName,
    trial_ends_at: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('sh_subscribers')
    .upsert(row, { onConflict: 'user_email' });

  if (error) {
    console.error('Upsert failed:', error.message);
    throw error;
  }
  console.log(`✔ upserted ${email}  status=${sub.status}  plan=${planName}`);
}

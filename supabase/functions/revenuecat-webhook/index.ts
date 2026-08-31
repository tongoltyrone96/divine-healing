// Supabase Edge Function — RevenueCat webhook receiver
//
// The App Store and Play equivalent of stripe-webhook. Both write the same
// rows to public.sh_subscribers, so the audio paywall in Storage RLS —
// sh_has_full_access(), which reads subscription_status and
// current_period_end — does not need to know which store took the money.
//
// RevenueCat sends one webhook for both stores, which is the reason it is
// here rather than App Store Server Notifications and Play RTDN separately.
//
// Env (Dashboard -> Functions -> revenuecat-webhook -> Secrets):
//   REVENUECAT_WEBHOOK_SECRET  — the exact string set as the Authorization
//                                header value in RevenueCat's webhook config
//   SUPABASE_URL               — provided by the runtime
//   SUPABASE_SERVICE_ROLE_KEY  — provided by the runtime
//
// Deploy without JWT verification, or RevenueCat's calls are rejected before
// reaching this code:
//   supabase functions deploy revenuecat-webhook --no-verify-jwt

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;

/// RevenueCat's event types, mapped onto the four states sh_has_full_access()
/// understands. Anything not listed is acknowledged and ignored: RevenueCat
/// sends transfers, alias changes and test pings that carry no entitlement
/// change, and returning an error for those would have it retry forever.
const GRANTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
]);

interface RevenueCatEvent {
  type: string;
  id: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  period_type?: string;
  store?: string;
  environment?: string;
  expiration_at_ms?: number | null;
  transaction_id?: string;
  original_transaction_id?: string;
  subscriber_attributes?: Record<string, { value?: string }>;
}

Deno.serve(async (req) => {
  // RevenueCat has no request signing. It sends whatever string is configured
  // as the Authorization header, so the check is a comparison rather than a
  // verification — which is why the secret must be long and random.
  const auth = req.headers.get('authorization') ?? '';
  if (!WEBHOOK_SECRET || auth !== WEBHOOK_SECRET) {
    console.error('Rejected: Authorization header did not match');
    return new Response('Unauthorized', { status: 401 });
  }

  let event: RevenueCatEvent;
  try {
    const body = await req.json();
    event = body.event;
    if (!event?.type) throw new Error('no event in payload');
  } catch (e) {
    return new Response(`Bad payload: ${e.message}`, { status: 400 });
  }

  console.log(`▶ ${event.type}  id=${event.id}  store=${event.store}`);

  // Sandbox purchases would otherwise unlock the real library for a tester.
  if (event.environment === 'SANDBOX') {
    console.log('Sandbox event, not recorded.');
    return ok();
  }
  if (event.type === 'TEST') return ok();

  try {
    const email = await resolveEmail(event);
    if (!email) {
      // Acknowledged rather than retried: without an email there is no row to
      // write, and RevenueCat replaying it will not produce one.
      console.warn(`No email for app_user_id=${event.app_user_id}`);
      return ok();
    }

    const status = statusFor(event);
    if (!status) {
      console.log(`${event.type} carries no status change.`);
      return ok();
    }

    const expiry = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    const row = {
      user_email: email,
      subscription_status: status,
      plan_name: planName(event.product_id),
      // A trial that has been superseded should not keep claiming to end in
      // the future, so this is only set while the trial is the current period.
      trial_ends_at: event.period_type === 'TRIAL' ? expiry : null,
      current_period_end: expiry,
      store: event.store === 'APP_STORE'
        ? 'app_store'
        : event.store === 'PLAY_STORE'
        ? 'play_store'
        : (event.store ?? '').toLowerCase() || null,
      store_transaction_id:
        event.original_transaction_id ?? event.transaction_id ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sh_subscribers')
      .upsert(row, { onConflict: 'user_email' });
    if (error) throw error;

    console.log(`✔ ${email}  status=${status}  plan=${row.plan_name}`);
  } catch (e) {
    // A 500 makes RevenueCat retry, which is what we want for a transient
    // database problem.
    console.error('Handler error:', e);
    return new Response(`Handler error: ${e.message}`, { status: 500 });
  }

  return ok();
});

function ok() {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

/// sh_subscribers is keyed on email, and RevenueCat identifies people by the
/// app user id the app configured — the Supabase auth user id.
///
/// The email attribute is set by the app at sign-in and is the fast path.
/// The lookup behind it covers a purchase made before that attribute synced,
/// which RevenueCat does asynchronously.
async function resolveEmail(event: RevenueCatEvent): Promise<string | null> {
  const attribute = event.subscriber_attributes?.['$email']?.value;
  if (attribute) return attribute;

  for (const id of [event.app_user_id, event.original_app_user_id]) {
    if (!id) continue;
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error) {
      console.warn(`Lookup failed for ${id}: ${error.message}`);
      continue;
    }
    if (data.user?.email) return data.user.email;
  }
  return null;
}

/// The vocabulary here has to match what the Stripe webhook writes, because
/// sh_has_full_access() reads both without distinguishing them.
function statusFor(event: RevenueCatEvent): string | null {
  if (GRANTS.has(event.type)) {
    return event.period_type === 'TRIAL' ? 'trialing' : 'active';
  }
  switch (event.type) {
    case 'CANCELLATION':
      // Cancelling stops the renewal; it does not end the period already
      // paid for. current_period_end is what decides access from here, and
      // sh_has_full_access() honours it.
      return 'canceled';
    case 'EXPIRATION':
      return 'canceled';
    case 'BILLING_ISSUE':
      // Apple and Google keep retrying the card for a while. past_due still
      // grants access, matching how Stripe behaves.
      return 'past_due';
    default:
      return null;
  }
}

function planName(productId?: string): string | null {
  if (!productId) return null;
  if (productId.endsWith('.annual')) return 'Annual';
  if (productId.endsWith('.monthly')) return 'Monthly';
  return productId;
}

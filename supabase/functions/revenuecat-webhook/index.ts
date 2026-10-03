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
/// understands. TRANSFER is handled separately, because it moves a
/// subscription between people rather than changing its state. Anything else
/// not listed is acknowledged and ignored: alias changes and test pings
/// carry no entitlement change, and returning an error for those would have
/// it retry forever.
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
  transferred_from?: string[];
  transferred_to?: string[];
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

  if (event.type === 'TEST') return ok();

  if (event.type === 'TRANSFER') {
    try {
      await handleTransfer(event);
    } catch (e) {
      console.error('Transfer error:', e);
      return new Response(`Handler error: ${e.message}`, { status: 500 });
    }
    return ok();
  }

  try {
    // The app user id is the Supabase auth uid — the app sets it that way,
    // for anonymous sessions as much as for real accounts. It is the only
    // identifier a guest purchase carries, so it leads now and the email
    // follows.
    const userId = uuidOrNull(event.app_user_id) ??
      uuidOrNull(event.original_app_user_id);
    const email = await resolveEmail(event) ??
      (userId ? `${userId}@anonymous.divinehealing.app` : null);

    if (!userId && !email) {
      // Acknowledged rather than retried: with neither identifier there is no
      // row to write, and RevenueCat replaying it will not produce one.
      console.warn(`No identity for app_user_id=${event.app_user_id}`);
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
      user_id: userId,
      user_email: email,
      subscription_status: status,
      plan_name: planName(event.product_id),
      // A trial that has been superseded should not keep claiming to end in
      // the future, so this is only set while the trial is the current period.
      trial_ends_at: event.period_type === 'TRIAL' ? expiry : null,
      current_period_end: expiry,
      // Sandbox purchases are recorded, not dropped. Only licence testers
      // and the two stores' reviewers can make one, and dropping them meant
      // a tester could buy, be told by Google they were subscribed, and
      // still find the library locked — which is what happened. A reviewer
      // hitting the same wall is a rejection. The environment is kept in
      // `store` so real revenue is still distinguishable; nothing reads it,
      // sh_has_full_access() goes by status and expiry alone.
      store: (event.store === 'APP_STORE'
        ? 'app_store'
        : event.store === 'PLAY_STORE'
        ? 'play_store'
        : (event.store ?? '').toLowerCase() || 'unknown') +
        (event.environment === 'SANDBOX' ? '_sandbox' : ''),
      store_transaction_id:
        event.original_transaction_id ?? event.transaction_id ?? null,
      updated_at: new Date().toISOString(),
    };

    // Match on the uid before the address. An upsert keyed on user_email —
    // which is what this did — writes a second row the moment an anonymous
    // buyer signs in and starts resolving to a real address, and the
    // abandoned first row keeps saying `active` forever. Cancelling would
    // then mark only the new one, and access would never actually end.
    const written = await updateWhere(row, 'user_id', userId) ||
      await updateWhere(row, 'user_email', email);
    if (!written) {
      const { error } = await supabase.from('sh_subscribers').insert(row);
      if (error) throw error;
    }

    console.log(`✔ ${userId ?? email}  status=${status}  plan=${row.plan_name}`);
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

/// Updates the existing row matching one identifier, and says whether it
/// found one. Returns false for a null identifier so the callers can chain.
async function updateWhere(
  row: Record<string, unknown>,
  column: string,
  value: string | null,
): Promise<boolean> {
  if (!value) return false;
  const { data, error } = await supabase
    .from('sh_subscribers')
    .update(row)
    .eq(column, value)
    .select('user_email');
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/// RevenueCat's app user id is whatever the app passed to configure(). It is
/// a Supabase uid here, but a device-scoped `$RCAnonymousID:…` if a purchase
/// somehow happened before configure() ran, and that is not a uid.
function uuidOrNull(id?: string): string | null {
  if (!id) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(id)
    ? id
    : null;
}

/// The real address, when the buyer has one.
///
/// The email attribute is set by the app at sign-in and is the fast path.
/// The lookup behind it covers a purchase made before that attribute synced,
/// which RevenueCat does asynchronously. Anonymous buyers have neither, and
/// the caller falls back to a synthetic address for them.
///
/// Lower-cased, because the table is: 20260924_01 lowered every stored
/// address and put a unique index on lower(user_email). An address arriving
/// with a capital would miss its own row in updateWhere and then collide
/// with it on insert, and the 500 would have RevenueCat retry forever.
async function resolveEmail(event: RevenueCatEvent): Promise<string | null> {
  const attribute = event.subscriber_attributes?.['$email']?.value;
  if (attribute) return attribute.toLowerCase();

  for (const id of [event.app_user_id, event.original_app_user_id]) {
    if (!id) continue;
    const email = await emailOf(id);
    if (email) return email;
  }
  return null;
}

/// The account's own address, lower-cased, or null for an anonymous one.
async function emailOf(uid: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.getUserById(uid);
  if (error) {
    console.warn(`Lookup failed for ${uid}: ${error.message}`);
    return null;
  }
  return data.user?.email ? data.user.email.toLowerCase() : null;
}

/// Moves a subscription to the account RevenueCat moved it to.
///
/// A guest who buys and then signs in ends up with a different Supabase
/// uid: signing in does not promote the anonymous user, it replaces it. The
/// row still names the anonymous uid, so the person who paid finds the
/// library locked. Restore Purchases makes RevenueCat transfer the purchase
/// to the new app user id and report a TRANSFER, which carries no status, so
/// this used to drop it. The library then stayed locked until a renewal
/// happened to arrive under the new id, up to a year for an annual plan.
async function handleTransfer(event: RevenueCatEvent): Promise<void> {
  const from = (event.transferred_from ?? [])
    .map(uuidOrNull)
    .filter((id): id is string => id !== null);
  const to = (event.transferred_to ?? [])
    .map(uuidOrNull)
    .find((id): id is string => id !== null) ?? null;
  if (!from.length || !to) {
    console.warn(`TRANSFER without usable ids: from=${event.transferred_from} to=${event.transferred_to}`);
    return;
  }

  const { data: sources, error } = await supabase
    .from('sh_subscribers')
    .select('*')
    .in('user_id', from)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  const source = sources?.[0];
  if (!source) {
    console.log(`TRANSFER ${from.join(',')} -> ${to}: no row to move.`);
    return;
  }

  const email = await emailOf(to) ?? `${to}@anonymous.divinehealing.app`;
  const moved = {
    user_id: to,
    user_email: email,
    subscription_status: source.subscription_status,
    plan_name: source.plan_name,
    trial_ends_at: source.trial_ends_at,
    current_period_end: source.current_period_end,
    store: source.store,
    store_transaction_id: source.store_transaction_id,
    updated_at: new Date().toISOString(),
  };

  // The receiving account may already have a row of its own, by uid or by
  // address if Stripe or a gift wrote it. The purchase lands on that row
  // rather than beside it: two rows for one person is the state the
  // uid-first matching above exists to prevent, and the next renewal would
  // update only one of them.
  const { data: existing, error: findError } = await supabase
    .from('sh_subscribers')
    .select('id')
    .or(`user_id.eq.${to},user_email.eq."${email}"`)
    .neq('id', source.id)
    .limit(1);
  if (findError) throw findError;

  if (existing?.length) {
    const { error: updateError } = await supabase
      .from('sh_subscribers').update(moved).eq('id', existing[0].id);
    if (updateError) throw updateError;
    const { error: deleteError } = await supabase
      .from('sh_subscribers').delete().eq('id', source.id);
    if (deleteError) throw deleteError;
  } else {
    const { error: moveError } = await supabase
      .from('sh_subscribers').update(moved).eq('id', source.id);
    if (moveError) throw moveError;
  }
  console.log(`✔ TRANSFER ${source.user_id} -> ${to}  status=${moved.subscription_status}`);
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
    case 'SUBSCRIPTION_PAUSED':
      // Play lets a subscriber pause for up to three months. Nothing is
      // charged in that window, so nothing should be unlocked either.
      // Pause is switched off in Play Console today; this is here so that
      // turning it back on does not silently hand out free access.
      return 'canceled';
    case 'BILLING_ISSUE':
      // Apple and Google keep retrying the card for a while. past_due still
      // grants access, matching how Stripe behaves.
      return 'past_due';
    default:
      return null;
  }
}

/// Apple's identifiers are com.divinehealing.app.annual; Play's are
/// divine_healing_annual, and RevenueCat may append the base plan as
/// divine_healing_annual:annual. Matching on the word rather than on a
/// dotted suffix covers all three, and 'annual' is checked first because
/// neither identifier contains the other.
function planName(productId?: string): string | null {
  if (!productId) return null;
  const id = productId.toLowerCase();
  if (id.includes('annual')) return 'Annual';
  if (id.includes('monthly')) return 'Monthly';
  return productId;
}

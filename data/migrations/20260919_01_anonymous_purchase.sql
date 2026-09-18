-- ===========================================================================
-- Let someone subscribe without making an account.
--
-- Apple rejected build 23 under guideline 5.1.1(v): the app made people
-- register before they could buy, and the subscription unlocks the same 23
-- sessions for everyone, so it is not account-based content. Registration
-- therefore has to be optional.
--
-- The obstacle was never the UI. The paywall lives in Storage RLS, and
-- sh_has_full_access() matched on auth.email() — which is NULL for anyone
-- without an account, so a guest could pay and still be refused the audio.
--
-- The app now signs guests in anonymously (a real auth.uid(), no email, no
-- personal information, invisible to them), so this teaches the entitlement
-- check to accept that uid as well as the email. The two are ORed rather
-- than swapped: every row written before today is keyed on email alone, and
-- Stripe's webhook still writes them that way.
--
-- An anonymous purchaser's row carries a synthetic address,
--   <uid>@anonymous.divinehealing.app
-- because user_email may be NOT NULL and is what the older code keys on.
-- It is not a mailbox and nothing is ever sent to it; it marks a row as
-- "bought without an account", which is worth being able to see.
--
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
--   (or: node data/22_run_migration.js data/migrations/20260919_01_anonymous_purchase.sql --apply)
-- Safe to re-run.
--
-- Requires "Allow anonymous sign-ins" under Authentication -> Providers.
-- Without it the app still runs, guests just cannot purchase — which is the
-- rejection we are fixing, so check it before shipping.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Identify a subscriber by auth uid, not only by email
-- ---------------------------------------------------------------------------

ALTER TABLE public.sh_subscribers
  ADD COLUMN IF NOT EXISTS user_id uuid;

COMMENT ON COLUMN public.sh_subscribers.user_id IS
  'Supabase auth uid. Set for store purchases, where it is the RevenueCat '
  'app user id. Null on older Stripe rows, which are keyed on user_email.';

-- One row per person. Partial, so the many legacy rows with a null user_id
-- do not collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS sh_subscribers_user_id_key
  ON public.sh_subscribers (user_id)
  WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. The entitlement check
--
-- Unchanged except for the identity clause. The status vocabulary and the
-- canceled-but-still-paid-for window are the same, and still mirror
-- SubscriptionStatus.hasFullAccess in lib/models/subscription_status.dart.
--
-- auth.email() is NULL for an anonymous session and auth.uid() is NULL for
-- none of them, so the OR cannot widen access: a NULL on either side matches
-- nothing rather than everything.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sh_has_full_access()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sh_subscribers s
    WHERE (
        (s.user_id IS NOT NULL AND s.user_id = auth.uid())
        OR (s.user_email IS NOT NULL AND s.user_email = auth.email())
      )
      AND (
        s.subscription_status IN ('trialing', 'active', 'past_due')
        OR (
          s.subscription_status = 'canceled'
          AND s.current_period_end IS NOT NULL
          AND s.current_period_end > now()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.sh_has_full_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sh_has_full_access() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Let a guest read their own row
--
-- The Profile screen reads sh_subscribers directly to show the plan and
-- renewal date. Whatever policy already grants that by email is left alone;
-- this is an additional permissive one, and permissive policies OR together.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "sh_subscribers own row by uid" ON public.sh_subscribers;
CREATE POLICY "sh_subscribers own row by uid"
  ON public.sh_subscribers
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Backfill what can be matched
--
-- Existing rows keyed on a real address get their uid stamped, so a person
-- who already subscribed keeps access by either key from here on.
-- ---------------------------------------------------------------------------

UPDATE public.sh_subscribers s
   SET user_id = u.id
  FROM auth.users u
 WHERE s.user_id IS NULL
   AND u.email IS NOT NULL
   AND lower(u.email) = lower(s.user_email);

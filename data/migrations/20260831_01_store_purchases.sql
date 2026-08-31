-- ===========================================================================
-- 20260831_01_store_purchases.sql
--
-- Makes room in sh_subscribers for purchases that did not come from Stripe.
--
-- The table was designed around Stripe and names its identifier columns after
-- it. App Store and Play purchases have no Stripe customer or subscription,
-- so those columns stay null and there is otherwise no way to tell where a
-- subscription came from — which matters the first time someone asks for a
-- refund and we have to find their transaction.
--
-- Nothing about access control changes. sh_has_full_access() reads
-- subscription_status and current_period_end, and the RevenueCat webhook
-- writes the same vocabulary the Stripe one does: trialing, active,
-- past_due, canceled.
--
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to re-run.
-- ===========================================================================

ALTER TABLE public.sh_subscribers
  ADD COLUMN IF NOT EXISTS store text,
  ADD COLUMN IF NOT EXISTS store_transaction_id text;

COMMENT ON COLUMN public.sh_subscribers.store IS
  'Where the money came from: stripe, app_store or play_store. Null on rows '
  'written before 2026-08-31, all of which are Stripe.';

COMMENT ON COLUMN public.sh_subscribers.store_transaction_id IS
  'The store''s own identifier for the purchase. For Stripe the existing '
  'stripe_subscription_id column serves the same purpose.';

-- Existing rows all came through Stripe.
UPDATE public.sh_subscribers
   SET store = 'stripe'
 WHERE store IS NULL
   AND stripe_subscription_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Checks — expected result on each line
-- ---------------------------------------------------------------------------
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'sh_subscribers' AND column_name IN
--        ('store', 'store_transaction_id');
--   -> two rows
--
-- And unchanged, which is the part that matters:
--   node data/04_verify_paywall.js   -> all checks pass

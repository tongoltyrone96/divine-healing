-- ===========================================================================
-- Match a subscriber's address without caring about capitals.
--
-- The client granted her wife free access, typed `Cassie.d13@hotmail.com`,
-- and the app stayed locked. The row said `active`, the address looked right,
-- and nothing anywhere said why — sh_has_full_access() compared
-- `s.user_email = auth.email()`, which in Postgres is case-sensitive, and the
-- account had signed in as `cassie.d13@hotmail.com`.
--
-- Nobody types an address expecting the capital to matter, and the providers
-- do not agree either: what Google or Apple hands back is whatever the person
-- registered with. So the comparison is the thing that was wrong, not the row.
--
-- Also normalises what is already stored, so the existing rows match too.
--
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
--   (or: node data/22_run_migration.js data/migrations/20260924_01_case_insensitive_email.sql --apply)
-- Safe to re-run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Straighten the rows that are already there
--
-- Done first so the unique index below cannot trip over two rows that differ
-- only in capitals. If that ever happens the newest wins, which is the one
-- someone most recently meant.
-- ---------------------------------------------------------------------------

DELETE FROM public.sh_subscribers a
 USING public.sh_subscribers b
 WHERE lower(a.user_email) = lower(b.user_email)
   AND a.user_email IS DISTINCT FROM b.user_email
   AND a.updated_at < b.updated_at;

UPDATE public.sh_subscribers
   SET user_email = lower(user_email)
 WHERE user_email IS NOT NULL
   AND user_email <> lower(user_email);

-- ---------------------------------------------------------------------------
-- 2. The entitlement check
--
-- Unchanged except that both sides of the address comparison are lowered.
-- The uid clause from 20260919_01 is untouched: it is what an anonymous
-- buyer matches on, and a uuid has no such problem.
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
        OR (s.user_email IS NOT NULL AND lower(s.user_email) = lower(auth.email()))
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
-- 3. Stop two spellings of one address existing at all
--
-- Without this, a later row typed with a capital sits beside the lowered one
-- and the webhook updates whichever it finds first.
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS sh_subscribers_user_email_lower_key
  ON public.sh_subscribers (lower(user_email))
  WHERE user_email IS NOT NULL;

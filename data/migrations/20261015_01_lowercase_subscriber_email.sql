-- ===========================================================================
-- Store every subscriber address in lowercase, however it was typed.
--
-- The client gave a friend free access by adding a row in the Table Editor
-- as `Natashajensen0214@gmail.com`. Google signed the friend in as
-- `natashajensen0214@gmail.com`, and the app showed her the paywall.
--
-- 20260924_01 made sh_has_full_access() compare addresses in lowercase,
-- which is why the audio itself would have played. But two other readers
-- still compare exactly:
--   - the RLS policy "user reads own subscription" (user_email = auth.email())
--   - the app's SubscriptionRepository, which filters user_email.eq.<email>
-- Neither could see a capitalised row, so the Profile screen offered plans
-- and the library stayed locked in the UI.
--
-- Fixing the readers would need an app release for the second one. Fixing
-- what is stored needs none: a trigger lowercases (and trims) the address
-- on every insert and update, so a hand-typed capital or a pasted trailing
-- space can no longer produce a row nobody matches. The policy is lowered
-- too, so it does not depend on auth.email() being lowercase either.
--
-- Apply: node data/22_run_migration.js data/migrations/20261015_01_lowercase_subscriber_email.sql --apply
-- Safe to re-run.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.sh_subscribers_normalise_email()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_email IS NOT NULL THEN
    NEW.user_email := lower(btrim(NEW.user_email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sh_subscribers_normalise_email ON public.sh_subscribers;
CREATE TRIGGER trg_sh_subscribers_normalise_email
  BEFORE INSERT OR UPDATE OF user_email ON public.sh_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.sh_subscribers_normalise_email();

-- Anything already stored with capitals or spaces. None at the time of
-- writing; the statement makes the migration safe to apply later.
UPDATE public.sh_subscribers
   SET user_email = lower(btrim(user_email))
 WHERE user_email IS NOT NULL
   AND user_email <> lower(btrim(user_email));

DROP POLICY IF EXISTS "user reads own subscription" ON public.sh_subscribers;
CREATE POLICY "user reads own subscription"
  ON public.sh_subscribers
  FOR SELECT
  TO authenticated
  USING (lower(user_email) = lower(auth.email()));

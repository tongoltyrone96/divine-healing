-- ===========================================================================
-- 20260829_01_public_catalogue.sql
--
-- Lets signed-out visitors see the catalogue.
--
-- Until now anon could read only the three preview rows, so every category
-- filter but Meditations and Reiki rendered "No sessions yet." The sessions
-- are not missing, they are locked — but the screen said the opposite, and
-- the locked-card upsell the Library is built around never appeared for the
-- people most likely to need it. The demo the client shares is browsed signed
-- out.
--
-- What this does NOT change: who can hear anything. Audio is gated at the
-- Storage layer by 20260828_01_audio_paywall.sql, which was verified against
-- the live project — an anonymous caller cannot sign a paid track, and the
-- public object route is dead.
--
-- The trade-off, stated plainly: content_body becomes readable, so the
-- randomised object paths are no longer secret. That randomisation was a
-- second line of defence against the bucket being made public by accident,
-- not the paywall itself. And the same titles, durations and paths already
-- ship inside the app bundle as assets/content/admin_content.json, which
-- anyone can unzip from the APK — hiding them behind the API was never
-- hiding them.
--
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to re-run.
-- ===========================================================================

-- Dropped first so a re-run cannot leave two overlapping SELECT policies,
-- where the more permissive one silently decides the outcome.
DROP POLICY IF EXISTS "public reads preview"    ON sh_content;
DROP POLICY IF EXISTS "authenticated reads all" ON sh_content;
DROP POLICY IF EXISTS "catalogue is public"     ON sh_content;

CREATE POLICY "catalogue is public"
  ON sh_content FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Writes stay service_role only; it bypasses RLS, so no policy is needed.

-- ---------------------------------------------------------------------------
-- Checks — expected result on each line
-- ---------------------------------------------------------------------------
-- SELECT policyname, roles, cmd FROM pg_policies
--  WHERE tablename = 'sh_content';
--   -> one SELECT policy, {anon,authenticated}
--
-- With the anon key:
--   GET /rest/v1/sh_content?select=id  -> 24 rows
--
-- And still refused, which is the part that matters:
--   node data/04_verify_paywall.js     -> all checks pass

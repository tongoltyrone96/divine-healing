-- ===========================================================================
-- 20260828_01_audio_paywall.sql
--
-- Closes the paywall bypass: before this migration the `sh-audio` bucket was
-- public, so any paid meditation could be downloaded anonymously by guessing
-- the path (`audio/{id}.mp3`). Verified 2026-08-28: audio/10, 11, 12 all
-- returned HTTP 206 with no credentials.
--
-- After this migration the bucket is private and Supabase Storage refuses to
-- mint a signed URL unless the caller passes one of the policies below.
-- Reading `sh_content.content_body` no longer grants anything, which is why
-- the table's own policies are deliberately left alone (locked cards still
-- render for free users, so the upsell keeps working).
--
-- Apply: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to re-run (idempotent).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Entitlement helpers
--
-- SECURITY DEFINER so the checks are not themselves filtered by the caller's
-- RLS on sh_subscribers / sh_content. search_path is pinned to defeat
-- search_path hijacking, which is mandatory for definer functions.
-- ---------------------------------------------------------------------------

-- Does the calling user hold an active entitlement?
-- Mirrors SubscriptionStatus.hasFullAccess in the Flutter app
-- (lib/models/subscription_status.dart) — keep the two in sync.
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
    WHERE s.user_email = auth.email()
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

-- Is this storage path one of the free preview sessions?
-- auth.email() is NULL for anon, so this is the only path a signed-out
-- visitor can ever reach.
CREATE OR REPLACE FUNCTION public.sh_is_preview_audio(object_path text)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sh_content c
    WHERE c.content_body = object_path
      AND c.is_preview = TRUE
  );
$$;

REVOKE ALL ON FUNCTION public.sh_has_full_access()            FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sh_is_preview_audio(text)       FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sh_has_full_access()          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sh_is_preview_audio(text)     TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Lock the bucket
--
-- public = false makes /object/public/** return 400 and forces every read
-- through /object/sign/**, which evaluates the policies in step 3.
-- ---------------------------------------------------------------------------
UPDATE storage.buckets
   SET public              = FALSE,
       file_size_limit     = 52428800,          -- 50 MB; largest file is ~31 MB
       allowed_mime_types  = ARRAY['audio/mpeg']
 WHERE id = 'sh-audio';

-- ---------------------------------------------------------------------------
-- 3. Storage read policies
--
-- Dropped first so re-running the migration cannot leave a stale permissive
-- policy behind — an ORed leftover would silently reopen the hole.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated can read audio"   ON storage.objects;
DROP POLICY IF EXISTS "sh_audio preview readable"      ON storage.objects;
DROP POLICY IF EXISTS "sh_audio subscriber readable"   ON storage.objects;

-- Free tier: the 3 preview sessions, signed-in or not.
CREATE POLICY "sh_audio preview readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'sh-audio'
    AND public.sh_is_preview_audio(name)
  );

-- Paid tier: the whole catalogue, active subscription required.
CREATE POLICY "sh_audio subscriber readable"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'sh-audio'
    AND public.sh_has_full_access()
  );

-- Uploads stay service_role only (data/upload_audio_to_supabase.js).
-- service_role bypasses RLS entirely, so no policy is needed for it.

-- ---------------------------------------------------------------------------
-- 4. Post-apply checks — expected output is noted on each line
-- ---------------------------------------------------------------------------
-- SELECT id, public FROM storage.buckets WHERE id = 'sh-audio';
--   -> public = false
--
-- SELECT policyname, roles FROM pg_policies
--  WHERE schemaname = 'storage' AND tablename = 'objects'
--    AND policyname LIKE 'sh_audio%';
--   -> exactly 2 rows
--
-- SELECT public.sh_is_preview_audio('audio/15.mp3');   -> true  (Anxiety Release)
-- SELECT public.sh_is_preview_audio('audio/10.mp3');   -> false (Chemotherapy, paid)
--
-- Then run: node data/04_verify_paywall.js

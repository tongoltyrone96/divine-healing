-- ==========================================================================
-- Divine Healing App — Supabase Schema
-- Client: Strawberry Hope (gstsaver@me.com)
-- Migration source: Glide app "Spiritual Healing"
-- Prefix `sh_` = Spiritual Healing (kept per client's original schema)
-- ==========================================================================
--
-- To run:
--   1. Create Supabase project at supabase.com
--   2. Open SQL Editor
--   3. Paste this file, click "Run"
--
-- Auth users are managed by Supabase's built-in auth.users table.
-- Our tables key off user_email (from auth.users.email) for readability.
-- Consider migrating to user_id (uuid) foreign keys later if needed.
-- ==========================================================================

-- Cleanup (safe re-run during development)
DROP TABLE IF EXISTS sh_shadow_work_responses CASCADE;
DROP TABLE IF EXISTS sh_manifestation_responses CASCADE;
DROP TABLE IF EXISTS sh_affirmation_favourites CASCADE;
DROP TABLE IF EXISTS sh_content_progress CASCADE;
DROP TABLE IF EXISTS sh_content CASCADE;
DROP TABLE IF EXISTS sh_subscribers CASCADE;

-- ==========================================================================
-- 1. sh_subscribers — Stripe/RevenueCat subscriptions
-- ==========================================================================
CREATE TABLE sh_subscribers (
  id                     BIGSERIAL PRIMARY KEY,
  user_email             TEXT NOT NULL UNIQUE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT,               -- 'active' | 'trialing' | 'canceled' | 'past_due' | ...
  plan_name              TEXT,               -- 'Monthly' | 'Annual' | 'Complimentary'
  trial_ends_at          TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sh_subscribers_email ON sh_subscribers(user_email);
CREATE INDEX idx_sh_subscribers_stripe_customer ON sh_subscribers(stripe_customer_id);

-- ==========================================================================
-- 2. sh_content — Content library (meditations, shadow work, reiki sessions)
-- ==========================================================================
CREATE TABLE sh_content (
  id                BIGSERIAL PRIMARY KEY,
  category          TEXT NOT NULL,           -- 'meditation' | 'shadow_work' | 'reiki'
  title             TEXT NOT NULL,
  description       TEXT DEFAULT '',
  content_body      TEXT,                    -- storage path for audio, e.g. 'audio/15.mp3'
  duration_minutes  INTEGER,
  thumbnail_url     TEXT,
  is_preview        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sh_content_category ON sh_content(category);
CREATE INDEX idx_sh_content_is_preview ON sh_content(is_preview);
CREATE INDEX idx_sh_content_sort ON sh_content(category, sort_order);

-- ==========================================================================
-- 3. sh_content_progress — What each user has completed
-- ==========================================================================
CREATE TABLE sh_content_progress (
  id           BIGSERIAL PRIMARY KEY,
  user_email   TEXT NOT NULL,
  content_id   BIGINT NOT NULL REFERENCES sh_content(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_email, content_id)            -- one completion per session (idempotent)
);
CREATE INDEX idx_sh_progress_email ON sh_content_progress(user_email);
CREATE INDEX idx_sh_progress_content ON sh_content_progress(content_id);

-- ==========================================================================
-- 4. sh_affirmation_favourites — Saved affirmations (0..19 index into 20-item list)
-- ==========================================================================
CREATE TABLE sh_affirmation_favourites (
  id                 BIGSERIAL PRIMARY KEY,
  user_email         TEXT NOT NULL,
  affirmation_index  INTEGER NOT NULL CHECK (affirmation_index BETWEEN 0 AND 19),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_email, affirmation_index)
);
CREATE INDEX idx_sh_affirm_fav_email ON sh_affirmation_favourites(user_email);

-- ==========================================================================
-- 5. sh_manifestation_responses — 5-field manifestation exercise
-- ==========================================================================
CREATE TABLE sh_manifestation_responses (
  id                  BIGSERIAL PRIMARY KEY,
  user_email          TEXT NOT NULL,
  what_to_manifest    TEXT,
  why_you_want_it     TEXT,
  version_achieved    TEXT,                   -- description of your future self
  does_differently    TEXT,                   -- behaviour change
  one_action          TEXT,                   -- first concrete step
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sh_manifest_email ON sh_manifestation_responses(user_email);

-- ==========================================================================
-- 6. sh_shadow_work_responses — 7 reflection prompts per session
-- ==========================================================================
CREATE TABLE sh_shadow_work_responses (
  id          BIGSERIAL PRIMARY KEY,
  user_email  TEXT NOT NULL,
  content_id  BIGINT REFERENCES sh_content(id) ON DELETE SET NULL,
  prompt_1    TEXT,
  prompt_2    TEXT,
  prompt_3    TEXT,
  prompt_4    TEXT,
  prompt_5    TEXT,
  prompt_6    TEXT,
  prompt_7    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sh_shadow_email ON sh_shadow_work_responses(user_email);
CREATE INDEX idx_sh_shadow_content ON sh_shadow_work_responses(content_id);

-- ==========================================================================
-- updated_at trigger (for content + subscribers)
-- ==========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sh_content_updated
  BEFORE UPDATE ON sh_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sh_subscribers_updated
  BEFORE UPDATE ON sh_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==========================================================================
-- Row Level Security (RLS)
-- Users can only read/write their own rows. Admin bypasses via service_role.
-- ==========================================================================

-- sh_content: public read for is_preview OR authenticated read for all
ALTER TABLE sh_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads preview"      ON sh_content FOR SELECT USING (is_preview = TRUE);
CREATE POLICY "authenticated reads all"   ON sh_content FOR SELECT TO authenticated USING (TRUE);

-- sh_subscribers: user reads own row only
ALTER TABLE sh_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own subscription"
  ON sh_subscribers FOR SELECT TO authenticated
  USING (user_email = auth.email());

-- sh_content_progress: user manages own rows
ALTER TABLE sh_content_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own progress"   ON sh_content_progress FOR SELECT TO authenticated USING (user_email = auth.email());
CREATE POLICY "user writes own progress"  ON sh_content_progress FOR INSERT TO authenticated WITH CHECK (user_email = auth.email());
CREATE POLICY "user deletes own progress" ON sh_content_progress FOR DELETE TO authenticated USING (user_email = auth.email());

-- sh_affirmation_favourites: user manages own
ALTER TABLE sh_affirmation_favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own favs"   ON sh_affirmation_favourites FOR SELECT TO authenticated USING (user_email = auth.email());
CREATE POLICY "user writes own favs"  ON sh_affirmation_favourites FOR INSERT TO authenticated WITH CHECK (user_email = auth.email());
CREATE POLICY "user deletes own favs" ON sh_affirmation_favourites FOR DELETE TO authenticated USING (user_email = auth.email());

-- sh_manifestation_responses: user manages own
ALTER TABLE sh_manifestation_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own manifest"  ON sh_manifestation_responses FOR SELECT TO authenticated USING (user_email = auth.email());
CREATE POLICY "user writes own manifest" ON sh_manifestation_responses FOR INSERT TO authenticated WITH CHECK (user_email = auth.email());

-- sh_shadow_work_responses: user manages own
ALTER TABLE sh_shadow_work_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own shadow"  ON sh_shadow_work_responses FOR SELECT TO authenticated USING (user_email = auth.email());
CREATE POLICY "user writes own shadow" ON sh_shadow_work_responses FOR INSERT TO authenticated WITH CHECK (user_email = auth.email());

-- ==========================================================================
-- Storage bucket for audio files
-- ==========================================================================
-- Run this in Supabase Studio → Storage → create bucket:
--   Bucket name: sh-audio
--   Public: NO (require authentication)
--   File size limit: 50MB (largest file is 30MB)
--
-- Then set policy:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('sh-audio', 'sh-audio', false);
--
--   CREATE POLICY "authenticated can read audio"
--   ON storage.objects FOR SELECT TO authenticated
--   USING (bucket_id = 'sh-audio');
--
--   CREATE POLICY "service_role can write audio"
--   ON storage.objects FOR ALL TO service_role
--   USING (bucket_id = 'sh-audio');

-- ==========================================================================
-- DONE
-- ==========================================================================
-- Next step: run data/import_from_glide.sql (or Python script) to load
-- content rows from data/raw/admin_content.json into sh_content.

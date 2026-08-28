# Data Directory — Divine Healing Migration

This folder holds every piece of content extracted from the original Glide app plus the Supabase migration scripts.

## Folder layout

```
data/
├── raw/                     ← JSON pulled straight from the Glide API (do not edit)
├── content/                 ← Hard-coded content parsed out of the JS bundle
├── supabase_schema.sql      ← DDL to run in Supabase
├── import_content_to_supabase.js   ← Glide JSON → sh_content table
└── upload_audio_to_supabase.js     ← Local audio → Supabase Storage
```

## raw/ — Untouched Glide API responses

| File | Source API | Contents |
|-----|---------|------|
| `admin_content.json` | `GET /app-api/admin/content` | Metadata for all 24 sessions |
| `admin_subscribers.json` | `GET /app-api/admin/subscribers` | Subscriber list (1 today) |
| `content_all.json` | `GET /app-api/content` | Content for a signed-in user (essentially the same as admin) |
| `content_preview.json` | `GET /app-api/content/preview` | 3 free preview sessions |
| `content_meditation.json` | `GET /app-api/content?category=meditation` | 22 items |
| `content_shadow_work.json` | `GET /app-api/content?category=shadow_work` | 1 item |
| `content_reiki.json` | `GET /app-api/content?category=reiki` | 1 item |
| `content_chakra_healing.json` | `GET /app-api/content?category=chakra_healing` | **0 items** — this is not a DB category |
| `subscription_status.json` | `GET /app-api/subscription/status` | Current user's subscription state |
| `affirmations_favourites.json` | `GET /app-api/affirmations/favourites` | Favourites (0 today) |
| `audio_manifest.json` | (script generated) | Audio download manifest |
| `page_texts_v2.json` | (Playwright) | Rendered text per page |

## content/ — Static content that was hard-coded in the app

Content that lived directly in the Glide JS bundle rather than behind an API. It will ship as a Flutter asset in the new app.

| File | Contents |
|-----|------|
| `affirmations.json` | 20 affirmation strings (array) |
| `chakras.json` | 7 chakras (name / Sanskrit / description / affirmations / practices / imbalance signs) |
| `techniques.json` | 7 breathing techniques (name / subtitle / description / steps / benefits) |
| `category_meta.json` | Home 8-card routing / label / icon info |
| `shadow_work_prompts.json` | Shadow Work 7 reflection prompts |
| `manifestation_form.json` | Manifestation 5-field form structure |
| `spiritual_awakening.json` | Spiritual Awakening hero / benefits / expect / FAQs / prompts (complete) |
| `ShadowWorkJourney_source.js` | Original React source (kept for extra text extraction) |
| `ReikiJourney_source.js` | Original (text not yet extracted — parse if needed) |
| `ManifestationJourney_source.js` | Original (contains Understanding + Inner Work copy) |
| `SpiritualAwakening_source.js` | Original (spiritual_awakening.json covers most of it) |

## Supabase migration order

### 1. Create the Supabase project
- https://supabase.com → New Project
- Project name: `divine-healing-prod` (or `-staging`)
- Region: client is in Australia → **Sydney (ap-southeast-2)** recommended
- Save the DB password

### 2. Run the schema
- Dashboard → SQL Editor
- Paste all of `supabase_schema.sql` → Run
- Verify: Table Editor shows `sh_content`, `sh_subscribers`, and the other 6 tables

### 3. Create the storage bucket
- Dashboard → Storage → New bucket
- Name: `sh-audio`
- Public: **NO**
- File size limit: **50 MB** (largest file is around 30 MB)

### 4. Set environment variables
```powershell
$env:SUPABASE_URL="https://<project>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service_role key from Project Settings → API>"
```

Warning: the service role key is admin-level. Never expose it in client code or commit it to git.

### 5. Upload audio
```powershell
cd data
npm install @supabase/supabase-js
node upload_audio_to_supabase.js
```
This uploads the 22 mp3 files from `assets/audio/` to Storage.

### 6. Import content data
```powershell
node import_content_to_supabase.js
```
This inserts 24 sessions into `sh_content` and 1 record into `sh_subscribers`.

### 7. Verify
- Supabase Dashboard → Table Editor → `sh_content` → confirm 24 rows
- Storage → sh-audio → confirm 22 files
- SQL: `SELECT count(*), category FROM sh_content GROUP BY category;`
  - meditation: 22, shadow_work: 1, reiki: 1

## Using this from the Flutter app

### Static content (bundled with the app)
```
flutter_app/assets/content/
├── affirmations.json
├── chakras.json
├── techniques.json
├── shadow_work_prompts.json
├── manifestation_form.json
└── spiritual_awakening.json
```
Register under `assets:` in `pubspec.yaml` and load via `rootBundle.loadString('assets/content/affirmations.json')`.

### Dynamic content (fetched from Supabase)
- Session list: `supabase.from('sh_content').select('*').eq('category', 'meditation')`
- Audio URL: `supabase.storage.from('sh-audio').createSignedUrl(item.content_body, 3600)`

## Re-running notes

- `import_content_to_supabase.js` uses **upsert** — safe to run multiple times, no duplicates
- `upload_audio_to_supabase.js` uses **upsert: true** — files are overwritten
- Re-running the schema does a `DROP TABLE CASCADE` and wipes existing data — be careful in production

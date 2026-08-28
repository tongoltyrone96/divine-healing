# Divine Healing App — Project Context

Freelancer.com project (ID: 40666970). Rebuilding a Glide no-code app into a native Flutter app.

## Client & Contract

- **Client**: Strawberry Hope (Australia)
- **Platform**: Freelancer.com
- **Budget**: $500 AUD total (about USD $330). After the Freelancer $50 AUD commission, net take-home is about USD $300.
- **Timeline (proposed)**: 3 weeks (realistic scope is closer to 6-8 weeks)
- **Bid status**: awarded (accepted)
- **Freelancer accounts**: gstsaver (client) / Tyrone Jher Tongol (freelancer)
- **Communication style**: chat. Client is in an Australian evening / night timezone — no replies from her during our evening / night hours.

## Milestones

| # | Name | Amount (AUD) |
|---|------|-----------|
| 1 | Setup UI Design core navigation | $150 |
| 2 | Fully Functioning | $350 |

## App Details

- **App name (new)**: Divine Healing by Strawberry Hope
- **App name (Glide original)**: Spiritual Healing
- **Glide URL**: https://p7d350073-spiritual-healing--gstsaver.glideos.app
- **Admin access**: Glide admin invite has been sent to tongoltyrone84@gmail.com.

## Scope

### 8 Content Categories (Home cards) vs 4 real Library categories
**Home 8 cards** (marketing / landing): Meditations, Shadow Work, Chakra Healing, Reiki, Manifestation, Affirmations, Breathing, Spiritual Awakening

**Library actual filters** (audio sessions): All | Meditations | Shadow Work | Chakra Healing | Reiki only.

The remaining 4 are **different UI types** (not audio sessions):
- **Affirmations**: 20 text cards (favourites / daily)
- **Breathing**: 7 techniques (text)
- **Manifestation**: 5-field form exercise
- **Spiritual Awakening**: text + reflection prompts

### Actual session count (confirmed in Admin tab 2026-08-25)
**24 sessions total**:
- Meditation category: 22 (21 with audio + 1 without: "ABC")
- Shadow Work: 1 ("Shadow Work Meditation", audio included)
- Reiki: 1 ("Introduction to Reiki", no audio, text only)

**22 audio files** to download in total. Slightly more than the initial ~20 estimate.

**3 free previews**: Anxiety Release (10 min), Anxiety Release Short (5 min), Introduction to Reiki

**Session list** (Meditation category):
Chemotherapy(18m), Emotional Detox(12m), Chakra(22m), Heart Healing(12m), Manifestation(11m), Anxiety Release(10m, Free), Inner Child(17m), Morning Meditation(13m), Present Meditation(22m), Shadow Meditation(13m), Energy Clearing(9m), Aura Meditation(9m), Confidence(9m), Forgivness(7m)[sic], Selflove(10m), Sleep Meditation(7m), Anxiety Release Short(5m, Free), Evening Calm(7m), Charkra Short(6m)[sic], Breath Reset(6m), Grounding(8m), ABC(no audio)

Warning — **typos in the DB**: "Forgivness" (→ Forgiveness), "Charkra Short" (→ Chakra Short). Ask the client whether to fix them.

### Main tabs
Home / Library / Profile / Admin
- **Admin is an in-app tab** (not a separate web panel) — the fourth tab of the Glide app. It handles content management + subscriber management.
- Decision: the Flutter mobile app will **not** include the Admin tab. The client will continue using the Glide URL as her admin panel.

### Features
- **Login**: Google + Microsoft + Email (all three, same as Glide)
- **Audio player**: background playback + lock-screen controls + interruption handling required
- **Journaling**: for Shadow Work (prompt_1 through prompt_7, the same prompts on every session)
- **Manifestation exercise**: 5-field structured form (what_to_manifest, why_you_want_it, version_achieved, does_differently, one_action)
- **Reflection prompts**
- **Booking**: Square appointment system (handled via link embed)
- **Subscription**: Stripe (not yet implemented. **Warning: Apple IAP is mandatory — 30% commission. RevenueCat is recommended to unify the flow.**)
  - **Pricing confirmed** (visible on the Profile tab): **Monthly $19/mo**, **Annual $149/yr** (35% off vs monthly)
  - Currency unit is not displayed on that page — assume USD but confirm with the client (Australia, so AUD is possible)
- **Free/Paid tier**: free tier real content = **3 sessions** (Anxiety Release, Anxiety Release Short, Introduction to Reiki). The remaining 21 sessions are paid.
- **Push notifications**: wanted (daily reminders). Consider deferring to v1.1.
- **Offline support**: preferred
- **Audio files**: **22** (2 of the 24 sessions have no audio: ABC, Introduction to Reiki). Download complete → `assets/audio/` (2026-08-25, 325 MB total).
- **Booking**: Warning — CLAUDE.md initially said "Square", but the actual app shows **"Zoom Sessions Only"** — the `/booking` page has a "Book a Zoom Session" button that redirects to an external booking page. The real system may be Zoom itself or Square / Calendly — confirm by clicking through (screenshot: `reference/screenshots/features/booking_full.png`).

## Extracted Data (2026-08-25 Playwright automation)

**All content has been captured locally.** File locations:

### Extracted via API
- `data/raw/admin_content.json` — full metadata for all 24 sessions
- `data/raw/admin_subscribers.json` — 1 subscriber (gstsaver@me.com, "Complimentary" plan)
- `data/raw/content_preview.json` — 3 free preview sessions
- `data/raw/audio_manifest.json` — audio file mapping
- `data/raw/subscription_status.json` — current user's subscription state
- `data/raw/affirmations_favourites.json` — favourites (currently 0)
- `data/raw/page_texts_v2.json` — rendered text per page

### Extracted from the JS bundle (hard-coded content)
- `data/content/affirmations.json` — 20 affirmations (complete)
- `data/content/chakras.json` — 7 chakras, full data (name, sanskrit, description, affirmations, practices, imbalance)
- `data/content/techniques.json` — 7 breathing techniques, full data (name, subtitle, description, steps, benefits)
- `data/content/category_meta.json` — 8-card routing info
- `data/content/ShadowWorkJourney_source.js` — original React source (for text extraction)
- `data/content/ReikiJourney_source.js`
- `data/content/ManifestationJourney_source.js`
- `data/content/SpiritualAwakening_source.js`

### App Architecture (API map)
**Base**: `https://p7d350073-spiritual-healing--gstsaver.glideos.app`

Read:
- `GET /app-api/content` — all content (optional `?category=<meditation|shadow_work|reiki>`)
- `GET /app-api/content/preview` — free preview items
- `GET /app-api/content/{id}` — single item
- `GET /app-api/subscription/status` — current user's subscription
- `GET /app-api/affirmations/favourites` — user's favourites
- `GET /app-api/audio/{content_body}` — audio file (content_body starts with `audio/`)
- `GET /app-api/admin/content` — admin: all content (same as regular /content)
- `GET /app-api/admin/subscribers` — admin: subscriber list

Write:
- `POST /app-api/content/{id}/complete` — mark session done
- `POST /app-api/shadow-work/save` — save journal
- `POST /app-api/manifestation` — save 5-field form
- `POST /app-api/affirmations/favourites` (body: {index}) — add favourite
- `DELETE /app-api/affirmations/favourites/{index}` — remove favourite
- `POST /app-api/admin/content` — create session
- `PUT /app-api/admin/content/{id}` — update session
- `DELETE /app-api/admin/content/{id}` — delete session
- `POST /app-api/admin/upload-audio/{id}` — upload audio (multipart)

### Category → URL routing (in-app)
| Home card | Category (DB) | Route |
|-----------|--------------|-------|
| Meditations | `meditation` | `/library/meditation` |
| Shadow Work | `shadow_work` | `/library/shadow_work` |
| Chakra Healing | (none — hard-coded) | **`/chakras`** (special case) |
| Reiki | `reiki` | `/library/reiki` |
| Manifestation | (none — hard-coded) | `/manifestation` |
| Affirmations | (none — hard-coded) | `/affirmations` |
| Breathing | (none — hard-coded) | `/breathing` |
| Spiritual Awakening | (none — hard-coded) | `/spiritual-awakening` |

**Important**: Chakra Healing is not a DB category. **The 7 chakras are hard-coded into the app source** (see chakras.json).
For the same reason, Manifestation / Affirmations / Breathing / Spiritual Awakening are all hard-coded too. When migrating to Supabase these static pieces can either:
1. Ship as a static asset inside the Flutter app (no localisation needed) — **recommended**
2. Or live in a separate Supabase table (e.g. `sh_static_content`) for management

### Automation Setup (reusable)
Playwright scripts under `e:\Tasks\Glide_app\automation\`:
- `02_launch_persistent.js` — sets up the Chromium session (one-time)
- `05_extract_content.js` — calls the API and downloads audio
- `06_extract_pages.js`, `07_final_pages.js` — automates page screenshots
- `08_parse_bundle.js` — extracts data from the JS bundle
- `browser-session/` — saved login session (do not touch)

**Re-run**: `cd automation && node <script>.js`. The session stays alive so no re-login is needed.

### Client email (new info)
**Client's real email: `gstsaver@me.com`** (separate from the Freelancer account `gstsaver`).


## Database Schema (client-provided)

6 tables — **Supabase recommended** (Postgres schema is a perfect match + 3-way auth + storage):

### `sh_subscribers` — Stripe subscriptions
```
id, user_email, stripe_customer_id, stripe_subscription_id,
subscription_status, plan_name, trial_ends_at, current_period_end,
created_at, updated_at
```

### `sh_content` — content library
```
id, category, title, description, content_body, duration_minutes,
thumbnail_url, is_preview (bool — free teaser), sort_order,
created_at, updated_at
```

### `sh_content_progress` — per-user completion log
```
id, user_email, content_id, completed_at
```

### `sh_affirmation_favourites`
```
id, user_email, affirmation_index, created_at
```

### `sh_manifestation_responses` — 5-field form
```
id, user_email, what_to_manifest, why_you_want_it, version_achieved,
does_differently, one_action, created_at
```

### `sh_shadow_work_responses` — 7 reflection prompts
```
id, user_email, content_id, prompt_1 … prompt_7, created_at
```

## Design System (client-provided)

### Colours
- **Forest Green** `#4A6F5A` — headers, buttons
- **Moss Green** `#7BA68E` — cards, accents
- **Soft Sage** `#C9D8C5` — backgrounds
- **Sage Mist** `#F3F7F3` — light backgrounds
- **Warm Earth** `#D9C2A3` — module cards
- **Soft Clay** `#C7A27A` — highlights
- **Sunlight Gold** `#E7C77A` — borders, icons
- **Sandstone** `#E8DCCB` — confirmed 2026-08-25
- **Strawberry Blush** `#D96A7B` — confirmed 2026-08-25

### Typography
- Headings: **Playfair Display**
- Body: **Nunito**
- Buttons: Inter
- Confirmed by client 2026-08-25.

### Style
Rounded cards, soft drop shadow, nature icons (leaves, seedlings, moon, hands), soft gradients, feminine / organic tone.

### Screens (client-defined in detail)
Splash / Home / Module page / Meditation player / Journaling screen — detailed mockup specs exist (colours, icons, layout).

## Tech Stack (recommended)

| Area | Choice |
|------|------|
| Framework | **Flutter** (Tyrone has 5 years of Flutter experience) |
| Backend | **Supabase** (Postgres + 3-provider auth + storage + Stripe webhook) |
| Audio | `just_audio` + `audio_service` (background playback / lock screen) |
| Payment | Stripe + **RevenueCat** (unified iOS/Android IAP wrapper) |
| Push | Firebase Cloud Messaging |
| State | Riverpod or Bloc |

## Open Questions (all resolved via the 2026-08-25 client reply)

1. Free tier: 2 free meditations (Anxiety Release, Anxiety Release Short) + Reiki info + Spiritual Awakening info + Bookings. Rest = paid.
2. Free trial: **7 days**, then paid.
3. Subscription: **CAD $19/mo, CAD $149/yr** (client corrected from AUD to CAD).
4. Fonts: **Playfair Display + Nunito**. Confirmed.
5. Hex codes: confirmed 2026-08-25 (client sent "ends in CCB" / "ends in 7B" — the emoji was `B)` → 😎 auto-conversion).
   - Sandstone: **#E8DCCB**
   - Strawberry Blush: **#D96A7B**
6. Logo: no file exists. Tyrone will design it from the brand notes.
   - **Concept per client**: **nature + moon + fairies** (client wrote "ferries" — typo for "fairies").
7. Not asked yet — deferred until closer to store submission.
8. DB typos: not answered. Assume fix during migration ("Forgivness" → "Forgiveness", "Charkra Short" → "Chakra Short").
9. Reiki: text only, no more audio planned. Add a "Book Session with Strawberry Hope" button linking to the booking calendar.
10. Shadow Work: not answered — assume no expansion.

## New Requirements from Client (2026-08-25 response)

- **Reiki page**: add a "Book Session with Strawberry Hope" button → booking calendar. Implemented in `library_screen.dart` (shown when filter = reiki).
- **Spiritual Awakening page**: add a "Book coaching with Strawberry Hope" button → booking calendar. Implemented in `_placeholders.dart::SpiritualAwakeningScreen`.
- **Booking flow**: Square calendar link (URL to be provided by client). Later they will enable Square payment BEFORE booking, then send a manual Zoom link post-payment. Current implementation uses `url_launcher` to open the external Square page.
- **Free tier definition** (see #1 above).
- **7-day free trial** on Monthly + Annual subs.
- **Currency**: CAD everywhere.

## Client Account Setup Status (2026-08-25)

- **Stripe**: client has no account. Needs to sign up. Blocks M2.
- **Apple Developer**: client wants Tyrone to start "when you can" — but signup requires her identity + credit card. Explained in the follow-up. Client action needed.
- **Google Play**: same as Apple. Client action needed.
- **Supabase**: client is OK with using it. Waiting for her to create a free account + share the API keys.

## Live Deployment (M1 Preview)

**Vercel URL**: **https://divine-healing-iota.vercel.app**
- Public (SSO protection disabled via API)
- Flutter web build served from Vercel
- Mobile-responsive (tested at 390x844 iPhone viewport)
- **Sent to the client 2026-08-25 for M1 approval**
- Redeploy: `cd divine_healing/build/web && npx vercel deploy --prod --yes --name divine-healing --scope tyrone-jher-tongols-projects`
- Rebuild: `cd divine_healing && .\run_local.ps1 build web --release`
  - **Must go through `run_local.ps1`.** Calling `flutter build web --release`
    directly passes no `--dart-define`, so `Env.hasSupabase` is false and the
    app silently falls back to M1 local-only mode — no audio, no auth, no
    subscription. The script forwards only the client-safe keys.

## Immediate Next Steps

### Tonight
1. Confirm Freelancer accept + first milestone $150 funded status
2. Accept the Glide admin invite email
3. Screenshot the entire Glide app (all categories + detail pages)
4. Download all audio / image / text content
5. Draft the morning summary that consolidates the Open Questions above

### Tomorrow morning
- Send the morning summary to the client → start setup work while waiting on her reply.

### This Week
1. Init the Flutter project
2. Create the Supabase project + run the 6-table schema SQL
3. Upload audio files to Supabase Storage
4. Encode the brand colours / fonts into `theme.dart`
5. Splash + Home → send screenshots to the client for approval

## Risks & Notes

- **Budget is very tight**: net USD $300 vs a realistic 6-8 week scope. Decision was to accept it and finish.
- **3-week timeline is tight**: consider cutting MVP scope (IAP + Push moved to v1.1).
- **Apple IAP issue**: already pre-warned the client. Web Stripe alone will be rejected by iOS review.
- **Login mismatch resolved**: client ultimately picked "all options" (Google + Microsoft + Email).

## Client Communication History Summary

1. **First contact**: "Have you ever moved an app from Glide to a proper app?" → replied: yes, with wellness/content app examples.
2. **Client shares the Glide link** → detailed analysis reply (8 categories, IAP warning, 5 questions).
3. **Negotiation**: 3 weeks, $500 → client asks how to make milestones.
4. **Milestones proposed**: 3-stage $150 / $200 / $150 → client actually creates 2 stages $150 / $350.
5. **Awarded + schema shared**: 6-table DB schema + brand system delivered.
6. **Latest**: client went to bed ("night time here"). Tyrone will accept the admin email + explore the app.

## Persona Note

Tyrone Jher Tongol — 9+ years senior software engineer, 5 years senior Flutter experience, .NET / C# full-stack, LLM integration experience. Based in Angeles, Philippines. Email: tongoltyrone84@gmail.com.

## File / Comment Language Policy

All files inside this project must be written in English (code, comments, docs, HTML previews, markdown). Chat with the developer may be in Korean, but nothing Korean should ever be committed to the repo.

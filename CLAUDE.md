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

## New Requirements from Client (2026-08-25 response)

- **Reiki page**: add a "Book Session with Strawberry Hope" button → booking calendar. Implemented in `library_screen.dart` (shown when filter = reiki).
- **Spiritual Awakening page**: add a "Book coaching with Strawberry Hope" button → booking calendar. Implemented in `_placeholders.dart::SpiritualAwakeningScreen`.
- **Booking flow**: Square calendar link (URL to be provided by client). Later they will enable Square payment BEFORE booking, then send a manual Zoom link post-payment. Current implementation uses `url_launcher` to open the external Square page.
- **Free tier definition** (see #1 above).
- **7-day free trial** on Monthly + Annual subs.
- **Currency**: CAD everywhere.

## Client Account Setup Status

- **Stripe**: DONE. Live keys received 2026-08-27; products, payment links and the
  webhook are provisioned (see `data/10_*`–`15_*`).
- **Supabase**: DONE. Project `buzdtsupgmytqokgfsbn`, schema + RLS applied, 24 rows
  and 22 audio objects loaded.
- **Apple Developer**: ENROLLED 2026-08-26. Welcome mail sent to gstsaver@me.com, so
  the membership is active — what the client describes as "being processed" is most
  likely the Paid Applications Agreement, which sits in Processing while tax and
  banking details are reviewed.
  - The mail opens "Hello Mark", so the **account holder's name is not Strawberry
    Hope**. Confirm whether the team is Individual or Organization: an Individual
    team lists the app under the holder's legal name on the store, which is probably
    not the brand she wants shown.
  - **App Store Small Business Program**: opt in. Drops Apple's cut from 30% to 15%
    under $1M/yr, which on CAD $19/mo is the difference between viable and not.
  - Still needed from her: Team ID, an App Store Connect invite for
    tongoltyrone84@gmail.com (Admin or App Manager), the signed Paid Applications
    Agreement, and tax + banking details.
- **Google Play**: NOT STARTED. USD $25 one-time, and the identity verification now
  takes days, so this is the long pole. Client action needed.

## Booking

Confirmed by the client 2026-08-28: **https://divine-healing-106774.square.site**
Recovered from the Glide bundle before she confirmed it; wired into
`booking_screen.dart`.

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

## Current State (2026-08-30)

### Done and verified on a real device (Motorola XT2557-1, Android 16)
- All content restored; `node data/08_audit_content_coverage.js` reports zero
  missing passages. Reiki had shipped with none of its content at all.
- Audio paywall enforced in Storage RLS, not just the UI:
  `node data/04_verify_paywall.js` passes.
- Background playback, lock-screen controls, artwork, interruption handling.
- Google sign-in, including the deep-link return that had never worked on
  either platform.
- Fonts bundled (google_fonts removed — it fetched at runtime and failed).
- Live on Play internal testing:
  https://play.google.com/apps/internaltest/4701738235794999065
- Web demo: https://divine-healing-iota.vercel.app

### Blocked on the client
- Apple + Google payment details (tax/bank). Nothing paid ships until both
  clear. Waiting on her ABN — she said up to 48h as of 2026-08-29.
- App Store Connect API key: Issuer ID `027e6790-d592-4674-ada9-714978737be5`
  received; Key ID and the .p8 still outstanding. The key page errors out for
  our account, so she has to create it.
- EU trader status (Account Holder only).
- App Store Small Business Program enrolment — not automatic, must apply.
- 12 testers for the Play closed test. Two-week clock, cannot be shortened.

### Not built yet
- **In-app purchases.** The Profile screen still opens live Stripe payment
  links in a browser. Both stores forbid that for in-app digital goods, so
  this is the last substantial piece. `purchases_flutter` is in pubspec,
  unused.
- **Sign in with Apple.** Apple requires it wherever Google sign-in is
  offered; without it the app is rejected. Not on the sign-in screen yet.
- Push notifications, offline support (agreed as v1.1).
- Store listings: screenshots, icon, descriptions (client approved the
  drafts), age rating.

### iOS builds (2026-08-31)

Working end to end. The repo is private at `tongoltyrone96/divine-healing`
and `.github/workflows/ios-testflight.yml` builds, signs and uploads on
`workflow_dispatch`. **Build 7 is VALID in TestFlight.**

Getting there took four attempts, and three of the four failures pointed
somewhere other than their cause:

1. The workflow file would not parse — a `python3 -c` block inside a YAML
   block scalar. GitHub reported it as a missing `workflow_dispatch`
   trigger.
2. Automatic signing asked Apple for a *development* profile, which lists
   permitted devices; the team has none. The error named the missing
   devices, not the wrong profile type.
3. Signing settings passed to `xcodebuild` applied to every Pod and SwiftPM
   package, none of which accept a provisioning profile.
4. **ITMS-90683** — no `NSMicrophoneUsageDescription`. Builds 5 and 6
   uploaded with no errors and were then discarded during processing.
   Apple emails the reason to the Account Holder only, so from this side it
   looked like the builds had simply vanished. The app never records; a
   linked media framework references the API, and that alone requires the
   string.

`CFBundleIconName` and `ITSAppUsesNonExemptEncryption` were missing too,
found by unpacking the IPA from the run artifact rather than waiting on
another email. Unpacking the artifact is much cheaper than a rebuild —
worth doing first whenever a build disappears.

The app-level `PrivacyInfo.xcprivacy` is still absent. Apple treats that as
a warning, so it is on the list but has never blocked a build.

### Next
1. TestFlight testers — build 7 is installable as soon as a group exists
   and the client is invited.
2. Sign in with Apple — the package is already in the build, the button is
   not on the sign-in screen, and Apple requires it wherever Google sign-in
   appears.
3. RevenueCat once the store payment details clear.

## Working Notes

- **Android builds run in WSL**, never on Windows. Astrill VPN registers
  ASProxy64.dll as a Winsock LSP, which crashes Gradle's JVM before it
  starts. `automation/wsl/` holds the toolchain and build scripts;
  `03_build_android.sh apk|aab` is the entry point. adb still works on
  Windows — only the JVM is affected.
- The same VPN throttles large downloads to zero rather than failing. Every
  downloader without retry logic dies on it, so SDK packages, the Gradle
  distribution and the Flutter engine artifacts are prefetched by the
  numbered scripts in `automation/wsl/`.
- `.dart_tool/package_config.json` holds absolute paths, so Windows and WSL
  cannot share one. Both build scripts run `flutter pub get` first.
- **Play never reuses a versionCode.** Bump `version:` in pubspec before
  every upload; currently at `1.0.0+3`.
- Content edits go to Supabase, not to the old Glide admin — Glide no longer
  feeds this app. The client needs walking through the Table Editor.
- **iOS signing is manual and deliberate.** Automatic signing kept asking
  Apple for a *development* profile, which lists permitted devices; the team
  has none, so it failed with a message about missing devices rather than
  about the wrong profile type, and left two unused development certificates
  on the account. `node data/20_appstore_api.js create-distribution` makes
  the certificate and App Store profile directly; the settings live in the
  Runner target's Release configuration, because passing them to `xcodebuild`
  applies them to every Pod and SwiftPM package, none of which accept a
  profile. The certificate expires **2027-08-30**.
- macOS runners bill at 10x on a private repo — roughly eight free builds a
  month. There is no push trigger for that reason. Unpack the IPA from the
  run's artifact before spending another one.

## Security

`https://github.com/tongoltyrone96/Glide_app_mobile` is **public** and
contains the keystore password and a Google OAuth client secret, pushed
2026-08-28. Verified reachable unauthenticated. The keystore binary itself
did not leak. Not yet resolved: the repo needs taking down or making
private, and the OAuth client rotating.

## Risks & Notes

- **Budget is very tight**: net USD $300 vs a realistic 6-8 week scope. Decision was to accept it and finish.
- **3-week timeline is tight**: consider cutting MVP scope (IAP + Push moved to v1.1).
- **Apple IAP issue**: already pre-warned the client. Web Stripe alone will be rejected by iOS review.
- **Login mismatch resolved**: client ultimately picked "all options" (Google + Microsoft + Email).

## Persona Note

Tyrone Jher Tongol — 9+ years senior software engineer, 5 years senior Flutter experience, .NET / C# full-stack, LLM integration experience. Based in Angeles, Philippines. Email: tongoltyrone84@gmail.com.

## File / Comment Language Policy

All files inside this project must be written in English (code, comments, docs, HTML previews, markdown). Chat with the developer may be in Korean, but nothing Korean should ever be committed to the repo.

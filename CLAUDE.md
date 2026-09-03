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
`workflow_dispatch`. **Builds 7, 8 and 9 are VALID in TestFlight**; 9 is current.

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

### Sign in with Apple (2026-08-31)

Done and shipped in build 8. The button had been on the sign-in screen all
along but ran the web OAuth flow; iOS now opens the system sheet through
AuthenticationServices and hands Supabase the identity token. The nonce is
generated raw, hashed for Apple, and the raw value given to Supabase so a
token cannot be replayed between sessions.

The entitlement meant enabling `APPLE_ID_AUTH` on the bundle ID and
reissuing the provisioning profile — a profile is a snapshot of the bundle
ID's capabilities when it was made, so the old one would have been
rejected for claiming an entitlement it did not carry. Both steps are
`node data/20_appstore_api.js refresh-profile`; it also prints the command
to update the `APPSTORE_PROFILE` secret, which must be done or the next
build signs with the stale profile.

Apple rejects the capability without a configuration — "Please select at
least one configuration for Sign In with Apple" — so the request sends
`APPLE_ID_AUTH_APP_CONSENT: PRIMARY_APP_CONSENT`.

**Not yet working at runtime.** Supabase needs the Apple provider enabled
with `com.divinehealing.app` as an authorised client ID; until then the
button reaches Apple and fails on the way back. Dashboard only — there is
no management token in `.env`.

### TestFlight, public link (2026-09-04)

Two App Store Connect invitations to the client's daughter were issued and
neither arrived. Apple's side showed both as pending, which reads as a
delivery failure and sent us looking at spam filters for two days. The
address was simply misspelled: `cosmicremembrance@gmail.com` for
`cosmicrememberance@gmail.com`. Apple accepts any syntactically valid
address and reports the invitation as pending whether or not a mailbox
exists, so nothing on this side ever contradicted it. **An address the
client typed once, in a chat message, is worth reading back to them
before it costs two days.**

The public link is worth having regardless: internal testers must be App
Store Connect users, so reaching one always starts with an email that has
to be delivered and accepted.

`node data/20_appstore_api.js external-group` builds the way around it:
an external group with a public link that anyone can open.

  https://testflight.apple.com/join/qBPUu1PD

The link is issued immediately but serves nothing until Beta App Review
approves the build, which is the price of an external group. That review
needs three things the App Store review details do not cover, all
separate resources: `betaAppReviewDetail` (contact and demo account),
a `betaAppLocalization` (the description on the TestFlight card), and
the build submitted as a `betaAppReviewSubmission`. Build 12 went in on
2026-09-04.

### TestFlight

Internal group **Internal Testers**, `hasAccessToAllBuilds`, with
gstsaver@me.com and tongoltyrone84@gmail.com invited. Internal rather than
external because internal groups skip Beta App Review, which holds an
external group's first build for a day or two; the cost is that testers
must be App Store Connect users, and both already are.

Builds 7 and 8 are VALID. `node data/20_appstore_api.js testflight-setup
<emails>` is idempotent and adds more.

### Store listing (2026-08-31)

Everything that does not depend on the Paid Applications Agreement is
done, through `data/20_appstore_api.js`:

- **Copy** in `data/store/app_store_en-US.json`, applied with
  `store-metadata`. Written from what the binary contains. **The client has
  not seen this wording** — the drafts she approved were never written down.
- **Age rating 4+.** All NONE except `healthOrWellnessTopics`, which is what
  the whole app is. Apple's questionnaire has grown attributes since the
  docs; missing ones surface only as 409s naming them.
- **Screenshots** uploaded to the `APP_IPHONE_67` set, 1320x2868, produced
  by the simulator workflow. `upload-screenshots <dir>` replaces the set
  rather than appending.
- **Privacy policy** at https://divine-healing-iota.vercel.app/privacy.
  Every Vercel path but the root used to 404 — the build is a static
  directory and `/privacy` is not a file. `web/vercel.json` rewrites to
  index.html and travels with each build.

Two API quirks: Apple rejects `limit` on singleton relationships, while the
VPN stalls on a bare path, so those calls carry a `fields` parameter
instead.

**Worth a lawyer's eye before submission.** The Reiki page says balanced
energy makes you "less likely to get sick". App Review rejects health
claims it considers unsubstantiated, and this is the client's own wording,
so it is her call rather than ours.

### Content (2026-08-31)

The client's decisions are applied. `sh_content` holds **23 rows**: the
empty "ABC" session is gone, and "Forgivness" and "Charkra Short" are
spelled correctly. `data/21_fix_content_titles.js` did it and is safe to
re-run; the bundled `admin_content.json` fallback matches.

Deleting one row exposed that **"24" was written into five pieces of
user-facing copy**, all of which became wrong at once. The count now comes
from `sessionCountProvider`, which reads the loaded catalogue. She edits
content in Supabase directly, so any fixed number would go stale again the
next time she adds anything.

`SUPABASE_SECRET_KEY` now lives in `divine_healing/.env`. It has been shown
in screenshots and pasted into chat, so treat it as known — Tyrone's call
is to rotate at launch rather than mid-development. The file says so too.

### Subscriptions (2026-08-31)

**The Paid Applications Agreement is active.** The client said the payment
side was done for both stores; this proves it for Apple, because App Store
Connect refuses to create a subscription until the agreement is live and
there is no API that reports the agreement's status directly. The refusal
is the only signal, and it did not come.

`node data/20_appstore_api.js create-subscriptions` then
`configure-subscriptions` built:

- group **Divine Healing Membership**, with its own display name — without
  that the plans stay incomplete no matter how finished they look
- `com.divinehealing.app.monthly` CAD 19.00 and `.annual` CAD 149.00,
  matching Stripe
- availability in 175 territories — a subscription with none cannot be
  priced, and the refusal reads as a pricing error
- a seven-day free trial in each of those territories; the endpoint has no
  "everywhere" option
- a review screenshot each. 1080x1920 was rejected as
  IMAGE_INCORRECT_DIMENSIONS *after* a successful upload, so the iOS
  capture is used

Both still read `MISSING_METADATA`. Everything findable through the API is
set; App Store Connect's own UI names the remaining field, and the API does
not. Worth ten minutes in the browser before assuming anything is wrong.

Store screenshots live in `store/ios/` (1320x2868) and `store/play/`
(1080x1920, captured by `automation/play_screenshots.sh`). They are not
interchangeable: Play caps phone screenshots at 2:1 and the iOS set is
2.17:1, while Apple checks against its own device sizes.

### In-app purchases (2026-09-01)

**Built and shipped to TestFlight.** The Profile screen used to open a
Stripe payment link in a browser, which both stores forbid for digital
goods sold inside an app; it was the single most likely reason for a first
rejection. iOS and Android now purchase through RevenueCat, and the web
build keeps Stripe, where no store is involved and no commission is taken.

`sh_subscribers` is still the one source of truth. RevenueCat's webhook
writes the same rows the Stripe one does, so the audio paywall in Storage
RLS never had to learn which store took the money.

- App: `lib/services/purchases_service.dart`, wired into the Profile
  screen with Restore Purchases beside it — Apple requires that, and
  someone reinstalling has already paid.
- Webhook: `supabase/functions/revenuecat-webhook`, deployed and verified
  end to end (correct secret → 200, wrong secret → 401).
- After a purchase the app waits for the `sh_subscribers` row rather than
  unlocking immediately. The store confirms instantly but RLS reads that
  table, so until it lands the audio genuinely will not play.

RevenueCat project `91a7dfa1`, owned by the client. Configured: App Store
app connected (valid credentials), both products, entitlement
`full_access` — **the app looks for that exact string** — offering
`default` with `$rc_monthly` and `$rc_annual`.

Store products exist on both sides at CAD 19 and 149 with a seven-day
trial. Apple's read `Prepare for Submission`, which is normal: the first
subscription group is approved with the first app version. The API
reports `MISSING_METADATA` for the same records — the web UI is right and
the API is not, which cost an hour of looking for absent fields.

### Account deletion (2026-09-01)

Required by Play since 2023 and Apple's guideline 5.1.1(v) since 2022, and
asked about directly on Play's Data safety form. The app had sign-in and
no way out.

Profile → Account → Delete Account, the `delete-account` Edge Function,
and https://divine-healing-iota.vercel.app/delete-account for someone who
has already uninstalled. The function takes the caller from their JWT and
accepts no user id, and was checked against the anon key — which is itself
a valid JWT and would otherwise have been enough to reach it.

### Play store listing (2026-09-01)

All eleven dashboard items are done: listing copy, screenshots (phone
1080x1920 and tablet 1440x2560, both required), feature graphic, icon,
content rating, target audience, Data safety, health declaration, category
and contact details. Nothing is submitted — the app is still a draft and
`Send app for review` stays disabled until a release exists.

Two answers worth remembering:

- **Sign in details: Yes.** The subscription makes part of the app
  restricted, so Play requires reviewer credentials. It also forbids
  reviewers creating accounts, using their own, or taking a free trial.
- **Health features: stress management and relaxation only.** Not "mental
  and behavioural health", which is the clinical category and pulls in
  medical-app policy. Google then confirmed no regional requirements apply.

**Reviewer account**: `appreview@divinehealing.app`, password in the store
consoles. The app had no way for a reviewer to sign in — Google, Apple and
a magic link are all unusable by someone who cannot read the inbox — so
password sign-in was added to `AuthService`, and
`data/23_make_review_account.js` creates the account with an active
`sh_subscribers` row. Written rather than bought, because Play forbids the
alternative. Verified: it signs in, `sh_has_full_access` is true for it,
and it can sign a paid track while a signed-out caller still cannot.

Nothing in the app *sets* a password, so the magic link remains the only
way an ordinary person gets an account.

### Android purchases (2026-09-03)

**Done, and live on the internal track as versionCode 5.** The whole chain
is wired: Cloud project `divine-healing-506710`, service account, Pub/Sub
topic `play-rtdn` with Play confirmed publishing to it, RevenueCat's Play
app on valid credentials, both products attached to `full_access` and to
the `default` offering's packages beside the Apple ones.

Two defects surfaced in the webhook while wiring it, both fixed and
deployed (version 5, verified against the deployed body):

- `planName()` matched `endsWith('.annual')`, which is Apple's shape. Play
  sends `divine_healing_annual`, so every Play subscriber would have been
  stored under the raw product id.
- `SUBSCRIPTION_PAUSED` fell through to "no status change". Play lets a
  subscriber pause for up to three months, so they would have kept the
  whole library while paying nothing. Pause is also switched off in Play
  Console now; the code no longer depends on that.

### Closed testing, submitted 2026-09-03

The app is in review. Getting there turned up three things worth keeping:

- **A closed track will not take a live release while the app is a draft.**
  Play answers `Only releases with status draft may be created on draft
  app` — and it answers it on the *commit*, after the track assignment has
  already succeeded. Internal testing is the exception, which is why that
  track took a completed release without complaint. So the closed test
  cannot start until the app itself has been reviewed, which puts review
  ahead of the fourteen days rather than after them.
- **Play never reuses a version code**, so the same build cannot be
  uploaded to a second track. `--promote <versionCode>` assigns a bundle
  Play already holds.
- **The advertising ID declaration blocked the whole submission.**
  `purchases_flutter` pulls in `com.google.android.gms.permission.AD_ID`,
  so the honest answer is Yes with Fraud prevention as the only reason —
  Play checks that answer against the manifest. `data/store/play_data_safety.md`
  had claimed the app had no advertising ID access; it was wrong.

**Zero testers have opted in.** Being on the email list is not opting in,
and the dashboard counts only the latter. Five addresses are on the list,
three of which look like the client's own accounts.

### Android purchases, unfinished on device

The wiring is verified as far as the store: the app configures RevenueCat,
reaches BillingClient and is refused there, not in our code. What has never
run is an actual purchase, so the webhook writing a row, the `plan_name`
fix and the audio unlocking are all still unproven.

Tyrone's Motorola cannot finish it: `BILLING_UNAVAILABLE`, because
**Google Play billing is not offered in the SIM's region**. Play Store and
Play services are current, the app was installed by Play, and the account
is a licence tester — region is the only explanation left. **One of the
twelve testers has to be an Android user in a country where Play billing
works.**

Two device-level things cost an hour each and are worth remembering:

- A sideloaded build cannot purchase at all. `installer=null` means Play
  did not install it, and Play Billing refuses.
- **Google sign-in hangs on this phone.** The code is right —
  `LaunchMode.inAppBrowserView` — but Motorola ships `com.zui.browser` as
  the Custom Tabs provider, and it holds the `com.divinehealing.app://`
  callback at its own "deeplink check" instead of handing it back. Making
  Firefox the default browser fixed it. Real users on Motorola and Lenovo
  hardware will hit this, so the proper fix is native Google sign-in
  through `signInWithIdToken`, the way Apple sign-in already works on iOS.

### The fourteen days, running since 2026-09-03

Google approved the closed test fifteen minutes after it was submitted,
and twelve testers opted in the same afternoon, so the clock runs to about
**2026-09-17**. Fourteen addresses are on the list to leave two spare.

`data/store/play_production_access.md` holds Google's requirements and,
more usefully, what has to be *collected* while the clock runs. Meeting
the count is not the same as passing: the application asks what feedback
came back and what changed because of it, and Google refuses applications
for "insufficient tester engagement". That record cannot be written
afterwards.

The count is fragile in one specific way. **Revisiting the opt-in link
after joining shows a `Leave the program` button where `Become a tester`
used to be** — same URL, same position. One tester checking whether it
worked can drop the count below twelve and restart the fourteen days, so
the link must not be resent to anyone who has already joined.

The client has full access on both `gstsaver@gmail.com` and
`gstsaver@me.com` — `sh_subscribers` rows with `store: 'owner'`, active to
2031. She had never signed into the app, so the row that already existed
for `gstsaver@me.com` had never been used; Google sign-in on Android gives
the gmail address, which is why both are set.

### Next

1. Collect tester feedback in writing, and fix something with it. Check
   Monitor and improve → Ratings and reviews → Testing feedback as well as
   the client's inbox — the closed track's feedback channel points at her.
2. Get one tester in a country where Play billing works to complete a
   purchase. It is the only part of the app never proven end to end.
3. Run the pre-launch report before applying.
4. Decide with the client about the Reiki "less likely to get sick" line
   before the production application, not after a rejection.
2. Real-device checks, waiting on the client's wife's Apple ID: Sign in
   with Apple should show the system sheet rather than a browser, and the
   trial should open Apple's payment sheet.
3. Client: Small Business Program (Apple) and the 15% service fee (Play).
   Neither is automatic and each halves the commission.
4. Client: twelve Play testers. Fourteen continuous days, and the clock
   has not started.
5. Apple's EU trader review is open on her side. It gates EU distribution,
   not the build or the products.
6. Rotate the Supabase secret key and the RevenueCat webhook secret at
   launch. Both have been through this chat.

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
- **Play Console has no API access page any more.** Every guide still sends
  you to Setup → API access to link a Google Cloud project. It is gone from
  this account: the direct URL redirects to the app list for the account
  owner as well as for an Admin (all permissions), and the client spent an
  hour looking for it. Google's own current documentation no longer mentions
  linking at all — a service account made in *any* Cloud project works once
  it is invited under Users and permissions. That path needs nothing from
  the account owner, which is what unblocked this.
- **Play service account.** `revenuecat-play@divine-healing-506710.iam.gserviceaccount.com`,
  key at `divine_healing/.signing/play-service-account.json` (gitignored),
  invited with View financial data + Manage orders and subscriptions, no
  access expiry — an expiry would silently kill receipt validation one day.
  `node data/24_verify_play_credential.js <key.json>` checks it against the
  Play Developer API and names the missing permission on failure; do that
  before RevenueCat, which only ever says "invalid credentials".
- **Play product IDs differ from Apple's**: `divine_healing_monthly` and
  `divine_healing_annual`, against `com.divinehealing.app.monthly` / `.annual`
  on iOS. The app matches on `identifier.contains('monthly'|'annual')`, so
  both stores resolve without a per-platform branch.
- **Play rejects Billing Library below 8.0.0.** `purchases_flutter ^8.2.1`
  carried Billing 7.1.1 and the commit failed — the upload and the track
  assignment both succeeded first, so the bundle looked fine right up to the
  last call. `^10.10.1` fixes it; `purchasePackage` is deprecated there and
  `purchase(PurchaseParams.package(pkg))` returns a `PurchaseResult` rather
  than the `CustomerInfo` directly.
- **`node data/25_play_upload.js`** opens an edit, uploads, assigns a track
  and commits, with a dry run that opens an edit and throws it away. The
  service account needs `Release apps to testing tracks` on the app, which
  is not among the permissions RevenueCat asks for — Play answers 403 for
  that and for a rejected artifact alike.
- **Never trust the App Store Connect API's `state` on subscriptions.** It
  reported MISSING_METADATA on records the web UI showed as complete and
  ready. Check the browser before hunting for missing fields.
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

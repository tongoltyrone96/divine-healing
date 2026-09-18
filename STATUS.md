# Divine Awakening — status snapshot, 2026-09-18

A point-in-time summary for quick reference. The full history and reasoning
live in `CLAUDE.md`; this is just "where things stand right now."

## iOS

- **App Store review**: resubmitted 2026-09-15 09:25 UTC, state
  `WAITING_FOR_REVIEW`. Build **23** attached (carries the support-email fix
  and the Bluetooth-play-command fix). This is the first submission a human
  reviewer will actually open — the 3.1.2 rejection on 09-09 was an
  automated metadata check that never touched the binary.
  - Submission id: `0dc027df-afb0-4a2d-9f49-20e33ac7928d`
  - If nothing has moved in 48h from resubmission, follow up on the same
    message thread (App Store Connect → Distribution → App Review →
    this submission → Reply to App Review).
- **TestFlight, Public Link group** (daughter, `cosmicrememberance@gmail.com`):
  build 23 is APPROVED for Beta App Review and live. Verified at the
  binary level (grepped the compiled `App.framework/App` — the new support
  email appears 7 times, the old one 0 times).
- **Support email**: `cosmicrememberance@gmail.com`, live in-app
  (`lib/config/support.dart`) and in the Play listing. Apple has no public
  support-email field (only Support URL), so nothing to change there.
- **Release is Manual.** Approval does not put the app on sale by itself —
  someone has to press Release afterward.

## Android

- **Internal testing track**: build 14, live. Support-email and Bluetooth
  fixes verified on a real device with actual Bluetooth hardware (logcat +
  usagestats showed the app never resumed to foreground through a real
  Bluetooth connect/disconnect while backgrounded).
- **Closed testing track (alpha)**: build 14, live. This is the track the
  production-access application depends on.
- **Closed test tester count**: dropped to 11 opted-in around 2026-09-14,
  which breaks the "12 testers, 14 consecutive days" requirement and
  restarts the clock. Recovered to 12+ testers on 2026-09-14, so the
  14-day window is now counted from **2026-09-14**, earliest apply date
  around **2026-09-28**.
  - **Do not resend the tester join link to anyone already opted in** — it
    shows them "Leave the program" instead of "Become a tester" and can
    drop the count again.
  - The email list ("Divine Healing testers") holds 15 addresses against a
    12-tester requirement, which should be enough slack if one drops.

## Known pending / open items

- Apple review outcome (see above) — waiting.
- Play production application — earliest ~2026-09-28, contingent on the
  closed test staying at ≥12 testers continuously until then.
- Client is replacing the Square booking link with Calendly (Square Canada
  dropped the "online" location option). This is a one-line URL change in
  `booking_screen.dart` and the Reiki/Spiritual Awakening booking buttons
  once she sends the new link(s) — confirm whether Reiki and Spiritual
  Awakening use the same Calendly link or two different ones.
- Play developer name still reads "Divine Healing" (account-level, wait for
  the client to ask).
- Subscription group display name in iOS Settings still reads "Divine
  Healing" — fix as its own submission once the app is approved, not worth
  disturbing the current one.
- Shadow work history screen — agreed as the first post-launch feature.
- `assets/content/reiki.json`'s "less likely to get sick" line is still
  unvetted — needs the client's sign-off before it becomes a review risk,
  and a new build either way since it's a bundled asset.
- Rotate the Supabase secret key and the RevenueCat webhook secret at
  launch (deferred deliberately, both parties aware).

## Process note for next session

Two separate incidents this month were caused by **local commits not being
pushed to `origin/main` before triggering the iOS GitHub Actions build** —
the workflow builds from the pushed remote state, not the local working
tree. Always `git push` immediately after committing anything that a CI
build might need, and confirm with `git log origin/main..HEAD` before
triggering `ios-testflight.yml`.

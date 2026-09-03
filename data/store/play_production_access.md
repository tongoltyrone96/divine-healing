# Play production access — the closed test and the application

Google's requirements for personal developer accounts created after
13 November 2023, saved on 2026-09-03 for use when the application is
written. Divine Healing is such an account, so none of this is optional.

`Apply for production` sits on the Play Console **Dashboard**, under
Production. It stays disabled until the criteria below are met.

## What Google actually requires

- A **closed test** with **at least 12 testers opted in**, who have been
  opted in **continuously for the 14 days immediately before you apply**.
- The count is of *opted-in* testers. Being on the email list is not
  opting in; the dashboard counts only the latter.
- Uninstalling the app does not remove a tester. Pressing **Leave the
  program** does, and so does deleting their address from the list.
- Google's own wording on the discontinuous case: *"Testers who opt in,
  test for fewer than 14 days, and then opt out do not count toward the
  requirement. If a tester opts out and opts back in later, the 14 days
  must be consecutive."* So a dip below 12 restarts the window.

Our timeline: 12 testers were reached **2026-09-03**, so the earliest
application date is around **2026-09-17**. Fourteen addresses are on the
list to leave two spare.

## The part that is not automatic

Meeting the count is not the same as passing. The application asks three
sets of questions, and Google reviews tester engagement alongside them:

1. About your closed test
2. About your app / game
3. About your production readiness

Google says outright that an application can be refused for *"insufficient
tester engagement during the testing period"* — a test where twelve people
tapped a link and nobody opened the app is the failure mode, not a
loophole. Review takes seven days or less, and the result is emailed to
**the account owner**, which is the client rather than us.

## What to collect during the fourteen days

The application asks what feedback we received and what we changed. That
cannot be written retrospectively, so it has to be gathered as it happens:

- **Ask testers for specific feedback**, not "does it work". Name the
  things worth exercising: the audio player and lock-screen controls,
  the shadow work journal, the affirmations, the booking link.
- **Keep a written record** of what comes back, with dates.
- **Fix something and say so.** "We received X, changed Y, released
  version Z" is the answer that reads as a real test.
- Feedback left through Google Play appears in Play Console under
  **Monitor and improve → Ratings and reviews → Testing feedback**, with
  filters and search. Check it; testers may leave it there rather than
  emailing.
- The feedback channel on the closed track is set to `gstsaver@me.com`,
  so anything sent that way reaches the client, not us. Ask her to
  forward it.

Also worth running before applying: **Test and release → Pre-launch
report**, which exercises the app on real devices and lists crashes and
performance problems. It costs nothing and its findings are exactly the
kind of thing the application asks whether we acted on.

## Policy points Google calls out for this review

These are the areas it names, with where we stand:

- **App content and features.** The Reiki page says balanced energy makes
  you "less likely to get sick". This is the client's wording and is the
  one health claim in the app that could be read as unsubstantiated.
  Play's health policy is the reason the Data safety declaration says
  "stress management and relaxation" rather than the clinical category.
  Worth resolving with her before applying rather than after a rejection.
- **Targeting and content rating.** Declared 18 and older, Health &
  Fitness.
- **Functional reliability.** No crashes seen, but the Android purchase
  flow has never completed on a device — Google Play billing is not
  offered in the test phone's region. One tester somewhere it works has
  to confirm it before we claim the app is production ready.
- **Test credentials.** Required, because the subscription makes part of
  the app restricted. `appreview@divinehealing.app` exists with a
  password and an active `sh_subscribers` row; the password lives in both
  store consoles. See `data/23_make_review_account.js`.

## Tracks, for reference

| Track | What it is | Needed here |
|---|---|---|
| Internal | Seconds to distribute, no review, small trusted group | Used; versionCode 5 is live on it |
| Closed | Controlled group, reviewed, **the one production access depends on** | Running since 2026-09-03 |
| Open | Public test listing | Only available *after* production access |
| Production | Public | Gated on the closed test |

## Source

Google Play Help, "App testing requirements for new personal developer
accounts". The three application sections were collapsed in the copy we
have, so the individual questions are not recorded here — expand
`Preview questions` on the Dashboard and add them before writing the
answers.

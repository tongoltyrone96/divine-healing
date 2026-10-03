# Google Play — Data safety answers

Mandatory since 2022: Play will not publish an app without this form. It is
a legal declaration, so every line below was checked against the code rather
than assumed.

Fill it in at:
`Play Console → Policy → App content → Data safety`

Apple's equivalent (App Privacy in App Store Connect) asks the same
questions in a different order; these answers carry across.

---

## What the app actually contains

No analytics. No crash reporting. No advertising SDK. That is unusual and
it makes most of this form short — there is no Firebase, no Crashlytics, no
Sentry, nothing that phones home for measurement.

The SDKs that handle data at all:

| SDK | What it does with data |
|---|---|
| `supabase_flutter` | The backend. Account, journals, progress, subscription status. |
| `google_sign_in`, `sign_in_with_apple` | Authentication only. |
| `purchases_flutter` (RevenueCat) | Purchase state, and a device identifier for it. |

Everything else — audio, storage, images, URL launching — is local or
fetches content without sending anything back.

---

## Does your app collect or share any of the required user data types?

**Yes.**

---

## Data types

Play distinguishes *collected* (leaves the device) from *shared*
(transferred to a third party for their own purposes). **Nothing here is
shared.** Supabase, RevenueCat and Brevo process data on our behalf as
service providers, which Play explicitly says is not sharing.

### Personal info

| Type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Name | Yes | No | Optional | Account management, App functionality |
| Email address | Yes | No | Required | Account management, App functionality |
| User IDs | Yes | No | Required | Account management, App functionality |
| Other info | Yes | No | Optional | Account management |

- **Name** comes from the sign-in provider and only when the provider
  supplies it. Apple gives it once, on first sign-in, and only if the person
  agrees.
- **Email** is the key `sh_subscribers` is stored against, so it is not
  optional — there is no account without it.
- **User IDs** covers the Supabase user id and the RevenueCat app user id.
- **Other info** is the profile photo URL that Google returns with the
  sign-in. The app never displays it; it arrives as part of the provider's
  response and is stored with the account. Declared because it is stored,
  not because it is used.

### Financial info

| Type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Purchase history | Yes | No | Required | App functionality, Account management |

Subscription status, plan and renewal date. This is what decides whether the
audio unlocks, so it is required rather than optional. **Payment method and
card details are never collected** — those stay with Apple, Google or
Stripe.

### App activity

| Type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| App interactions | Yes | No | Optional | App functionality |
| Other user-generated content | Yes | No | Optional | App functionality |

- **App interactions** is which sessions have been completed, so progress
  survives a reinstall. Nothing is measured for analytics.
- **User-generated content** is the shadow work journal, the manifestation
  answers and saved affirmations. Private to the account and never shown to
  anyone else.

### Device or other IDs

| Type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Device or other IDs | Yes | No | Required | App functionality, Fraud prevention |

RevenueCat uses a device identifier to tie a purchase to a device and to
detect duplicate or fraudulent transactions. Not used for advertising — the
app shows none and integrates no ad network.

Play's separate advertising ID declaration is answered **No**, as of
2026-10-03. It has been answered both ways, and both were right at the time,
because Play checks the answer against the manifest of every active
artifact:

- **Yes, until versionCode 15.** `purchases_flutter` 8.x pulled in
  `com.google.android.gms.permission.AD_ID`, so the bundle carried it
  whether or not the app ever read it. The answer was Yes, with **Fraud
  prevention, security, and compliance** as the only reason, and saying No
  failed the check. It was the last thing standing between the closed test
  and review.
- **No, from versionCode 15.** `purchases_flutter` ^10.10.1, which Play's
  Billing 8 requirement forced, no longer merges `AD_ID`. The first
  production release then failed the same check from the other side: the
  declaration said Yes and the bundle had no permission. The merged
  manifest and the `.aab` were both checked before changing the answer.

Before answering again after a dependency upgrade, read the merged manifest
(`build/app/intermediates/bundle_manifest/release/.../AndroidManifest.xml`)
rather than this note. The Device or other IDs row above is unaffected: that
is RevenueCat's own device identifier, not the advertising ID.

### Not collected

Location, health and fitness, messages, photos and videos, audio recordings,
files and docs, calendar, contacts, web browsing history, installed apps,
performance diagnostics. None of these are touched.

The **microphone** deserves a note: `NSMicrophoneUsageDescription` is
declared on iOS because a linked media framework references the API and
Apple requires the string from any binary that does. The app never records,
and there is no microphone permission in the Android manifest.

---

## Security practices

| Question | Answer |
|---|---|
| Is all user data encrypted in transit? | **Yes** — HTTPS throughout; Supabase and RevenueCat both refuse plaintext |
| Do you provide a way for users to request data deletion? | **Yes** — see below |
| Have you committed to the Play Families Policy? | No — not a children's app |
| Has your app been independently security reviewed? | No |

---

## Account deletion — built 2026-08-31

Answer **Yes** to the deletion question. All three pieces exist:

1. **In the app**: Profile → Account → Delete Account, behind a
   confirmation that spells out what goes.
2. **Server**: the `delete-account` Edge Function removes the rows from all
   five user tables and then the login. It takes the caller from their JWT
   and has no user id parameter, so a forged request can only delete the
   account it already authenticated as. Deployed *with* JWT verification,
   unlike the webhooks — and verified to refuse the anon key, which is
   itself a valid JWT and would otherwise have been enough to reach it.
3. **Public page**: https://divine-healing-iota.vercel.app/delete-account —
   reachable without signing in or installing anything, which is what Play
   asks for. It also names the support address, for someone who has already
   uninstalled.

Deletion is immediate and total. There is no soft-delete and no recovery
window, which is what makes "Yes" a truthful answer.

## Data deletion URL

`https://divine-healing-iota.vercel.app/delete-account`

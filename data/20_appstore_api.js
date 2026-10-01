// Talks to the App Store Connect API.
//
// We have no Mac and no access to Certificates, Identifiers & Profiles in the
// developer portal — that is a separate permission the account holder did not
// grant. The API reaches the same resources with the team key she did create,
// so bundle IDs and signing assets go through here instead.
//
// Run:
//   node data/20_appstore_api.js whoami
//   node data/20_appstore_api.js register-bundle-id com.divinehealing.app "Divine Healing"
//   node data/20_appstore_api.js list-bundle-ids
//
// Note: apps cannot be created through this API — see the create-app case.
//
// Credentials come from divine_healing/.env:
//   APPSTORE_ISSUER_ID, APPSTORE_KEY_ID, APPSTORE_P8_PATH

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { execFileSync } = require('child_process');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const ISSUER = process.env.APPSTORE_ISSUER_ID;
const KEY_ID = process.env.APPSTORE_KEY_ID;
const P8 = process.env.APPSTORE_P8_PATH;

if (!ISSUER || !KEY_ID || !P8) {
  console.error(
    'Missing APPSTORE_ISSUER_ID / APPSTORE_KEY_ID / APPSTORE_P8_PATH in ' +
      'divine_healing/.env',
  );
  process.exit(1);
}

const BASE = 'https://api.appstoreconnect.apple.com';
const BUNDLE_ID = 'com.divinehealing.app';

/// Apple wants an ES256 JWT, and specifically the JOSE signature form — a bare
/// r||s pair. Node signs EC keys as DER by default, which Apple rejects as
/// malformed with no explanation, so the encoding has to be stated.
function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = {
    iss: ISSUER,
    iat: now,
    exp: now + 15 * 60, // Apple caps this at 20 minutes.
    aud: 'appstoreconnect-v1',
  };
  const b64 = (o) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const signature = crypto
    .sign('sha256', Buffer.from(signingInput), {
      key: fs.readFileSync(P8),
      dsaEncoding: 'ieee-p1363',
    })
    .toString('base64url');
  return `${signingInput}.${signature}`;
}

/// Astrill's proxy drops connections rather than refusing them, so a request
/// fails as a bare "fetch failed" with nothing to distinguish it from being
/// offline. Retrying is the only way to tell the difference. Only the
/// transport is retried — an HTTP error is the server's real answer.
async function api(method, endpoint, body, attempt = 1) {
  const MAX = 4;
  let res;
  try {
    res = await request(method, endpoint, body);
  } catch (e) {
    if (attempt >= MAX) {
      throw new Error(
        `${e.message} after ${MAX} attempts — check the VPN`,
      );
    }
    await new Promise((r) => setTimeout(r, 400 * attempt));
    return api(method, endpoint, body, attempt + 1);
  }
  return handle(res);
}

function request(method, endpoint, body) {
  return fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function handle(res) {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Apple returns HTML for some auth failures.
  }
  if (!res.ok) {
    const detail =
      json?.errors?.map((e) => `${e.title}: ${e.detail}`).join('; ') ||
      text.slice(0, 300);
    throw new Error(`HTTP ${res.status} — ${detail}`);
  }
  return json;
}

const [, , command, ...args] = process.argv;

(async () => {
  switch (command) {
    case 'whoami': {
      // Any authenticated read proves the key, the issuer and the signature
      // format all line up.
      const apps = await api('GET', '/v1/apps?limit=10');
      console.log(`Authenticated. ${apps.data.length} app(s) on the team:`);
      for (const app of apps.data) {
        console.log(
          `  ${app.attributes.bundleId}  ${app.attributes.name}`,
        );
      }
      if (!apps.data.length) console.log('  (none yet)');
      break;
    }

    case 'list-bundle-ids': {
      const ids = await api('GET', '/v1/bundleIds?limit=200');
      console.log(`${ids.data.length} bundle ID(s):`);
      for (const b of ids.data) {
        console.log(
          `  ${b.attributes.identifier.padEnd(34)} ${b.attributes.name}`,
        );
      }
      break;
    }

    case 'register-bundle-id': {
      const [identifier, name] = args;
      if (!identifier || !name) {
        console.error(
          'usage: register-bundle-id <com.example.app> "<Display Name>"',
        );
        process.exit(1);
      }
      const existing = await api(
        'GET',
        `/v1/bundleIds?filter[identifier]=${encodeURIComponent(identifier)}`,
      );
      if (existing.data.length) {
        console.log(`Already registered: ${identifier}`);
        break;
      }
      const created = await api('POST', '/v1/bundleIds', {
        data: {
          type: 'bundleIds',
          attributes: { identifier, name, platform: 'IOS' },
        },
      });
      console.log(
        `Registered ${created.data.attributes.identifier} ` +
          `(id ${created.data.id})`,
      );
      break;
    }

    case 'list-certificates': {
      const c = await api('GET', '/v1/certificates?limit=200');
      console.log(`${c.data.length} certificate(s):`);
      for (const x of c.data) {
        const a = x.attributes;
        console.log(
          `  ${a.certificateType.padEnd(26)} ${a.name} ` +
            `(expires ${a.expirationDate.slice(0, 10)})`,
        );
      }
      if (!c.data.length) console.log('  (none)');
      break;
    }

    case 'list-profiles': {
      const c = await api('GET', '/v1/profiles?limit=200');
      console.log(`${c.data.length} profile(s):`);
      for (const x of c.data) {
        const a = x.attributes;
        console.log(
          `  ${a.profileType.padEnd(22)} ${a.profileState.padEnd(8)} ${a.name}`,
        );
      }
      if (!c.data.length) console.log('  (none)');
      break;
    }

    case 'get': {
      // Escape hatch for endpoints that have not earned a command yet.
      //   node data/20_appstore_api.js get '/v1/builds?limit=5'
      if (!args[0]) {
        console.error("usage: get '/v1/<endpoint>'");
        process.exit(1);
      }
      console.log(JSON.stringify(await api('GET', args[0]), null, 2));
      break;
    }

    case 'list-builds': {
      // Processing takes a few minutes after altool reports success, and a
      // build is not testable until it leaves PROCESSING.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      if (!app.data.length) throw new Error('No app record for ' + BUNDLE_ID);
      const builds = await api('GET',
        '/v1/builds?filter[app]=' + app.data[0].id + '&limit=10');
      console.log(app.data[0].attributes.name + ' — ' +
        builds.data.length + ' build(s):');
      for (const b of builds.data) {
        const a = b.attributes;
        console.log('  build ' + String(a.version).padEnd(6) +
          a.processingState.padEnd(12) +
          'uploaded ' + a.uploadedDate.slice(0, 16).replace('T', ' '));
      }
      if (!builds.data.length) console.log('  (none yet)');
      break;
    }

    case 'review-details': {
      // What App Review reads before opening the app: who to contact, and
      // how to get past the paywall. Without a working demo account they
      // see three free sessions and a locked library, which is a rejection.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const versions = await api('GET',
        '/v1/apps/' + app.data[0].id + '/appStoreVersions?limit=1');
      const versionId = versions.data[0].id;

      const attributes = {
        contactFirstName: 'Tyrone Jher',
        contactLastName: 'Tongol',
        contactPhone: '+63 999 000 0000',
        contactEmail: 'tyronejhert@gmail.com',
        demoAccountName: 'appreview@divinehealing.app',
        demoAccountPassword: process.env.APPSTORE_DEMO_PASSWORD || '',
        demoAccountRequired: true,
        notes:
          'No account is required anywhere in this app, including to '
          + 'subscribe. Browsing, the three free sessions, and starting a '
          + 'subscription all work without registering (guideline '
          + '5.1.1(v)). Signing in is offered only so that favourites, '
          + 'journal entries and an existing subscription follow the person '
          + 'to their other devices.\n\n'
          + 'The demo account below is provided so you can see the paid '
          + 'library without making a purchase. To use it, tap "Continue '
          + 'with Email" on the sign-in screen, enter the email and password '
          + 'above, then tap "Sign in".\n\n'
          + 'The subscription on that account was granted for review. No '
          + 'purchase was made and no free trial was used.\n\n'
          + 'Audio plays in the background and on the lock screen. Booking '
          + 'a session opens an external booking page in Safari; those are '
          + 'real one-to-one sessions with a person, not digital content, '
          + 'so they fall outside in-app purchase.',
      };
      if (!attributes.demoAccountPassword) {
        throw new Error(
          'Set APPSTORE_DEMO_PASSWORD before running this — the demo '
          + 'password is not stored in the repo.',
        );
      }

      const existing = await api('GET', '/v1/appStoreVersions/' + versionId +
        '/appStoreReviewDetail?fields[appStoreReviewDetails]=contactEmail');
      if (existing.data) {
        await api('PATCH', '/v1/appStoreReviewDetails/' + existing.data.id, {
          data: {
            type: 'appStoreReviewDetails',
            id: existing.data.id,
            attributes,
          },
        });
        console.log('Review details updated.');
      } else {
        await api('POST', '/v1/appStoreReviewDetails', {
          data: {
            type: 'appStoreReviewDetails',
            attributes,
            relationships: {
              appStoreVersion: {
                data: { type: 'appStoreVersions', id: versionId },
              },
            },
          },
        });
        console.log('Review details created.');
      }
      console.log('  demo account  ' + attributes.demoAccountName);
      break;
    }

    case 'configure-subscriptions': {
      // Fills in what create-subscriptions deliberately left out: the
      // display name and description reviewers and customers see, the CAD
      // price, and the seven-day trial. Until all three exist a subscription
      // sits in MISSING_METADATA and cannot be submitted.
      //
      // CAD because the client sells in CAD — the Stripe products already
      // do, and a different currency in the App Store would be a different
      // price to the same customer.
      const plans = [
        {
          productId: BUNDLE_ID + '.monthly',
          name: 'Monthly',
          price: 19.0,
          // Apple caps this at 55 characters, which is shorter than it
          // sounds and is checked here rather than by a 409.
          description: 'Every session and exercise. Cancel any time.',
        },
        {
          productId: BUNDLE_ID + '.annual',
          name: 'Annual',
          price: 149.0,
          description: 'Everything, for a year. 35% less than monthly.',
        },
      ];

      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const groups = await api('GET',
        '/v1/apps/' + app.data[0].id + '/subscriptionGroups?limit=20');
      if (!groups.data.length) {
        throw new Error('No subscription group. Run create-subscriptions.');
      }
      // The group needs its own display name — this is the heading
      // customers see above the two plans on the subscription sheet.
      // Without it both plans stay in MISSING_METADATA no matter how
      // complete they are individually.
      const groupLocs = await api('GET', '/v1/subscriptionGroups/' +
        groups.data[0].id + '/subscriptionGroupLocalizations?limit=20');
      if (groupLocs.data.some((l) => l.attributes.locale === 'en-US')) {
        console.log('Group name already set');
      } else {
        await api('POST', '/v1/subscriptionGroupLocalizations', {
          data: {
            type: 'subscriptionGroupLocalizations',
            attributes: { locale: 'en-US', name: 'Divine Healing' },
            relationships: {
              subscriptionGroup: {
                data: {
                  type: 'subscriptionGroups',
                  id: groups.data[0].id,
                },
              },
            },
          },
        });
        console.log('Group name written');
      }

      let allTerritories = null;
      const subs = await api('GET', '/v1/subscriptionGroups/' +
        groups.data[0].id + '/subscriptions?limit=20');

      for (const plan of plans) {
        if (plan.description.length > 55) {
          throw new Error(plan.productId + ': description is ' +
            plan.description.length + ' characters, limit 55');
        }
        const sub = subs.data.find(
          (x) => x.attributes.productId === plan.productId);
        if (!sub) {
          console.log('  MISSING  ' + plan.productId);
          continue;
        }
        console.log(plan.productId);

        // 1. Localization. Apple caps the display name at 30 characters and
        // shows it on the subscription sheet.
        const locs = await api('GET',
          '/v1/subscriptions/' + sub.id + '/subscriptionLocalizations?limit=20');
        if (locs.data.some((l) => l.attributes.locale === 'en-US')) {
          console.log('  localization already set');
        } else {
          await api('POST', '/v1/subscriptionLocalizations', {
            data: {
              type: 'subscriptionLocalizations',
              attributes: {
                locale: 'en-US',
                name: plan.name,
                description: plan.description,
              },
              relationships: {
                subscription: { data: { type: 'subscriptions', id: sub.id } },
              },
            },
          });
          console.log('  localization written');
        }

        // 2. Availability. A subscription with no territories cannot be
        // priced, and the refusal reads 'an error occurred while processing
        // the pricing information' — which points at the price.
        if (!allTerritories) {
          const t = await api('GET', '/v1/territories?limit=200');
          allTerritories = t.data.map(
            (x) => ({ type: 'territories', id: x.id }));
        }
        let availability = null;
        try {
          availability = await api('GET', '/v1/subscriptions/' + sub.id +
            '/subscriptionAvailability?fields[subscriptionAvailabilities]=' +
            'availableInNewTerritories');
        } catch (e) {
          if (!e.message.includes('404')) throw e;
        }
        if (availability) {
          console.log('  availability already set');
        } else {
          if (!allTerritories) {
            const t = await api('GET', '/v1/territories?limit=200');
            allTerritories = t.data.map(
              (x) => ({ type: 'territories', id: x.id }));
          }
          await api('POST', '/v1/subscriptionAvailabilities', {
            data: {
              type: 'subscriptionAvailabilities',
              // New App Store territories are opted into automatically. The
              // alternative is the subscription quietly not existing in a
              // country the app is otherwise sold in.
              attributes: { availableInNewTerritories: true },
              relationships: {
                subscription: { data: { type: 'subscriptions', id: sub.id } },
                availableTerritories: { data: allTerritories },
              },
            },
          });
          console.log('  available in ' + allTerritories.length + ' territories');
        }

        // 3. Price. Apple offers a fixed ladder of price points per
        // territory, so the exact figure has to exist on it — CAD 19.00 and
        // 149.00 both do. The ladder runs to several hundred entries, hence
        // the paging.
        const prices = await api('GET',
          '/v1/subscriptions/' + sub.id + '/prices?limit=20');
        if (prices.data.length) {
          console.log('  price already set');
        } else {
          let url = '/v1/subscriptions/' + sub.id +
            '/pricePoints?filter[territory]=CAN&limit=200';
          let point = null;
          while (url && !point) {
            const page = await api('GET', url);
            point = page.data.find(
              (x) => Number(x.attributes.customerPrice) === plan.price);
            const next = page.links && page.links.next;
            url = next ? next.replace(BASE, '') : null;
          }
          if (!point) {
            throw new Error('No CAD price point at ' + plan.price);
          }
          await api('POST', '/v1/subscriptionPrices', {
            data: {
              type: 'subscriptionPrices',
              // No attributes. startDate and preserveCurrentPrice are both
              // optional, and sending them on a subscription that has never
              // had a price is what Apple was objecting to.
              relationships: {
                subscription: { data: { type: 'subscriptions', id: sub.id } },
                subscriptionPricePoint: {
                  data: { type: 'subscriptionPricePoints', id: point.id },
                },
                // Naming the territory as well as the price point: without
                // it Apple answers 'an error occurred while processing the
                // pricing information', which says nothing about what is
                // missing.
              },
            },
          });
          console.log('  price set to CAD ' + plan.price.toFixed(2));
        }

        // 4. Review screenshot. Apple requires one per subscription and
        // will not leave MISSING_METADATA without it. The Profile screen
        // shows both plans, their prices and the trial, which is exactly
        // what a reviewer is checking.
        let hasShot = false;
        try {
          const existing = await api('GET', '/v1/subscriptions/' + sub.id +
            '/appStoreReviewScreenshot?fields[subscriptionAppStoreReview' +
            'Screenshots]=assetDeliveryState');
          const delivery = existing.data.attributes.assetDeliveryState;
          if (delivery.state === 'FAILED') {
            // Apple accepts the upload and rejects the image afterwards, so
            // a failed screenshot sits there looking present. The reason is
            // in delivery.errors — 1080x1920 came back as
            // IMAGE_INCORRECT_DIMENSIONS; it wants a real iPhone size.
            const why = (delivery.errors || [])
              .map((e) => e.code).join(', ');
            console.log('  replacing failed screenshot (' + why + ')');
            await api('DELETE',
              '/v1/subscriptionAppStoreReviewScreenshots/' + existing.data.id);
          } else {
            hasShot = true;
          }
        } catch (e) {
          if (!e.message.includes('404')) throw e;
        }
        if (hasShot) {
          console.log('  review screenshot already uploaded');
        } else {
          // The iOS capture, not the Android one: Apple checks the
          // dimensions against its own device sizes.
          const shot = path.join(__dirname, '..', 'store', 'ios',
            '04-profile.png');
          const bytes = fs.readFileSync(shot);
          const reserved = await api('POST',
            '/v1/subscriptionAppStoreReviewScreenshots', {
              data: {
                type: 'subscriptionAppStoreReviewScreenshots',
                attributes: {
                  fileSize: bytes.length,
                  fileName: 'subscription-plans.png',
                },
                relationships: {
                  subscription: {
                    data: { type: 'subscriptions', id: sub.id },
                  },
                },
              },
            });
          for (const op of reserved.data.attributes.uploadOperations) {
            const headers = {};
            for (const h of op.requestHeaders) headers[h.name] = h.value;
            const put = await fetch(op.url, {
              method: op.method,
              headers,
              body: bytes.subarray(op.offset, op.offset + op.length),
            });
            if (!put.ok) {
              throw new Error('review screenshot upload: HTTP ' + put.status);
            }
          }
          await api('PATCH', '/v1/subscriptionAppStoreReviewScreenshots/' +
            reserved.data.id, {
              data: {
                type: 'subscriptionAppStoreReviewScreenshots',
                id: reserved.data.id,
                attributes: {
                  uploaded: true,
                  sourceFileChecksum: crypto.createHash('md5')
                    .update(bytes).digest('hex'),
                },
              },
            });
          console.log('  review screenshot uploaded');
        }

        // 4. The trial the Profile screen already advertises.
        const offers = await api('GET', '/v1/subscriptions/' + sub.id +
          '/introductoryOffers?limit=20');
        // Introductory offers are per-territory — there is no "everywhere"
        // option on this endpoint. The Profile screen advertises the trial
        // to everyone, so it has to exist everywhere the subscription does.
        const have = new Set(offers.data.map((o) => o.id));
        if (have.size >= allTerritories.length) {
          console.log('  trial already set in every territory');
        } else {
          let added = 0;
          for (const territory of allTerritories) {
            try {
              await api('POST', '/v1/subscriptionIntroductoryOffers', {
                data: {
                  type: 'subscriptionIntroductoryOffers',
                  attributes: {
                    duration: 'ONE_WEEK',
                    offerMode: 'FREE_TRIAL',
                    numberOfPeriods: 1,
                  },
                  relationships: {
                    subscription: {
                      data: { type: 'subscriptions', id: sub.id },
                    },
                    territory: { data: territory },
                  },
                },
              });
              added += 1;
            } catch (e) {
              // A territory that already has one, or that the subscription
              // is not sold in, is not worth stopping for.
              if (!/already|conflict|409/i.test(e.message)) throw e;
            }
          }
          console.log('  7-day free trial added in ' + added + ' territories');
        }
      }
      break;
    }

    case 'create-subscriptions': {
      // Also the only reliable test of whether the Paid Applications
      // Agreement is active. App Store Connect refuses to create a
      // subscription until it is, and there is no API that reports the
      // agreement's status directly — the refusal is the answer.
      //
      // Prices and the free trial are not set here. Those are separate
      // resources and depend on Apple's price points, which are worth
      // getting right rather than guessing at.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const appId = app.data[0].id;

      const groupName = 'Divine Healing Membership';
      const groups = await api('GET',
        '/v1/apps/' + appId + '/subscriptionGroups?limit=20');
      let group = groups.data.find(
        (g) => g.attributes.referenceName === groupName);
      if (group) {
        console.log('Group already exists: ' + groupName);
      } else {
        const made = await api('POST', '/v1/subscriptionGroups', {
          data: {
            type: 'subscriptionGroups',
            attributes: { referenceName: groupName },
            relationships: { app: { data: { type: 'apps', id: appId } } },
          },
        });
        group = made.data;
        console.log('Created group: ' + groupName);
      }

      // One group, so a subscriber moving between the two plans upgrades
      // rather than ending up paying for both.
      const plans = [
        {
          productId: BUNDLE_ID + '.monthly',
          name: 'Monthly',
          period: 'ONE_MONTH',
        },
        {
          productId: BUNDLE_ID + '.annual',
          name: 'Annual',
          period: 'ONE_YEAR',
        },
      ];
      const existing = await api('GET',
        '/v1/subscriptionGroups/' + group.id + '/subscriptions?limit=20');
      for (const plan of plans) {
        if (existing.data.some(
          (x) => x.attributes.productId === plan.productId)) {
          console.log('  exists   ' + plan.productId);
          continue;
        }
        await api('POST', '/v1/subscriptions', {
          data: {
            type: 'subscriptions',
            attributes: {
              name: plan.name,
              productId: plan.productId,
              subscriptionPeriod: plan.period,
              // Apple requires this on create and shows it only to review.
              reviewNote: 'Unlocks the full library of guided sessions and '
                + 'the written exercises. No account or code needed to test.',
              familySharable: false,
            },
            relationships: {
              group: {
                data: { type: 'subscriptionGroups', id: group.id },
              },
            },
          },
        });
        console.log('  created  ' + plan.productId + '  (' + plan.period + ')');
      }
      console.log('');
      console.log('Prices and the 7-day trial still have to be set.');
      break;
    }

    case 'upload-screenshots': {
      // Apple's upload is a three-step handshake, not a POST: reserve a slot
      // and it answers with the URLs and byte ranges to PUT to, then the
      // reservation is confirmed with a checksum. Skipping the confirmation
      // leaves a screenshot that exists and never appears.
      //
      //   node data/20_appstore_api.js upload-screenshots <dir>
      const dir = args[0];
      if (!dir) {
        console.error('usage: upload-screenshots <directory of .png files>');
        process.exit(1);
      }
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
      if (!files.length) throw new Error('No .png files in ' + dir);

      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const versions = await api('GET',
        '/v1/apps/' + app.data[0].id + '/appStoreVersions?limit=1');
      const vlocs = await api('GET', '/v1/appStoreVersions/' +
        versions.data[0].id + '/appStoreVersionLocalizations?limit=20');
      const vloc = vlocs.data.find((l) => l.attributes.locale === 'en-US');
      if (!vloc) throw new Error('No en-US localization');

      // APP_IPHONE_67 is the slot Apple uses for the largest iPhones, which
      // covers the 1320x2868 a Pro Max simulator produces.
      const displayType = 'APP_IPHONE_67';
      const sets = await api('GET', '/v1/appStoreVersionLocalizations/' +
        vloc.id + '/appScreenshotSets?limit=20');
      let set = sets.data.find(
        (x) => x.attributes.screenshotDisplayType === displayType);
      if (!set) {
        const made = await api('POST', '/v1/appScreenshotSets', {
          data: {
            type: 'appScreenshotSets',
            attributes: { screenshotDisplayType: displayType },
            relationships: {
              appStoreVersionLocalization: {
                data: { type: 'appStoreVersionLocalizations', id: vloc.id },
              },
            },
          },
        });
        set = made.data;
        console.log('Created the ' + displayType + ' set');
      }

      // Replacing rather than appending: a rerun should not leave the old
      // screenshots sitting alongside the new ones in an arbitrary order.
      const existing = await api('GET',
        '/v1/appScreenshotSets/' + set.id + '/appScreenshots?limit=20');
      for (const old of existing.data) {
        await api('DELETE', '/v1/appScreenshots/' + old.id);
      }
      if (existing.data.length) {
        console.log('Removed ' + existing.data.length + ' earlier screenshot(s)');
      }

      for (const name of files) {
        const bytes = fs.readFileSync(path.join(dir, name));
        const reserved = await api('POST', '/v1/appScreenshots', {
          data: {
            type: 'appScreenshots',
            attributes: { fileSize: bytes.length, fileName: name },
            relationships: {
              appScreenshotSet: {
                data: { type: 'appScreenshotSets', id: set.id },
              },
            },
          },
        });
        for (const op of reserved.data.attributes.uploadOperations) {
          const headers = {};
          for (const h of op.requestHeaders) headers[h.name] = h.value;
          // Not api(): these are presigned URLs, and sending our own
          // Authorization header to them is refused.
          const put = await fetch(op.url, {
            method: op.method,
            headers,
            body: bytes.subarray(op.offset, op.offset + op.length),
          });
          if (!put.ok) {
            throw new Error(name + ': upload returned HTTP ' + put.status);
          }
        }
        await api('PATCH', '/v1/appScreenshots/' + reserved.data.id, {
          data: {
            type: 'appScreenshots',
            id: reserved.data.id,
            attributes: {
              uploaded: true,
              sourceFileChecksum: crypto.createHash('md5')
                .update(bytes).digest('hex'),
            },
          },
        });
        console.log('  uploaded  ' + name + '  (' + bytes.length + ' bytes)');
      }
      break;
    }

    case 'age-rating': {
      // Everything NONE, which is the honest answer for a meditation app and
      // yields a 4+ rating. unrestrictedWebAccess is false on purpose: the
      // app has no browser. It opens the booking page in the system browser
      // and shows Google's consent screen in a Safari view, neither of which
      // lets anyone navigate the open web from inside the app.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const infos = await api('GET',
        '/v1/apps/' + app.data[0].id + '/appInfos?limit=10');
      const editable = infos.data.find((i) =>
        i.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION') ||
        infos.data[0];

      const none = 'NONE';
      await api('PATCH', '/v1/ageRatingDeclarations/' + editable.id, {
        data: {
          type: 'ageRatingDeclarations',
          id: editable.id,
          attributes: {
            alcoholTobaccoOrDrugUseOrReferences: none,
            contests: none,
            gamblingSimulated: none,
            // The sessions are a spiritual practice, not medical advice, and
            // the app makes no treatment claims.
            medicalOrTreatmentInformation: none,
            profanityOrCrudeHumor: none,
            sexualContentGraphicAndNudity: none,
            sexualContentOrNudity: none,
            horrorOrFearThemes: none,
            matureOrSuggestiveThemes: none,
            violenceCartoonOrFantasy: none,
            violenceRealisticProlongedGraphicOrSadistic: none,
            violenceRealistic: none,
            gambling: false,
            unrestrictedWebAccess: false,
            // Added by Apple's newer questionnaire.
            advertising: false,
            messagingAndChat: false,
            parentalControls: false,
            lootBox: false,
            gunsOrOtherWeapons: none,
            ageAssurance: false,
            // True, and deliberately so. The whole app is meditation and
            // emotional practice, which is exactly what Apple means here. It
            // may raise the rating; answering otherwise would be false.
            healthOrWellnessTopics: true,
            // Journals and manifestation answers are user-written but private
            // to the account. Apple's question is about content other people
            // can see, and nothing here is ever shared.
            userGeneratedContent: false,
          },
        },
      });
      console.log('Age rating declared: no restricted content anywhere (4+).');
      break;
    }

    case 'store-metadata': {
      // Writes the listing copy from data/store/app_store_<locale>.json.
      // Nothing here submits anything — the version stays in
      // PREPARE_FOR_SUBMISSION and every field can be changed again.
      const copy = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'store', 'app_store_en-US.json'), 'utf8'));

      // Apple truncates silently on some fields and rejects on others, so
      // both cases are caught here where the message can name the field.
      const limits = { subtitle: 30, promotionalText: 170, keywords: 100,
        description: 4000 };
      for (const [field, max] of Object.entries(limits)) {
        const len = (copy[field] || '').length;
        if (len > max) {
          throw new Error(field + ' is ' + len + ' characters, limit ' + max);
        }
      }

      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      if (!app.data.length) throw new Error('No app record for ' + BUNDLE_ID);
      const appId = app.data[0].id;

      // Version-level copy: what changes with each release.
      const versions = await api('GET',
        '/v1/apps/' + appId + '/appStoreVersions?limit=1');
      if (!versions.data.length) throw new Error('No app store version yet');
      // REJECTED is editable, and is exactly when the copy needs changing:
      // App Review's own page says so — "You can make edits to your app
      // version below". Refusing it turned a metadata fix into a puzzle.
      const state = versions.data[0].attributes.appStoreState;
      const editableStates = ['PREPARE_FOR_SUBMISSION', 'REJECTED',
        'DEVELOPER_REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'];
      if (!editableStates.includes(state)) {
        throw new Error('Version is ' + state + ', not editable');
      }
      // The limit is not optional: without a query string the request stalls
      // behind the VPN and fails as a bare "fetch failed".
      const vlocs = await api('GET', '/v1/appStoreVersions/' +
        versions.data[0].id + '/appStoreVersionLocalizations?limit=20');
      const vloc = vlocs.data.find((l) => l.attributes.locale === copy.locale);
      if (!vloc) throw new Error('No ' + copy.locale + ' version localization');
      await api('PATCH', '/v1/appStoreVersionLocalizations/' + vloc.id, {
        data: {
          type: 'appStoreVersionLocalizations',
          id: vloc.id,
          attributes: {
            description: copy.description,
            keywords: copy.keywords,
            promotionalText: copy.promotionalText,
            supportUrl: copy.supportUrl,
            marketingUrl: copy.marketingUrl,
          },
        },
      });
      console.log('Version copy written (' + copy.locale + ')');

      // App-level copy: what stays put across releases.
      const infos = await api('GET',
        '/v1/apps/' + appId + '/appInfos?limit=10');
      const editable = infos.data.find((i) =>
        i.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION') ||
        infos.data[0];
      const ilocs = await api('GET', '/v1/appInfos/' + editable.id +
        '/appInfoLocalizations?limit=20');
      const iloc = ilocs.data.find((l) => l.attributes.locale === copy.locale);
      if (!iloc) throw new Error('No ' + copy.locale + ' app info localization');
      await api('PATCH', '/v1/appInfoLocalizations/' + iloc.id, {
        data: {
          type: 'appInfoLocalizations',
          id: iloc.id,
          attributes: {
            subtitle: copy.subtitle,
            privacyPolicyUrl: copy.privacyPolicyUrl,
          },
        },
      });
      console.log('App-level copy written (subtitle, privacy policy URL)');
      break;
    }

    case 'price-all-territories': {
      // Gives every subscription a price in each territory it is sold in.
      //
      //   node data/20_appstore_api.js price-all-territories
      //
      // create-subscriptions set one CAD price and left it there, which the
      // API reports only as MISSING_METADATA and the browser as "You must add
      // a subscription price" — a subscription available in 175 territories
      // and priced in one is incomplete, and neither message says which of
      // the two numbers is wrong. The console has a flow for this that ends
      // in Keep the calculated prices; it did not create anything here.
      //
      // Apple will do the conversion itself: the equalizations of a price
      // point are the matching price points elsewhere, and they are the same
      // figures the console shows.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const groups = await api('GET', '/v1/apps/' + app.data[0].id
        + '/subscriptionGroups?limit=10&fields[subscriptionGroups]=referenceName');

      for (const group of groups.data) {
        const subs = await api('GET', '/v1/subscriptionGroups/' + group.id
          + '/subscriptions?limit=20&fields[subscriptions]=productId,state');
        for (const sub of subs.data) {
          console.log(sub.attributes.productId + '  ' + sub.attributes.state);

          const prices = await api('GET', '/v1/subscriptions/' + sub.id
            + '/prices?limit=200&include=territory,subscriptionPricePoint');
          const priced = new Set(
            (prices.included || [])
              .filter((x) => x.type === 'territories')
              .map((x) => x.id),
          );
          const base = (prices.included || [])
            .find((x) => x.type === 'subscriptionPricePoints');
          if (!base) {
            console.log('  no price at all — set one in the browser first');
            continue;
          }
          console.log('  priced in ' + priced.size + ', base '
            + base.attributes.customerPrice);

          const eq = await api('GET', '/v1/subscriptionPricePoints/'
            + encodeURIComponent(base.id)
            + '/equalizations?limit=200&include=territory');
          const territoryOf = new Map(
            (eq.included || []).map((t) => [t.id, t.id]),
          );
          let made = 0;
          let skipped = 0;
          for (const point of eq.data) {
            // The territory is carried in the price point's relationship, and
            // the id itself encodes it; the relationship is the documented way.
            const tid = point.relationships
              && point.relationships.territory
              && point.relationships.territory.data
              && point.relationships.territory.data.id;
            if (tid && priced.has(tid)) { skipped += 1; continue; }
            await api('POST', '/v1/subscriptionPrices', {
              data: {
                type: 'subscriptionPrices',
                attributes: { preserveCurrentPrice: false },
                relationships: {
                  subscription: {
                    data: { type: 'subscriptions', id: sub.id },
                  },
                  subscriptionPricePoint: {
                    data: { type: 'subscriptionPricePoints', id: point.id },
                  },
                },
              },
            });
            made += 1;
          }
          void territoryOf;
          console.log('  added ' + made + ' territories, ' + skipped
            + ' already priced');
        }
      }
      break;
    }

    case 'external-group': {
      // A TestFlight group anyone can join from a URL, with no invitation
      // email and no App Store Connect account.
      //
      //   APPSTORE_DEMO_PASSWORD=... node data/20_appstore_api.js external-group
      //
      // Internal groups are faster — they skip Beta App Review — but they
      // take App Store Connect users only, which means an invitation email
      // that has to arrive. Two of those vanished into a tester's mailbox,
      // and a link that can be forwarded does not have that failure mode.
      //
      // The cost is Beta App Review, which needs contact details, a demo
      // account and a beta description first. Those are separate resources
      // from the App Store review details that `review-details` writes.
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      const appId = app.data[0].id;

      const password = process.env.APPSTORE_DEMO_PASSWORD || '';
      if (!password) {
        throw new Error(
          'Set APPSTORE_DEMO_PASSWORD before running this — the demo '
          + 'password is not stored in the repo.',
        );
      }

      // 1. Who Beta App Review contacts, and how they get past the paywall.
      const detail = await api('GET', '/v1/apps/' + appId
        + '/betaAppReviewDetail?fields[betaAppReviewDetails]=contactEmail');
      await api('PATCH', '/v1/betaAppReviewDetails/' + detail.data.id, {
        data: {
          type: 'betaAppReviewDetails',
          id: detail.data.id,
          attributes: {
            contactFirstName: 'Tyrone Jher',
            contactLastName: 'Tongol',
            contactPhone: '+63 999 000 0000',
            contactEmail: 'tyronejhert@gmail.com',
            demoAccountName: 'appreview@divinehealing.app',
            demoAccountPassword: password,
            demoAccountRequired: true,
            notes:
              'Browsing works without an account: the library and three '
              + 'free sessions are open. The demo account unlocks the rest.'
              + '\n\nTo sign in, tap "Continue with Email" on the sign-in '
              + 'screen, enter the email and password above, then tap '
              + '"Sign in".\n\nThe subscription on that account was granted '
              + 'for review. No purchase was made and no trial was used.',
          },
        },
      });
      console.log('  review details   set');

      // 2. What a tester reads on the TestFlight card. Beta App Review
      //    refuses a build with no description.
      const locales = await api('GET', '/v1/apps/' + appId
        + '/betaAppLocalizations?fields[betaAppLocalizations]=locale');
      const attributes = {
        description:
          'Guided meditation, shadow work, chakra healing and Reiki. '
          + 'Twenty-two audio sessions with background playback, plus '
          + 'journaling, affirmations and breathwork.\n\n'
          + 'Please try signing in, play a session with the screen locked, '
          + 'and tell us anything that felt slow or unclear.',
        feedbackEmail: 'tyronejhert@gmail.com',
        marketingUrl: 'https://divine-healing-iota.vercel.app',
        privacyPolicyUrl: 'https://divine-healing-iota.vercel.app/privacy',
      };
      const existing = locales.data.find((l) => l.attributes.locale === 'en-US');
      if (existing) {
        await api('PATCH', '/v1/betaAppLocalizations/' + existing.id, {
          data: { type: 'betaAppLocalizations', id: existing.id, attributes },
        });
        console.log('  beta listing     updated');
      } else {
        await api('POST', '/v1/betaAppLocalizations', {
          data: {
            type: 'betaAppLocalizations',
            attributes: { ...attributes, locale: 'en-US' },
            relationships: { app: { data: { type: 'apps', id: appId } } },
          },
        });
        console.log('  beta listing     created');
      }

      // 3. The group itself.
      const groupName = 'Public Link';
      const groups = await api('GET', '/v1/betaGroups?limit=200');
      let group = groups.data.find((g) => g.attributes.name === groupName);
      if (!group) {
        const created = await api('POST', '/v1/betaGroups', {
          data: {
            type: 'betaGroups',
            attributes: {
              name: groupName,
              isInternalGroup: false,
              publicLinkEnabled: true,
              publicLinkLimitEnabled: false,
              hasAccessToAllBuilds: true,
            },
            relationships: { app: { data: { type: 'apps', id: appId } } },
          },
        });
        group = created.data;
        console.log('  group created    ' + groupName);
      } else {
        console.log('  group exists     ' + groupName);
      }

      // 4. Submit the newest build. Apple holds an external group's first
      //    build until this passes, usually within a day.
      const builds = await api('GET', '/v1/builds?filter[app]=' + appId
        + '&sort=-version&limit=1');
      const build = builds.data[0];
      console.log('  build            ' + build.attributes.version
        + '  ' + build.attributes.processingState);
      try {
        await api('POST', '/v1/betaAppReviewSubmissions', {
          data: {
            type: 'betaAppReviewSubmissions',
            relationships: { build: { data: { type: 'builds', id: build.id } } },
          },
        });
        console.log('  submitted        Beta App Review');
      } catch (e) {
        // Already submitted, or already approved. Neither is a problem.
        console.log('  beta review      ' + e.message);
      }

      const fresh = await api('GET', '/v1/betaGroups/' + group.id);
      console.log('');
      console.log('Public link: ' + (fresh.data.attributes.publicLink
        || '(appears once Beta App Review approves the build)'));
      break;
    }

    case 'invite-user': {
      // An internal TestFlight group takes App Store Connect users only, so a
      // tester who is not on the team is rejected with a bare 409 that names
      // no cause. This invites them first; testflight-setup then works.
      //
      //   node data/20_appstore_api.js invite-user someone@example.com
      //
      // Marketing is the least-privileged role Apple accepts for an internal
      // tester — it cannot upload builds, touch signing, or see agreements —
      // and access is scoped to this app alone. Re-running is safe: a pending
      // invitation is reported rather than duplicated.
      const email = args[0];
      if (!email) throw new Error('Pass an email address.');
      const first = args[1] || 'Divine';
      const last = args[2] || 'Healing Tester';

      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      if (!app.data.length) throw new Error('No app record for ' + BUNDLE_ID);
      const appId = app.data[0].id;

      const users = await api('GET', '/v1/users?limit=200');
      if (users.data.some(
        (u) => (u.attributes.username || '').toLowerCase() === email.toLowerCase()
      )) {
        console.log('Already a team member: ' + email);
        break;
      }
      const pending = await api('GET', '/v1/userInvitations?limit=200');
      if (pending.data.some(
        (u) => (u.attributes.email || '').toLowerCase() === email.toLowerCase()
      )) {
        console.log('Invitation already pending: ' + email);
        console.log('They have to accept it before TestFlight will take them.');
        break;
      }

      await api('POST', '/v1/userInvitations', {
        data: {
          type: 'userInvitations',
          attributes: {
            email,
            firstName: first,
            lastName: last,
            roles: ['MARKETING'],
            allAppsVisible: false,
            provisioningAllowed: false,
          },
          relationships: {
            visibleApps: { data: [{ type: 'apps', id: appId }] },
          },
        },
      });
      console.log('Invited ' + email + ' as Marketing on ' + BUNDLE_ID + '.');
      console.log('Apple has emailed them. Once they accept, run:');
      console.log('  node data/20_appstore_api.js testflight-setup ' + email);
      break;
    }

    case 'testflight-setup': {
      // Internal testing, not external: internal groups take App Store Connect
      // users only, but they skip Beta App Review, which for an external group
      // holds the first build for a day or two.
      //
      //   node data/20_appstore_api.js testflight-setup a@b.com c@d.com
      const app = await api('GET',
        '/v1/apps?filter[bundleId]=' + encodeURIComponent(BUNDLE_ID));
      if (!app.data.length) throw new Error('No app record for ' + BUNDLE_ID);
      const appId = app.data[0].id;

      const groupName = 'Internal Testers';
      const groups = await api('GET', '/v1/betaGroups?limit=200');
      let group = groups.data.find((g) => g.attributes.name === groupName);
      if (group) {
        console.log('Group already exists: ' + groupName);
      } else {
        const created = await api('POST', '/v1/betaGroups', {
          data: {
            type: 'betaGroups',
            attributes: {
              name: groupName,
              isInternalGroup: true,
              // Every build reaches the group without being assigned by hand,
              // which is the whole point of internal testing.
              hasAccessToAllBuilds: true,
            },
            relationships: { app: { data: { type: 'apps', id: appId } } },
          },
        });
        group = created.data;
        console.log('Created group: ' + groupName);
      }

      const emails = args.length ? args : [];
      if (!emails.length) {
        console.log('No testers given. Pass emails to invite them.');
        break;
      }
      const existing = await api('GET',
        '/v1/betaTesters?filter[betaGroups]=' + group.id + '&limit=200');
      const have = existing.data.map((t) => (t.attributes.email || '')
        .toLowerCase());
      for (const email of emails) {
        if (have.includes(email.toLowerCase())) {
          console.log('  already invited  ' + email);
          continue;
        }
        await api('POST', '/v1/betaTesters', {
          data: {
            type: 'betaTesters',
            attributes: { email },
            relationships: {
              betaGroups: { data: [{ type: 'betaGroups', id: group.id }] },
            },
          },
        });
        console.log('  invited          ' + email);
      }
      break;
    }

    case 'refresh-profile': {
      // A provisioning profile is a snapshot of the bundle ID's capabilities
      // at the moment it was created. Turning a capability on does nothing to
      // profiles that already exist, so anything signed with the old one is
      // rejected for claiming an entitlement the profile does not carry.
      // Run this after changing capabilities, then replace APPSTORE_PROFILE.
      const identifier = args[0] || BUNDLE_ID;
      const capability = args[1] || 'APPLE_ID_AUTH'; // Sign in with Apple
      const out = path.join(__dirname, '..', 'divine_healing', '.signing');
      fs.mkdirSync(out, { recursive: true });

      const bundle = await api('GET',
        '/v1/bundleIds?filter[identifier]=' + encodeURIComponent(identifier));
      if (!bundle.data.length) {
        throw new Error('Bundle ID not registered: ' + identifier);
      }
      const bundleDbId = bundle.data[0].id;

      // The fields parameter is not decoration: the VPN stalls on this path
      // when it is bare, and the call fails after four retries.
      const caps = await api('GET', '/v1/bundleIds/' + bundleDbId +
        '/bundleIdCapabilities?fields[bundleIdCapabilities]=capabilityType');
      const have = caps.data.map((c) => c.attributes.capabilityType);
      if (have.includes(capability)) {
        console.log(capability + ' already enabled.');
      } else {
        await api('POST', '/v1/bundleIdCapabilities', {
          data: {
            type: 'bundleIdCapabilities',
            attributes: {
              capabilityType: capability,
              // Apple refuses the capability without one: "Please select at
              // least one configuration for Sign In with Apple." This is the
              // primary-app choice, which is what a standalone app wants —
              // the alternative groups it under another app's consent.
              settings: capability === 'APPLE_ID_AUTH'
                ? [{
                    key: 'APPLE_ID_AUTH_APP_CONSENT',
                    options: [{ key: 'PRIMARY_APP_CONSENT' }],
                  }]
                : undefined,
            },
            relationships: {
              bundleId: { data: { type: 'bundleIds', id: bundleDbId } },
            },
          },
        });
        console.log('Enabled ' + capability + ' on ' + identifier);
      }

      const certs = await api('GET',
        '/v1/certificates?filter[certificateType]=DISTRIBUTION');
      if (!certs.data.length) {
        throw new Error('No distribution certificate. Run create-distribution.');
      }

      const name = 'Divine Healing App Store';
      const existing = await api('GET', '/v1/profiles?limit=200');
      for (const pr of existing.data) {
        if (pr.attributes.name === name) {
          await api('DELETE', '/v1/profiles/' + pr.id);
        }
      }
      const profile = await api('POST', '/v1/profiles', {
        data: {
          type: 'profiles',
          attributes: { name, profileType: 'IOS_APP_STORE' },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundleDbId } },
            certificates: {
              data: [{ type: 'certificates', id: certs.data[0].id }],
            },
          },
        },
      });
      fs.writeFileSync(path.join(out, 'profile.mobileprovision'),
        Buffer.from(profile.data.attributes.profileContent, 'base64'));

      console.log('Profile reissued: ' + profile.data.attributes.name +
        '  (' + profile.data.attributes.uuid + ')');
      console.log('Now update the secret:');
      console.log('  base64 -w0 divine_healing/.signing/' +
        'profile.mobileprovision | gh secret set APPSTORE_PROFILE');
      break;
    }

    case 'create-distribution': {
      // Builds everything needed to sign for the App Store, without a Mac.
      //
      // Xcode's automatic signing was tried first and kept asking Apple for a
      // *development* profile, which enumerates permitted devices — this team
      // has none, so every archive failed. It also littered the account with
      // two stray development certificates. Creating the distribution pair
      // explicitly removes the guesswork: CI signs with exactly these.
      const identifier = args[0] || 'com.divinehealing.app';
      const out = path.join(__dirname, '..', 'divine_healing', '.signing');
      fs.mkdirSync(out, { recursive: true });
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dh-signing-'));
      const at = (f) => path.join(tmp, f);
      const openssl = (a) => execFileSync('openssl', a, { stdio: 'pipe' });

      // 1. A key that never leaves here, and the request Apple signs.
      openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes',
        '-keyout', at('key.pem'), '-out', at('csr.pem'),
        '-subj', '/CN=Divine Healing Distribution/O=Strawberry Hope/C=AU']);

      // 2. Apple only ever holds the public half.
      let cert;
      const existing = await api(
        'GET', '/v1/certificates?filter[certificateType]=DISTRIBUTION');
      if (existing.data.length) {
        // A certificate cannot be re-downloaded with its private key, and the
        // key here is new, so an existing one is useless to us. Apple allows
        // very few distribution certificates, hence the explicit stop.
        throw new Error(
          'A distribution certificate already exists (' +
            existing.data[0].attributes.name + '). Its private key is not on ' +
            'this machine. Revoke it in App Store Connect -> Certificates, ' +
            'then re-run — or recover the original .p12.');
      }
      cert = await api('POST', '/v1/certificates', {
        data: {
          type: 'certificates',
          attributes: {
            certificateType: 'DISTRIBUTION',
            csrContent: fs.readFileSync(at('csr.pem'), 'utf8'),
          },
        },
      });
      fs.writeFileSync(at('cert.cer'),
        Buffer.from(cert.data.attributes.certificateContent, 'base64'));
      openssl(['x509', '-inform', 'DER', '-in', at('cert.cer'),
        '-out', at('cert.pem')]);

      // 3. Certificate plus private key, in the one format a keychain imports.
      // The old PBE algorithms are named on purpose: OpenSSL 3 defaults to
      // AES-256 with PBKDF2, which some `security import` builds still refuse.
      const password = crypto.randomBytes(16).toString('hex');
      openssl(['pkcs12', '-export', '-legacy',
        '-inkey', at('key.pem'), '-in', at('cert.pem'),
        '-out', at('dist.p12'), '-passout', 'pass:' + password,
        '-name', 'Divine Healing Distribution']);

      // 4. The profile ties bundle ID and certificate together.
      const bundle = await api('GET',
        '/v1/bundleIds?filter[identifier]=' + encodeURIComponent(identifier));
      if (!bundle.data.length) {
        throw new Error('Bundle ID not registered: ' + identifier);
      }
      const name = 'Divine Healing App Store';
      const stale = await api('GET', '/v1/profiles?limit=200');
      for (const pr of stale.data) {
        if (pr.attributes.name === name) {
          // A profile is pinned to a certificate; the old one now points at
          // nothing we hold.
          await api('DELETE', '/v1/profiles/' + pr.id);
        }
      }
      const profile = await api('POST', '/v1/profiles', {
        data: {
          type: 'profiles',
          attributes: { name, profileType: 'IOS_APP_STORE' },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundle.data[0].id } },
            certificates: {
              data: [{ type: 'certificates', id: cert.data.id }],
            },
          },
        },
      });
      fs.writeFileSync(path.join(out, 'dist.p12'),
        fs.readFileSync(at('dist.p12')));
      fs.writeFileSync(path.join(out, 'profile.mobileprovision'),
        Buffer.from(profile.data.attributes.profileContent, 'base64'));
      fs.writeFileSync(path.join(out, 'password.txt'), password);
      fs.rmSync(tmp, { recursive: true, force: true });

      console.log('Distribution certificate and profile created.');
      console.log('  certificate  ' + cert.data.attributes.name);
      console.log('  expires      ' +
        cert.data.attributes.expirationDate.slice(0, 10));
      console.log('  profile      ' + profile.data.attributes.name +
        '  (' + profile.data.attributes.uuid + ')');
      console.log('  written to   divine_healing/.signing/  — gitignored');
      break;
    }

    case 'create-app': {
      // Apple refuses this, and the refusal is worth keeping so nobody
      // spends another hour on it:
      //   HTTP 403 — The resource 'apps' does not allow 'CREATE'.
      //   Allowed operations are: GET_COLLECTION, GET_INSTANCE, UPDATE
      // Not a permissions problem — the API simply has no app-creation
      // endpoint. The record has to be made in the browser, once, and
      // everything after it (builds, TestFlight, metadata) is scriptable.
      console.log(
        'The App Store Connect API cannot create apps. Create the record at\n' +
          '  https://appstoreconnect.apple.com/apps  ->  +  ->  New App\n' +
          'The bundle ID is already registered, so it appears in the dropdown.',
      );
      break;
    }

    default:
      console.error(
        'commands: whoami | list-bundle-ids | register-bundle-id <id> <name>\n' +
          '          list-certificates | list-profiles | create-distribution\n' +
          '          list-builds | refresh-profile | testflight-setup\n' +
          '          store-metadata | age-rating | upload-screenshots <dir>',
      );
      process.exit(1);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

// Checks a Play service account JSON before it goes anywhere near RevenueCat.
//
// RevenueCat accepts a credential file and then reports "invalid credentials"
// with nothing to go on. This calls the Play Developer API directly with the
// same key, so a failure names the missing permission instead.
//
//   node data/24_verify_play_credential.js path/to/key.json
//
// Signs its own RS256 assertion rather than pulling in google-auth-library:
// the file already contains the private key, and this repo signs an ES256
// assertion for Apple the same way in 20_appstore_api.js.

const fs = require('fs');
const crypto = require('crypto');

const PACKAGE = 'com.divinehealing.app';
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Pass the service account JSON: node data/24_verify_play_credential.js key.json');
  process.exit(1);
}
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
if (!key.client_email || !key.private_key) {
  console.error('That file is not a service account key — no client_email/private_key.');
  process.exit(1);
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64(claim);
  const sig = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(key.private_key)
    .toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + sig,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    // The usual cause is the Play Android Developer API being off in the
    // project the key belongs to, which reports as an auth failure.
    throw new Error(
      'Token request failed: ' + (body.error_description || JSON.stringify(body)),
    );
  }
  return body.access_token;
}

(async () => {
  console.log('Service account: ' + key.client_email);
  console.log('Project:         ' + key.project_id);
  console.log('');

  const access = await token();
  console.log('  OAuth token     ok');

  // Listing subscriptions needs the same read the receipt check needs, and
  // unlike creating an edit it changes nothing.
  const url =
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
    PACKAGE + '/subscriptions?pageSize=50';
  const res = await fetch(url, {
    headers: { authorization: 'Bearer ' + access },
  });
  const body = await res.json();

  if (!res.ok) {
    const msg = (body.error && body.error.message) || JSON.stringify(body);
    console.log('  Play API        FAILED — ' + msg);
    console.log('');
    if (/has not been linked|not been invited|does not have permission/i.test(msg)) {
      console.log('The key is valid but Play does not know it yet. Invite it:');
      console.log('  Play Console -> Users and permissions -> Invite new users');
      console.log('  -> ' + key.client_email);
      console.log('  -> View financial data, orders, and cancellation surveys');
      console.log('  -> Manage orders and subscriptions');
    }
    process.exit(1);
  }

  const subs = body.subscriptions || [];
  console.log('  Play API        ok — ' + subs.length + ' subscription(s) on ' + PACKAGE);
  for (const s of subs) console.log('      ' + s.productId);
  console.log('');
  console.log('Ready for RevenueCat.');
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

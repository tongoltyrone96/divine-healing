// Creates the account Apple and Google reviewers sign in with.
//
// Both stores require working credentials for an app with paid content, and
// neither will accept a magic link: a reviewer cannot read somebody else's
// inbox. This makes an account with a password and marks it subscribed, so
// they see the whole library rather than three free sessions and a paywall.
//
// The subscription row is written directly rather than bought. Google's form
// says outright that reviewers may not use free trials or make purchases,
// and a real purchase would also mean a real refund later.
//
//   node data/23_make_review_account.js            # shows what it would do
//   node data/23_make_review_account.js --apply
//
// Safe to re-run: it resets the password and refreshes the expiry rather
// than failing on an account that already exists.

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ADMIN) {
  console.error(
    'Missing SUPABASE_URL or the admin key in divine_healing/.env',
  );
  process.exit(1);
}

const EMAIL = 'appreview@divinehealing.app';
const APPLY = process.argv.includes('--apply');

const db = createClient(URL, ADMIN, { auth: { persistSession: false } });

// Far enough out that it will not lapse mid-review and turn a working
// account into a paywall.
const EXPIRES = new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString();

(async () => {
  console.log(APPLY ? 'Applying.' : 'Dry run — nothing is written.');
  console.log('');

  // A generated password rather than a memorable one: it goes into two store
  // consoles and nowhere else, and nobody has to type it from memory.
  const password = 'Dh-' + crypto.randomBytes(12).toString('base64url');

  const { data: list, error: listErr } = await db.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === EMAIL);

  if (!APPLY) {
    console.log(`  ${existing ? 'would reset' : 'would create'}  ${EMAIL}`);
    console.log('  would mark the account active until ' + EXPIRES.slice(0, 10));
    console.log('');
    console.log('Re-run with --apply to write, and the password is printed');
    console.log('only then.');
    return;
  }

  let userId;
  if (existing) {
    const { error } = await db.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = existing.id;
    console.log(`  password reset   ${EMAIL}`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: EMAIL,
      password,
      // No confirmation mail: the address does not receive anything, and an
      // unconfirmed account cannot sign in.
      email_confirm: true,
      user_metadata: { name: 'App Review' },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  created          ${EMAIL}`);
  }

  const { error: subErr } = await db.from('sh_subscribers').upsert(
    {
      user_email: EMAIL,
      subscription_status: 'active',
      plan_name: 'Annual',
      current_period_end: EXPIRES,
      store: 'review',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_email' },
  );
  if (subErr) throw subErr;
  console.log('  marked active    until ' + EXPIRES.slice(0, 10));
  console.log('');
  console.log('Give these to both stores:');
  console.log('  email     ' + EMAIL);
  console.log('  password  ' + password);
  console.log('');
  console.log('Shown once. Re-run with --apply to set a new one.');
  console.log('  user id   ' + userId);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

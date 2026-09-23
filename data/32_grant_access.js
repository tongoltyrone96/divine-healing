// Gives someone the full library without a purchase.
//
//   node data/32_grant_access.js alice@example.com bob@example.com
//   node data/32_grant_access.js --apply alice@example.com
//   node data/32_grant_access.js --revoke --apply alice@example.com
//
// The client asked how to let family and friends in for free. Apple's own
// answers — Family Sharing, offer codes — only reach people on her Apple
// account or willing to redeem a code in one store, and neither covers
// Android or the web. A row here covers all three, because
// sh_has_full_access() is what every platform ends up asking.
//
// The row can be written before the person has ever opened the app: the
// entitlement matches on the address in their session, so it starts working
// the moment they sign in with it. That is how the client's own two
// accounts were set up.
//
// `store` is recorded as 'gift' so these never look like revenue, and the
// expiry is far enough out to be effectively permanent without being
// literally forever.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ADMIN) {
  console.error('Missing SUPABASE_URL or the admin key in divine_healing/.env');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const REVOKE = process.argv.includes('--revoke');
const emails = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('--'))
  .map((e) => e.trim().toLowerCase());

if (!emails.length) {
  console.error('Usage: node data/32_grant_access.js [--apply] [--revoke] <email> [email…]');
  process.exit(1);
}

const db = createClient(URL, ADMIN, { auth: { persistSession: false } });
const EXPIRES = new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString();

(async () => {
  console.log(APPLY ? 'Applying.' : 'Dry run — nothing is written.');
  console.log('');

  for (const email of emails) {
    const { data: existing } = await db
      .from('sh_subscribers')
      .select('user_email,subscription_status,store,current_period_end')
      .eq('user_email', email)
      .maybeSingle();

    if (REVOKE) {
      if (!existing) {
        console.log(`  ${email.padEnd(38)} no row — nothing to revoke`);
        continue;
      }
      if (existing.store !== 'gift') {
        // Refusing rather than clearing: cancelling a real subscriber's row
        // would take away something they paid for, and the store would
        // happily keep charging them.
        console.log(`  ${email.padEnd(38)} REFUSED — store is '${existing.store}', not a gift`);
        continue;
      }
      if (!APPLY) {
        console.log(`  ${email.padEnd(38)} would revoke`);
        continue;
      }
      const { error } = await db.from('sh_subscribers').delete().eq('user_email', email);
      if (error) throw error;
      console.log(`  ${email.padEnd(38)} revoked`);
      continue;
    }

    if (existing && existing.store !== 'gift') {
      console.log(`  ${email.padEnd(38)} already has access via '${existing.store}' — left alone`);
      continue;
    }
    if (!APPLY) {
      console.log(`  ${email.padEnd(38)} ${existing ? 'would refresh' : 'would grant'} until ${EXPIRES.slice(0, 10)}`);
      continue;
    }

    const { error } = await db.from('sh_subscribers').upsert(
      {
        user_email: email,
        subscription_status: 'active',
        plan_name: 'Annual',
        current_period_end: EXPIRES,
        store: 'gift',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_email' },
    );
    if (error) throw error;
    console.log(`  ${email.padEnd(38)} granted until ${EXPIRES.slice(0, 10)}`);
  }

  console.log('');
  if (!APPLY) {
    console.log('Re-run with --apply to write.');
  } else if (!REVOKE) {
    console.log('They need to sign in with exactly this address — "Continue with');
    console.log('Email" on the sign-in screen. Google and Apple sign-in work too,');
    console.log('as long as the address they arrive with is the one above.');
  }
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

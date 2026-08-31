// Runs a migration file against the live database.
//
// Until now every migration in data/migrations/ was pasted into the Supabase
// SQL Editor by hand, because the anon and secret keys both go through
// PostgREST, which will not run DDL. The Management API will, given a
// personal access token with Database write.
//
//   $env:SUPABASE_ACCESS_TOKEN="sbp_..."      # or put it in .env
//   node data/22_run_migration.js data/migrations/20260831_01_store_purchases.sql
//   node data/22_run_migration.js <file> --apply
//
// Dry by default: it prints the statements it would send. The migrations
// here are written to be safe to re-run, but a typo in a DDL statement is
// not the kind of thing to discover by running it.

const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = (process.env.SUPABASE_URL || '')
  .replace('https://', '')
  .replace('.supabase.co', '');

const file = process.argv[2];
const APPLY = process.argv.includes('--apply');

if (!TOKEN) {
  console.error(
    'Missing SUPABASE_ACCESS_TOKEN. Create one at\n' +
      '  https://supabase.com/dashboard/account/tokens\n' +
      'scoped to this project with Database write.',
  );
  process.exit(1);
}
if (!file) {
  console.error('usage: node data/22_run_migration.js <file.sql> [--apply]');
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');

// Comment-only lines are stripped for the preview so the summary shows the
// statements rather than the reasoning around them. The full file is what
// gets sent.
const preview = sql
  .split('\n')
  .filter((l) => l.trim() && !l.trim().startsWith('--'))
  .join('\n');

(async () => {
  console.log(`${path.basename(file)} -> project ${REF}`);
  console.log('');
  console.log(preview.replace(/^/gm, '  '));
  console.log('');

  if (!APPLY) {
    console.log('Dry run. Re-run with --apply to execute.');
    return;
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error(`HTTP ${res.status} — ${text.slice(0, 500)}`);
    process.exit(1);
  }
  console.log('Applied.');
  if (text && text !== '[]') console.log(text.slice(0, 500));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

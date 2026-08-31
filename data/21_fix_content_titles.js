// Applies the client's content decisions of 2026-08-31: delete the empty
// "ABC" session and correct two misspelled titles.
//
// The typos came across from the Glide database and have been visible in the
// library the whole time. "ABC" was a test row with no audio, no description
// and no duration; it sat second in the list, ahead of real sessions.
//
// The same three changes are already made in
// divine_healing/assets/content/admin_content.json, which is the offline
// fallback. Supabase is what the shipped app actually reads.
//
// Needs the admin key, which is not in .env and should not be:
//
//   $env:SUPABASE_SECRET_KEY="sb_secret_..."
//   node data/21_fix_content_titles.js          # shows what it would do
//   node data/21_fix_content_titles.js --apply  # does it
//
// Safe to re-run: it reports "already correct" for anything done.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL) {
  console.error('Missing SUPABASE_URL in divine_healing/.env');
  process.exit(1);
}
if (!ADMIN) {
  console.error(
    'Missing the admin key. Set it for this shell only:\n' +
      '  $env:SUPABASE_SECRET_KEY="sb_secret_..."',
  );
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const db = createClient(URL, ADMIN, { auth: { persistSession: false } });

const RENAMES = [
  { from: 'Forgivness', to: 'Forgiveness' },
  { from: 'Charkra Short', to: 'Chakra Short' },
];
const DELETE_TITLE = 'ABC';

(async () => {
  console.log(APPLY ? 'Applying changes.' : 'Dry run — nothing is written.');
  console.log('');

  for (const { from, to } of RENAMES) {
    const { data, error } = await db
      .from('sh_content')
      .select('id, title')
      .eq('title', from);
    if (error) throw error;

    if (!data.length) {
      const { data: done } = await db
        .from('sh_content')
        .select('id')
        .eq('title', to);
      console.log(
        done && done.length
          ? `  already correct   ${to}`
          : `  NOT FOUND         ${from} (nor ${to})`,
      );
      continue;
    }
    if (!APPLY) {
      console.log(`  would rename      ${from} -> ${to}  (id ${data[0].id})`);
      continue;
    }
    const { error: upErr } = await db
      .from('sh_content')
      .update({ title: to })
      .eq('id', data[0].id);
    if (upErr) throw upErr;
    console.log(`  renamed           ${from} -> ${to}`);
  }

  const { data: abc, error: findErr } = await db
    .from('sh_content')
    .select('id, title, content_body, duration_minutes')
    .eq('title', DELETE_TITLE);
  if (findErr) throw findErr;

  if (!abc.length) {
    console.log(`  already gone      ${DELETE_TITLE}`);
  } else {
    const row = abc[0];
    // Deleting a row someone has listened to or journalled against would
    // orphan their history, so check before removing rather than after.
    const refs = [];
    for (const table of ['sh_content_progress', 'sh_shadow_work_responses']) {
      const { count, error } = await db
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('content_id', row.id);
      if (error) throw error;
      if (count) refs.push(`${table}: ${count}`);
    }
    if (refs.length) {
      console.log(
        `  SKIPPED           ${DELETE_TITLE} is referenced by ${refs.join(', ')}`,
      );
      console.log('                    Deleting it would orphan that history.');
    } else if (!APPLY) {
      console.log(`  would delete      ${DELETE_TITLE} (id ${row.id}, no audio)`);
    } else {
      const { error: delErr } = await db
        .from('sh_content')
        .delete()
        .eq('id', row.id);
      if (delErr) throw delErr;
      console.log(`  deleted           ${DELETE_TITLE}`);
    }
  }

  const { count } = await db
    .from('sh_content')
    .select('id', { count: 'exact', head: true });
  console.log('');
  console.log(`  sh_content now holds ${count} rows.`);
  if (!APPLY) console.log('  Re-run with --apply to write.');
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

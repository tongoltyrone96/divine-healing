// Diagnostic — verifies Supabase URL + service-role key are working and
// reports what already exists in the project (buckets, tables, row counts).
//
// Run:
//   $env:SUPABASE_URL="..."
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."
//   node 00_check_supabase.js

const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(URL, KEY);

const TABLES = [
  'sh_subscribers',
  'sh_content',
  'sh_content_progress',
  'sh_affirmation_favourites',
  'sh_manifestation_responses',
  'sh_shadow_work_responses',
];

const BUCKET = 'sh-audio';

(async () => {
  console.log(`\nTarget: ${URL}`);
  console.log('─'.repeat(60));

  // 1. Storage buckets
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.log(`Storage list  ✗  ${bErr.message}`);
  } else {
    const names = buckets.map(b => b.name);
    console.log(`Storage list  ✓  ${names.length} bucket(s): [${names.join(', ') || '(none)'}]`);
    const hit = buckets.find(b => b.name === BUCKET);
    if (hit) {
      const { data: files } = await supabase.storage.from(BUCKET).list('audio', { limit: 100 });
      console.log(`  '${BUCKET}'    ✓  ${files ? files.length : 0} file(s) under audio/`);
    } else {
      console.log(`  '${BUCKET}'    ✗  bucket does not exist yet`);
    }
  }

  console.log('─'.repeat(60));

  // 2. Tables
  for (const t of TABLES) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${t.padEnd(30)}  ✗  ${error.message}`);
    } else {
      console.log(`Table ${t.padEnd(30)}  ✓  ${count} row(s)`);
    }
  }

  console.log('─'.repeat(60));
  console.log('Done.\n');
})().catch((e) => { console.error(e); process.exit(1); });

// Deeper probe — verify tables really exist by trying a definitive SELECT and
// an INSERT-then-DELETE round-trip that would fail if the schema is missing.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

(async () => {
  // 1. Straight SELECT with LIMIT 1 — errors distinctly if the table is missing.
  console.log('SELECT probe:');
  const tables = [
    'sh_subscribers', 'sh_content', 'sh_content_progress',
    'sh_affirmation_favourites', 'sh_manifestation_responses',
    'sh_shadow_work_responses',
  ];
  for (const t of tables) {
    const { data, error, status } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`  ${t.padEnd(30)}  status=${status}  err="${error.message}" (code=${error.code})`);
    } else {
      console.log(`  ${t.padEnd(30)}  status=${status}  rows=${data.length}`);
    }
  }

  // 2. INSERT probe on the least destructive table — sh_content_progress.
  console.log('\nINSERT probe on sh_content_progress:');
  const testEmail = 'probe@example.invalid';
  const { data: ins, error: insErr } = await supabase
    .from('sh_content_progress')
    .insert({ user_email: testEmail, content_id: 1 })
    .select();
  if (insErr) {
    console.log(`  insert  err="${insErr.message}" (code=${insErr.code})`);
  } else {
    console.log(`  insert  ok  ${ins.length} row(s)`);
    // Clean up
    await supabase.from('sh_content_progress').delete().eq('user_email', testEmail);
    console.log('  cleaned up probe row');
  }
})().catch((e) => { console.error(e); process.exit(1); });

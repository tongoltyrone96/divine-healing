// Probe what an unauthenticated user (anon key) can see in sh_content.
// RLS policy on sh_content:
//   - "public reads preview"  → SELECT WHERE is_preview = TRUE (anyone)
//   - "authenticated reads all" → SELECT * (signed-in)
//
// If RLS is enforced correctly, anon should see only the 3 preview rows.

const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ANON = 'sb_publishable_7m-bk8K9-pW7CUEu-3Dnyg_dpaZWQDa'; // baked into web build

if (!URL) { console.error('Missing SUPABASE_URL'); process.exit(1); }

const supabase = createClient(URL, ANON);

(async () => {
  console.log(`Probing as anon on ${URL}\n`);

  const { data, error, count } = await supabase
    .from('sh_content')
    .select('id, title, category, is_preview', { count: 'exact' });

  if (error) {
    console.log(`ERROR: ${error.message} (code=${error.code})`);
    process.exit(0);
  }

  console.log(`Anon can see ${data.length} rows (count=${count}):`);
  for (const r of data) {
    const mark = r.is_preview ? '⭐ FREE' : '     ';
    console.log(`  ${mark}  id=${r.id.toString().padEnd(3)} ${r.category.padEnd(12)} ${r.title}`);
  }
  console.log('');
  console.log(data.length === 3 ? '✅ RLS working: anon sees only preview rows.'
    : data.length >= 20 ? '⚠️  RLS NOT enforced: anon sees everything.'
    : '❓ Unexpected count.');
})();

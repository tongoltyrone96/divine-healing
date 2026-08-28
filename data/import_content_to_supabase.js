// Load Glide-exported content JSON into Supabase.
// Prerequisites:
//   1. Supabase schema created (run supabase_schema.sql)
//   2. Audio files uploaded to Supabase Storage bucket 'sh-audio' (see upload_audio_to_supabase.js)
//   3. Set env vars SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role — bypasses RLS)
//
// Run:
//   npm install @supabase/supabase-js
//   node import_content_to_supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importContent() {
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw/admin_content.json'), 'utf8'));
  console.log(`Loaded ${src.length} content items from Glide export`);

  // Map Glide -> Supabase shape:
  //   Glide content_body = "audio/10.mp3" (Glide's storage path)
  //   Supabase we keep same convention — bucket is 'sh-audio', object is same path
  // If audio file was renamed during download, update this mapping.
  const rows = src.map(item => ({
    id: parseInt(item.id, 10),
    category: item.category,
    title: item.title,
    description: item.description || '',
    content_body: item.content_body,          // keep original path — matches Storage
    duration_minutes: item.duration_minutes,
    is_preview: item.is_preview,
    sort_order: item.sort_order ?? 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  // Insert (upsert on id in case re-run)
  const { data, error } = await supabase
    .from('sh_content')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }
  console.log(`✅ Imported ${data.length} content rows`);

  // Bump the id sequence so future auto-inserts don't collide with imported ids
  const maxId = Math.max(...rows.map(r => r.id));
  const { error: seqErr } = await supabase.rpc('exec_sql', {
    sql: `SELECT setval('sh_content_id_seq', ${maxId + 1}, false);`
  });
  if (seqErr) console.warn('Could not bump sequence (safe to ignore):', seqErr.message);
}

async function importSubscribers() {
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw/admin_subscribers.json'), 'utf8'));
  console.log(`Loaded ${src.length} subscriber(s) from Glide export`);

  const rows = src.map(item => ({
    user_email: item.user_email,
    subscription_status: item.subscription_status,
    plan_name: item.plan_name,
    current_period_end: item.current_period_end,
    created_at: item.created_at,
  }));

  const { data, error } = await supabase
    .from('sh_subscribers')
    .upsert(rows, { onConflict: 'user_email' })
    .select();

  if (error) {
    console.error('Subscriber upsert failed:', error);
    return;
  }
  console.log(`✅ Imported ${data.length} subscriber(s)`);
}

(async () => {
  try {
    await importContent();
    await importSubscribers();
    console.log('\nAll done.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

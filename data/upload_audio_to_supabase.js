// Upload downloaded audio files from assets/audio/ to Supabase Storage.
//
// Object paths come from sh_content, NOT from the manifest: paths were
// randomized by 06_randomize_audio_paths.js and the manifest still records
// Glide's original "audio/{id}.mp3". Uploading to those would recreate the
// guessable paths this project deliberately moved away from, as a second
// orphaned copy of every track.
//
// Historical note — the manifest kept the same object path as Glide used
// values from Glide can be reused unchanged.
//
// Run:
//   npm install @supabase/supabase-js
//   node upload_audio_to_supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'sh-audio';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'raw/audio_manifest.json'), 'utf8')
  );
  const audioDir = path.join(__dirname, '..', 'assets/audio');

  console.log(`Uploading ${manifest.filter(m => m.audio_downloaded).length} audio files to bucket '${BUCKET}'`);

  const { data: rows, error: readErr } = await supabase
    .from('sh_content')
    .select('id, content_body');
  if (readErr) {
    console.error('Could not read sh_content:', readErr.message);
    process.exit(1);
  }
  const currentPath = new Map((rows || []).map(r => [String(r.id), r.content_body]));

  for (const item of manifest) {
    if (!item.audio_downloaded) continue;

    const localPath = path.join(audioDir, item.audio_file);
    // The table is the source of truth for where a track lives.
    const remotePath = currentPath.get(String(item.id)) || item.content_body;
    const file = fs.readFileSync(localPath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, file, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      console.log(`  ❌ ${remotePath} — ${error.message}`);
    } else {
      console.log(`  ✅ ${remotePath} (${(item.audio_size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }

  console.log('\nDone.');
})();

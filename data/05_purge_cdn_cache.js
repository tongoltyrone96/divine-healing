// Purges Supabase's CDN cache for audio objects that are still being served
// publicly after the bucket was locked down.
//
// Why this is needed: flipping `sh-audio` to private stops the ORIGIN from
// answering /object/public/**, but Cloudflare keeps serving whatever it had
// already cached — observed well past the advertised max-age=3600 (one object
// was still a HIT at 45 hours). Waiting it out is not a fix.
//
// Supabase invalidates an object's cache entry when the object is written, so
// re-uploading the identical bytes from assets/audio/ is enough.
//
// Run:
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
//   node data/05_purge_cdn_cache.js
//
// Only objects that are actually still cached get re-uploaded, so this is
// cheap to re-run.

const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;

// This project is on Supabase's newer key format, where the admin credential
// is a `sb_secret_...` key (Project Settings > API Keys > Secret keys) rather
// than the legacy `service_role` JWT. Both work identically here, so accept
// either name.
const SERVICE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL or the admin key.\n' +
      'Grab it from Project Settings > API Keys > Secret keys (sb_secret_...)\n' +
      'and set it for this run only — it bypasses RLS, so never commit it:\n' +
      '  $env:SUPABASE_SECRET_KEY="sb_secret_..."',
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY);
const BUCKET = 'sh-audio';
const AUDIO_DIR = path.join(__dirname, '..', 'assets', 'audio');
const manifest = require('./raw/audio_manifest.json');

// Is this path still answering on the public route?
async function isStillCached(objectPath) {
  const res = await fetch(
    `${URL}/storage/v1/object/public/${BUCKET}/${objectPath}`,
    { headers: { Range: 'bytes=0-1023' } },
  );
  return {
    cached: res.status === 206 || res.status === 200,
    status: res.status,
    age: res.headers.get('age'),
  };
}

(async () => {
  const tracks = manifest.filter((m) => m.content_body && m.audio_file);
  console.log(`Scanning ${tracks.length} objects for CDN residue...\n`);

  const stale = [];
  for (const t of tracks) {
    const r = await isStillCached(t.content_body);
    if (r.cached) {
      stale.push(t);
      console.log(
        `  CACHED  ${t.content_body}  (${t.title}${t.is_preview ? ', preview' : ', PAID'})  age=${r.age}s`,
      );
    }
  }

  if (!stale.length) {
    console.log('No cached objects. Nothing to purge.\n');
    return;
  }

  console.log(`\nRe-uploading ${stale.length} object(s) to force invalidation...\n`);
  for (const t of stale) {
    const local = path.join(AUDIO_DIR, t.audio_file);
    if (!fs.existsSync(local)) {
      console.error(`  SKIP   ${t.content_body} — local file missing: ${t.audio_file}`);
      continue;
    }
    const bytes = fs.readFileSync(local);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(t.content_body, bytes, {
        contentType: 'audio/mpeg',
        upsert: true,
      });
    if (error) {
      console.error(`  FAIL   ${t.content_body} — ${error.message}`);
      continue;
    }
    const after = await isStillCached(t.content_body);
    console.log(
      `  ${after.cached ? 'STILL CACHED' : 'PURGED'}  ${t.content_body}  -> HTTP ${after.status}`,
    );
  }

  console.log('\nNow re-run: node data/04_verify_paywall.js\n');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

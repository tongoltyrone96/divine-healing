// Moves every audio object to an unguessable path and points sh_content at it.
//
// Why: paths were `audio/{id}.mp3`, so the whole catalogue could be
// enumerated by counting. That is half of what made the original leak
// exploitable — the other half (a public bucket) is fixed by
// migrations/20260828_01_audio_paywall.sql.
//
// This does NOT recover the objects Cloudflare cached while the bucket was
// public. Supabase only invalidates CDN entries on Pro+ (Smart CDN); on Free
// there is no purge, confirmed by a re-upload leaving Last-Modified and ETag
// untouched. Those stale copies stay reachable at their old paths until
// Cloudflare evicts them. What this script buys is that nothing NEW is ever
// guessable, and the stale entries become orphans pointing at paths the app
// no longer uses.
//
// Run:
//   $env:SUPABASE_SECRET_KEY="sb_secret_..."
//   node data/06_randomize_audio_paths.js
//
// Idempotent: paths that already carry a suffix are left alone.

const crypto = require('crypto');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL or the admin key.\n' +
      '  $env:SUPABASE_SECRET_KEY="sb_secret_..."',
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY);
const BUCKET = 'sh-audio';

// audio/10-3f9a1c2b8e7d4056.mp3
const RANDOMIZED = /^audio\/\d+-[0-9a-f]{16}\.mp3$/;

(async () => {
  const { data: rows, error } = await supabase
    .from('sh_content')
    .select('id, title, content_body, is_preview')
    .not('content_body', 'is', null)
    .order('id');

  if (error) {
    console.error('Could not read sh_content:', error.message);
    process.exit(1);
  }

  console.log(`${rows.length} sessions carry audio.\n`);

  let moved = 0;
  let skipped = 0;

  for (const row of rows) {
    const from = row.content_body;

    if (RANDOMIZED.test(from)) {
      skipped++;
      continue;
    }

    const to = `audio/${row.id}-${crypto.randomBytes(8).toString('hex')}.mp3`;

    const { error: moveErr } = await supabase.storage
      .from(BUCKET)
      .move(from, to);
    if (moveErr) {
      console.error(`  FAIL  ${from} -> ${to}: ${moveErr.message}`);
      continue;
    }

    // Only now is it safe to repoint the row; if this update fails the object
    // is already moved, so report loudly rather than leaving a silent
    // mismatch between the table and the bucket.
    const { error: updErr } = await supabase
      .from('sh_content')
      .update({ content_body: to })
      .eq('id', row.id);

    if (updErr) {
      console.error(
        `  ORPHANED  object moved to ${to} but sh_content.id=${row.id} still ` +
          `says ${from}: ${updErr.message}`,
      );
      continue;
    }

    moved++;
    console.log(`  ${from}  ->  ${to}   (${row.title})`);
  }

  console.log(
    `\nMoved ${moved}, already randomized ${skipped}.\n` +
      'Now re-run: node data/04_verify_paywall.js\n',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

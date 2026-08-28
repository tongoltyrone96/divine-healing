// Proves the audio paywall holds, from an attacker's point of view.
//
// Uses ONLY the anon key — the same credential that ships inside the Flutter
// bundle and is therefore public. Nothing here needs service_role.
//
// Run (after applying data/migrations/20260828_01_audio_paywall.sql):
//   node data/04_verify_paywall.js
//
// Exit code 0 = paywall holds, 1 = something is still reachable.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !ANON) {
  console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY in divine_healing/.env');
  process.exit(1);
}

const supabase = createClient(URL, ANON);
const BUCKET = 'sh-audio';

// audio/15.mp3 = Anxiety Release (free preview)
// audio/10.mp3 = Chemotherapy    (paid)
const PREVIEW = 'audio/15.mp3';
const PAID = ['audio/10.mp3', 'audio/11.mp3', 'audio/12.mp3'];

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

// Range-request the first KB so we never pull a 30 MB file just to test.
async function probe(url) {
  const res = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
  return res.status;
}

// Same, but with a cache-busting param so Cloudflare has to ask the origin.
// Without this the check reads the CDN's memory rather than the current
// access rules, which is the difference between "is the bucket locked" and
// "is anything still being served".
async function probeOrigin(url) {
  const sep = url.includes('?') ? '&' : '?';
  return probe(`${url}${sep}cb=${Date.now()}-${Math.random()}`);
}

function publicUrl(p) {
  return `${URL}/storage/v1/object/public/${BUCKET}/${p}`;
}

(async () => {
  console.log('\n1. Origin must refuse the public route (bucket private)');
  for (const p of [PREVIEW, ...PAID]) {
    const status = await probeOrigin(publicUrl(p));
    check(`origin public/${p} blocked`, status >= 400, `HTTP ${status}`);
  }

  console.log('\n2. Anonymous caller must NOT be able to sign a paid track');
  for (const p of PAID) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(p, 60);
    check(
      `sign ${p} refused`,
      !!error || !data,
      error ? error.message : 'signed URL was issued!',
    );
  }

  console.log('\n3. Free preview must still stream for a signed-out visitor');
  const { data: pv, error: pvErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(PREVIEW, 60);
  if (pvErr || !pv) {
    check(`sign ${PREVIEW}`, false, pvErr ? pvErr.message : 'no URL returned');
  } else {
    check(`sign ${PREVIEW}`, true);
    const status = await probe(pv.signedUrl);
    check(`stream ${PREVIEW}`, status === 206 || status === 200, `HTTP ${status}`);
  }

  console.log('\n4. Signed URL must not be a skeleton key for other objects');
  if (pv && pv.signedUrl) {
    // Swap the path but keep the token — Storage signs per-object, so this
    // must be rejected.
    const forged = pv.signedUrl.replace(PREVIEW, PAID[0]);
    const status = await probe(forged);
    check(`token replay onto ${PAID[0]} blocked`, status >= 400, `HTTP ${status}`);
  }

  // The origin can be locked while Cloudflare still hands out copies it
  // cached beforehand. Observed lasting far past max-age=3600, so this is a
  // real leak and not something to wait out — see data/05_purge_cdn_cache.js.
  console.log('\n5. No paid track may still be served from the CDN cache');
  const manifest = require('./raw/audio_manifest.json');
  const paidPaths = manifest
    .filter((m) => m.content_body && !m.is_preview)
    .map((m) => m.content_body);
  const residue = [];
  for (const p of paidPaths) {
    if ((await probe(publicUrl(p))) < 400) residue.push(p);
  }
  check(
    `${paidPaths.length} paid tracks absent from CDN cache`,
    residue.length === 0,
    residue.length
      ? `still cached: ${residue.join(', ')} — run node data/05_purge_cdn_cache.js`
      : undefined,
  );

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${failed.length ? `${failed.length} CHECK(S) FAILED` : 'All checks passed — paywall holds.'}\n`,
  );
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

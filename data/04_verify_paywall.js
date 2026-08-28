// Proves the audio paywall holds, from an attacker's point of view.
//
// The anon key is the same credential that ships inside the Flutter bundle,
// so everything an attacker can do, this script can do. Run:
//
//   node data/04_verify_paywall.js
//
// Optionally set the admin key to make check 2 stronger — it is used ONLY to
// look up the real paid paths, which are deliberately unguessable since
// 06_randomize_audio_paths.js. The signing attempts themselves always go
// through the anon client.
//
//   $env:SUPABASE_SECRET_KEY="sb_secret_..."   # optional
//
// Exit code 0 = paywall holds, 1 = something is reachable that should not be.

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', 'divine_healing', '.env'),
});
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const ADMIN =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON) {
  console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY in divine_healing/.env');
  process.exit(1);
}

const anon = createClient(URL, ANON);
const admin = ADMIN ? createClient(URL, ADMIN) : null;
const BUCKET = 'sh-audio';

// The paths everything used to live at. Nothing serves these any more, but
// they are what Cloudflare may still hold from when the bucket was public.
const LEGACY = require('./raw/audio_manifest.json')
  .filter((m) => m.content_body)
  .map((m) => ({ path: m.content_body, title: m.title, preview: m.is_preview }));

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function publicUrl(p) {
  return `${URL}/storage/v1/object/public/${BUCKET}/${p}`;
}

// Range-request the first KB so we never pull a 30 MB file just to test.
async function probe(url) {
  const res = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
  return res.status;
}

// Same, but cache-busted so Cloudflare has to ask the origin. Without this
// the check reads the CDN's memory rather than the current access rules.
async function probeOrigin(url) {
  const sep = url.includes('?') ? '&' : '?';
  return probe(`${url}${sep}cb=${Date.now()}-${Math.random()}`);
}

(async () => {
  // ---- what an anonymous caller can even see -----------------------------
  const { data: visible } = await anon
    .from('sh_content')
    .select('id, title, content_body, is_preview')
    .not('content_body', 'is', null);

  const previewPaths = (visible || [])
    .filter((r) => r.is_preview)
    .map((r) => r.content_body);

  let paidPaths = [];
  if (admin) {
    const { data: all } = await admin
      .from('sh_content')
      .select('content_body, is_preview')
      .eq('is_preview', false)
      .not('content_body', 'is', null);
    paidPaths = (all || []).map((r) => r.content_body);
  }

  console.log('\n1. Anonymous callers must not be able to enumerate paid audio');
  const leakedPaid = (visible || []).filter((r) => !r.is_preview);
  check(
    'sh_content exposes preview rows only',
    leakedPaid.length === 0,
    leakedPaid.length
      ? `${leakedPaid.length} paid paths readable`
      : `${previewPaths.length} preview paths visible`,
  );

  console.log('\n2. Origin must refuse the public route');
  for (const p of [...previewPaths, ...LEGACY.slice(0, 3).map((l) => l.path)]) {
    const status = await probeOrigin(publicUrl(p));
    check(`origin public/${p} blocked`, status >= 400, `HTTP ${status}`);
  }

  console.log('\n3. Anonymous caller must not be able to sign a paid track');
  if (!paidPaths.length) {
    console.log(
      '  SKIP  set SUPABASE_SECRET_KEY to test the real paid paths\n' +
        '        (they are unguessable, which is why anon cannot find them)',
    );
  } else {
    for (const p of paidPaths.slice(0, 5)) {
      const { data, error } = await anon.storage
        .from(BUCKET)
        .createSignedUrl(p, 60);
      check(
        `sign ${p} refused`,
        !!error || !data,
        error ? error.message : 'signed URL was issued!',
      );
    }
    console.log(`  (checked 5 of ${paidPaths.length} paid tracks)`);
  }

  console.log('\n4. Free preview must still stream for a signed-out visitor');
  let previewSigned = null;
  for (const p of previewPaths) {
    const { data, error } = await anon.storage
      .from(BUCKET)
      .createSignedUrl(p, 60);
    if (error || !data) {
      check(`sign ${p}`, false, error ? error.message : 'no URL returned');
      continue;
    }
    previewSigned = previewSigned || { path: p, url: data.signedUrl };
    const status = await probe(data.signedUrl);
    check(`stream ${p}`, status === 206 || status === 200, `HTTP ${status}`);
  }

  console.log('\n5. A signed URL must not be a skeleton key for other objects');
  if (previewSigned && paidPaths.length) {
    // Keep the token, swap the path. Storage signs per-object, so this must
    // be rejected.
    const forged = previewSigned.url.replace(previewSigned.path, paidPaths[0]);
    const status = await probe(forged);
    check('token replay onto a paid path blocked', status >= 400, `HTTP ${status}`);
  } else {
    console.log('  SKIP  needs both a preview signature and a known paid path');
  }

  console.log('\n6. CDN residue at the old guessable paths');
  const residue = [];
  for (const l of LEGACY) {
    if ((await probe(publicUrl(l.path))) < 400) residue.push(l);
  }
  const paidResidue = residue.filter((l) => !l.preview);
  check(
    `no paid track served from cache (${LEGACY.length} legacy paths swept)`,
    paidResidue.length === 0,
    paidResidue.length
      ? `still cached: ${paidResidue.map((l) => `${l.path} (${l.title})`).join(', ')}`
      : undefined,
  );
  if (paidResidue.length) {
    console.log(
      '        Re-uploading over an object does NOT clear its cache entry.\n' +
        '        Moving it does — see 06_randomize_audio_paths.js, which is\n' +
        '        what cleared the residue from the original public-bucket era.',
    );
  }

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${failed.length ? `${failed.length} CHECK(S) FAILED` : 'All checks passed — paywall holds.'}\n`,
  );
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

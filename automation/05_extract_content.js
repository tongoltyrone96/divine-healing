const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SESSION_DIR = path.join(__dirname, 'browser-session');
const DATA_DIR = path.join(ROOT, 'data', 'raw');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'https://p7d350073-spiritual-healing--gstsaver.glideos.app';

[DATA_DIR, AUDIO_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function fetchJson(page, endpoint) {
  return await page.evaluate(async (url) => {
    const r = await fetch(url, { credentials: 'include' });
    return { status: r.status, ok: r.ok, body: r.ok ? await r.json() : await r.text() };
  }, endpoint);
}

async function downloadAudio(page, contentBody, outPath) {
  // Use browser session (authenticated) to fetch audio file, return as base64
  const result = await page.evaluate(async (cb) => {
    const r = await fetch(`/app-api/audio/${cb}`, { credentials: 'include' });
    if (!r.ok) return { ok: false, status: r.status };
    const buf = await r.arrayBuffer();
    // Convert to base64 in chunks to avoid stack overflow
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 32768;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return { ok: true, size: buf.byteLength, b64: btoa(binary), type: r.headers.get('content-type') };
  }, contentBody);
  if (!result.ok) return { ok: false, status: result.status };
  fs.writeFileSync(outPath, Buffer.from(result.b64, 'base64'));
  return { ok: true, size: result.size, type: result.type };
}

(async () => {
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check'],
    ignoreDefaultArgs: ['--enable-automation']
  });
  const page = context.pages()[0] || await context.newPage();

  log('Navigating to app to establish session...');
  await page.goto(APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // ==================================================================
  // API endpoints to fetch
  // ==================================================================
  const endpoints = [
    { name: 'admin_content', url: '/app-api/admin/content' },
    { name: 'admin_subscribers', url: '/app-api/admin/subscribers' },
    { name: 'content_all', url: '/app-api/content' },
    { name: 'content_preview', url: '/app-api/content/preview' },
    { name: 'subscription_status', url: '/app-api/subscription/status' },
    { name: 'affirmations_favourites', url: '/app-api/affirmations/favourites' },
    // category filters
    { name: 'content_meditation', url: '/app-api/content?category=meditation' },
    { name: 'content_shadow_work', url: '/app-api/content?category=shadow_work' },
    { name: 'content_shadow-work', url: '/app-api/content?category=shadow-work' },
    { name: 'content_chakra_healing', url: '/app-api/content?category=chakra_healing' },
    { name: 'content_reiki', url: '/app-api/content?category=reiki' },
  ];

  log('=== Fetching API endpoints ===');
  const apiResults = {};
  for (const { name, url } of endpoints) {
    try {
      const r = await fetchJson(page, url);
      apiResults[name] = r;
      const outPath = path.join(DATA_DIR, `${name}.json`);
      fs.writeFileSync(outPath, JSON.stringify(r.body, null, 2));
      const preview = typeof r.body === 'string' ? r.body.slice(0, 80) : Array.isArray(r.body) ? `[array, len=${r.body.length}]` : `[${typeof r.body}]`;
      log(`  ${r.ok ? '✅' : '❌'} ${name} (${r.status}) → ${preview}`);
    } catch (e) {
      log(`  ❌ ${name}: ${e.message}`);
    }
  }

  // ==================================================================
  // Download audio files
  // ==================================================================
  const contentList = apiResults.admin_content?.body;
  if (!Array.isArray(contentList)) {
    log('❌ admin_content is not an array — cannot download audio. Body:', JSON.stringify(contentList).slice(0, 200));
    await context.close();
    return;
  }

  log(`\n=== Downloading audio for ${contentList.length} sessions ===`);
  const manifest = [];
  for (const item of contentList) {
    const entry = {
      id: item.id,
      title: item.title,
      category: item.category,
      content_body: item.content_body,
      duration_minutes: item.duration_minutes,
      is_preview: item.is_preview,
      audio_downloaded: false,
      audio_file: null,
      audio_size: null,
    };

    if (typeof item.content_body === 'string' && item.content_body.startsWith('audio/')) {
      const safeTitle = item.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const ext = path.extname(item.content_body) || '.mp3';
      const outName = `${String(item.id).padStart(3, '0')}_${safeTitle}${ext}`;
      const outPath = path.join(AUDIO_DIR, outName);
      const dl = await downloadAudio(page, item.content_body, outPath);
      if (dl.ok) {
        entry.audio_downloaded = true;
        entry.audio_file = outName;
        entry.audio_size = dl.size;
        log(`  ✅ ${outName} (${(dl.size/1024/1024).toFixed(2)} MB)`);
      } else {
        log(`  ❌ ${item.title} — status ${dl.status}`);
      }
    } else {
      log(`  ⏭️  ${item.title} — no audio (content_body: ${JSON.stringify(item.content_body)?.slice(0,60)})`);
    }
    manifest.push(entry);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'audio_manifest.json'), JSON.stringify(manifest, null, 2));
  log(`\n📄 Manifest saved: data/raw/audio_manifest.json`);

  const downloaded = manifest.filter(m => m.audio_downloaded).length;
  const skipped = manifest.length - downloaded;
  log(`\n=== SUMMARY ===`);
  log(`  Total sessions: ${manifest.length}`);
  log(`  Audio downloaded: ${downloaded}`);
  log(`  No audio: ${skipped}`);

  log('\nClosing browser in 3s...');
  await page.waitForTimeout(3000);
  await context.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

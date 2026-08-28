const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SESSION_DIR = path.join(__dirname, 'browser-session');
const SS_CATS = path.join(ROOT, 'reference/screenshots/categories');
const SS_FEATS = path.join(ROOT, 'reference/screenshots/features');
const DATA_DIR = path.join(ROOT, 'data/raw');
const JS_BUNDLE_PATH = path.join(ROOT, 'reference/glide_admin/app_bundle.js');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'https://p7d350073-spiritual-healing--gstsaver.glideos.app';

[SS_CATS, SS_FEATS, DATA_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function snap(page, dir, name) {
  const p = path.join(dir, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  log(`  📸 ${name}.png`);
}

async function grabText(page) {
  return await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });
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

  // Establish session
  await page.goto(APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // ==================================================================
  // Save the JS bundle for source-code archaeology
  // ==================================================================
  log('Saving JS bundle...');
  const html = await page.content();
  const scriptMatches = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m => m[1]);
  log(`  Found ${scriptMatches.length} script tags`);
  // Also save the inline scripts (Glide often inlines big bundle)
  const inlineJs = await page.$$eval('script', els =>
    els.filter(s => !s.src && s.textContent.length > 10000).map(s => s.textContent)
  );
  log(`  Inline scripts >10kb: ${inlineJs.length}`);
  if (inlineJs.length > 0) {
    fs.writeFileSync(JS_BUNDLE_PATH, inlineJs.join('\n\n// ============ NEXT SCRIPT ============\n\n'));
    log(`  💾 JS bundle → ${JS_BUNDLE_PATH} (${(fs.statSync(JS_BUNDLE_PATH).size/1024).toFixed(1)}kb)`);
  }

  // ==================================================================
  // Visit each of the 8 category pages + extract text + screenshot
  // ==================================================================
  const routes = [
    { path: '/library?category=meditation', name: 'meditations_library', snapDir: SS_CATS },
    { path: '/shadow-work', name: 'shadow_work_journey', snapDir: SS_CATS },
    { path: '/chakra-healing', name: 'chakra_healing', snapDir: SS_CATS },
    { path: '/reiki', name: 'reiki_journey', snapDir: SS_CATS },
    { path: '/manifestation', name: 'manifestation_form', snapDir: SS_CATS },
    { path: '/affirmations', name: 'affirmations', snapDir: SS_CATS },
    { path: '/breathing', name: 'breathing', snapDir: SS_CATS },
    { path: '/spiritual-awakening', name: 'spiritual_awakening', snapDir: SS_CATS },
    { path: '/booking', name: 'booking', snapDir: SS_FEATS },
    // player: use first free preview session id (15 = Anxiety Release)
    { path: '/content/15', name: 'player_anxiety_release', snapDir: SS_FEATS },
    { path: '/session/15', name: 'session_15_alt', snapDir: SS_FEATS },
    { path: '/content/32', name: 'reiki_intro_detail', snapDir: SS_FEATS },
    { path: '/content/31', name: 'shadow_work_meditation_detail', snapDir: SS_FEATS },
  ];

  const textDump = {};
  for (const r of routes) {
    try {
      log(`Visiting ${r.path}`);
      const resp = await page.goto(APP + r.path, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const finalUrl = page.url();
      const status = resp?.status();
      log(`  → ${finalUrl} (status ${status})`);
      await snap(page, r.snapDir, r.name);
      const text = await grabText(page);
      textDump[r.name] = { path: r.path, finalUrl, status, textLength: text.length, text };
      log(`  📝 text ${text.length}c`);
    } catch (e) {
      log(`  ❌ ${r.name}: ${e.message}`);
      textDump[r.name] = { path: r.path, error: e.message };
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'page_texts.json'), JSON.stringify(textDump, null, 2));
  log(`\n💾 All page texts saved → data/raw/page_texts.json`);

  log('\nClosing browser in 3s...');
  await page.waitForTimeout(3000);
  await context.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

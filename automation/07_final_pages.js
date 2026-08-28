const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SESSION_DIR = path.join(__dirname, 'browser-session');
const SS_CATS = path.join(ROOT, 'reference/screenshots/categories');
const SS_FEATS = path.join(ROOT, 'reference/screenshots/features');
const DATA_DIR = path.join(ROOT, 'data/raw');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'https://p7d350073-spiritual-healing--gstsaver.glideos.app';

[SS_CATS, SS_FEATS, DATA_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function snap(page, dir, name) {
  const p = path.join(dir, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  log(`  📸 ${name}.png`);
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

  await page.goto(APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Corrected routes based on JS bundle CATEGORY_META
  const routes = [
    { path: '/library/meditation', name: 'library_meditation', dir: SS_CATS },
    { path: '/library/shadow_work', name: 'library_shadow_work', dir: SS_CATS },
    { path: '/library/reiki', name: 'library_reiki', dir: SS_CATS },
    { path: '/chakras', name: 'chakras', dir: SS_CATS },
    { path: '/manifestation', name: 'manifestation_form_full', dir: SS_CATS },
    { path: '/affirmations', name: 'affirmations_full', dir: SS_CATS },
    { path: '/breathing', name: 'breathing_full', dir: SS_CATS },
    { path: '/spiritual-awakening', name: 'spiritual_awakening_full', dir: SS_CATS },
    { path: '/booking', name: 'booking_full', dir: SS_FEATS },
    { path: '/content/15', name: 'player_free_anxiety', dir: SS_FEATS },
    { path: '/content/26', name: 'player_free_anxiety_short', dir: SS_FEATS },
    { path: '/content/32', name: 'reiki_intro_page', dir: SS_FEATS },
    { path: '/content/31', name: 'shadow_work_meditation_page', dir: SS_FEATS },
  ];

  const textDump = {};
  for (const r of routes) {
    try {
      log(`Visiting ${r.path}`);
      const resp = await page.goto(APP + r.path, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);  // extra wait for React render
      await snap(page, r.dir, r.name);
      const text = await page.evaluate(() => (document.querySelector('main') || document.body).innerText);
      textDump[r.name] = {
        path: r.path,
        finalUrl: page.url(),
        status: resp?.status(),
        text
      };
      log(`  → text ${text.length}c`);
    } catch (e) {
      log(`  ❌ ${r.name}: ${e.message}`);
      textDump[r.name] = { path: r.path, error: e.message };
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'page_texts_v2.json'), JSON.stringify(textDump, null, 2));
  log(`\n💾 data/raw/page_texts_v2.json`);

  // ==================================================================
  // Also test: /profile (subscribe cards), Home Booking button target
  // ==================================================================
  log('\nVisiting /profile for subscribe cards ...');
  await page.goto(APP + '/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await snap(page, SS_FEATS, 'profile_subscribe');

  log('\nDone. Closing in 3s.');
  await page.waitForTimeout(3000);
  await context.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

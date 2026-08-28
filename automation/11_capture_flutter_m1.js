// Capture Flutter M1 screenshots via Playwright (Chromium visits local server).
// Assumes server running at http://localhost:8765
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', 'reference/screenshots/flutter_m1');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:8765';

fs.mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function snap(page, name) {
  const p = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  log(`  📸 ${name}.png`);
}

(async () => {
  // NEW session dir (fresh) so Flutter web can init cleanly without Glide cookies
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const routes = [
    { name: '01_splash',              path: '/#/splash',                wait: 500  },
    { name: '02_home',                path: '/#/',                      wait: 1500 },
    { name: '03_library',             path: '/#/library',               wait: 1000 },
    { name: '04_profile',             path: '/#/profile',               wait: 1000 },
    { name: '05_chakras',             path: '/#/chakras',               wait: 1000 },
    { name: '06_affirmations',        path: '/#/affirmations',          wait: 1000 },
    { name: '07_breathing',           path: '/#/breathing',             wait: 1000 },
    { name: '08_manifestation',       path: '/#/manifestation',         wait: 1000 },
    { name: '09_spiritual_awakening', path: '/#/spiritual-awakening',   wait: 1000 },
    { name: '10_booking',             path: '/#/booking',               wait: 1000 },
    { name: '11_sign_in',             path: '/#/sign-in',               wait: 1000 },
  ];

  for (const r of routes) {
    try {
      log(`→ ${APP}${r.path}`);
      await page.goto(APP + r.path, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(r.wait);
      await snap(page, r.name);
    } catch (e) {
      log(`  ❌ ${r.name}: ${e.message}`);
    }
  }

  log('Done. Closing browser in 3s...');
  await page.waitForTimeout(3000);
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

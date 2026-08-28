// Capture Flutter M1 screenshots at iPhone 14 Pro viewport (390x844).
const { chromium, devices } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', 'reference/screenshots/flutter_m1_mobile');
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
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  // iPhone 14 Pro viewport (Playwright's iPhone 14 preset would use webkit user agent — we stay chromium)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  const routes = [
    { name: '01_splash',              path: '/#/splash',                wait: 400  },
    { name: '02_home',                path: '/#/',                      wait: 1500 },
    { name: '03_library',             path: '/#/library',               wait: 1200 },
    { name: '04_library_reiki',       path: '/#/library/reiki',         wait: 1200 },
    { name: '05_profile',             path: '/#/profile',               wait: 1200 },
    { name: '06_chakras',             path: '/#/chakras',               wait: 1200 },
    { name: '07_affirmations',        path: '/#/affirmations',          wait: 1200 },
    { name: '08_breathing',           path: '/#/breathing',             wait: 1200 },
    { name: '09_manifestation',       path: '/#/manifestation',         wait: 1200 },
    { name: '10_spiritual_awakening', path: '/#/spiritual-awakening',   wait: 1200 },
    { name: '11_booking',             path: '/#/booking',               wait: 1200 },
    { name: '12_sign_in',             path: '/#/sign-in',               wait: 1200 },
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

  log('Done.');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const SESSION_DIR = path.join(__dirname, 'browser-session');
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'reference', 'screenshots', 'tabs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'https://p7d350073-spiritual-healing--gstsaver.glideos.app';

(async () => {
  console.log('Launching with saved session (should be auto-logged in)...');

  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = context.pages()[0] || await context.newPage();

  console.log(`Navigating to ${APP_URL}`);
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });

  console.log(`URL after navigation: ${page.url()}`);
  console.log(`Title: ${await page.title()}`);

  // Wait a moment for any dynamic content
  await page.waitForTimeout(2000);

  const outPath = path.join(SCREENSHOT_DIR, '00_playwright_test_home.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Screenshot saved: ${outPath}`);

  // Also grab structural info: all top tab links
  const tabs = await page.$$eval('nav a, header a, [role="tab"], [role="link"]',
    els => els.slice(0, 20).map(e => ({ text: e.textContent?.trim(), href: e.getAttribute('href') }))
  ).catch(() => []);
  console.log('\nTop nav elements found:');
  console.log(JSON.stringify(tabs, null, 2));

  console.log('\n---');
  console.log('Waiting 3 seconds then closing browser...');
  await page.waitForTimeout(3000);

  await context.close();
  console.log('Done.');
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

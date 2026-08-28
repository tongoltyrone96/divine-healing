const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const SESSION_DIR = path.join(__dirname, 'browser-session');
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome not found. Please tell me the path to chrome.exe');
}

(async () => {
  const chromePath = findChrome();
  console.log(`Using Chrome: ${chromePath}`);
  console.log(`Session dir: ${SESSION_DIR}`);

  fs.mkdirSync(SESSION_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    executablePath: chromePath,
    headless: false,
    viewport: null,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
      '--no-first-run',
      '--no-default-browser-check'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  console.log('Browser launched. Waiting for you to log in and navigate...');

  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://os.glideapps.dev/');

  console.log('\n============================================');
  console.log('  DO THIS IN THE OPENED BROWSER WINDOW:');
  console.log('  1. Log in with Google (tongoltyrone84@gmail.com)');
  console.log('  2. Wait until you see the Gstsaver dashboard');
  console.log('  3. Come back here and press Ctrl+C to exit');
  console.log('  (Your login will be saved for next runs)');
  console.log('============================================\n');

  await new Promise(() => {});
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

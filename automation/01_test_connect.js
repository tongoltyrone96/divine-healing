const { chromium } = require('playwright-core');

(async () => {
  console.log('Connecting to Chrome CDP on http://127.0.0.1:9222 ...');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  console.log('Connected. Version:', browser.version());

  const contexts = browser.contexts();
  console.log(`Contexts: ${contexts.length}`);

  let tabIndex = 0;
  for (const ctx of contexts) {
    const pages = ctx.pages();
    for (const page of pages) {
      const url = page.url();
      const title = await page.title().catch(() => '(no title)');
      console.log(`  [${tabIndex}] ${title}`);
      console.log(`      ${url}`);
      tabIndex++;
    }
  }

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SESSION_DIR = path.join(__dirname, 'browser-session');
const SS = {
  tabs: path.join(ROOT, 'reference/screenshots/tabs'),
  cats: path.join(ROOT, 'reference/screenshots/categories'),
  feats: path.join(ROOT, 'reference/screenshots/features'),
  admin: path.join(ROOT, 'reference/glide_admin'),
};
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'https://p7d350073-spiritual-healing--gstsaver.glideos.app';

Object.values(SS).forEach(d => fs.mkdirSync(d, { recursive: true }));

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function snap(page, dir, name) {
  const p = path.join(dir, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  log(`  📸 ${name}.png`);
  return p;
}

async function dumpHtml(page, filePath) {
  const html = await page.content();
  fs.writeFileSync(filePath, html);
  log(`  💾 dumped HTML (${(html.length/1024).toFixed(1)}kb)`);
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

  // ============================================================
  // 1. HOME
  // ============================================================
  log('[1] Home');
  await page.goto(APP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, SS.tabs, '01_home');

  // Extract all Explore links to know their href
  const exploreLinks = await page.$$eval('a', els =>
    els.filter(a => a.textContent?.trim().startsWith('Explore'))
       .map(a => {
         const card = a.closest('article, [class*="card"], div');
         const title = card?.querySelector('h1,h2,h3,h4,p,span')?.textContent?.trim();
         return { href: a.getAttribute('href'), title: title?.slice(0, 40) };
       })
  );
  log('  Explore links found:', JSON.stringify(exploreLinks, null, 2));

  // ============================================================
  // 2. 8 CATEGORIES via Explore links
  // ============================================================
  log('[2] Categories via Explore');
  for (const link of exploreLinks) {
    if (!link.href) continue;
    const slug = (link.title || link.href).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
    try {
      await page.goto(APP + link.href, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      await snap(page, SS.cats, slug);
    } catch (e) {
      log(`  ❌ ${slug}: ${e.message}`);
    }
  }

  // ============================================================
  // 3. LIBRARY
  // ============================================================
  log('[3] Library');
  await page.goto(APP + '/library', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, SS.tabs, '02_library');
  // Scroll to bottom to capture full list
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await snap(page, SS.tabs, '02_library_scrolled');

  // ============================================================
  // 4. PROFILE
  // ============================================================
  log('[4] Profile');
  await page.goto(APP + '/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, SS.tabs, '03_profile');

  // ============================================================
  // 5. ADMIN (Content list)
  // ============================================================
  log('[5] Admin Content list');
  await page.goto(APP + '/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await snap(page, SS.tabs, '04_admin_content');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await snap(page, SS.tabs, '04_admin_content_scrolled');

  // ============================================================
  // 6. ADMIN: click first edit pencil, dump structure
  // ============================================================
  log('[6] Admin: opening first session edit');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Find edit pencil buttons — look for SVG icons in rows
  const editButtons = await page.$$('button[aria-label*="Edit" i], button[title*="Edit" i], a[aria-label*="Edit" i]');
  log(`  Found ${editButtons.length} explicit edit buttons`);

  if (editButtons.length === 0) {
    // Fallback: any pencil-like SVG button
    const allButtons = await page.$$('button');
    log(`  Total buttons on page: ${allButtons.length}`);
    // Dump admin HTML for inspection
    await dumpHtml(page, path.join(SS.admin, 'admin_content_list.html'));
  } else {
    // Click first one
    await editButtons[0].click();
    await page.waitForTimeout(2000);
    await snap(page, SS.admin, 'session_edit_first');
    await dumpHtml(page, path.join(SS.admin, 'session_edit_first.html'));
  }

  // ============================================================
  // 7. ADMIN Subscribers tab
  // ============================================================
  log('[7] Admin Subscribers');
  await page.goto(APP + '/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Click Subscribers tab
  const subsBtn = await page.$('text=Subscribers');
  if (subsBtn) {
    await subsBtn.click();
    await page.waitForTimeout(1500);
    await snap(page, SS.tabs, '05_admin_subscribers');
  } else {
    log('  ⚠️  Subscribers tab button not found');
  }

  log('DONE. Closing browser in 3s...');
  await page.waitForTimeout(3000);
  await context.close();
  process.exit(0);
})().catch(err => {
  console.error('ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Convert app-icon SVGs into 1024x1024 PNGs so `flutter_launcher_icons` can
// consume them. Uses Playwright's built-in Chromium (no extra deps) and does
// not touch the persistent browser-session profile.

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const LOGO_DIR = path.resolve(__dirname, '..', 'divine_healing', 'assets', 'logo');

const TASKS = [
  { svg: 'app_icon.svg',              png: 'app_icon.png',              size: 1024, transparent: false },
  { svg: 'app_icon_adaptive_fg.svg',  png: 'app_icon_adaptive_fg.png',  size: 1024, transparent: true  },
];

const wrap = (svgMarkup, size, transparent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin: 0; padding: 0; ${transparent ? 'background: transparent;' : ''} }
    body { width: ${size}px; height: ${size}px; }
    svg  { width: ${size}px; height: ${size}px; display: block; }
  </style>
</head>
<body>${svgMarkup}</body>
</html>
`;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });

  for (const t of TASKS) {
    const svgPath = path.join(LOGO_DIR, t.svg);
    const pngPath = path.join(LOGO_DIR, t.png);
    if (!fs.existsSync(svgPath)) {
      console.error(`missing: ${svgPath}`);
      continue;
    }
    const svgMarkup = fs.readFileSync(svgPath, 'utf-8');
    const page = await context.newPage();
    await page.setContent(wrap(svgMarkup, t.size, t.transparent), { waitUntil: 'load' });
    await page.screenshot({
      path: pngPath,
      clip: { x: 0, y: 0, width: t.size, height: t.size },
      omitBackground: t.transparent,
    });
    await page.close();
    const stat = fs.statSync(pngPath);
    console.log(`wrote ${t.png} (${t.size}x${t.size}, ${(stat.size / 1024).toFixed(1)} KB)`);
  }

  await context.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

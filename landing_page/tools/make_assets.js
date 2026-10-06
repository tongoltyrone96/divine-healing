// Builds the landing page's images from the app's own artwork.
//
//   cd landing_page && npm install --no-save sharp && node tools/make_assets.js
//
// Everything in site/img is generated here, so swapping a screenshot or the
// practitioner photo means replacing a source file and re-running this, not
// editing images by hand. Sources stay where the app keeps them.
//
// Screenshot 03-session is left out on purpose: it is the Reiki page, and
// its intro says balanced energy makes you "less likely to get sick". That
// is a health claim, and this page exists to be the target of paid ads.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, '..', 'site', 'img');
const APP_ICON = path.join(ROOT, 'divine_healing', 'assets', 'logo', 'app_icon.png');
const PLAYFAIR = path.join(ROOT, 'divine_healing', 'assets', 'fonts', 'PlayfairDisplay-Variable.ttf');
const SCREENS = {
  home: path.join(ROOT, 'store', 'ios', '01-home.png'),
  library: path.join(ROOT, 'store', 'ios', '02-library.png'),
  pricing: path.join(ROOT, 'store', 'ios', '04-profile.png'),
};

// The app's background, Blush Mist. The icon's tree sits on exactly this.
const BG = { r: 0xfc, g: 0xf5, b: 0xf8 };

fs.mkdirSync(OUT, { recursive: true });

/// The tree on a transparent background, so it can sit on the page's
/// gradients without a square showing round it. Alpha follows the distance
/// from the icon's flat background, which keeps the anti-aliased edges soft.
async function transparentEmblem() {
  const { data, info } = await sharp(APP_ICON)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.hypot(data[i] - BG.r, data[i + 1] - BG.g, data[i + 2] - BG.b);
    data[i + 3] = Math.max(0, Math.min(255, Math.round((d - 6) * 9)));
  }
  return sharp(data, { raw: info }).png().trim().toBuffer();
}

async function main() {
  const emblem = await transparentEmblem();
  // 80 is the header mark (40px at 2x). The others are shown at up to 280
  // CSS pixels, so 280 and 560 cover 1x and 2x screens. The tree's fine
  // branches are what make these heavy; quality 78 is where they stop
  // visibly softening.
  for (const size of [80, 280, 560]) {
    await sharp(emblem).resize(size, size, { fit: 'contain', background: '#0000' })
      .webp({ quality: 78, alphaQuality: 80, effort: 6 })
      .toFile(path.join(OUT, `emblem-${size}.webp`));
  }

  for (const [name, file] of Object.entries(SCREENS)) {
    for (const width of [360, 720]) {
      await sharp(file).resize({ width })
        .webp({ quality: 82 })
        .toFile(path.join(OUT, `screen-${name}-${width}.webp`));
    }
  }

  // Favicons from the full icon, which has its own background.
  await sharp(APP_ICON).resize(32, 32).png().toFile(path.join(OUT, 'favicon-32.png'));
  await sharp(APP_ICON).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));

  // Google's badge PNG ships with a wide transparent margin, which makes it
  // look smaller than Apple's at the same height. Trimming the margin is not
  // altering the badge.
  // Source: play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png
  // Apple's badge is used as downloaded (developer.apple.com, SVG).
  const trimmed = await sharp(path.join(__dirname, 'src', 'google-play-badge.png')).trim().toBuffer();
  await sharp(trimmed).resize({ height: 120 }).png()
    .toFile(path.join(OUT, 'badge-google-play.png'));

  await shareImage(emblem);
  console.log('assets written to', OUT);
}

/// The link preview for social posts and messages, 1200x630. The Play
/// feature graphic would have done, but it still says Divine Healing.
async function shareImage(emblem) {
  const W = 1200, H = 630;
  const background = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FCF5F8"/>
          <stop offset="1" stop-color="#EBDDEC"/>
        </linearGradient>
        <radialGradient id="r" cx="0.27" cy="0.5" r="0.45">
          <stop offset="0" stop-color="#F5D4D9" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#F5D4D9" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="url(#r)"/>
    </svg>`);

  const text = (markup, width) => sharp({
    text: {
      text: markup,
      font: 'Playfair Display',
      fontfile: PLAYFAIR,
      width,
      dpi: 72,
      rgba: true,
    },
  }).png().toBuffer();

  const title = await text(
    '<span foreground="#5B3A5E" size="44000">Awakening is overwhelming —\nyou don’t have to go\nthrough it alone.</span>', 640);
  const byline = await text(
    '<span foreground="#C48B95" size="22000" letter_spacing="2400">DIVINE AWAKENING</span>\n<span foreground="#8B5A8C" size="26000">by Strawberry Hope</span>', 620);

  // Stacked by measured height rather than fixed offsets, so a change of
  // wording cannot make the two blocks overlap.
  const titleH = (await sharp(title).metadata()).height;
  const bylineH = (await sharp(byline).metadata()).height;
  const gap = 36;
  const top = Math.round((H - (titleH + gap + bylineH)) / 2);

  const tree = await sharp(emblem).resize(400, 400, { fit: 'contain', background: '#0000' }).toBuffer();

  await sharp(background)
    .composite([
      { input: tree, left: 90, top: 115 },
      { input: title, left: 540, top },
      { input: byline, left: 540, top: top + titleH + gap },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, 'og-image.jpg'));
}

main().catch((e) => { console.error(e); process.exit(1); });

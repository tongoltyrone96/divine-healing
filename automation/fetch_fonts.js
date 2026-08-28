// Downloads the brand fonts into the app bundle.
//
// The app used package:google_fonts, which fetches fonts from
// fonts.gstatic.com at runtime. On a real device that failed outright —
// "Unhandled Exception: Failed to load font ... SocketException" — and the
// typography silently fell back to the platform default. For a meditation app
// people will open on a plane or in a basement, that is the wrong trade: the
// client picked Playfair Display and Nunito, and they should render the same
// every time, offline included.
//
// Google now publishes only variable fonts, which suits us: one file per
// family covers every weight, and Flutter selects an exact weight through
// FontVariation rather than rounding to whichever static cut was bundled.
//
// Run:  node automation/fetch_fonts.js

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'divine_healing', 'assets', 'fonts');
const RAW = 'https://raw.githubusercontent.com/google/fonts/main/ofl';

// The bracketed upstream names ([wght], [opsz,wght]) are awkward in asset
// paths and pubspec entries, so they are stored under plainer names.
const FONTS = [
  { family: 'Playfair Display', dir: 'playfairdisplay', remote: 'PlayfairDisplay[wght].ttf', local: 'PlayfairDisplay-Variable.ttf' },
  { family: 'Nunito',           dir: 'nunito',          remote: 'Nunito[wght].ttf',          local: 'Nunito-Variable.ttf' },
  { family: 'Inter',            dir: 'inter',           remote: 'Inter[opsz,wght].ttf',      local: 'Inter-Variable.ttf' },
];

// A TrueType file starts with 0x00010000, and an OpenType one with "OTTO".
// GitHub answers a missing path with an HTML page, which would otherwise be
// written out as a .ttf and fail much later inside the engine.
function looksLikeFont(buf) {
  if (buf.length < 4) return false;
  const tag = buf.readUInt32BE(0);
  return tag === 0x00010000 || buf.subarray(0, 4).toString('latin1') === 'OTTO';
}

async function download(url, dest, { binary = true } = {}) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = Buffer.from(await res.arrayBuffer());
      if (binary && !looksLikeFont(body)) {
        throw new Error(`not a font file (${body.length} bytes)`);
      }
      fs.writeFileSync(dest, body);
      return body.length;
    } catch (err) {
      if (attempt === 6) throw err;
      console.log(`    attempt ${attempt} failed (${err.message}) — retrying`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  for (const font of FONTS) {
    console.log(`${font.family}`);

    const dest = path.join(OUT, font.local);
    const url = `${RAW}/${font.dir}/${encodeURIComponent(font.remote)}`;
    const size = await download(url, dest);
    console.log(`  ${font.local}  ${(size / 1024).toFixed(0)} KB`);

    // These are OFL-licensed, and the licence has to travel with them.
    const licenseDest = path.join(OUT, `OFL-${font.dir}.txt`);
    await download(`${RAW}/${font.dir}/OFL.txt`, licenseDest, { binary: false });
    console.log(`  ${path.basename(licenseDest)}`);
  }

  console.log('\nDeclare these in pubspec.yaml under flutter.fonts, then use');
  console.log('fontFamily + FontVariation in lib/theme.dart — see DHTypography.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

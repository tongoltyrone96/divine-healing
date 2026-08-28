// Parse the extracted JS bundle to pull out hardcoded content data arrays.
// We rely on the arrays being valid JS literals — extract by regex on markers,
// then eval in a sandbox to get clean objects.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BUNDLE = path.join(ROOT, 'reference/glide_admin/app_bundle.js');
const OUT = path.join(ROOT, 'data/content');
fs.mkdirSync(OUT, { recursive: true });

const src = fs.readFileSync(BUNDLE, 'utf8');

function extractArray(varName) {
  // Find `var <name> = [` and capture until the matching `];\n`
  const startPattern = new RegExp(`var\\s+${varName}\\s*=\\s*\\[`);
  const m = src.match(startPattern);
  if (!m) return null;
  const start = m.index + m[0].length - 1; // position of the '['
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        const arrSrc = src.slice(start, i + 1);
        try {
          const ctx = {};
          vm.runInNewContext(`out = ${arrSrc}`, ctx);
          return ctx.out;
        } catch (e) {
          console.error(`  eval error for ${varName}:`, e.message);
          return null;
        }
      }
    }
  }
  return null;
}

const targets = ['AFFIRMATIONS', 'CHAKRAS', 'TECHNIQUES', 'CATEGORY_META'];
for (const t of targets) {
  const data = extractArray(t);
  if (data === null) {
    console.log(`❌ ${t}: not found or eval failed`);
    continue;
  }
  const outPath = path.join(OUT, `${t.toLowerCase()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  const size = Array.isArray(data) ? `array(${data.length})` : `object(${Object.keys(data).length})`;
  console.log(`✅ ${t} → ${outPath} [${size}]`);
}

// Also try CATEGORY_META which is an object not array
function extractObject(varName) {
  const startPattern = new RegExp(`var\\s+${varName}\\s*=\\s*\\{`);
  const m = src.match(startPattern);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        const objSrc = src.slice(start, i + 1);
        try {
          // CATEGORY_META has React.createElement — replace icon values with string placeholders
          const sanitized = objSrc.replace(/\/\* @__PURE__ \*\/ ?React\d*\.createElement\([^)]*\)/g, '"[React icon]"');
          const ctx = {};
          vm.runInNewContext(`out = ${sanitized}`, ctx);
          return ctx.out;
        } catch (e) {
          console.error(`  obj eval error for ${varName}:`, e.message);
          return null;
        }
      }
    }
  }
  return null;
}

const meta = extractObject('CATEGORY_META');
if (meta) {
  const outPath = path.join(OUT, 'category_meta.json');
  fs.writeFileSync(outPath, JSON.stringify(meta, null, 2));
  console.log(`✅ CATEGORY_META → ${outPath} [object(${Object.keys(meta).length})]`);
}

// ==================================================================
// Also grab Shadow Work / Reiki / Manifestation / Spiritual Awakening
// journey content — these are big JSX blobs. Just dump the raw source
// section between the `// virtual:apps/.../pages/X.tsx` comments.
// ==================================================================
const pages = ['ShadowWorkJourney', 'ReikiJourney', 'ManifestationJourney', 'SpiritualAwakening'];
for (const p of pages) {
  const startRe = new RegExp(`// virtual:apps/spiritual-healing/client/pages/${p}\\.tsx`);
  const startM = src.match(startRe);
  if (!startM) { console.log(`❌ ${p}: page marker not found`); continue; }
  // Find next `// virtual:apps/...` marker
  const nextRe = /\/\/ virtual:apps\/spiritual-healing\/client\/(?:pages|components)\//g;
  nextRe.lastIndex = startM.index + startM[0].length;
  const nextM = nextRe.exec(src);
  const endIdx = nextM ? nextM.index : src.length;
  const section = src.slice(startM.index, endIdx);
  const outPath = path.join(OUT, `${p}_source.js`);
  fs.writeFileSync(outPath, section);
  console.log(`✅ ${p} source → ${outPath} (${(section.length/1024).toFixed(1)}kb)`);
}

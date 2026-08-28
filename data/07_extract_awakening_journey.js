// Re-extracts the Spiritual Awakening page from the original Glide bundle.
//
// The first pass (08_parse_bundle.js) only picked up the page's Overview and
// FAQ tabs, plus the intro paragraph. The page actually has three tabs, and
// the first one — "The Journey" — is the bulk of the writing: a run of
// headed long-form sections the client wrote. Those were silently dropped,
// which is what she noticed when she said the Spiritual Awakening info was
// incomplete.
//
// Run:  node data/07_extract_awakening_journey.js
// Writes data/content/spiritual_awakening.json and copies it into the app's
// asset bundle.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'content', 'SpiritualAwakening_source.js');
const OUT = path.join(__dirname, 'content', 'spiritual_awakening.json');
const ASSET = path.join(
  __dirname,
  '..',
  'divine_healing',
  'assets',
  'content',
  'spiritual_awakening.json',
);

const src = fs.readFileSync(SRC, 'utf8');

// Reads one JS string literal (single, double or template) starting at `i`,
// which is what the bundle mixes depending on whether the body contains
// apostrophes. Returns the decoded value and the index just past it.
function readString(i) {
  const quote = src[i];
  if (quote !== '"' && quote !== "'" && quote !== '`') {
    throw new Error(`expected a quote at ${i}, found ${quote}`);
  }
  const escapes = {
    n: '\n',
    t: '\t',
    r: '\r',
    '"': '"',
    "'": "'",
    '`': '`',
    '\\': '\\',
  };
  let out = '';
  i += 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') {
      const next = src[i + 1];
      if (next === 'u') {
        out += String.fromCharCode(parseInt(src.substr(i + 2, 4), 16));
        i += 6;
        continue;
      }
      out += escapes[next] !== undefined ? escapes[next] : '\\' + next;
      i += 2;
      continue;
    }
    if (c === quote) return [out, i + 1];
    out += c;
    i += 1;
  }
  throw new Error('unterminated string literal');
}

// --- the headed sections of "The Journey" ---------------------------------
const blocks = [];
const headingRe = /\{\s*heading:\s*/g;
let m;
while ((m = headingRe.exec(src)) !== null) {
  let i = m.index + m[0].length;
  let heading = null;
  if (src.startsWith('null', i)) {
    i += 4;
  } else {
    [heading, i] = readString(i);
  }
  const bodyMatch = /^\s*,\s*body:\s*/.exec(src.slice(i, i + 40));
  if (!bodyMatch) continue;
  const [body] = readString(i + bodyMatch[0].length);
  blocks.push({ heading, body });
}

if (!blocks.length) {
  console.error('No {heading, body} blocks found — the bundle shape changed.');
  process.exit(1);
}

// The lead block carries no heading; it is the hero paragraph the old
// extraction already had.
const heroBlock = blocks.find((b) => b.heading === null);
const journey = blocks.filter((b) => b.heading !== null);

// --- keep everything the previous extraction got right ---------------------
const previous = JSON.parse(fs.readFileSync(OUT, 'utf8'));

const out = {
  source: previous.source,
  description:
    'Spiritual Awakening page. Three tabs in the original: The Journey ' +
    '(long-form sections), Overview (Benefits + What to Expect), and FAQ. ' +
    'Reflection prompts sit below the tabs.',
  hero_text: heroBlock ? heroBlock.body : previous.hero_text,
  journey,
  benefits: previous.benefits,
  what_to_expect: previous.what_to_expect,
  faqs: previous.faqs,
  reflection_prompts: previous.reflection_prompts,
  note: previous.note,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
fs.copyFileSync(OUT, ASSET);

const chars = journey.reduce((n, b) => n + b.body.length, 0);
console.log(`Recovered ${journey.length} sections of "The Journey":\n`);
for (const b of journey) {
  console.log(`  ${b.heading.padEnd(34)} ${String(b.body.length).padStart(5)} chars`);
}
console.log(`\n${chars} characters of body text that the app was not showing.`);
console.log(`\nWrote ${path.relative(process.cwd(), OUT)}`);
console.log(`Copied to ${path.relative(process.cwd(), ASSET)}`);

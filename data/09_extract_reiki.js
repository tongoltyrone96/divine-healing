// Extracts the Reiki page from the original Glide bundle.
//
// This page had never been parsed — the coverage audit reported 0/16 passages
// present, meaning the app shipped none of it. The original has four screens
// behind Header components: "What is Reiki?", "What to Expect in a Reiki
// Session", "Benefits of Reiki" and "Common Questions".
//
// Everything here is located by structure rather than by guessing at prose,
// because the sections have genuinely different shapes: paragraphs, a labelled
// bullet list, a plain array, and a FAQ of { q, a } pairs.
//
// Run:  node data/09_extract_reiki.js
// Writes data/content/reiki.json and copies it into the app's asset bundle.

const fs = require('fs');
const path = require('path');
const { stringLiterals, isProse } = require('./lib/prose');

const SRC = path.join(__dirname, 'content', 'ReikiJourney_source.js');
const OUT = path.join(__dirname, 'content', 'reiki.json');
const ASSET = path.join(
  __dirname,
  '..',
  'divine_healing',
  'assets',
  'content',
  'reiki.json',
);

const src = fs.readFileSync(SRC, 'utf8');
const literals = stringLiterals(src);

/// Prose literals between two offsets, in source order.
function proseBetween(start, end) {
  return literals
    .filter((l) => l.start > start && (end === undefined || l.start < end))
    .map((l) => l.value)
    .filter(isProse);
}

// --- section headers -------------------------------------------------------
const headers = [];
const headerRe = /Header,\s*\{\s*title:\s*"([^"]+)"/g;
let m;
while ((m = headerRe.exec(src)) !== null) {
  headers.push({ title: m[1], start: m.index });
}
if (headers.length !== 4) {
  console.error(`Expected 4 Header sections, found ${headers.length}.`);
  process.exit(1);
}
const [whatIs, whatToExpect, benefitsHdr, faqHdr] = headers;

// --- FAQ, defined as a FAQS array of { q, a } ------------------------------
const faqs = [];
const faqRe = /\{\s*q:\s*/g;
while ((m = faqRe.exec(src)) !== null) {
  let i = m.index + m[0].length;
  const q = literals.find((l) => l.start === i);
  if (!q) continue;
  const rest = src.slice(i);
  const gap = /^(?:"(?:[^"\\]|\\.)*")\s*,\s*a:\s*/.exec(rest);
  if (!gap) continue;
  const a = literals.find((l) => l.start === i + gap[0].length);
  if (!a) continue;
  faqs.push({ q: q.value, a: a.value });
}

// --- "Most people experience:" bullets -------------------------------------
// Rendered as <Bullet2 text="..."> elements rather than an array.
const bullets = [];
const bulletRe = /Bullet2?,\s*\{\s*text:\s*/g;
while ((m = bulletRe.exec(src)) !== null) {
  const lit = literals.find((l) => l.start === m.index + m[0].length);
  if (lit) bullets.push({ value: lit.value, start: lit.start });
}
const expectBullets = bullets
  .filter((b) => b.start > whatToExpect.start && b.start < benefitsHdr.start)
  .map((b) => b.value);

// --- Benefits, a plain array the list maps over ----------------------------
// Bounded by the .map call rather than the next header, so the following
// section's title cannot leak in as an eleventh benefit.
const benefitsMap = src.indexOf('.map(', benefitsHdr.start);
const benefits = proseBetween(benefitsHdr.start, benefitsMap).filter(
  (v) => v !== benefitsHdr.title,
);

// --- paragraphs ------------------------------------------------------------
// Long enough to be a paragraph rather than a bullet or a nav label.
const bulletValues = new Set(expectBullets);
const paragraphs = (start, end, skip = []) =>
  proseBetween(start, end).filter(
    (v) =>
      v.trim().split(/\s+/).length >= 8 &&
      !bulletValues.has(v) &&
      !skip.includes(v) &&
      !faqs.some((f) => f.q === v || f.a === v),
  );

const out = {
  source: 'apps/spiritual-healing/client/pages/ReikiJourney.tsx',
  description:
    'Reiki page. Four screens in the original: What is Reiki?, What to ' +
    'Expect in a Reiki Session, Benefits of Reiki, and Common Questions.',
  what_is_reiki: {
    title: whatIs.title,
    paragraphs: paragraphs(whatIs.start, whatToExpect.start, [whatIs.title]),
  },
  what_to_expect: {
    title: whatToExpect.title,
    paragraphs: paragraphs(whatToExpect.start, benefitsHdr.start, [
      whatToExpect.title,
    ]),
    experience_label: 'Most people experience:',
    experiences: expectBullets,
  },
  benefits: { title: benefitsHdr.title, items: benefits },
  faqs: { title: faqHdr.title, items: faqs },
};

// The client's own words are the deliverable here, so fail loudly rather than
// quietly writing a thin file that looks fine.
const problems = [];
if (out.what_is_reiki.paragraphs.length < 3) problems.push('what_is_reiki');
if (out.what_to_expect.paragraphs.length < 2) problems.push('what_to_expect');
if (out.what_to_expect.experiences.length < 4) problems.push('experiences');
if (out.benefits.items.length < 8) problems.push('benefits');
if (out.faqs.items.length < 6) problems.push('faqs');
if (problems.length) {
  console.error(`Extraction looks incomplete: ${problems.join(', ')}`);
  console.error(JSON.stringify(out, null, 2));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
fs.copyFileSync(OUT, ASSET);

console.log('Recovered the Reiki page:\n');
console.log(`  ${out.what_is_reiki.title.padEnd(36)} ${out.what_is_reiki.paragraphs.length} paragraphs`);
console.log(
  `  ${out.what_to_expect.title.padEnd(36)} ${out.what_to_expect.paragraphs.length} paragraphs + ${out.what_to_expect.experiences.length} bullets`,
);
console.log(`  ${out.benefits.title.padEnd(36)} ${out.benefits.items.length} items`);
console.log(`  ${out.faqs.title.padEnd(36)} ${out.faqs.items.length} questions`);
console.log(`\nWrote ${path.relative(process.cwd(), OUT)}`);
console.log(`Copied to ${path.relative(process.cwd(), ASSET)}`);

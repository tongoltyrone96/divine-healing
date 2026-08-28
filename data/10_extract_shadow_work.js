// Extracts the Shadow Work "Explanation" step from the original Glide bundle.
//
// This step was hand-transcribed into the Dart screen, and transcription did
// what transcription does: whole sections went missing ("How Childhood
// Experiences Create Adult Patterns", "A Simple Example", the closing "The
// goal is not perfection…"), and the sections that survived were quietly
// reworded and trimmed — one paragraph lost its final sentence, another was
// condensed into half its length.
//
// The client's own words are the product here, so the screen should render
// them from data rather than from someone's summary of them.
//
// Run:  node data/10_extract_shadow_work.js
// Writes data/content/shadow_work_explanation.json and copies it into the
// app's asset bundle.

const fs = require('fs');
const path = require('path');
const { stringLiterals, isProse } = require('./lib/prose');

const SRC = path.join(__dirname, 'content', 'ShadowWorkJourney_source.js');
const OUT = path.join(__dirname, 'content', 'shadow_work_explanation.json');
const ASSET = path.join(
  __dirname,
  '..',
  'divine_healing',
  'assets',
  'content',
  'shadow_work_explanation.json',
);

const src = fs.readFileSync(SRC, 'utf8');
const literals = stringLiterals(src);

// UI chrome and browser fallbacks that sit in the same markup as the copy.
const CHROME = new Set([
  'Your browser does not support the audio element.',
  'Audio not yet uploaded for this session.',
  'Could not save — please try again.',
  'Journal your thoughts here...',
  'Back to Library',
]);

// --- bullets ---------------------------------------------------------------
const bullets = [];
const bulletRe = /Bullet2?,\s*\{\s*text:\s*/g;
let m;
while ((m = bulletRe.exec(src)) !== null) {
  const lit = literals.find((l) => l.start === m.index + m[0].length);
  if (lit) bullets.push(lit);
}
const bulletStarts = new Set(bullets.map((b) => b.start));

// --- section boundaries ----------------------------------------------------
const sections = [];
const sectionRe = /Section,\s*\{\s*title:\s*"((?:[^"\\]|\\.)*)"/g;
while ((m = sectionRe.exec(src)) !== null) {
  sections.push({ title: JSON.parse(`"${m[1]}"`), start: m.index });
}
if (!sections.length) {
  console.error('No Section components found — the bundle shape changed.');
  process.exit(1);
}

// The explanation step runs from the first paragraph up to the last section.
// Anything before the first Section but after the step's own heading is the
// intro.
// Anchored on the literal itself, not on indexOf over the raw source: the
// latter points at the text, which sits one character past the opening quote,
// and the opening paragraph then falls outside every range built from it.
const firstParagraph = literals.find((l) =>
  l.value.startsWith('Shadow work is the gentle practice'),
);
if (!firstParagraph) {
  console.error('Could not find the start of the explanation step.');
  process.exit(1);
}
const explanationStart = firstParagraph.start;

/// Ordered blocks between two offsets: paragraphs and bullet runs, in the
/// order a reader meets them, because a bullet list here sits between two
/// paragraphs and reads wrong if it is moved.
function blocksBetween(start, end, skipTitles) {
  const items = literals
    .filter((l) => l.start >= start && (end === undefined || l.start < end))
    .filter((l) => isProse(l.value))
    .filter((l) => !CHROME.has(l.value.trim()))
    .filter((l) => !skipTitles.has(l.value));

  const blocks = [];
  for (const item of items) {
    const isBullet = bulletStarts.has(item.start);
    const value = item.value.trim();
    // Nav labels are short and imperative; real copy in this step is a
    // sentence. Bullets are exempt — several are legitimately short.
    if (!isBullet && value.split(/\s+/).length < 5) continue;

    const last = blocks[blocks.length - 1];
    if (isBullet) {
      if (last && last.type === 'bullets') last.items.push(value);
      else blocks.push({ type: 'bullets', items: [value] });
    } else {
      blocks.push({ type: 'paragraph', text: value });
    }
  }
  return blocks;
}

const titles = new Set(sections.map((s) => s.title));

const intro = blocksBetween(explanationStart, sections[0].start, titles)
  .filter((b) => b.type === 'paragraph')
  .map((b) => b.text);

const parsed = sections.map((s, i) => ({
  title: s.title,
  blocks: blocksBetween(
    s.start,
    i + 1 < sections.length ? sections[i + 1].start : undefined,
    titles,
  ),
}));

// The trailing section runs to end-of-file, which sweeps in the meditation and
// reflection steps. Cut it at the first block that belongs to another step.
const STEP_BOUNDARY = /^(Listen to the guided meditation|Take your time|Use these prompts)/;
const last = parsed[parsed.length - 1];
const cut = last.blocks.findIndex(
  (b) => b.type === 'paragraph' && STEP_BOUNDARY.test(b.text),
);
if (cut >= 0) last.blocks = last.blocks.slice(0, cut);

const out = {
  source: 'apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx',
  description:
    'The Explanation step of the Shadow Work journey — the same copy for ' +
    'every shadow work session, shown before the meditation and the ' +
    'reflection prompts.',
  intro,
  sections: parsed,
};

const sectionCount = out.sections.length;
const blockCount = out.sections.reduce((n, s) => n + s.blocks.length, 0);
if (sectionCount < 4 || blockCount < 8 || !intro.length) {
  console.error(
    `Extraction looks thin: ${intro.length} intro paragraphs, ` +
      `${sectionCount} sections, ${blockCount} blocks.`,
  );
  console.error(JSON.stringify(out, null, 2));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
fs.copyFileSync(OUT, ASSET);

console.log(`Intro: ${intro.length} paragraph(s)\n`);
for (const s of out.sections) {
  const paras = s.blocks.filter((b) => b.type === 'paragraph').length;
  const bulletItems = s.blocks
    .filter((b) => b.type === 'bullets')
    .reduce((n, b) => n + b.items.length, 0);
  console.log(
    `  ${s.title.padEnd(48)} ${paras} paragraph(s)` +
      (bulletItems ? `, ${bulletItems} bullet(s)` : ''),
  );
}
console.log(`\nWrote ${path.relative(process.cwd(), OUT)}`);
console.log(`Copied to ${path.relative(process.cwd(), ASSET)}`);

// Extracts the Manifestation journey's written screens from the Glide bundle.
//
// Same story as Shadow Work: the copy had been typed into the Dart screen by
// hand and lost material in the process. The audit put it at 10/18. A whole
// 641-character paragraph — the example about how the environment you grow up
// in shapes what you believe is possible — was gone, both Inner Work
// paragraphs were absent, and the paragraphs that did survive had clauses
// trimmed off ("...because those aren't the cards they were dealt").
//
// Run:  node data/11_extract_manifestation.js
// Writes data/content/manifestation_journey.json and copies it into the app's
// asset bundle. The 5-field form itself stays in manifestation_form.json.

const fs = require('fs');
const path = require('path');
const { stringLiterals, isProse } = require('./lib/prose');

const SRC = path.join(__dirname, 'content', 'ManifestationJourney_source.js');
const OUT = path.join(__dirname, 'content', 'manifestation_journey.json');
const ASSET = path.join(
  __dirname,
  '..',
  'divine_healing',
  'assets',
  'content',
  'manifestation_journey.json',
);

const src = fs.readFileSync(SRC, 'utf8');
const literals = stringLiterals(src);

// Buttons and field chrome that share the markup with the copy.
const CHROME = [
  'Continue to Inner Work',
  'Start the Exercise',
  'Save My Exercise',
  'Back to Library',
  'Could not save',
  'Type your answer',
  'Your exercise has been saved',
];

// --- screen headers --------------------------------------------------------
const screens = [];
const headerRe =
  /Header2,\s*\{\s*title:\s*"((?:[^"\\]|\\.)*)",\s*description:\s*"((?:[^"\\]|\\.)*)"/g;
let m;
while ((m = headerRe.exec(src)) !== null) {
  screens.push({
    title: JSON.parse(`"${m[1]}"`),
    description: JSON.parse(`"${m[2]}"`),
    start: m.index,
  });
}
if (screens.length < 2) {
  console.error(`Expected at least 2 Header2 screens, found ${screens.length}.`);
  process.exit(1);
}

// The exercise screen's questions live in a QUESTIONS array already captured
// by manifestation_form.json; stop before it so they are not duplicated here.
const questionsArray = src.indexOf('QUESTIONS');

/// Paragraphs between two offsets. Quoted lines in this page ("What version of
/// me has achieved these things?") are short but are the client's words and
/// carry the point of the section, so they are kept and flagged rather than
/// filtered out by length.
function paragraphsBetween(start, end, skip) {
  return literals
    .filter((l) => l.start > start && (end === undefined || l.start < end))
    .map((l) => l.value.trim())
    .filter(isProse)
    .filter((v) => !skip.includes(v))
    .filter((v) => !CHROME.some((c) => v.startsWith(c)))
    .filter((v) => v.split(/\s+/).length >= 6)
    .map((text) => ({
      text,
      // The original renders these as pull-quotes rather than body copy.
      quote: text.startsWith('"') && text.endsWith('"'),
    }));
}

const parsed = screens.map((s, i) => {
  let end = i + 1 < screens.length ? screens[i + 1].start : undefined;
  if (questionsArray > s.start && (end === undefined || questionsArray < end)) {
    end = questionsArray;
  }
  return {
    title: s.title,
    description: s.description,
    paragraphs: paragraphsBetween(s.start, end, [s.title, s.description]),
  };
});

const out = {
  source: 'apps/spiritual-healing/client/pages/ManifestationJourney.tsx',
  description:
    'The written screens of the Manifestation journey, shown before the ' +
    '5-field exercise (which lives in manifestation_form.json).',
  screens: parsed,
};

const total = parsed.reduce((n, s) => n + s.paragraphs.length, 0);
const thin = parsed.filter((s) => s.paragraphs.length === 0).map((s) => s.title);
if (total < 6 || thin.length) {
  console.error(
    `Extraction looks thin: ${total} paragraphs` +
      (thin.length ? `, empty screens: ${thin.join(', ')}` : ''),
  );
  console.error(JSON.stringify(out, null, 2));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
fs.copyFileSync(OUT, ASSET);

for (const s of parsed) {
  const quotes = s.paragraphs.filter((p) => p.quote).length;
  console.log(
    `  ${s.title.padEnd(28)} ${s.paragraphs.length} paragraph(s)` +
      (quotes ? `, ${quotes} pull-quote(s)` : ''),
  );
}
console.log(`\nWrote ${path.relative(process.cwd(), OUT)}`);
console.log(`Copied to ${path.relative(process.cwd(), ASSET)}`);

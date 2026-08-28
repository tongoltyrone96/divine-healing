// Answers "is everything there?" by comparing the original Glide page sources
// against what the Flutter app actually ships.
//
// The client spotted that Spiritual Awakening was missing text. Rather than
// eyeball the rest, this walks every extracted *_source.js, pulls out the
// prose, and reports each passage that appears nowhere in the app — neither
// in the Dart screens nor in the bundled JSON assets.
//
// Run:  node data/08_audit_content_coverage.js
//
// Exit code 0 = every passage is accounted for, 1 = something is missing.

const fs = require('fs');
const path = require('path');
const { stringLiterals, isProse } = require('./lib/prose');

const CONTENT_DIR = path.join(__dirname, 'content');
const APP = path.join(__dirname, '..', 'divine_healing');
const SEARCH_ROOTS = [
  path.join(APP, 'lib'),
  path.join(APP, 'assets', 'content'),
];

// Length and word-count floors keep headings and labels out of the report;
// telling prose from Tailwind class lists is lib/prose.js's job, and it is
// shared with the extractors so the two cannot disagree about what counts.
const MIN_CHARS = 45;
const MIN_WORDS = 7;

const normalize = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

function collectAppText() {
  const chunks = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(dart|json)$/.test(entry.name)) {
        chunks.push(fs.readFileSync(full, 'utf8'));
      }
    }
  };
  SEARCH_ROOTS.forEach(walk);
  // Dart wraps long strings across lines and JSON escapes newlines; collapsing
  // whitespace makes both comparable to the source.
  return normalize(chunks.join(' '));
}

const appText = collectAppText();

// A passage may be split across adjacent Dart string literals, so match on a
// distinctive run of words rather than the whole passage.
function isPresent(passage) {
  const norm = normalize(passage);
  if (appText.includes(norm)) return true;
  const words = norm.split(' ');
  const probe = words.slice(0, 8).join(' ');
  return appText.includes(probe);
}

const sources = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('_source.js'))
  .sort();

let missingTotal = 0;
let missingChars = 0;

for (const file of sources) {
  const page = file.replace('_source.js', '');
  const literals = stringLiterals(
    fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'),
  ).map((l) => l.value);

  const passages = [...new Set(literals)].filter(
    (s) =>
      s.length >= MIN_CHARS &&
      s.trim().split(/\s+/).length >= MIN_WORDS &&
      isProse(s),
  );

  const missing = passages.filter((p) => !isPresent(p));
  const covered = passages.length - missing.length;

  console.log(
    `\n${page}  —  ${covered}/${passages.length} passages present in the app`,
  );

  if (!missing.length) {
    console.log('  complete');
    continue;
  }

  for (const m of missing) {
    missingTotal += 1;
    missingChars += m.length;
    const preview = m.replace(/\s+/g, ' ').trim();
    console.log(
      `  MISSING (${String(m.length).padStart(5)} chars)  ${preview.slice(0, 100)}${preview.length > 100 ? '…' : ''}`,
    );
  }
}

console.log(
  `\n${missingTotal ? `${missingTotal} passage(s) missing, ${missingChars} characters of the client's copy` : 'Every passage is accounted for.'}\n`,
);
process.exit(missingTotal ? 1 : 0);

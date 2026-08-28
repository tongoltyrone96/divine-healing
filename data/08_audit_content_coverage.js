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

const CONTENT_DIR = path.join(__dirname, 'content');
const APP = path.join(__dirname, '..', 'divine_healing');
const SEARCH_ROOTS = [
  path.join(APP, 'lib'),
  path.join(APP, 'assets', 'content'),
];

// Prose, not markup. A length floor is not enough on its own: the bundle is
// full of long Tailwind class lists that read as many "words". Those never
// contain sentence punctuation and always lead with utility-class tokens, so
// that pair separates them reliably.
const MIN_CHARS = 45;
const MIN_WORDS = 7;

const CSS_TOKEN = /(^|\s)(flex|grid|block|inline|hidden|absolute|relative|w-|h-|size-|min-|max-|p[xytblr]?-|m[xytblr]?-|gap-|space-|rounded|border|bg-|text-[a-z]|font-|leading-|tracking-|shadow|ring-|opacity-|transition|duration-|animate-|overflow-|items-|justify-|self-|col-|row-|z-|cursor-|placeholder:|md:|sm:|lg:)/;

function isMarkup(s) {
  // Template interpolation only ever appears in className expressions here.
  if (s.includes('${')) return true;
  if (!CSS_TOKEN.test(s)) return false;
  // A class list can still contain a dot ("mt-0.5"), so require punctuation
  // that actually terminates a word before calling it prose.
  return !/[a-z][.?!](\s|$)/.test(s);
}

function readStringLiterals(src) {
  const out = [];
  const escapes = { n: '\n', t: '\t', r: '\r', '"': '"', "'": "'", '`': '`', '\\': '\\' };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c !== '"' && c !== "'" && c !== '`') {
      i += 1;
      continue;
    }
    const quote = c;
    let value = '';
    let j = i + 1;
    let closed = false;
    while (j < src.length) {
      const ch = src[j];
      if (ch === '\\') {
        const next = src[j + 1];
        if (next === 'u') {
          value += String.fromCharCode(parseInt(src.substr(j + 2, 4), 16));
          j += 6;
          continue;
        }
        value += escapes[next] !== undefined ? escapes[next] : next;
        j += 2;
        continue;
      }
      if (ch === quote) {
        closed = true;
        break;
      }
      value += ch;
      j += 1;
    }
    if (!closed) {
      i += 1;
      continue;
    }
    out.push(value);
    i = j + 1;
  }
  return out;
}

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
  const literals = readStringLiterals(
    fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'),
  );

  const passages = [...new Set(literals)].filter(
    (s) =>
      s.length >= MIN_CHARS &&
      s.trim().split(/\s+/).length >= MIN_WORDS &&
      !isMarkup(s),
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

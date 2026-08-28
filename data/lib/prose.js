// Shared helpers for pulling the client's copy out of the Glide JS bundle.
//
// Both the coverage audit and the per-page extractors need the same two
// things: every string literal in a chunk of bundled JS, and a way to tell
// the client's prose apart from React props, Tailwind class lists and the
// bundler's source annotations. Keeping them here stops the two from drifting.

const ESCAPES = {
  n: '\n',
  t: '\t',
  r: '\r',
  '"': '"',
  "'": "'",
  '`': '`',
  '\\': '\\',
};

/// Every string literal in `text`, in source order, as { value, start }.
/// Handles single, double and template quoting, since the bundle mixes all
/// three depending on what the copy itself contains.
function stringLiterals(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const quote = text[i];
    if (quote !== '"' && quote !== "'" && quote !== '`') {
      i += 1;
      continue;
    }
    let value = '';
    let j = i + 1;
    let closed = false;
    while (j < text.length) {
      const ch = text[j];
      if (ch === '\\') {
        const next = text[j + 1];
        if (next === 'u') {
          value += String.fromCharCode(parseInt(text.substr(j + 2, 4), 16));
          j += 6;
          continue;
        }
        value += ESCAPES[next] !== undefined ? ESCAPES[next] : next;
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
    out.push({ value, start: i });
    i = j + 1;
  }
  return out;
}

// Utility-class tokens. The trailing (?![a-z]) matters more than it looks:
// without it, "block" matches inside "blockages" and a real benefit line gets
// thrown away as markup. Hyphenated prefixes cannot collide the same way, but
// they are anchored at the start of a word for the same reason.
const CSS_TOKEN = new RegExp(
  '(^|\\s)(' +
    '(?:flex|grid|block|inline|hidden|absolute|relative|static|sticky|' +
    'truncate|uppercase|lowercase|capitalize|italic|underline)(?![a-z])' +
    '|(?:w|h|size|min|max|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space|' +
    'rounded|border|bg|font|leading|tracking|shadow|ring|opacity|transition|' +
    'duration|delay|ease|overflow|items|justify|self|col|row|z|cursor|grow|' +
    'shrink|basis|order|aspect|object|origin|scale|rotate|translate)-' +
    '|text-[a-z]' +
    '|(?:sm|md|lg|xl|hover|focus|active|disabled|placeholder|group):' +
    ')',
);

/// True when a string is markup rather than something a reader would see.
function isMarkup(value) {
  const t = value.trim();
  // Template interpolation only ever appears in className expressions here.
  if (t.includes('${')) return true;
  // The bundler's data-glide-source annotations.
  if (t.startsWith('apps/')) return true;
  if (!CSS_TOKEN.test(t)) return false;
  // A class list can still contain a dot ("mt-0.5"), so only punctuation that
  // actually terminates a word rescues a string from being called markup.
  return !/[a-z][.?!](\s|$)/.test(t);
}

/// Prose worth comparing or extracting: readable, and not a bare identifier.
function isProse(value) {
  const t = value.trim();
  if (t.length < 3) return false;
  if (/^[a-z][a-z-]*$/.test(t)) return false; // tag names, prop keys
  return !isMarkup(t);
}

module.exports = { stringLiterals, isMarkup, isProse };

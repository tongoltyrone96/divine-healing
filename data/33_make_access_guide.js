// Builds the client's guide to granting free access, as a Word document.
//
//   node data/33_make_access_guide.js "docs/Divine Awakening - Giving someone free access.docx"
//
// She asked to be able to hand out free access herself rather than going
// through us each time, and she already edits content in Supabase, so the
// guide walks through the same Table Editor she knows: one row in
// sh_subscribers, five boxes, save.
//
// A script rather than a hand-made file because the guide will need editing
// — column names, the expiry year — and editing a .docx means unpacking XML.
// Regenerating is cheaper and cannot corrupt the package.
//
// Needs the `docx` npm package, which is in data/package.json.

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, convertInchesToTwip,
} = require('docx');
const fs = require('fs');

const FOREST = '4A6F5A';
const INK = '2E3A32';
const SOFT = '5C6B5F';
const SAGE = 'EDF2EC';
const BLUSH = 'B04A5C';
const EDGE = 'D9D6CC';

const PAGE_W = 12240, PAGE_H = 15840; // US Letter, DXA

const body = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 160, line: 300 },
  indent: opts.indent,
  children: [new TextRun({ text, font: 'Calibri', size: 22, color: opts.color ?? INK, bold: opts.bold })],
});

const mono = (text) => new TextRun({ text, font: 'Consolas', size: 20, color: FOREST, bold: true });

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: 'Georgia', size: 26, bold: true, color: INK })],
  });
}

// A field row: name | value, with an optional note underneath.
function fieldRows() {
  const rows = [
    ['user_email', 'their@email.com', 'All lowercase. This has to be the address they sign in with.'],
    ['subscription_status', 'active', null],
    ['plan_name', 'Annual', null],
    ['current_period_end', '2031-12-31', 'Any date far enough ahead. Access ends on this date.'],
    ['store', 'gift', 'Marks the row as a gift rather than a real payment, so it is easy to find later.'],
  ];

  const cell = (children, width, shading) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading, color: 'auto' } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children,
  });

  const header = new TableRow({
    tableHeader: true,
    children: [
      cell([new Paragraph({ children: [new TextRun({ text: 'Box', font: 'Calibri', size: 18, bold: true, color: FOREST, allCaps: true })] })], 3200, SAGE),
      cell([new Paragraph({ children: [new TextRun({ text: 'What to type', font: 'Calibri', size: 18, bold: true, color: FOREST, allCaps: true })] })], 5800, SAGE),
    ],
  });

  const out = [header];
  for (const [name, value, note] of rows) {
    const right = [new Paragraph({ children: [mono(value)] })];
    if (note) {
      right.push(new Paragraph({
        spacing: { before: 60 },
        children: [new TextRun({ text: note, font: 'Calibri', size: 19, color: SOFT, italics: true })],
      }));
    }
    out.push(new TableRow({
      children: [
        cell([new Paragraph({ children: [new TextRun({ text: name, font: 'Consolas', size: 20, color: SOFT })] })], 3200),
        cell(right, 5800),
      ],
    }));
  }
  return out;
}

function callout(title, paragraphs) {
  return new Table({
    columnWidths: [9000],
    width: { size: 9000, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.SINGLE, size: 18, color: BLUSH },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9000, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'FBF1F3', color: 'auto' },
        margins: { top: 160, bottom: 160, left: 220, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: title, font: 'Calibri', size: 21, bold: true, color: BLUSH })],
          }),
          ...paragraphs.map((t, i) => new Paragraph({
            spacing: { after: i === paragraphs.length - 1 ? 0 : 120, line: 290 },
            children: [new TextRun({ text: t, font: 'Calibri', size: 21, color: INK })],
          })),
        ],
      })],
    })],
  });
}

const doc = new Document({
  creator: 'Tyrone Jher Tongol',
  title: 'Divine Awakening — Giving someone free access',
  description: 'How to grant full library access without a purchase.',
  numbering: {
    config: [
      {
        reference: 'steps',
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } },
        }],
      },
      {
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: 1300, bottom: 1300, left: 1440, right: 1440 },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: 'DIVINE AWAKENING', font: 'Calibri', size: 17, bold: true, color: '7BA68E', characterSpacing: 40 })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: EDGE, space: 12 } },
        children: [new TextRun({ text: 'Giving someone free access', font: 'Georgia', size: 40, bold: true, color: FOREST })],
      }),
      body('Add one row and that person sees the whole library — every session, every exercise — without paying. It works on iPhone, Android and the web, and takes effect the moment they sign in. Nothing to install, nothing for them to redeem.', { color: SOFT, after: 220 }),

      h2('Adding someone'),

      ...[
        'Open supabase.com/dashboard/project/buzdtsupgmytqokgfsbn — the same place you edit the sessions. Go straight to that address rather than hunting for the project by name.',
        'In the left sidebar choose Table Editor, then the table sh_subscribers.',
        'Click Insert, then Insert row.',
        'Fill in the five boxes below. Leave every other box empty — including id, created_at and updated_at, which the database fills in for you.',
      ].map((t) => new Paragraph({
        numbering: { reference: 'steps', level: 0 },
        spacing: { after: 120, line: 300 },
        children: [new TextRun({ text: t, font: 'Calibri', size: 22, color: INK })],
      })),

      new Paragraph({ spacing: { after: 100 }, children: [] }),

      new Table({
        columnWidths: [3200, 5800],
        width: { size: 9000, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
          left: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
          right: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: EDGE },
        },
        rows: fieldRows(),
      }),

      new Paragraph({
        spacing: { before: 140, after: 200 },
        children: [new TextRun({ text: 'Most of these sit under Optional Fields — scroll down in the panel to reach them.', font: 'Calibri', size: 20, color: SOFT, italics: true })],
      }),

      new Paragraph({
        numbering: { reference: 'steps', level: 0 },
        spacing: { after: 200, line: 300 },
        children: [new TextRun({ text: 'Save. That is all — the person now has full access.', font: 'Calibri', size: 22, color: INK })],
      }),

      callout('The address has to match', [
        'Access is matched on the email address, so it only works if they sign in with exactly the one you typed.',
        'If they sign in with Google or Apple rather than email, they arrive with whatever address that account carries — which may not be the one they gave you. If it is not working, ask them what address the app shows on the Profile screen, and change the row to match.',
      ]),

      h2('Taking access away'),

      body('Find their row in the same table, tick it, and delete it. Access stops straight away.', { after: 200 }),

      callout('Only delete rows marked gift', [
        'Rows with anything else in the store column belong to people who actually paid — through the App Store, Google Play or Stripe. Deleting one of those takes away what they bought while their store keeps charging them.',
      ]),

      h2('Worth knowing'),

      ...[
        'The row can be added before they have ever opened the app. It starts working the first time they sign in.',
        'They can sign in on as many devices as they like with that address.',
        'Gift rows never appear as income anywhere, because no payment was taken.',
        'Your own two accounts are already set up this way.',
      ].map((t) => new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { after: 100, line: 290 },
        children: [new TextRun({ text: t, font: 'Calibri', size: 22, color: INK })],
      })),

      new Paragraph({
        spacing: { before: 400 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: EDGE, space: 12 } },
        children: [new TextRun({ text: 'If anything looks different from this, send me a screenshot of what you see and I will sort it out.', font: 'Calibri', size: 20, color: SOFT, italics: true })],
      }),
    ],
  }],
});

const out = process.argv[2];
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote ' + out + '  (' + buf.length + ' bytes)');
});

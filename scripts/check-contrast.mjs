/**
 * WCAG contrast audit of the palette, as it is actually paired in the design.
 *
 * `node scripts/check-contrast.mjs`. Exits non-zero if anything fails, so it
 * can gate a PR later; today it is a reporting tool, because the failures it
 * finds are in the signed-off design and are the user's call to change.
 *
 * Colours are read from src/styles/tokens.css so this cannot drift from what
 * ships. The pairings are listed by hand because only the markup knows which
 * colour sits on which ground.
 */
import fs from 'node:fs';
import path from 'node:path';

const tokens = fs.readFileSync(path.resolve('src/styles/tokens.css'), 'utf8');

/** Pull `--name: #RRGGBB;` out of the token file. */
function token(name) {
  const m = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(tokens);
  if (!m) throw new Error(`token --${name} not found in tokens.css`);
  return m[1];
}

const C = {
  ink: token('c-ink'),
  inkDeep: token('c-ink-deep'),
  inkMuted: token('c-ink-muted'),
  inkSoft: token('c-ink-soft'),
  paper: token('c-paper'),
  paperRaised: token('c-paper-raised'),
  paperAlt: token('c-paper-alt'),
  white: token('c-white'),
  amber: token('c-amber'),
  teal: token('c-teal'),
  red: token('c-red'),
  line: token('c-line'),
};

const srgb = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => srgb(c / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * kind: 'text'  — needs 4.5:1 (WCAG 1.4.3)
 *       'large' — 18.66px bold or 24px+, needs 3:1
 *       'ui'    — focus rings and anything that identifies a component or its
 *                 state, needs 3:1 (WCAG 1.4.11)
 *       'decor' — reported for information only. 1.4.11 covers what is
 *                 *required* to identify a component; a card outline is not,
 *                 since the card is also delimited by its background and
 *                 padding. Listed so the number is on record rather than
 *                 quietly omitted.
 */
const PAIRS = [
  ['Body copy on paper', C.ink, C.paper, 'text'],
  ['Secondary copy on paper', C.inkMuted, C.paper, 'text'],
  ['Mono labels on paper', C.inkSoft, C.paper, 'text'],
  ['Mono labels on white card', C.inkSoft, C.white, 'text'],
  ['Mono labels on raised card', C.inkSoft, C.paperRaised, 'text'],
  ['Body copy on alt ground', C.ink, C.paperAlt, 'text'],
  ['Link teal on paper', C.teal, C.paper, 'text'],
  ['Link teal on white card', C.teal, C.white, 'text'],
  ['Dashboard-reports red on white', C.red, C.white, 'text'],
  ['True-breakeven teal on white', C.teal, C.white, 'large'],
  ['Paper text on ink section', C.paper, C.ink, 'text'],
  ['Paper text on deep ink', C.paper, C.inkDeep, 'text'],
  ['Amber eyebrow on ink section', C.amber, C.ink, 'text'],
  ['Amber eyebrow on deep ink', C.amber, C.inkDeep, 'text'],

  // The pairing the brief singles out as the likeliest failure.
  ['Amber breakeven label on white', C.amber, C.white, 'text'],
  ['Amber station number on white', C.amber, C.white, 'text'],
  ['Amber bundle number on white', C.amber, C.white, 'text'],
  ['Amber founder role on paper', C.amber, C.paper, 'text'],
  ['Amber "back to 01" on paper', C.amber, C.paper, 'text'],
  ['Amber focus ring on paper', C.amber, C.paper, 'ui'],
  ['Amber focus ring on white', C.amber, C.white, 'ui'],
  ['Card border on paper', C.line, C.paper, 'decor'],
];

const NEED = { text: 4.5, large: 3, ui: 3, decor: 3 };

let failures = 0;
const rows = PAIRS.map(([label, fg, bg, kind]) => {
  const r = ratio(fg, bg);
  const need = NEED[kind];
  const pass = r >= need;
  // 'decor' is advisory: reported, never counted against the build.
  if (!pass && kind !== 'decor') failures++;
  return { label, fg, bg, kind, r, need, pass };
});

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('', 34) + pad('fg', 9) + pad('on', 9) + pad('ratio', 8) + pad('need', 6) + '');
console.log('-'.repeat(74));
for (const row of rows) {
  console.log(
    pad(row.label, 34) +
      pad(row.fg, 9) +
      pad(row.bg, 9) +
      pad(row.r.toFixed(2) + ':1', 8) +
      pad(row.need.toFixed(1), 6) +
      (row.pass ? 'pass' : row.kind === 'decor' ? 'note' : 'FAIL'),
  );
}

if (failures) {
  console.log(`\n${failures} pairing(s) below the WCAG AA threshold.\n`);

  // How far the amber has to darken to clear 4.5:1 on white. Scaling all three
  // channels together keeps the hue, so the suggestion is the smallest change
  // that works rather than a different colour.
  const n = parseInt(C.amber.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255];

  let suggestion = null;
  for (let scale = 100; scale > 20; scale--) {
    const hex =
      '#' +
      channels
        .map((c) => Math.round(c * (scale / 100)).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    if (ratio(hex, C.white) >= 4.5) {
      suggestion = hex;
      break;
    }
  }

  console.log(
    `Amber (${C.amber}) reaches ${ratio(C.amber, C.white).toFixed(2)}:1 on white — it needs 4.5:1.\n` +
      `The nearest same-hue amber that clears it is ${suggestion} ` +
      `(${ratio(suggestion, C.white).toFixed(2)}:1).\n` +
      `Amber on the dark grounds is fine (${ratio(C.amber, C.ink).toFixed(2)}:1), so a second\n` +
      `token for amber-on-light would fix the text without touching the dark sections.\n` +
      `This is a signed-off design decision — see NOTES.md. Not changed here.`,
  );
  process.exitCode = 1;
} else {
  console.log('\nAll audited pairings meet WCAG AA.');
}

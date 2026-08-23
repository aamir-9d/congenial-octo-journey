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
  bg: token('color-bg'),
  surface: token('color-surface'),
  sunk: token('color-surface-sunk'),
  band: token('color-band'),
  text: token('color-text'),
  text2: token('color-text-2'),
  text3: token('color-text-3'),
  text4: token('color-text-4'),
  accent: token('color-accent'),
  ink: token('color-ink'),
  line: token('color-line'),
  lineStrong: token('color-line-strong'),
  measured: token('chart-measured'),
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
  // Body and secondary copy, on each of the three grounds it sits on.
  ['Body text on ground', C.text, C.bg, 'text'],
  ['Body text on surface', C.text, C.surface, 'text'],
  ['Body copy on ground', C.text2, C.bg, 'text'],
  ['Body copy on surface', C.text2, C.surface, 'text'],
  ['Body copy on band', C.text2, C.band, 'text'],
  ['Secondary copy on ground', C.text3, C.bg, 'text'],
  ['Secondary copy on surface', C.text3, C.surface, 'text'],
  ['Labels and meta on ground', C.text4, C.bg, 'text'],
  ['Labels and meta on surface', C.text4, C.surface, 'text'],
  // Only text-2 and text-3 ever sit on the sunk surface — chips, tags and code
  // blocks. Checking text-4 there would be auditing a pairing that does not
  // exist, which is worse than not checking at all.
  ['Chip label on sunk', C.text2, C.sunk, 'text'],
  ['Code block on sunk', C.text3, C.sunk, 'text'],

  // The pairing that failed seven times on the cream ground. Inverting the
  // ground is what resolved it — amber is 8.1:1 on #0E1014.
  ['Amber eyebrow on ground', C.accent, C.bg, 'text'],
  ['Amber kicker on surface', C.accent, C.surface, 'text'],
  ['Amber station number on surface', C.accent, C.surface, 'text'],
  ['Amber breakeven readout on surface', C.accent, C.surface, 'text'],
  ['Amber outcome line on surface', C.accent, C.surface, 'text'],
  ['Amber chip on sunk', C.accent, C.sunk, 'text'],

  // Text on a filled accent button, which is the one light-on-dark inversion.
  ['Button label on amber', C.ink, C.accent, 'text'],

  // Chart series must be distinguishable from the ground they are drawn on.
  ['True-revenue line on surface', C.accent, C.surface, 'ui'],
  // 2.85:1 against a 3:1 requirement — the one pairing the dark ground did not
  // fix. Left failing rather than reclassified: the dashed pattern does help
  // distinguish it, but 1.4.11 covers graphics needed to understand content and
  // a chart series qualifies. Nudging it to about #606871 clears the bar, and
  // that is a design value, so it is the user's call. See NOTES.md.
  ['Dashboard line on surface', C.measured, C.surface, 'ui'],

  ['Amber focus ring on ground', C.accent, C.bg, 'ui'],
  ['Amber focus ring on surface', C.accent, C.surface, 'ui'],

  ['Card outline on ground', C.line, C.bg, 'decor'],
  ['Control border on surface', C.lineStrong, C.surface, 'decor'],
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

const NL = String.fromCharCode(10);

if (failures) {
  console.log(NL + failures + ' pairing(s) below the WCAG AA threshold.' + NL);

  /* The cream palette failed here seven times, all of them amber on a light
     ground, and the fix was to invert the ground rather than retune the amber.
     What is left is reported generically: for each failure, the nearest
     same-hue colour that clears the bar, so the suggestion is the smallest
     change that works rather than a new palette.

     Nothing is changed automatically. These are design values. */
  for (const row of rows.filter((r) => !r.pass && r.kind !== 'decor')) {
    const n = parseInt(row.fg.slice(1), 16);
    const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const bgLighter = luminance(row.bg) > luminance(row.fg);

    let suggestion = null;
    for (let step = 1; step <= 80; step++) {
      const k = bgLighter ? 1 - step / 100 : 1 + step / 100;
      const hex =
        '#' +
        channels
          .map((c) => Math.min(255, Math.round(c * k)).toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
      if (ratio(hex, row.bg) >= row.need) {
        suggestion = hex;
        break;
      }
    }

    const head = '  ' + row.label + ': ' + row.fg + ' on ' + row.bg +
      ' is ' + row.r.toFixed(2) + ':1, needs ' + row.need + ':1.';
    const tail = suggestion
      ? '    Nearest same-hue colour that clears it: ' + suggestion +
        ' (' + ratio(suggestion, row.bg).toFixed(2) + ':1).'
      : '    No same-hue adjustment clears it; the pairing needs rethinking.';

    console.log(head + NL + tail);
  }

  console.log(NL + 'These are design values - see NOTES.md. Nothing changed here.' + NL);
}

process.exitCode = failures ? 1 : 0;

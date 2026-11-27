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

/* The site has two themes. The dark values are the first declaration of each
   token; the light values are the ones inside the
   `@media (prefers-color-scheme: light)` block. A token the light block does
   not restate keeps its dark value, exactly as the cascade would resolve it. */
const lightStart = tokens.indexOf('@media (prefers-color-scheme: light)');
if (lightStart < 0) throw new Error('the light theme block is missing from tokens.css');
const darkCss = tokens.slice(0, lightStart);
const lightCss = tokens.slice(lightStart, tokens.indexOf('\n}\n', lightStart));

/** Pull `--name: #RRGGBB;` out of a block of the token file. */
function token(name, css) {
  const m = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
  return m ? m[1] : null;
}

function palette(theme) {
  const get = (name) => {
    const v = (theme === 'light' && token(name, lightCss)) || token(name, darkCss);
    if (!v) throw new Error(`token --${name} not found in tokens.css`);
    return v;
  };
  return {
    bg: get('color-bg'),
    surface: get('color-surface'),
    sunk: get('color-surface-sunk'),
    band: get('color-band'),
    text: get('color-text'),
    text2: get('color-text-2'),
    text3: get('color-text-3'),
    text4: get('color-text-4'),
    accent: get('color-accent'),
    accentText: get('color-accent-text'),
    focus: get('color-focus'),
    chartTrue: theme === 'light' ? get('chart-true') : get('color-accent'),
    ink: get('color-ink'),
    line: get('color-line'),
    lineStrong: get('color-line-strong'),
    measured: get('chart-measured'),
  };
}

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
const pairs = (C) => [
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
  /* The sunk surface, which is the hardest ground on the site.

     This list used to say that only text-2 and text-3 ever sat here, and that
     checking text-4 would be auditing a pairing that did not exist. That was a
     claim about the markup, and the markup stopped honouring it: Automation's
     sample/caption/source labels and the change-block labels are all text-4 on
     sunk, at 4.22:1. This file reported a clean palette the whole time, because
     it was only ever checking the pairings someone had remembered to list.

     So every text token is checked against every ground now, whether or not
     the design is believed to use that combination today. A pairing that does
     not exist costs one line of output; a pairing that exists and is not
     checked costs an accessibility failure nobody sees until CI. */
  ['Body copy on sunk', C.text2, C.sunk, 'text'],
  ['Secondary copy on sunk', C.text3, C.sunk, 'text'],
  ['Labels and meta on sunk', C.text4, C.sunk, 'text'],
  ['Body text on sunk', C.text, C.sunk, 'text'],
  ['Body text on band', C.text, C.band, 'text'],
  ['Secondary copy on band', C.text3, C.band, 'text'],
  ['Labels and meta on band', C.text4, C.band, 'text'],

  // The pairing that failed seven times on the cream ground. Inverting the
  // ground is what resolved it — amber is 8.1:1 on #0E1014.
  ['Amber eyebrow on ground', C.accentText, C.bg, 'text'],
  ['Amber kicker on surface', C.accentText, C.surface, 'text'],
  ['Amber station number on surface', C.accentText, C.surface, 'text'],
  ['Amber breakeven readout on surface', C.accentText, C.surface, 'text'],
  ['Amber outcome line on surface', C.accentText, C.surface, 'text'],
  ['Amber chip on sunk', C.accentText, C.sunk, 'text'],

  // Text on a filled accent button, which is the one light-on-dark inversion.
  ['Button label on amber', C.ink, C.accent, 'text'],

  // Chart series must be distinguishable from the ground they are drawn on.
  ['True-revenue line on surface', C.chartTrue, C.surface, 'ui'],
  // 2.85:1 against a 3:1 requirement — the one pairing the dark ground did not
  // fix. Left failing rather than reclassified: the dashed pattern does help
  // distinguish it, but 1.4.11 covers graphics needed to understand content and
  // a chart series qualifies. Nudging it to about #606871 clears the bar, and
  // that is a design value, so it is the user's call. See NOTES.md.
  ['Dashboard line on surface', C.measured, C.surface, 'ui'],

  ['Focus ring on ground', C.focus, C.bg, 'ui'],
  ['Focus ring on surface', C.focus, C.surface, 'ui'],
  ['Amber text on band', C.accentText, C.band, 'text'],

  ['Card outline on ground', C.line, C.bg, 'decor'],
  ['Control border on surface', C.lineStrong, C.surface, 'decor'],
];

const NEED = { text: 4.5, large: 3, ui: 3, decor: 3 };

let failures = 0;
const pad = (s, n) => String(s).padEnd(n);

for (const theme of ['dark', 'light']) {
  const rows = pairs(palette(theme)).map(([label, fg, bg, kind]) => {
    const r = ratio(fg, bg);
    const need = NEED[kind];
    const pass = r >= need;
    // 'decor' is advisory: reported, never counted against the build.
    if (!pass && kind !== 'decor') failures++;
    return { label, fg, bg, kind, r, need, pass };
  });

  console.log(`\n${theme.toUpperCase()} THEME`);
  console.log(pad('', 36) + pad('fg', 9) + pad('on', 9) + pad('ratio', 8) + pad('need', 6));
  console.log('-'.repeat(74));
  for (const row of rows) {
    const mark = row.pass ? 'pass' : row.kind === 'decor' ? 'note' : 'FAIL';
    console.log(
      pad(row.label, 36) + pad(row.fg, 9) + pad(row.bg, 9) + pad(row.r.toFixed(2) + ':1', 8) + pad(row.need.toFixed(1), 6) + mark,
    );
  }
}

console.log(failures === 0 ? '\nAll text and graphic pairings pass in both themes.' : `\n${failures} pairing(s) fail.`);
process.exit(failures === 0 ? 0 : 1);

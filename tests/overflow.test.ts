/**
 * The six phone bugs, pinned.
 *
 * Every one of these shipped green: the markup was right, the copy was right,
 * the numbers were right, and the page still broke on a phone. They are pinned
 * individually because each has a different failure mode and a different way of
 * coming back.
 *
 *   1. `white-space: nowrap` on a row container stops the LABEL wrapping, so
 *      the row's intrinsic width exceeds the viewport and the card scrolls.
 *   2. UA margins make a `width: 100%` range input 4px wider than its parent.
 *   3. Labels too long to sit beside their value at 402px.
 *   4. The chart's aria-live summary rendering visibly.
 *   5. The breakeven annotation drawn on top of the day-7 tick.
 *   6. The chart still carrying the cream palette.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist', 'index.html');
const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

/** The declaration block of a rule whose selector list is exactly `selector`. */
function rule(selector: string): string | null {
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('');
  // Unscoped stylesheets emit the bare class; component styles get a scope
  // attribute appended. Accept either, and require a selector boundary so
  // `.calc__row` does not match `.calc__row-label`.
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\[data-astro-cid-[a-z0-9]+\\])?\\{([^}]*)\\}',
  );
  const m = re.exec(css);
  return m ? m[2]! : null;
}

test('1. no field container forbids its own label from wrapping', { skip }, () => {
  const field = rule('.pm__field');
  const label = rule('.pm__label');
  const entry = rule('.pm__entry');

  assert.ok(field, '.pm__field has no rule at all');
  assert.ok(
    !/white-space:\s*nowrap/.test(field!),
    '.pm__field forbids wrapping — the label cannot shrink and the panel scrolls',
  );

  // The label sits in a minmax(0, 1fr) track, which is the grid equivalent of
  // the flex min-width:0 this originally pinned: without it the track refuses
  // to go below the label's intrinsic width.
  assert.match(field!, /minmax\(0,\s*1fr\)/, '.pm__field lets its label set a floor');
  assert.ok(label, '.pm__label has no rule');
  assert.ok(entry, '.pm__entry has no rule');
});

test('1. the numeric entries keep their shape', { skip }, () => {
  const num = rule('.pm__num');
  assert.ok(num, '.pm__num has no rule');
  assert.match(num!, /tabular-nums/, 'figures must not jitter as they change');
  assert.match(num!, /text-align:\s*right/, 'the value should sit against its unit');
});

test('2. UA margins on native controls are zeroed', { skip }, () => {
  const decl = rule('input,select,textarea,button');
  assert.ok(decl, 'no reset for native control margins');
  assert.match(decl!, /margin:\s*0/, 'a width:100% range input will overflow its container by 4px');
});

test('3. no axis label is drawn as SVG text', { skip }, () => {
  // SVG <text> scales with the viewBox: an 11px label in a 920-wide box lands
  // near 7px once the box is phone width, which is how a previous chart
  // shipped unreadable. Every label on this plot is HTML positioned from a
  // fraction the chart module returns.
  const plot = /<div class="pm__plot"[\s\S]*?<\/svg>/.exec(html);
  assert.ok(plot, 'the plot did not render');
  assert.ok(
    !/<text[\s>]/.test(plot![0]),
    'an axis label is SVG <text> — it will shrink with the viewBox on a phone',
  );

  /* `rule()` matches its argument as a substring, so `.pm__tick` would find
     `.pm__yaxis .pm__tick` first and read the wrong body. Look for the
     standalone rule directly: a font size on the label element itself is the
     whole point — inherited from a container it would be the viewBox problem
     again, in CSS. */
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('');
  assert.match(
    css,
    /(?:^|[,}])\.pm__tick\{[^}]*font-size/,
    'the HTML tick has no font size of its own',
  );
});

test('4. the chart summary is out of the visual tree and in the a11y one', { skip }, () => {
  // The old summary was a clipped live region. This one is the SVG's own
  // <desc>, referenced by aria-labelledby: never painted, always announced,
  // and impossible to accidentally render as body copy.
  assert.match(html, /<svg[^>]*class="pm__svg"[^>]*aria-labelledby="([^"]+)"/, 'the plot has no accessible name');
  const ids = /aria-labelledby="([^"]+)"/.exec(html)![1]!.split(/\s+/);
  for (const id of ids) {
    assert.ok(html.includes(`id="${id}"`), `aria-labelledby points at a missing ${id}`);
  }
  assert.match(html, /<desc id="pm-chart-desc"[^>]*>[^<]{40,}/, 'the chart description is empty or missing');
  assert.match(html, /role="img"/, 'the plot is not exposed as an image');
});

test('5. the crossing annotation cannot float without a crossing', { skip }, () => {
  // The old bug drew the breakeven label on top of the day-7 tick. The new
  // failure mode is worse: a marker left at the frame when the curve never
  // crosses, implying a payback that did not happen.
  const chip = rule('.pm__chip');
  assert.ok(chip, '.pm__chip has no rule');
  assert.ok(rule('.pm__chip[hidden]'), 'the chip cannot be hidden — it will show with no crossing');
  assert.match(chip!, /--x/, 'the chip is not positioned from the crossing fraction');
});

test('6. the chart is on the dark palette, not the cream one', { skip }, () => {
  // The cream values, if they survive as the effective colour, render a teal
  // line with a brown wash on the dark ground.
  for (const [selector, token] of [
    ['.pm__curve', '--color-accent'],
    ['.pm__pinned', '--color-text-4'],
    ['.pm__zero', '--color-text-3'],
    ['.pm__marker', '--color-accent'],
  ] as const) {
    const decl = rule(selector);
    assert.ok(decl, `${selector} has no palette rule`);
    assert.ok(decl!.includes(`var(${token})`), `${selector} is not painted from ${token}`);
  }

  // The comparison must not rest on colour alone.
  const pinned = rule('.pm__pinned');
  assert.match(pinned!, /stroke-dasharray/, 'the pinned curve is distinguished by colour only');
});
test('6. the OG image generator did not drift to the old palette', { skip }, () => {
  const gen = path.resolve(import.meta.dirname, '..', 'scripts', 'build-og-image.mjs');
  if (!fs.existsSync(gen)) return;

  const src = fs.readFileSync(gen, 'utf8');
  for (const cream of ['#0E6E63', '#E2E0DA', '#F7F6F3']) {
    assert.ok(!src.includes(cream), `build-og-image.mjs still paints ${cream} from the cream palette`);
  }
});

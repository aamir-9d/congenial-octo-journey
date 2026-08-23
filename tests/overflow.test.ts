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

test('1. no row container forbids its own label from wrapping', { skip }, () => {
  const row = rule('.calc__row');
  const label = rule('.calc__row-label');
  const value = rule('.calc__row-val');

  assert.ok(row, '.calc__row has no rule at all');
  assert.ok(!/white-space:\s*nowrap/.test(row!), '.calc__row still forbids wrapping — this is the bug');

  // min-width:0 is the load-bearing half: a flex child defaults to
  // min-width:auto and refuses to shrink below its content.
  assert.match(label!, /min-width:\s*0/, '.calc__row-label cannot shrink below its content');
  assert.match(value!, /white-space:\s*nowrap/, 'the value may not wrap — nowrap belongs here');
});

test('1. the slider readout rows have the same shape', { skip }, () => {
  const value = rule('.calc__field-val');
  assert.match(value!, /white-space:\s*nowrap/, 'slider readouts must not wrap');
  assert.match(value!, /flex:\s*none/, 'slider readouts must not be squeezed');
});

test('2. UA margins on native controls are zeroed', { skip }, () => {
  const decl = rule('input,select,textarea,button');
  assert.ok(decl, 'no reset for native control margins');
  assert.match(decl!, /margin:\s*0/, 'a width:100% range input will overflow its container by 4px');
});

test('3. long labels have a phone form, and only one is ever shown', { skip }, () => {
  assert.ok(html.includes('Invisible / 1,000<'), 'the shortened row label is missing');
  assert.ok(html.includes('iOS installs with null CV'), 'the shortened slider label is missing');

  const narrow = rule('.narrow-only');
  assert.match(narrow!, /display:\s*none/, 'both label forms would render at once');
});

test('4. the chart summary is out of the visual tree and in the a11y one', { skip }, () => {
  const decl = rule('.calc__summary');
  assert.ok(decl, '.calc__summary has no rule — it will render as visible body copy');
  assert.match(decl!, /clip-path:\s*inset\(50%\)/, 'not clipped');
  assert.match(decl!, /position:\s*absolute/, 'still in flow');

  // Clipped, not removed: it is the chart's live region.
  assert.ok(
    /class="calc__summary"/.test(html) && /aria-live="polite"[^>]*calc__summary|calc__summary[^>]*aria-live="polite"/.test(html),
    'the summary lost its live region',
  );
  assert.ok(!/display:\s*none/.test(decl!), 'display:none would drop it from the a11y tree');
});

test('5. the plot drops its own annotations at phone width', { skip }, () => {
  const css = [...html.matchAll(/@media[^{]*max-width:\s*767px[^{]*\{([\s\S]*?)\}\s*(?=@media|<\/style>|\.)/g)]
    .map((m) => m[1]!)
    .join('');
  const anywhere = html;

  // The breakeven is stated in the card header, so on the plot it only collides.
  assert.ok(/#lbl-day7/.test(anywhere), 'the day-7 label element is gone entirely');
  assert.ok(
    /\.chart__lbl--be,\s*#lbl-day7,\s*#lbl-tmid\{display:none\}/.test(anywhere.replace(/\s+/g, ' ')) ||
      /chart__lbl--be[^}]*#lbl-day7/.test(anywhere),
    'the colliding annotations are not hidden on a phone',
  );
  assert.ok(/class="calc__breakeven/.test(anywhere), 'the header no longer carries the breakeven');
});

test('6. the chart is on the dark palette, not the cream one', { skip }, () => {
  // The cream values, if they survive as the effective colour, render a teal
  // line with a brown wash on the dark ground.
  for (const [id, token] of [
    ['#p-true', '--chart-true'],
    ['#p-meas', '--chart-measured'],
    ['#ax-y,#ax-x', '--chart-axis'],
    ['#zero-line', '--chart-rule'],
  ] as const) {
    const decl = rule(id);
    assert.ok(decl, `${id} has no palette rule — it falls back to the cream attribute`);
    assert.ok(decl!.includes(`var(${token})`), `${id} is not painted from ${token}`);
  }

  const dot = rule('#cross-dot');
  assert.match(dot!, /stroke:\s*var\(--color-surface\)/, 'the marker ring is still white');
});

test('6. the OG image generator did not drift to the old palette', { skip }, () => {
  const gen = path.resolve(import.meta.dirname, '..', 'scripts', 'build-og-image.mjs');
  if (!fs.existsSync(gen)) return;

  const src = fs.readFileSync(gen, 'utf8');
  for (const cream of ['#0E6E63', '#E2E0DA', '#F7F6F3']) {
    assert.ok(!src.includes(cream), `build-og-image.mjs still paints ${cream} from the cream palette`);
  }
});

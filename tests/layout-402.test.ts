/**
 * The 402px pass, as far as it can be done without a browser.
 *
 * The brief's acceptance test is four console snippets that measure the real
 * layout. This repo has no browser and no headless DOM, by decision — no new
 * dependencies — so nothing here measures anything. What it does instead is
 * assert the absence of the *causes* of horizontal overflow, each of which has
 * already produced a real defect in this project at least once:
 *
 *   - a grid column floor wider than the viewport, unwrapped by `min()`
 *     (this is what clipped the founder bios by 77px)
 *   - `white-space: nowrap` on a flex or grid container, which stops the
 *     container's own children from wrapping (this is what made every
 *     calculator row run off the right edge)
 *   - a fixed pixel width wider than a 360px viewport minus its gutters
 *   - a long unbroken token in a mono block with no `overflow-wrap`
 *
 * The real measurement still has to happen in a browser at 360/390/430. This
 * catches the regressions between those passes.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const PAGES = ['index.html', 'blog/index.html', 'privacy.html', 'terms.html'];

const built = fs.existsSync(path.join(DIST, 'index.html'));
const skip = !built && 'run `npm run build` first';

/** Every rule on a page, as [selector, declarations]. */
function rules(page: string): Array<[string, string]> {
  const file = path.join(DIST, page);
  if (!fs.existsSync(file)) return [];

  const html = fs.readFileSync(file, 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('\n');

  // Strip at-rule preludes so the inner rules are matched on their own; the
  // declarations are what matter here, not what gates them.
  return [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].map(
    (m) => [m[1]!.trim(), m[2]!] as [string, string],
  );
}

/** The narrowest viewport the brief tests, less the smallest gutter. */
const NARROWEST = 360;

test('no grid column floor is wider than the phone viewport', { skip }, () => {
  const offenders: string[] = [];

  for (const page of PAGES) {
    for (const [selector, decl] of rules(page)) {
      for (const m of decl.matchAll(/minmax\(\s*([^,]+),/g)) {
        const floor = m[1]!.trim();

        // `min(420px, 100%)` is the correct form: it collapses to the track
        // width on a narrow screen. A bare pixel floor does not.
        if (floor.startsWith('min(')) continue;

        const px = /^([0-9.]+)px$/.exec(floor);
        if (px && Number(px[1]) > NARROWEST) {
          offenders.push(`${page}  ${selector.slice(0, 60)} → minmax(${floor}, …)`);
        }
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'These grid floors cannot shrink below their content and will overflow:\n  ' +
      offenders.join('\n  ') +
      '\n\nWrap the floor in min(): minmax(min(420px, 100%), 1fr).',
  );
});

test('no flex or grid container forbids its own children from wrapping', { skip }, () => {
  const offenders: string[] = [];

  for (const page of PAGES) {
    for (const [selector, decl] of rules(page)) {
      if (!/white-space:\s*nowrap/.test(decl)) continue;
      if (!/display:\s*(flex|grid|inline-flex|inline-grid)/.test(decl)) continue;

      // A container that is itself a scrolling strip is deliberate: the chips
      // and the stack filters both scroll sideways on purpose.
      if (/overflow-x:\s*(auto|scroll)/.test(decl)) continue;

      // A button or a chip is one short label and nowrap is correct there.
      // The bug shape is specifically a two-ended row — a label at one end and
      // a value at the other — where nowrap on the container stops the label
      // wrapping and the row's intrinsic width becomes the sum of both.
      if (!/justify-content:\s*space-between/.test(decl)) continue;

      offenders.push(`${page}  ${selector.slice(0, 60)}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'These containers set nowrap on themselves, which their children inherit:\n  ' +
      offenders.join('\n  ') +
      '\n\nnowrap belongs on the value that must not break, never on the row.',
  );
});

test('no fixed width exceeds the narrowest phone', { skip }, () => {
  const offenders: string[] = [];

  for (const page of PAGES) {
    for (const [selector, decl] of rules(page)) {
      // SVG-internal and deliberately-scrolling boxes are exempt.
      if (/overflow-x:\s*(auto|scroll)/.test(decl)) continue;

      for (const m of decl.matchAll(/(?:^|;)\s*(min-width|width):\s*([0-9.]+)px/g)) {
        if (Number(m[2]) > NARROWEST) offenders.push(`${page}  ${selector.slice(0, 60)} → ${m[1]}: ${m[2]}px`);
      }
    }
  }

  assert.deepEqual(offenders, [], 'Fixed widths wider than a 360px viewport:\n  ' + offenders.join('\n  '));
});

test('mono blocks that carry long tokens can break them', { skip }, () => {
  // The stack bundle bodies and the bento code blocks are the two places with
  // slash-separated strings longer than the container. Without a break
  // opportunity they push the whole page sideways.
  const offenders: string[] = [];

  for (const page of PAGES) {
    const wanted = ['.stack__body', '.problems__code'];
    const found = new Map<string, string>();

    for (const [selector, decl] of rules(page)) {
      for (const w of wanted) {
        if (selector.includes(w)) found.set(w, (found.get(w) ?? '') + decl);
      }
    }

    for (const [name, decl] of found) {
      if (!/overflow-wrap:\s*(anywhere|break-word)|word-break:\s*break-all/.test(decl)) {
        offenders.push(`${page}  ${name}`);
      }
    }
  }

  assert.deepEqual(offenders, [], 'These carry long unbreakable tokens:\n  ' + offenders.join('\n  '));
});

test('the page still relies on a masking overflow rule — recorded, not asserted away', { skip }, () => {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const masks = /overflow-x:\s*hidden/.test(html);

  // This is deliberately not a failure. `overflow-x: hidden` on the page root
  // is a reasonable last line of defence, but it also *hides* the very thing
  // the brief's console test measures — it is what concealed the founder bio
  // clipping until a phone screenshot turned it up. The test exists so the
  // fact is written down somewhere that runs, rather than being rediscovered.
  assert.equal(
    typeof masks,
    'boolean',
    'if this ever fails, the sweep above is the only thing left catching overflow',
  );
});

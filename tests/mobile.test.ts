/**
 * Phone layout.
 *
 * `design/E2E Apps - Bento mobile.dc.html` is a separate signed-off design, not
 * a narrower rendering of the desktop one: the hero headline is 32px rather
 * than a clamp bottoming out, the CTAs stack full width, the blog rows become
 * stacked blocks closing on a "Read" affordance, the Loop is a vertical rail
 * instead of a circle, and the calculator header is left-aligned where the
 * desktop one is centred.
 *
 * None of that is visible to the rest of this suite, which reads the built page
 * as one document and never asks what a rule is gated behind. So a phone rule
 * could be deleted, or land in a component whose scope token doesn't match, and
 * every other test would stay green. These assertions are deliberately about
 * the media query, not just the declaration.
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

/**
 * The bodies of every `@media` block whose condition includes a max-width at or
 * below `px`. Astro's minifier drops the space after `@media` and writes
 * `(max-width:640px)` unspaced, so this parses rather than pattern-matching,
 * balancing braces to survive the nested blocks.
 */
function phoneCss(px: number): string {
  return phoneCssOf(html, px);
}

/** The same, against any document — the blog index has its own phone rules. */
function phoneCssOf(html: string, px: number): string {
  const out: string[] = [];
  const re = /@media([^{]+)\{/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html))) {
    const width = /max-width\s*:\s*(\d+(?:\.\d+)?)px/.exec(m[1]!);
    if (!width || Number(width[1]) > px) continue;

    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < html.length && depth > 0) {
      if (html[i] === '{') depth++;
      else if (html[i] === '}') depth--;
      i++;
    }
    out.push(html.slice(start, i - 1));
  }
  return out.join('\n');
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => '\\' + c);

/** Astro's scope tokens make exact selectors brittle; match on shape instead. */
function has(css: string, selector: string, declaration: string): boolean {
  return new RegExp(
    escape(selector) + '(\\[[^\\]]*\\])?[^{}]*\\{[^{}]*' + escape(declaration),
  ).test(css);
}

test('the phone breakpoint exists at all', { skip }, () => {
  const css = phoneCss(640);
  assert.ok(css.length > 400, 'no substantial rules are gated behind a phone-width media query');
});

test('the hero uses the mobile design, not a shrunken desktop one', { skip }, () => {
  const css = phoneCss(640);

  // The size comes from the --t-h1 token override, not a per-component rule,
  // so every section heading moves together.
  assert.match(css, /--t-h1:\s*32px/, 'the phone type scale is not applied');
  assert.match(css, /--t-h2:\s*25px/, 'section headings are not the design 25px');
  assert.ok(has(css, '.hero__actions', 'display:grid'), 'CTAs do not stack');
  assert.ok(/min-height:52px/.test(css), 'stacked CTAs are not 52px tall');
  assert.ok(has(css, '.hero__lead', 'font-size:var(--t-body-sm)'), 'lead is not 15px');
});

test('bento cards get the phone padding and type', { skip }, () => {
  const css = phoneCss(640);

  assert.ok(has(css, '.problems__card', 'padding:var(--s6)'), 'cards keep desktop padding');
  assert.ok(
    has(css, '.problems__title', 'font-size:var(--t-post-title)'),
    'card titles are not the design 19px',
  );
});

test('blog rows are stacked blocks closing on a Read affordance', { skip }, () => {
  // The blog section left the homepage in the restructure; its rows and their
  // phone rules now ship on the blog index, so that is where this reads.
  const blogIndex = path.resolve(import.meta.dirname, '..', 'dist', 'blog.html');
  const doc = fs.existsSync(blogIndex) ? fs.readFileSync(blogIndex, 'utf8') : html;
  const css = phoneCssOf(doc, 767);

  assert.ok(has(css, '.blog__title', 'font-size:17px'), 'post titles are not the design 17px');
  assert.ok(/\.blog__read[^{}]*\{[^{}]*display:inline-flex/.test(css), '"Read" never becomes visible');
  // The updated mobile design keeps the kicker -- an earlier pass dropped it.
  assert.ok(!/\.blog__kicker[^{}]*\{[^{}]*display:none/.test(css), 'the kicker should stay on a phone');
  // The full-width "All posts" button was part of the homepage blog teaser,
  // which the restructure removed. On the index itself there is nowhere for it
  // to go, so there is nothing left to assert about it.

  // And it must be absent above the breakpoint, or it doubles the desktop row.
  // Read from the same document as the phone rules above — the homepage no
  // longer carries a blog section at all.
  const desktop = doc.replace(/@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  assert.ok(/\.blog__read[^{}]*\{[^{}]*display:none/.test(desktop), '"Read" is not hidden on desktop');
});

test('the calculator becomes one column with 44px targets', { skip }, () => {
  const css = phoneCss(640);

  assert.ok(has(css, '.calc__head', 'text-align:left'), 'the header is still centred');
  assert.ok(/grid-template-columns:1fr/.test(css), 'controls do not stack to one column');
  assert.ok(/min-height:44px/.test(css), 'segmented controls are under 44px');
  assert.ok(has(css, '.calc__horizon-label', 'display:none'), 'the redundant label still shows');
});

test('no phone-width rule sets a touch target under 44px', { skip }, () => {
  // Not exhaustive — it cannot be, without a browser. It pins the values the
  // mobile design states outright, which is where the regressions have come from.
  //
  // Selector-aware, because a min-height is not automatically a touch target:
  // the Loop rail's connector line carries one and nothing taps it.
  const DECORATIVE = /\.loop__line|\.loop__node|\.hero__bloom/;

  const css = phoneCss(767);
  const offenders: string[] = [];
  let found = 0;

  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1]!.trim();
    const height = /min-height:\s*(\d+(?:\.\d+)?)px/.exec(m[2]!);
    if (!height) continue;

    found++;
    if (DECORATIVE.test(selector)) continue;
    if (Number(height[1]) < 44) offenders.push(`${selector} → ${height[1]}px`);
  }

  assert.ok(found >= 2, 'no explicit touch-target heights survive at phone width');
  assert.deepEqual(offenders, [], 'these phone-width targets are under 44px:\n  ' + offenders.join('\n  '));
});

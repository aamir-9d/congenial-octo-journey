/**
 * Phone layout.
 *
 * `design/v3/Phone.dc.html` is a separate signed-off design, not a narrower
 * rendering of the desktop one: the hero headline is a stated 36px rather than
 * a clamp bottoming out, the hero buttons stack full width at 54px, the blog
 * cards go to one column with a 17px title, and the homepage's services, loop
 * stations and posts each become a swipe row (tests/redesign.test.ts).
 *
 * (Until November 2026 this file pinned the earlier phone design,
 * `design/E2E Apps - Bento mobile.dc.html`: a 32px headline, 52px stacked CTAs
 * on `.hero__actions`, and blog rows whose "Read" link was hidden on desktop.
 * The redesign replaced all three; the tests below pin what replaced them.)
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
  // so every section heading moves together. These are the phone values in
  // src/styles/tokens.css; the homepage h1 takes --t-h1 and every other page's
  // h1 takes --t-page.
  assert.match(css, /--t-h1:\s*36px/, 'the phone type scale is not applied');
  assert.match(css, /--t-page:\s*32px/, 'sub-page headlines are not the design 32px');
  assert.match(css, /--t-h2:\s*28px/, 'section headings are not the design 28px');

  // The hero is built on the shared page header, so the stacking rule is the
  // header's: each action takes the full row and is 54px tall.
  assert.ok(/\.phero__actions>\*\{[^{}]*flex:1 1 100%/.test(css), 'CTAs do not stack');
  assert.ok(/\.phero__actions>\*\{[^{}]*min-height:54px/.test(css), 'stacked CTAs are not 54px tall');

  // And the two rules those overrides act on have to exist outside the query.
  assert.match(html, /\.phero__title--home\{[^{}]*font-size:var\(--t-h1\)/, 'the homepage h1 does not take --t-h1');
  assert.match(html, /\.phero__title\{[^{}]*font-size:var\(--t-page\)/, 'page h1s do not take --t-page');
});

test('bento cards get the phone padding and type', { skip }, () => {
  // The bento left the homepage in the evidence-led restructure — the calculator
  // was starting 2,172px down behind it. It still exists in full on /services,
  // which is where its phone rules now ship, so that is where this reads.
  const services = path.resolve(import.meta.dirname, '..', 'dist', 'services.html');
  const doc = fs.existsSync(services) ? fs.readFileSync(services, 'utf8') : html;
  const css = phoneCssOf(doc, 640);

  assert.ok(has(css, '.problems__card', 'padding:var(--s6)'), 'cards keep desktop padding');
  assert.ok(
    has(css, '.problems__title', 'font-size:var(--t-post-title)'),
    'card titles are not the design 19px',
  );
});

test('blog cards go to one column on a phone and keep their Read affordance', { skip }, () => {
  // The blog index is a grid of cards since the November 2026 redesign: one
  // column by default, two from 700px, three from 1024px. Each card closes on
  // "Read" at every width. The old design showed it on a phone only and this
  // test used to assert it was hidden on desktop; on a card it is the one
  // affordance, so now it must never be hidden.
  const blogIndex = path.resolve(import.meta.dirname, '..', 'dist', 'blog.html');
  const doc = fs.existsSync(blogIndex) ? fs.readFileSync(blogIndex, 'utf8') : html;
  const css = phoneCssOf(doc, 767);

  assert.ok(has(css, '.blog__title', 'font-size:17px'), 'post titles are not the design 17px');
  assert.ok(/\.blog__read[^{}]*\{[^{}]*display:inline-flex/.test(css), '"Read" is not shown on a phone');
  // The updated mobile design keeps the kicker -- an earlier pass dropped it.
  assert.ok(!/\.blog__kicker[^{}]*\{[^{}]*display:none/.test(css), 'the kicker should stay on a phone');
  // The full-width "All posts" button was part of the homepage blog teaser,
  // which the restructure removed. On the index itself there is nowhere for it
  // to go, so there is nothing left to assert about it.

  // Above the breakpoint: still shown, and never switched off anywhere.
  // Read from the same document as the phone rules above — the homepage no
  // longer carries a blog section at all.
  const desktop = doc.replace(/@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  assert.ok(/\.blog__read[^{}]*\{[^{}]*display:inline-flex/.test(desktop), '"Read" is not shown on desktop');
  assert.ok(!/\.blog__read[^{}]*\{[^{}]*display:none/.test(doc), '"Read" is hidden at some width');

  // Every card carries one, and the whole card is the link (so the 24px line
  // "Read" sits on is not itself the touch target).
  const rows = doc.match(/<a\b[^>]*class="blog__row"/g) ?? [];
  assert.ok(rows.length >= 15, 'the blog index lists fewer posts than exist');
  assert.equal((doc.match(/class="blog__read"/g) ?? []).length, rows.length, 'a card has no Read affordance');

  // One column until there is room for two; tracks that can shrink.
  assert.match(desktop, /\.blog__list(\[[^\]]*\])?\{[^{}]*grid-template-columns:minmax\(0,1fr\)/, 'the list does not start as one column');
  const wider = [...doc.matchAll(/@media\s*\(min-width:\s*(\d+)px\)\{\.blog__list(?:\[[^\]]*\])?\{grid-template-columns:repeat\((\d),minmax\(0,1fr\)\)/g)]
    .map((m) => [Number(m[1]), Number(m[2])]);
  assert.deepEqual(wider, [[700, 2], [1024, 3]], 'the card grid no longer steps 1 → 2 → 3 columns');
});

test('the payback map becomes one column with 44px targets', { skip }, () => {
  // The two-column composition is a min-width query, so below it the map is
  // already one column; what matters is that the controls stay tappable.
  // Read from /payback-calculator: the calculator left the homepage on
  // 27 November 2026.
  const calc = fs.readFileSync(path.join(path.dirname(DIST), 'payback-calculator.html'), 'utf8');
  const all = calc.replace(/\s+/g, '');

  assert.ok(
    /\.pm__cols\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(all.replace(/\s+/g, '')) ||
      /\.pm__cols\{[^}]*grid-template-columns:minmax\(0,1fr\)/.test(all.replace(/\s+/g, '')),
    'the map does not start as one column',
  );

  for (const sel of ['.pm__model', '.pm__preset', '.pm__horizon', '.pm__entry', '.pm__action']) {
    const re = new RegExp(sel.replace('.', '\\.') + '\\{[^}]*min-height:44px');
    assert.ok(re.test(all.replace(/\s+/g, '')), `${sel} is under the 44px touch floor`);
  }
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

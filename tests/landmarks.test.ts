/**
 * The four defects the 19 September audit found in a browser.
 *
 * Every one of them shipped past a green suite, because none of them is visible
 * to a test that reads markup for content. They are about *computed* behaviour:
 * whether an ancestor is a scroll container, whether focus can leave an overlay,
 * whether a landmark exists at all.
 *
 * These assertions cannot run a browser, so they guard the *cause* rather than
 * the symptom — which is the only thing a static check can honestly do:
 *
 *   sticky nav   →  no `overflow-x: hidden` on an ancestor of the nav
 *   focus escape →  the sheet declares a dialog role and the script sets inert
 *   landmarks    →  every full page route renders exactly one <main>
 *   touch target →  the primary CTA declares a 44px floor
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';

/**
 * Every route a visitor can land on. `blog.html`, not `blog/index.html` — the
 * build format is `file`, so a directory index is a sibling file.
 *
 * The skip link ships from the layout, so it is on every one of these; each
 * therefore needs the target, not just the four the audit happened to open.
 */
const PAGES = [
  'index.html',
  'services.html',
  'products.html',
  'faq.html',
  'blog.html',
  'privacy.html',
  'terms.html',
  '404.html',
];

const read = (f: string) => fs.readFileSync(path.join(DIST, f), 'utf8');
const src = (f: string) => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('every page route has exactly one main landmark', { skip }, () => {
  for (const page of PAGES) {
    const html = read(page);
    const opens = html.match(/<main[\s>]/g) ?? [];
    assert.equal(opens.length, 1, `${page} has ${opens.length} <main> elements, expected 1`);
    assert.match(html, /<main[^>]*id="main"/, `${page}'s <main> has no id for the skip link`);
  }
});

test('the skip link exists and points at the landmark', { skip }, () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /class="skip-link"[^>]*>|<a[^>]*href="#main"/, `${page} has no skip link`);
  }
});

test('the skip link becomes visible when focused', { skip }, () => {
  // A skip link that stays off-screen while focused is the classic broken one:
  // it satisfies a markup audit and helps nobody.
  const css = PAGES.map(read).join('\n');
  assert.match(
    css,
    /\.skip-link:focus-visible\s*\{[^}]*transform:\s*translateY\(0\)/,
    'the skip link has no rule bringing it on screen when focused',
  );
});

test('no ancestor of the sticky nav is a scroll container', { skip }, () => {
  // `overflow-x: hidden` computes the other axis from `visible` to `auto`, which
  // makes the element a scroll container — and `position: sticky` resolves
  // against the nearest scroll container, not the viewport. The nav then scrolls
  // away with the page and takes the only "Book a call" with it.
  //
  // `overflow-x: clip` clips identically without the scroll-container semantics.
  const offenders: string[] = [];

  for (const file of ['src/styles/global.css', 'src/pages/index.astro', 'src/layouts/Prose.astro']) {
    // Comments first. The rule these files now carry *explains* why
    // `overflow-x: hidden` is wrong, so a scan that reads comments flags the
    // explanation as the offence — which this test did on its first run.
    const text = src(file).replace(/\/\*[\s\S]*?\*\//g, '');
    // Only the page-level wrappers matter. A deliberate `overflow-x: hidden` on
    // a small component cannot contain the nav, so it is not this test's business.
    for (const m of text.matchAll(/([^{}]*)\{([^{}]*overflow-x:\s*hidden[^{}]*)\}/g)) {
      const selector = m[1]!.trim().split('\n').pop()!.trim();
      if (/html|body|\.page|\.prose/.test(selector)) offenders.push(`${file} → ${selector}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'these page-level wrappers use overflow-x: hidden and defeat the sticky nav:\n  ' +
      offenders.join('\n  '),
  );
});

test('the nav stays sticky in the built CSS', { skip }, () => {
  const html = read('index.html');
  assert.match(html, /\.nav(\[[^\]]*\])?\{[^{}]*position:sticky/, 'the nav is no longer sticky');
});

test('the mobile sheet is a real modal dialog', { skip }, () => {
  const html = read('index.html');
  const sheet = /<div[^>]*id="nav-sheet"[^>]*>/.exec(html)?.[0] ?? '';

  assert.ok(sheet, 'the nav sheet is missing');
  assert.match(sheet, /role="dialog"/, 'the sheet has no dialog role');
  assert.match(sheet, /aria-modal="true"/, 'the sheet is not marked modal');
  assert.match(sheet, /aria-label=|aria-labelledby=/, 'the sheet has no accessible name');
});

test('the sheet script takes the background out of the tab order', { skip }, () => {
  const js = src('src/scripts/nav-menu.ts');

  assert.match(js, /toggleAttribute\('inert'|setAttribute\('inert'/, 'nothing is made inert');
  assert.match(js, /e\.key !== 'Tab'|key === 'Tab'/, 'Tab is not intercepted for the focus wrap');
  assert.match(js, /shiftKey/, 'Shift+Tab is not handled — the reported escape route');

  // The sheet is nested inside `.page`, so inerting document.body's children
  // would inert the sheet itself. Walking up from the sheet is the fix, and
  // regressing to the simpler version would silently break the whole sheet.
  assert.doesNotMatch(
    js,
    /document\.body\.children\)?\s*\.?\s*filter/,
    'inert is applied to body children, which would also inert the sheet',
  );
});

test('the primary call to action meets the 44px touch floor', { skip }, () => {
  const html = read('index.html');
  assert.match(
    html,
    /\.nav__cta(\[[^\]]*\])?\{[^{}]*min-height:44px/,
    'the nav "Book a call" declares no 44px floor — it measured 42.4px in the audit',
  );
});

test('the emptied scan-line element is gone', { skip }, () => {
  // The animation was removed as an AI tell; the 1px clipping strip it lived in
  // survived, doing nothing, until the audit found it.
  for (const page of PAGES) {
    assert.doesNotMatch(read(page), /hero__scan/, `${page} still carries the dead scan element`);
  }
});

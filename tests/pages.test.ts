/**
 * The sub-pages carry the homepage's design language.
 *
 * The stack, products and the FAQ moved onto their own pages, and each page was
 * given a header block above the section it already contained. Both had an
 * eyebrow, a heading and a lead, so /products printed "TOOLS BUILT FOR THIS
 * WORK" and "Three products, in detail." twice, word for word, and /faq
 * printed "BEFORE YOU BOOK" twice under two near-identical headings.
 *
 * Nothing caught it. The build was green, the tests were green, and the pages
 * were wrong in a way only a person looking at them would see. These assertions
 * are that person.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const PAGES = ['services', 'products', 'faq', 'blog'];

const built = fs.existsSync(path.join(DIST, 'services.html'));
const skip = !built && 'run `npm run build` first';

const body = (page: string) => {
  const html = fs.readFileSync(path.join(DIST, `${page}.html`), 'utf8');
  return html.slice(html.indexOf('<body'));
};
const strip = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();
const all = (src: string, re: RegExp) => [...src.matchAll(re)].map((m) => strip(m[1]!));

test('every page has exactly one h1', { skip }, () => {
  for (const page of PAGES) {
    const h1 = all(body(page), /<h1[^>]*>([\s\S]*?)<\/h1>/g);
    assert.equal(h1.length, 1, `/${page} has ${h1.length} h1 elements: ${h1.join(' | ')}`);
  }
});

test('no page repeats an eyebrow or a heading', { skip }, () => {
  for (const page of PAGES) {
    const src = body(page);
    const eyebrows = all(src, /class="eyebrow[^"]*"[^>]*>([\s\S]*?)<\/div>/g);
    const headings = [
      ...all(src, /<h1[^>]*>([\s\S]*?)<\/h1>/g),
      ...all(src, /<h2[^>]*>([\s\S]*?)<\/h2>/g),
    ];

    const dupe = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
    assert.deepEqual(dupe(eyebrows), [], `/${page} repeats an eyebrow`);
    assert.deepEqual(dupe(headings), [], `/${page} repeats a heading`);

    // And near-duplicates: "Questions people ask." above "Questions people ask
    // before booking." was the FAQ's version of the same mistake.
    for (let i = 0; i < headings.length; i++) {
      for (let j = i + 1; j < headings.length; j++) {
        const a = headings[i]!;
        const b = headings[j]!;
        const shorter = a.length < b.length ? a : b;
        assert.ok(
          shorter.length < 12 || !a.startsWith(shorter.slice(0, 18)) || !b.startsWith(shorter.slice(0, 18)),
          `/${page} has two headings that open the same way: "${a}" and "${b}"`,
        );
      }
    }
  }
});

test('every page opens with the same header pattern as the homepage', { skip }, () => {
  // Centred eyebrow, heading, lead. A left-aligned page header beside centred
  // section headers is the drift that made the sub-pages feel like another site.
  for (const page of PAGES) {
    assert.match(body(page), /class="section-head"/, `/${page} does not use the section-head pattern`);
  }

  const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  assert.match(home, /\.section-head[^{}]*\{[^{}]*text-align:center/, 'section headers are no longer centred');
});

test('the opening section clears the fixed nav without a screen of dead space', { skip }, () => {
  // The nav is fixed and about 70px tall. A full --section-pad on top of that
  // left most of a viewport empty above the first word.
  const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  assert.match(home, /\.section--lead\{padding-top:/, 'the lead-section rule did not ship');

  for (const page of PAGES) {
    assert.match(body(page), /class="[^"]*section--lead/, `/${page} does not mark its opening section`);
  }
});

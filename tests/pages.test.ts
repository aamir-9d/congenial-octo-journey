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
 * November 2026 redesign: the shared header is now PageHero (`.phero` in
 * src/styles/redesign.css) and the shared ending is the closing band (Cta,
 * `data-section="cta"`). The old pattern these tests pinned (`.section-head`
 * inside a `.section--lead`) is gone from every page; the header and closing
 * tests below pin the new one, over every page that was built rather than a
 * hand-kept list.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const PAGES = ['services', 'products', 'faq', 'about', 'payback-calculator', 'case-studies', 'mmp-audit-findings', 'blog'];

const built = fs.existsSync(path.join(DIST, 'services.html'));
const skip = !built && 'run `npm run build` first';

/** Every built page, as a path relative to dist/ ("about.html", "blog/x.html"). */
function builtPages(dir = DIST, prefix = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return e.name === '_astro' ? [] : builtPages(path.join(dir, e.name), `${prefix}${e.name}/`);
    return e.name.endsWith('.html') ? [`${prefix}${e.name}`] : [];
  });
}
const ALL_PAGES = builtPages();
const HOME = 'index.html';
const bodyOf = (file: string) => {
  const html = fs.readFileSync(path.join(DIST, file), 'utf8');
  return html.slice(html.indexOf('<body'));
};
/** The page's opening `.phero` section, whole. It never nests a section. */
const pheroOf = (src: string) => /<section\b[^>]*class="phero[" ][\s\S]*?<\/section>/.exec(src)?.[0] ?? '';

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

test('every page other than the homepage opens with the shared page header', { skip }, () => {
  // PageHero: a centred label, the page's ONE h1, a lead. A page that builds its
  // own header instead is the drift that made the sub-pages feel like another
  // site, so this walks every built page, the blog posts and the service pages
  // included, and asks three things of each: the first section in <main> is the
  // `.phero`, there is exactly one of them, and the page's single h1 is in it.
  assert.ok(ALL_PAGES.length >= 30, `only ${ALL_PAGES.length} pages were found in dist/`);

  for (const file of ALL_PAGES) {
    if (file === HOME) continue;
    const src = bodyOf(file);
    const main = src.slice(src.indexOf('<main'));

    const first = /<section\b[^>]*>/.exec(main)?.[0] ?? '';
    assert.match(first, /class="phero"/, `/${file} does not open with the shared page header`);
    assert.equal((src.match(/class="phero[" ]/g) ?? []).length, 1, `/${file} has more than one page header`);

    const h1 = src.match(/<h1\b/g) ?? [];
    assert.equal(h1.length, 1, `/${file} has ${h1.length} h1 elements`);
    assert.match(pheroOf(src), /<h1 class="phero__title"/, `/${file}: the h1 is not inside the page header`);
  }

  // The homepage has its own hero, built on the same block so the two cannot
  // drift: same class, its own modifier, and the page's one h1.
  const home = bodyOf(HOME);
  const hero = pheroOf(home);
  assert.match(hero, /class="phero hero"[^>]*data-section="hero"/, 'the homepage hero is not built on the shared header');
  assert.equal((home.match(/<h1\b/g) ?? []).length, 1, 'the homepage does not have exactly one h1');
  assert.match(hero, /<h1 class="phero__title phero__title--home"/, 'the homepage h1 is not in its hero');

  const css = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  assert.match(css, /\.phero\{[^{}]*text-align:center/, 'page headers are no longer centred');
});

test('the page header does not open on a screen of dead space', { skip }, () => {
  // History: the nav used to be `position: fixed`, every page needed a
  // `.section--lead` to clear it, and a full --section-pad on top of that left
  // most of a viewport empty above the first word. The nav is now sticky, so it
  // takes its own room in the flow and nothing has to clear it. What is left to
  // guard is the other half: the header's own top padding staying bounded.
  const about = fs.readFileSync(path.join(DIST, 'about.html'), 'utf8');
  assert.match(about, /\.nav(\[[^\]]*\])?\{[^{}]*position:sticky/, 'the nav is no longer sticky; the header needs to clear it again');

  const pad = /\.phero\{[^{}]*padding:clamp\((\d+)px,[\d.]+vw,(\d+)px\)/.exec(about);
  assert.ok(pad, 'the page header padding is no longer a px clamp; update this test');
  assert.ok(Number(pad[1]) <= 72, `phone header padding ${pad[1]}px is too tall`);
  assert.ok(Number(pad[2]) <= 128, `desktop header padding ${pad[2]}px is too tall`);

  // And the retired pattern has not crept back onto a built page.
  for (const file of ALL_PAGES) {
    assert.doesNotMatch(bodyOf(file), /class="[^"]*\bsection--lead\b/, `/${file} still marks a lead section`);
  }
});

test('every page ends on the closing band, except the two that must not', { skip }, () => {
  // Cta is the last thing in <main> on every page. Two pages do not carry it:
  // the homepage, which ends on the full contact form the band links to, and
  // the 404 page, whose board (design/v3/NotFound.dc.html) ends on its three
  // cards; src/pages/404.astro says so. Anything else without a band is a page
  // that was missed.
  const WITHOUT = new Set([HOME, '404.html']);
  const missing: string[] = [];
  const notLast: string[] = [];

  for (const file of ALL_PAGES) {
    const src = bodyOf(file);
    const count = (src.match(/data-section="cta"/g) ?? []).length;

    if (WITHOUT.has(file)) {
      assert.equal(count, 0, `/${file} has grown a closing band; take it out of the exception list`);
      continue;
    }
    if (count !== 1) missing.push(`${file} (${count})`);
    else if (!/<section\b[^>]*data-section="cta"[^>]*>(?:(?!<section\b)[\s\S])*<\/section>\s*<\/main>/.test(src)) notLast.push(file);
  }

  assert.deepEqual(missing, [], 'pages without exactly one closing band: ' + missing.join(', '));
  assert.deepEqual(notLast, [], 'the closing band is not the last thing in <main> on: ' + notLast.join(', '));

  // The band asks for the same thing everywhere and sends people to the form.
  const about = bodyOf('about.html');
  const band = about.slice(about.indexOf('data-section="cta"'));
  assert.match(band, /href="\/#contact"/, 'the closing band no longer leads to the contact form');
  assert.match(bodyOf(HOME), /<section\b[^>]*id="contact"/, 'the homepage lost the form the band links to');
});

/**
 * Every indexable page is in the sitemap.
 *
 * /services, /automation, /products and /faq shipped for weeks as real content
 * pages, linked from the nav on every page of the site, and none of them was in
 * sitemap.xml — which listed four static paths and the blog. Nothing caught it,
 * because nothing was checking the two against each other.
 *
 * So this walks what was actually built rather than a second hand-kept list. A
 * new page is either in the sitemap or it is deliberately `noindex`; there is
 * no third state where it quietly isn't in either.
 */
test('every indexable page that was built is in the sitemap', { skip }, () => {
  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const listed = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname.replace(/\/$/, '')),
  );

  const base = (process.env.SITE_BASE ?? '/').replace(/\/$/, '');
  const missing: string[] = [];

  for (const file of fs.readdirSync(DIST)) {
    if (!file.endsWith('.html')) continue;

    const html = fs.readFileSync(path.join(DIST, file), 'utf8');
    // A page that asks not to be indexed has no business in the sitemap.
    if (/name="robots"[^>]*content="noindex/.test(html)) continue;

    const route = file === 'index.html' ? '' : `/${file.replace(/\.html$/, '')}`;
    if (!listed.has(`${base}${route}`)) missing.push(route || '/');
  }

  assert.deepEqual(
    missing,
    [],
    `built, indexable, and absent from sitemap.xml: ${missing.join(', ')}`,
  );
});

test('sections are not separated by a screen of empty space', () => {
  // --section-pad sits above and below every section, so two meeting sections
  // leave twice its value empty. At up to 124px that was 248px at every break.
  const tokens = fs.readFileSync(path.join('src', 'styles', 'tokens.css'), 'utf8');
  const m = tokens.match(/--section-pad:\s*clamp\((\d+)px,\s*[\d.]+vw,\s*(\d+)px\)/);
  assert.ok(m, '--section-pad is no longer a px clamp; update this test');
  assert.ok(Number(m[1]) <= 56, `phone section padding ${m[1]}px is too tall`);
  assert.ok(Number(m[2]) <= 96, `desktop section padding ${m[2]}px is too tall`);
});

test('no track-record strip, and the figures it held still come from one place', { skip }, async () => {
  // The homepage used to show four numbers under the hero (audits, services,
  // apps, years), and this test checked each against the file that owns it.
  // The owner removed the strip in November 2026: a small audit count on show
  // reads as inexperience. So the strip must stay gone (the audit count is
  // also swept site-wide in tests/seo.test.ts), and the two figures that are
  // still published, in the founder bio on /about, must still agree with
  // src/data/authors.ts.
  const { PORTFOLIO_APPS, YEARS, AUTHORS } = await import('../src/data/authors.ts');

  const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  assert.doesNotMatch(home, /data-section="stats"/, 'the stats strip is back on the homepage');

  // The bio is the published source of the last two.
  assert.ok(AUTHORS.aamir.bio.includes(`${PORTFOLIO_APPS} iOS and Android apps`));
  assert.ok(AUTHORS.aamir.bio.includes(`${YEARS.word} years`));

  // And /about, where a visitor reads them, says the same.
  const about = strip(body('about'));
  assert.ok(about.includes(`${PORTFOLIO_APPS} iOS and Android apps`), '/about states a different portfolio size than authors.ts');
  assert.ok(about.includes(`${YEARS.word} years`), '/about states a different number of years than authors.ts');
});

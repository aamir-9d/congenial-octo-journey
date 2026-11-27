/**
 * Search and AI-answer foundations (SEO, AEO, GEO).
 *
 * What these guard: AI assistants name a business only when the pages make
 * the entity obvious (who it is, named early, linked to real people), and a
 * passage is quoted only when its heading says what it answers. Each test
 * below fails if one of those signals is quietly removed.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES } from '../src/data/services.ts';
import { ALL_FAQ } from '../src/data/faq.ts';
import { FINDINGS, AUDIT_COUNT } from '../src/data/findings.ts';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const built = fs.existsSync(path.join(DIST, 'about.html'));
const skip = !built && 'run `npm run build` first';

const read = (f: string) => fs.readFileSync(path.join(DIST, f), 'utf8');
const nodes = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]!))
    .flatMap((b) => b['@graph'] ?? [b]);
const types = (html: string) => new Set(nodes(html).map((n) => n['@type']));

test('/about names the business and both people, with their profiles', { skip }, () => {
  const html = read('about.html');
  const t = types(html);
  for (const want of ['AboutPage', 'ProfessionalService', 'Person', 'BreadcrumbList']) {
    assert.ok(t.has(want), `/about is missing ${want}`);
  }
  const people = nodes(html).filter((n) => n['@type'] === 'Person');
  assert.equal(people.length, 2, 'both founders');
  for (const p of people) assert.ok(p.sameAs?.length, `${p.name} has no sameAs profile`);
  assert.match(html, /<h1[^>]*>About E2E Apps<\/h1>/);
});

test('/about is in the sitemap and linked from the footer', { skip }, () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/e2eapp\.com\/about<\/loc>/);
  assert.match(read('index.html'), /href="\/about"/);
});

test('every service page names E2E Apps in its opening paragraph', () => {
  for (const s of SERVICES) assert.match(s.lead, /E2E Apps/, `${s.slug} lead does not name the business`);
});

test('service page headings are specific, not shared labels', () => {
  const mistakes = SERVICES.map((s) => s.mistakesTitle);
  assert.equal(new Set(mistakes).size, mistakes.length, 'two pages share a mistakes heading');
  const vague = ['What I check', 'How to test it', 'From plan to live', 'How to check your setup'];
  for (const s of SERVICES) {
    for (const b of s.blocks) assert.ok(!vague.includes(b.title), `${s.slug}: "${b.title}" says nothing on its own`);
  }
});

test('/services and /automation carry structured data beyond breadcrumbs', { skip }, () => {
  const services = nodes(read('services.html'));
  const list = services.find((n) => n['@type'] === 'ItemList');
  assert.ok(list, '/services has no ItemList');
  assert.equal(list.itemListElement.length, SERVICES.length, 'ItemList does not match the service pages');
  assert.ok(types(read('automation.html')).has('Service'), '/automation has no Service node');
});

test('FAQ answers that a service page covers link to it', { skip }, () => {
  const html = read('faq.html');
  const linked = ALL_FAQ.filter((f) => f.service);
  assert.ok(linked.length >= 4, 'fewer than four FAQ answers link to a service page');
  for (const f of linked) {
    assert.ok(SERVICES.some((s) => s.slug === f.service), `unknown service ${f.service}`);
    assert.match(html, new RegExp(`href="/services/${f.service}"`), `/faq does not link ${f.service}`);
  }
});

test('/payback-calculator: own page, in the sitemap, with method and computed examples', { skip }, () => {
  const html = read('payback-calculator.html');
  assert.match(html, /<h1[^>]*>App payback calculator<\/h1>/);
  assert.ok(types(html).has('WebApplication'), 'no WebApplication node');
  assert.match(html, /How the calculator works/);
  assert.match(html, /Worked examples/);
  assert.match(html, /data-payback/, 'the tool itself is missing');
  assert.match(read('sitemap.xml'), /\/payback-calculator</);
  assert.match(read('index.html'), /href="\/payback-calculator"/, 'homepage does not link the full page');
});

test('every blog post links on to a service or tool page', { skip }, () => {
  const dir = path.join(DIST, 'blog');
  const posts = fs.readdirSync(dir).filter((f) => f.endsWith('.html') && f !== 'index.html');
  assert.ok(posts.length >= 15);
  for (const f of posts) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.match(html, /href="\/(services\/[a-z-]+|payback-calculator|automation)"[^>]*>(Service|Tool|AI reporting)/, `${f} has no related page link`);
  }
});

test('service mistake headings stand on their own', { skip }, () => {
  const html = read('services/mobile-attribution-audit.html');
  assert.match(html, /<h3 class="svc__card-title"[^>]*><span class="visually-hidden"[^>]*>Mistake: <\/span>/);
});

test('contact form asks, optionally, where people heard about us', { skip }, () => {
  const html = read('index.html');
  assert.match(html, /name="heard"/);
  assert.doesNotMatch(html, /name="heard"[^>]*required/, 'the source question must stay optional');
});

test('/case-studies lists every case and states its limits', { skip }, () => {
  const html = read('case-studies.html');
  assert.ok(types(html).has('CollectionPage'));
  assert.match(read('sitemap.xml'), /\/case-studies</);
  const cards = html.match(/class="cs__case"/g) ?? [];
  assert.ok(cards.length >= 2, 'fewer than two cases');
  assert.equal((html.match(/What this cannot show:/g) ?? []).length, cards.length, 'a case has no limits note');
});

test('/services routes each situation to a page and names the ways to work together', { skip }, () => {
  const html = read('services.html');
  assert.match(html, /Pick your situation/);
  assert.match(html, /Fixed-price audit/);
  assert.match(html, /href="\/payback-calculator"/);
});

/**
 * The findings page, without the number of audits.
 *
 * This test used to require "<strong>N</strong> of 10 audits" on every finding.
 * The owner decided in November 2026 that the number of audits is never shown:
 * a small count on show reads as inexperience. The counts still exist, in
 * src/data/findings.ts, and still decide everything a reader sees: the order,
 * the length of each bar and the phrase beside it. So the facts this protects
 * are unchanged; only the numeral is gone.
 *
 * The phrase is recomputed here from the count rather than read off the page,
 * so a card that says "In every audit" about a fault found in six of them
 * fails, whichever of the two was edited.
 */
const often = (count: number) => {
  if (count === AUDIT_COUNT) return 'in every audit';
  if (count === AUDIT_COUNT - 1) return 'in nearly every audit';
  if (count * 2 > AUDIT_COUNT) return 'in more than half';
  if (count * 2 === AUDIT_COUNT) return 'in half';
  return 'in some audits';
};
const plain = (h: string) =>
  h
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

test('/mmp-audit-findings: every finding, its fix, and the frequency its count implies', { skip }, () => {
  const html = read('mmp-audit-findings.html');
  assert.match(read('sitemap.xml'), /\/mmp-audit-findings</);

  const cards = [...html.matchAll(/<li\b[^>]*class="[^"]*\bfd__item\b[^"]*"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]!);
  assert.equal(cards.length, FINDINGS.length, `${FINDINGS.length} findings in the data, ${cards.length} cards on the page`);
  assert.ok(FINDINGS.length >= 6, 'too few findings');

  const widths: number[] = [];

  FINDINGS.forEach((f, i) => {
    const card = cards[i]!;
    assert.ok(f.count >= 1 && f.count <= AUDIT_COUNT, `${f.key}: count ${f.count} out of range`);

    // Same order as the data, with its title as the card's heading.
    assert.equal(plain(/<h3\b[^>]*>([\s\S]*?)<\/h3>/.exec(card)?.[1] ?? ''), f.title, `card ${i + 1} is not "${f.title}"`);
    assert.ok(plain(card).includes(f.effect), `${f.key}: the effect on the numbers is missing or reworded`);

    // Its fix: the right page, under the right name.
    const link = new RegExp(`<a\\b[^>]*href="${f.path}"[^>]*>([\\s\\S]*?)<\\/a>`).exec(card);
    assert.ok(link, `${f.key}: no link to ${f.path}`);
    assert.equal(plain(link![1]!), `Fix: ${f.linkLabel}`, `${f.key}: the fix link is mislabelled`);

    // The phrase its count implies, and no other.
    const tag = plain(/<span\b[^>]*class="[^"]*\bfd__count\b[^"]*"[^>]*>([\s\S]*?)<\/span>/.exec(card)?.[1] ?? '');
    assert.equal(tag.toLowerCase(), often(f.count), `${f.key}: found in ${f.count} of the audits but the card says "${tag}"`);

    // The bar is the same proportion, drawn.
    const bar = /class="fd__bar"[^>]*>\s*<i\b[^>]*style="width:\s*([\d.]+)%"/.exec(card);
    assert.ok(bar, `${f.key}: no bar`);
    assert.ok(
      Math.abs(Number(bar![1]) - (f.count / AUDIT_COUNT) * 100) < 0.05,
      `${f.key}: the bar is ${bar![1]}% wide but the count gives ${(f.count / AUDIT_COUNT) * 100}%`,
    );
    widths.push(Number(bar![1]));
  });

  assert.deepEqual([...widths].sort((a, b) => b - a), widths, 'findings are not ordered most common first');
  assert.deepEqual(
    FINDINGS.map((f) => f.count),
    [...FINDINGS].map((f) => f.count).sort((a, b) => b - a),
    'src/data/findings.ts is not ordered most common first',
  );

  // The overview chart draws the same nine bars in the same order.
  const overview = [...html.matchAll(/<i\b[^>]*class="fd__fill[^"]*"[^>]*style="width:\s*([\d.]+)%"/g)].map((m) => Number(m[1]));
  assert.deepEqual(overview, widths, 'the overview chart and the cards disagree');

  // The opening paragraph names the two most common faults; each claim is the
  // one the data supports.
  const text = plain(html.slice(html.indexOf('<body'))).toLowerCase();
  assert.ok(text.includes(`att handling needed fixing ${often(FINDINGS[0]!.count)}`), 'the headline claim about ATT does not match its count');
  assert.ok(
    text.includes(`revenue or purchase events were missing or wrong ${often(FINDINGS[1]!.count)}`),
    'the claim about revenue events does not match its count',
  );

  assert.match(html, /How these were counted/);
  assert.match(html, /What this cannot show/);
});

test('the homepage report card says no more about the findings than the data does', { skip }, () => {
  // HomeInsights writes its two claims as prose ("ATT handled badly in every
  // audit. Revenue or purchase events missing or wrong in nearly all of them.")
  // rather than computing them, so they are checked against the counts here.
  // If a count changes, this fails until the sentence is rewritten.
  const home = plain(read('index.html').replace(/^[\s\S]*<body/, '<body'));
  const [first, second] = FINDINGS;

  if (/ATT handled badly in every audit/.test(home)) {
    assert.equal(first!.title, 'ATT handled badly');
    assert.equal(first!.count, AUDIT_COUNT, 'the homepage says "in every audit" about a fault that was not in every audit');
  }
  if (/missing or wrong in nearly all of them/.test(home)) {
    assert.equal(second!.title, 'Revenue or purchase events missing or wrong');
    assert.ok(
      second!.count >= AUDIT_COUNT - 1 && second!.count < AUDIT_COUNT,
      'the homepage says "nearly all" about a count that is not one short of all',
    );
  }

  // Its four bars are the four most common faults, scaled to the most common.
  const card = /<a\b[^>]*class="[^"]*\breport\b[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(read('index.html'))?.[1] ?? '';
  const rows = [...card.matchAll(/class="report__row"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<i\b[^>]*style="width:\s*([\d.]+)%"/g)];
  const top = Math.max(...FINDINGS.map((f) => f.count));
  assert.deepEqual(
    rows.map((m) => [plain(m[1]!), Number(m[2])]),
    FINDINGS.slice(0, 4).map((f) => [f.title, Math.round((f.count / top) * 100)]),
    'the homepage report bars are not the top four findings in proportion',
  );
});

/**
 * No page shows how many audits there were.
 *
 * The owner's rule, written into docs/redesign-brief.md: never "10 audits",
 * "of 10", "/ 10" or "ten audits", anywhere. One page keeping an old sentence
 * is enough to undo it, so this reads every built page, head and structured
 * data included (a meta description is shown in search results).
 *
 * The patterns follow AUDIT_COUNT, so the sweep keeps working after the next
 * audit. One kind of hit is let through, and only in a blog post: "of 10" in a
 * sentence that has nothing to do with audits ("steps of 10 to 20 per cent").
 * A post body is prose about other people's numbers; everywhere else a bare
 * "of 10" is far more likely to be the count coming back.
 */
test('no built page shows the number of audits', { skip }, () => {
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const n = String(AUDIT_COUNT);
  const word = WORDS[AUDIT_COUNT];
  const num = word ? `(?:${n}|${word})` : n;

  const patterns = [
    // "10 audits", "ten mobile attribution audits", "10 MMP audits"
    new RegExp(`\\b${num}\\s+(?:[a-z-]+\\s+){0,3}audits?\\b`, 'gi'),
    // "6 of 10", "of ten"
    new RegExp(`\\bof\\s+${num}\\b(?!\\s*%)`, 'gi'),
    // "6/10", "6 / 10"
    new RegExp(`\\d\\s*\\/\\s*${n}\\b(?![\\d.%])`, 'g'),
    // "audits: 10", "audits (10)"
    new RegExp(`\\baudits?\\b[^a-z0-9<]{1,4}${num}\\b`, 'gi'),
  ];

  const walk = (dir: string, prefix = ''): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? e.name === '_astro' ? [] : walk(path.join(dir, e.name), `${prefix}${e.name}/`)
        : e.name.endsWith('.html') ? [`${prefix}${e.name}`] : [],
    );

  const pages = walk(DIST);
  assert.ok(pages.length >= 30, `only ${pages.length} pages were found in dist/`);

  const hits: string[] = [];

  for (const file of pages) {
    const text = read(file)
      // Styles and behaviour are not copy; JSON-LD is, so it stays.
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ' ')
      // Drawings: path data is full of digits and slashes are legal in it.
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      // What is left of each tag is its human-readable attributes.
      .replace(/<[^>]+>/g, (tag) => ' ' + [...tag.matchAll(/\b(?:content|alt|title|aria-label)="([^"]*)"/g)].map((m) => m[1]).join(' ') + ' ')
      .replace(/\s+/g, ' ');

    const isPost = /^blog\/(?!index\.html$)/.test(file);

    for (const re of patterns) {
      for (const m of text.matchAll(re)) {
        const around = text.slice(Math.max(0, m.index! - 70), m.index! + m[0].length + 70);
        if (isPost && !/audit/i.test(around)) continue;
        hits.push(`${file}: …${around.trim()}…`);
      }
    }
  }

  assert.deepEqual(hits, [], 'The number of audits is on show:\n  ' + hits.join('\n  '));
});

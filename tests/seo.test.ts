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

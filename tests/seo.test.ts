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

/**
 * The specialist service pages.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SERVICES } from '../src/data/services.ts';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const built = fs.existsSync(path.join(DIST, 'services.html'));
const skip = !built && 'run `npm run build` first';

const read = (slug: string) => fs.readFileSync(path.join(DIST, 'services', `${slug}.html`), 'utf8');
const text = (s: string) =>
  s
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

test('each service page builds with one h1 and one main', { skip }, () => {
  for (const s of SERVICES) {
    const html = read(s.slug);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${s.slug} h1`);
    assert.equal((html.match(/<main[\s>]/g) ?? []).length, 1, `${s.slug} main`);
  }
});

test('titles, descriptions and questions are not shared between pages', () => {
  const unique = (xs: string[], what: string) => assert.equal(new Set(xs).size, xs.length, `duplicate ${what}`);
  unique(SERVICES.map((s) => s.title), 'title');
  unique(SERVICES.map((s) => s.description), 'description');
  unique(SERVICES.flatMap((s) => s.faqs.map((f) => f.q)), 'question');
  unique(SERVICES.flatMap((s) => s.mistakes.map((m) => m.wrong)), 'mistake');
  for (const s of SERVICES) {
    assert.ok(s.title.length <= 65, `${s.slug} title is ${s.title.length} characters`);
    assert.ok(s.description.length <= 160, `${s.slug} description is ${s.description.length} characters`);
  }
});

test('the FAQ structured data matches the visible text', { skip }, () => {
  for (const s of SERVICES) {
    const html = read(s.slug);
    const visible = text(html);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
    const faq = blocks.flatMap((b) => b['@graph'] ?? [b]).find((n) => n['@type'] === 'FAQPage');
    assert.ok(faq, `${s.slug} has no FAQPage`);
    assert.equal(faq.mainEntity.length, s.faqs.length);
    for (const q of faq.mainEntity) {
      assert.ok(visible.includes(q.name), `${s.slug}: "${q.name}" is not visible`);
      assert.ok(visible.includes(q.acceptedAnswer.text), `${s.slug}: answer to "${q.name}" is not visible`);
    }
  }
});

test('each service page is in the sitemap and linked from /services', { skip }, () => {
  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const hub = fs.readFileSync(path.join(DIST, 'services.html'), 'utf8');
  for (const s of SERVICES) {
    assert.ok(sitemap.includes(`/services/${s.slug}<`), `${s.slug} missing from the sitemap`);
    assert.ok(hub.includes(`/services/${s.slug}"`), `${s.slug} not linked from /services`);
  }
});

test('related links and related posts exist', { skip }, () => {
  for (const s of SERVICES) {
    for (const r of s.related) assert.ok(SERVICES.some((x) => x.slug === r && x.slug !== s.slug), `${s.slug} -> ${r}`);
    if (s.post) assert.ok(fs.existsSync(path.join(DIST, `${s.post.href}.html`)), `${s.post.href} does not exist`);
  }
});

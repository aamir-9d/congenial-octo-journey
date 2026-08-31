/**
 * FAQ checks.
 *
 * The one that matters most is the last: the FAQPage JSON-LD must carry the
 * same text the page shows. Structured data that does not match the visible
 * copy is a manual-action risk, and the two are easy to let drift once someone
 * edits one and not the other. They are generated from one array in
 * src/data/faq.ts, and this asserts that stays true in the built output.
 *
 * The voice rules come from the addition brief: no exclamation marks, no
 * "Absolutely", never a bare "yes", and answers long enough to prove something.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { GROUP_A, GROUP_B, ALL_FAQ, toHtml, toText } from '../src/data/faq.ts';

// The FAQ moved to its own page: it was 29% of the homepage and nineteen
// disclosures in front of visitors who had not yet asked a question. The
// content is unchanged and src/data/faq.ts is still the single source.
const DIST = path.resolve(import.meta.dirname, '..', 'dist', 'faq.html');
const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

const faqNode = () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, json] of blocks) {
    const parsed = JSON.parse(json!);
    const node = (parsed['@graph'] ?? [parsed]).find(
      (n: { '@type': string }) => n['@type'] === 'FAQPage',
    );
    if (node) return node;
  }
  throw new Error('no FAQPage node in the page');
};

/** Visible answer text, tags and entities resolved, for comparison. */
const visibleAnswers = () =>
  [...html.matchAll(/<p class="faq__a"[^>]*>([\s\S]*?)<\/p>/g)].map(([, inner]) =>
    inner!
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#8212;/g, '—')
      .replace(/\s+/g, ' ')
      .trim(),
  );

test('the two groups are the sizes the brief specifies', () => {
  // 7 "working together" plus the awkward client-results question, which is an
  // objection rather than a capability question and so belongs in Group A —
  // and has to sit in the group that is open, or answering it openly achieves
  // nothing.
  assert.equal(GROUP_A.length, 8);
  assert.equal(GROUP_B.length, 11);
});

test('no answer is a bare yes, and none breaks the voice rules', () => {
  for (const { q, a } of ALL_FAQ) {
    assert.ok(!a.includes('!'), `exclamation mark in: ${q}`);
    assert.ok(!/\babsolutely\b/i.test(a), `"Absolutely" in: ${q}`);
    assert.ok(!/we(?:'d| would) love/i.test(a), `"we'd love to" in: ${q}`);
    assert.ok(!/^(yes|no)\.?$/i.test(a.trim()), `bare yes/no answer: ${q}`);
    // Long enough to demonstrate something rather than assert it.
    assert.ok(a.length > 110, `answer too thin to prove anything: ${q}`);
  }
});

test('every question is unique and reads as a question', () => {
  const seen = new Set<string>();
  for (const { q } of ALL_FAQ) {
    assert.ok(!seen.has(q), `duplicate question: ${q}`);
    seen.add(q);
    assert.ok(q.trim().endsWith('?'), `not phrased as a question: ${q}`);
  }
});

test('inline markers render as markup and never survive into plain text', () => {
  const withCode = GROUP_B.find((i) => i.a.includes('`'))!;
  assert.match(toHtml(withCode.a), /<code>gclid<\/code>/);
  assert.ok(!toText(withCode.a).includes('`'));

  const withEm = GROUP_B.find((i) => i.a.includes('*'))!;
  assert.match(toHtml(withEm.a), /<em>use the value from Firebase, otherwise use zero<\/em>/);
  assert.ok(!toText(withEm.a).includes('*'));

  // Escaping runs before the markers, so copy can never inject markup.
  assert.match(toHtml('a < b & c'), /a &lt; b &amp; c/);
});

test('exactly one row per group is open by default', { skip }, () => {
  const rows = (html.match(/<details class="faq__item"/g) ?? []).length;
  const open = (html.match(/<details class="faq__item"[^>]*\sopen/g) ?? []).length;

  assert.equal(rows, ALL_FAQ.length);
  // Collapsed-by-default is what makes 19 rows scannable; two open, one to
  // show each group is expandable.
  assert.equal(open, 2);
});

test('the FAQ has its own page, reachable from the nav', { skip }, () => {
  // It used to sit between the founders and the closing ask on the homepage,
  // where it was 29% of the page. Now it is a destination, so what matters is
  // that it exists, carries the questions, and can be found.
  assert.ok(html.includes('id="faq"'), 'the FAQ section did not render on its page');

  const home = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'dist', 'index.html'), 'utf8');
  assert.ok(!home.includes('id="faq"'), 'the FAQ is still on the homepage');
  assert.match(home, /href="[^"]*\/faq"/, 'the homepage nav does not link to the FAQ page');
});

test('the FAQPage JSON-LD carries exactly the text the page shows', { skip }, () => {
  const node = faqNode();

  assert.equal(node.mainEntity.length, ALL_FAQ.length);

  const shown = visibleAnswers();
  assert.equal(shown.length, ALL_FAQ.length, 'a rendered answer is missing');

  for (const entry of node.mainEntity) {
    assert.equal(entry['@type'], 'Question');
    assert.equal(entry.acceptedAnswer['@type'], 'Answer');

    const structured = entry.acceptedAnswer.text.replace(/\s+/g, ' ').trim();
    assert.ok(
      shown.includes(structured),
      `structured text has no matching visible answer — this is the drift that\n` +
        `earns a manual action:\n  ${structured.slice(0, 120)}…`,
    );

    const question = ALL_FAQ.find((i) => i.q === entry.name);
    assert.ok(question, `JSON-LD names a question the page does not ask: ${entry.name}`);
  }

  // And the markers must not leak into structured data.
  const serialised = JSON.stringify(node);
  assert.ok(!serialised.includes('`'), 'a code marker reached the JSON-LD');
});

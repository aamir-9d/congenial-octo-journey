/**
 * Product card checks.
 *
 * The cards state a page count and a file size and then link to the document.
 * That is a promise about a file, and files move. These assert the promise
 * against the actual bytes in public/pdf/, so a card can never advertise a
 * document that is missing, renamed, or a different length than it claims.
 *
 * Page counts are read from the PDF itself rather than trusted.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PRODUCTS, megabytes } from '../src/data/products.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const PDF_DIR = path.join(ROOT, 'public', 'pdf');
const DIST = path.join(ROOT, 'dist', 'index.html');

const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

/** Count `/Type /Page` objects, ignoring `/Pages` tree nodes. */
function pageCount(file: string): number {
  const raw = fs.readFileSync(file).toString('latin1');
  return (raw.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

test('every card links to a PDF that actually exists', () => {
  for (const p of PRODUCTS) {
    const file = path.join(PDF_DIR, p.file);
    assert.ok(fs.existsSync(file), `${p.name} links to a missing file: public/pdf/${p.file}`);
    assert.ok(
      fs.readFileSync(file).subarray(0, 5).toString('latin1') === '%PDF-',
      `${p.name} links to something that is not a PDF`,
    );
  }
});

test('the size and page count each card claims match the real file', () => {
  for (const p of PRODUCTS) {
    const file = path.join(PDF_DIR, p.file);
    const actualBytes = fs.statSync(file).size;
    const actualPages = pageCount(file);

    assert.equal(
      actualBytes,
      p.bytes,
      `${p.name}: card says ${megabytes(p.bytes)}, file is ${megabytes(actualBytes)}`,
    );
    assert.equal(
      actualPages,
      p.pages,
      `${p.name}: card says ${p.pages} pages, file has ${actualPages}`,
    );
  }
});

test('ids and files are unique, and nothing is left unlabelled', () => {
  const ids = new Set<string>();
  const files = new Set<string>();

  for (const p of PRODUCTS) {
    assert.ok(!ids.has(p.id), `duplicate product id: ${p.id}`);
    assert.ok(!files.has(p.file), `two products point at the same PDF: ${p.file}`);
    ids.add(p.id);
    files.add(p.file);

    assert.ok(p.name.length > 2, `product has no name: ${p.id}`);
    assert.ok(p.summary.length > 80, `summary too thin to be worth a card: ${p.name}`);
    assert.ok(p.stats.length >= 2, `card needs at least two figures: ${p.name}`);
    assert.match(p.id, /^[a-z0-9-]+$/, `id is not a clean slug: ${p.id}`);
  }
});

test('cards render, are whole-card links, and open in a new tab', { skip }, () => {
  const cards = [...html.matchAll(/<a class="products__card"[^>]*>/g)];
  assert.equal(cards.length, PRODUCTS.length);

  for (const [tag] of cards) {
    assert.match(tag, /target="_blank"/, 'overview opens in the current tab, losing the page');
    assert.match(tag, /rel="noopener"/, 'target=_blank without rel=noopener');
    assert.match(tag, /aria-label="[^"]*opens in a new tab"/, 'new tab is not announced');
    assert.match(tag, /data-product="[a-z0-9-]+"/, 'card is not tracked');
  }

  // One tab stop per card. A card wrapping a second link or button would give
  // two stops to the same destination.
  const section = html.slice(html.indexOf('id="products"'), html.indexOf('data-section="founders"'));
  const links = (section.match(/<a\s/g) ?? []).length;
  assert.equal(links, PRODUCTS.length, 'the section has more links than cards');
  assert.equal((section.match(/<button/g) ?? []).length, 0, 'a button inside a card link');
});

test('each href resolves under the deployed base path', { skip }, () => {
  for (const p of PRODUCTS) {
    const href = new RegExp(`href="([^"]*${p.file.replace(/\./g, '\\.')})"`).exec(html);
    assert.ok(href, `${p.name} has no link in the built page`);
    // Astro is configured with base "/congenial-octo-journey"; a bare "/pdf/…"
    // would 404 on the project URL.
    assert.match(href[1]!, /^\/[^/].*\/pdf\//, `href does not carry the base path: ${href[1]}`);

    const onDisk = path.join(ROOT, 'dist', href[1]!.replace(/^\/[^/]+/, ''));
    assert.ok(fs.existsSync(onDisk), `built page links to ${href[1]} which is not in dist/`);
  }
});

test('the section sits between the audit findings and the founders', { skip }, () => {
  const proof = html.indexOf('data-section="proof"');
  const products = html.indexOf('id="products"');
  const founders = html.indexOf('data-section="founders"');

  assert.ok(proof > -1 && products > -1 && founders > -1, 'a section marker is missing');
  assert.ok(proof < products, 'products render before the audit findings');
  assert.ok(products < founders, 'products render after the founders');
});

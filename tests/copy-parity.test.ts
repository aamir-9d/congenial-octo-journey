/**
 * Copy parity against the original Claude Design export.
 *
 * The brief's first rule is that no string changes. This extracts the visible
 * text stream from the export's template — with its {{ }} bindings resolved to
 * the same defaults the port ships — and from the built page, then asserts they
 * carry the same copy.
 *
 * Comparison ignores whitespace entirely. The port wraps some bound values in
 * <span> so the client can update them in place, which splits a text run the
 * export had as one piece; that changes nothing on screen but does change where
 * the spaces fall. Ignoring whitespace makes the check robust to that while
 * still catching a changed, missing, reordered or re-punctuated string.
 *
 * Requires `npm run build` first. Skips itself if dist/ is absent so a bare
 * `npm test` still runs the model suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { computeView, INITIAL_STATE } from '../src/scripts/calc-model.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const ORIGINAL = path.join(ROOT, 'E2E Apps Homepage.dc.html');
const PORT = path.join(ROOT, 'dist', 'index.html');

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', copy: '©', middot: '·',
  times: '×', rarr: '→', ne: '≠', minus: '−',
};

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

/**
 * Remove every element carrying `data-added`, and its subtree.
 *
 * Phase 2 onward adds markup the export never had — the contact form, the
 * Calendly block, the consent banner. Each is tagged at its root with
 * `data-added` so this check can lift it out and go on comparing the design's
 * own copy, instead of being switched off the moment the page grows.
 */
function stripAdded(html: string): string {
  const opener = /<([a-z][a-z0-9-]*)\b[^>]*\sdata-added[\s=>][^>]*>/i;
  let out = html;

  for (;;) {
    const match = opener.exec(out);
    if (!match) return out;

    const tag = match[1]!.toLowerCase();
    const start = match.index;

    if (match[0].endsWith('/>')) {
      out = out.slice(0, start) + out.slice(start + match[0].length);
      continue;
    }

    // Walk to the matching close tag, counting nested opens of the same name.
    const scan = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    scan.lastIndex = start;
    let depth = 0;
    let end = -1;
    for (let m = scan.exec(out); m; m = scan.exec(out)) {
      depth += m[1] === '/' ? -1 : 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    }

    if (end === -1) throw new Error(`unbalanced <${tag} data-added> — cannot strip it reliably`);
    out = out.slice(0, start) + out.slice(end);
  }
}

/** Visible text runs, in document order. */
function textRuns(html: string): string[] {
  return decode(
    stripAdded(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<head[\s\S]*?<\/head>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .split('')
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Bindings the port deliberately does not render as text.
 * i0–i9 are the accordion +/− glyphs, which are now CSS ::before content on
 * <details>[open] rather than a template value.
 */
const NOT_TEXT_IN_PORT = /^\{\{\s*i[0-9]\s*\}\}$/;

function originalText(): string[] {
  const view = computeView(INITIAL_STATE) as Record<string, unknown>;
  let src = fs.readFileSync(ORIGINAL, 'utf8');
  src = src.slice(src.indexOf('</helmet>') + '</helmet>'.length, src.lastIndexOf('</x-dc>'));
  src = src.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (m, key: string) => {
    const value = view[key];
    return value === undefined || typeof value === 'object' ? m : String(value);
  });
  return textRuns(src).filter((run) => !NOT_TEXT_IN_PORT.test(run));
}

const distExists = fs.existsSync(PORT);

test('every string in the export survives into the port, unchanged', { skip: !distExists && 'run `npm run build` first' }, () => {
  const squash = (runs: string[]) => runs.join('').replace(/\s+/g, '');

  const original = squash(originalText());
  const port = squash(textRuns(fs.readFileSync(PORT, 'utf8')));

  if (original !== port) {
    let i = 0;
    while (i < original.length && i < port.length && original[i] === port[i]) i++;
    assert.fail(
      `Copy diverges at character ${i}.\n` +
        `  export: ...${original.slice(Math.max(0, i - 80), i + 120)}\n` +
        `  port:   ...${port.slice(Math.max(0, i - 80), i + 120)}`,
    );
  }
});

test('the data-added strip is actually doing something', { skip: !distExists && 'run `npm run build` first' }, () => {
  // Guards the check above from passing for the wrong reason. If a refactor
  // drops the `data-added` marker, the parity test would quietly start
  // comparing Phase 2 copy against an export that never had it — and fail
  // confusingly. If it drops the added sections instead, this catches that too.
  const html = fs.readFileSync(PORT, 'utf8');
  assert.match(html, /data-added=/, 'no data-added markers in the built page');
  assert.match(html, /Tell me what you're running\./, 'the contact form is missing from the page');

  const compared = textRuns(html).join(' ');
  assert.ok(
    !compared.includes("Tell me what you're running."),
    'Phase 2 copy leaked into the parity comparison — the strip did not run',
  );
  assert.ok(
    compared.includes('Three findings, from real audits.'),
    'the strip removed more than it should have',
  );
});

test('no template binding leaks into the built page', { skip: !distExists && 'run `npm run build` first' }, () => {
  const html = fs.readFileSync(PORT, 'utf8');
  assert.doesNotMatch(html, /\{\{/, 'an unresolved {{ binding }} reached the output');
  assert.doesNotMatch(html, /\bundefined\b/, 'a binding resolved to undefined');
  assert.doesNotMatch(html, /\bNaN\b/, 'a computed figure resolved to NaN');
});

test('the runtime the export depended on is gone', { skip: !distExists && 'run `npm run build` first' }, () => {
  const html = fs.readFileSync(PORT, 'utf8');
  for (const needle of ['support.js', 'image-slot', 'DCLogic', 'sc-if', 'x-dc', 'style-hover']) {
    assert.ok(!html.includes(needle), `built page still references ${needle}`);
  }
});

test('no third-party font or script host is contacted', { skip: !distExists && 'run `npm run build` first' }, () => {
  const html = fs.readFileSync(PORT, 'utf8');
  for (const host of ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com']) {
    assert.ok(!html.includes(host), `built page still references ${host}`);
  }
});

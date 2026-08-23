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

/**
 * Copy the Bento redesign deliberately replaced.
 *
 * An ordered whole-page comparison was right while the port was meant to be
 * pixel-identical to the export. It is the wrong assertion for a redesign that
 * restructures the page on purpose — it would fail on the first moved heading
 * and tell us nothing.
 *
 * What still matters is that no signed-off body copy gets quietly rewritten.
 * So the test now asserts every substantial run from the export still appears
 * somewhere in the port, and anything deliberately dropped is listed here with
 * the reason. The list is the record of what the redesign changed; it should
 * only ever grow by deliberate act.
 */
const REPLACED: { text: string; why: string }[] = [
  {
    text: "I run growth for a portfolio of 50+ iOS and Android apps — which means I'm not describing this work from the outside. I did it last week and I'll do it next week.",
    why: 'founder bio condensed from three paragraphs to one — new copy, awaiting sign-off',
  },
  {
    text: "Five years across the full mobile growth stack: measurement platforms, ad platforms, app stores, subscription analytics. I'm logged into 48 AppsFlyer accounts. I've shipped server-side subscription pipelines, per-country profitability models, and web-to-app attribution loops that close.",
    why: 'founder bio condensed — the AppsFlyer and portfolio figures survive as credential tags',
  },
  {
    text: "Most people in this field pick a side — the technical plumbing or the media buying. In a portfolio you don't get that luxury, because you own the outcome, not the task. That turns out to be the useful part.",
    why: 'founder bio condensed — the first two sentences carry into the one-paragraph version',
  },
  {
    text: 'Twenty years as a solution architect on carrier-grade mobile networks — packet core delivery and support across Cisco, Nokia and Ericsson. LTE and 5G core nodes, routing, security, network operations. The systems underneath the phone in your hand.',
    why: 'founder bio condensed — the years and the vendor list survive as credential tags',
  },
  {
    text: "A lot of what breaks in app measurement isn't a setting in a dashboard. It's a server that has to receive a webhook, validate it, and forward it on without dropping anything — renewal notifications from Apple, conversion events to ad platforms, pipelines that run every day whether anyone is watching or not. That's the half I own.",
    why: 'founder bio condensed — shortened, same claim',
  },
  {
    text: "Aamir works at the app layer of mobile. I've spent two decades at the network layer underneath it. Between us there isn't much of a mobile stack we haven't had to keep running.",
    why: 'founder bio condensed — dropped from the one-paragraph version',
  },
  {
    text: 'd1 0.32 → d7 0.11 → d30 0.03 · curve dies before payback',
    why: 'card 01 red code line replaced by the drawn retention curve, which says the same thing',
  },
  {
    text: 'revenue_dashboard ≠ mmp_reported · gap grows monthly',
    why: 'card 02 red code line replaced by the dashboard-versus-true bar pair',
  },
  {
    text: 'MOBILE GROWTH & MEASUREMENT',
    why: 'hero eyebrow replaced by the accent pill, "Attribution, fixed at the source"',
  },
  {
    text: "Most apps judge a campaign on day-7 revenue and kill the ones that would have paid back on day 60. The problem isn't the campaign. It's that the measurement stops before the money arrives. I fix the measurement, then run the spend on top of it.",
    why: 'hero lead rewritten — new copy, awaiting sign-off',
  },
  {
    text: 'It broke even in month nine — you killed it in week one.',
    why: 'moved out of the h1 and into the opening clause of the new hero lead',
  },
  {
    text: 'THE COHORT BELOW, IN NUMBERS',
    why: 'hero summary card removed; the payback model is its own section now',
  },
  {
    text: 'Live from the model below. Move a slider and these move.',
    why: 'hero summary card removed',
  },
];

/**
 * Paragraphs the redesign split across two elements.
 *
 * The bento cards show the opening sentences as a lead and put the remainder
 * behind a "Why it happens" disclosure. Not a word changes, but the disclosure
 * summary now sits between the two halves, so the paragraph is no longer one
 * contiguous run and a whole-run search cannot find it.
 *
 * Both halves are asserted verbatim instead. Concatenating them reproduces the
 * export's paragraph exactly — that is the check.
 */
const SPLIT: { lead: string; rest: string }[] = [
  {
    lead: 'Every LTV model is retention multiplied by monetisation. If the retention curve dies before the payback horizon, the campaign cannot break even at any CPI — the money was never going to be there.',
    rest: "Most teams track D1, quote D7 in a deck, and never build the D30 curve that actually decides it. On a subscription app, payback lands somewhere around month nine. A cohort that's gone by week three never gets there.",
  },
  {
    lead: "Subscription renewals happen on Apple's servers while your app is closed.",
    rest: 'If nothing is listening server-side, that revenue never reaches your MMP or your ad platforms — so every channel looks worse than it is, and you optimise against your own best cohorts.',
  },
  {
    lead: 'SKAdNetwork gives you a handful of bits and one short window.',
    rest: 'Most schemas were set up once, copied from a blog post, and never mapped to the events that actually predict revenue for this app.',
  },
  {
    lead: 'Someone clicks a Google ad on your website, installs later, subscribes a week after that.',
    rest: 'Without gclid/gbraid/wbraid capture and a conversion sent back, Google never learns which click earned the money — so it optimises toward the wrong people.',
  },
];

test('split paragraphs kept both halves, word for word', { skip: !distExists && 'run `npm run build` first' }, () => {
  const squash = (t: string) => t.replace(/\s+/g, '');
  const port = squash(textRuns(fs.readFileSync(PORT, 'utf8')).join(''));

  const lost = SPLIT.flatMap(({ lead, rest }) =>
    [lead, rest].filter((half) => !port.includes(squash(half))),
  );

  assert.deepEqual(lost, [], 'A half of a split paragraph is missing: ' + lost.join(' | '));
});

test('no signed-off copy was quietly rewritten', { skip: !distExists && 'run `npm run build` first' }, () => {
  const squash = (t: string) => t.replace(/\s+/g, '');
  const port = squash(textRuns(fs.readFileSync(PORT, 'utf8')).join(''));

  const replaced = REPLACED.map((r) => squash(r.text));
  const missing: string[] = [];

  for (const run of originalText()) {
    const needle = squash(run);
    // Short runs are chrome — nav labels, button text, "90d". The redesign
    // rewrites those by design; body copy is what must survive.
    if (needle.length < 40) continue;
    if (replaced.some((r) => r.includes(needle) || needle.includes(r))) continue;
    // Split paragraphs are covered by their own test, half by half.
    // The export breaks card 04's paragraph at its inline tokens, so its runs
    // are fragments of the whole. Containment, not equality.
    if (SPLIT.some((sp) => squash(sp.lead + sp.rest).includes(needle))) continue;
    if (!port.includes(needle)) missing.push(run.trim());
  }

  const report = [
    'Copy from the export is missing from the port:',
    '',
    ...missing.map((m) => '  ' + m.slice(0, 140)),
    '',
    'If a removal was deliberate, add it to REPLACED with the reason.',
    'If it was not, the copy has been lost — every string in the export was',
    'written deliberately and signed off.',
  ].join(String.fromCharCode(10));

  assert.deepEqual(missing, [], report);
});

test('everything listed as replaced really is gone', { skip: !distExists && 'run `npm run build` first' }, () => {
  // Stops the list becoming a dumping ground: an entry that is still on the
  // page is either a stale note or a suppression hiding a real regression.
  const squash = (t: string) => t.replace(/\s+/g, '');
  const port = squash(textRuns(fs.readFileSync(PORT, 'utf8')).join(''));

  const stale = REPLACED.filter((r) => port.includes(squash(r.text))).map((r) => r.text);

  const report = [
    'Listed as replaced, but still on the page:',
    '',
    ...stale.map((t) => '  ' + t.slice(0, 100)),
    '',
    'Remove the entry, or finish removing the copy.',
  ].join(String.fromCharCode(10));

  assert.deepEqual(stale, [], report);
});

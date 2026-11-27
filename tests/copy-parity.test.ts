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
// The homepage restructure moved the stack, products and the FAQ onto their own
// pages. The export's copy still all ships — it just no longer all ships on one
// page — so parity is checked against the built pages together.
// about.html: the founders section is hidden on the homepage until the portraits
// exist, and its signed-off copy lives on /about meanwhile.
// case-studies.html, automation.html: the November 2026 homepage rebuild took
// the case study and automation sections off the homepage; those pages are
// where their copy lives now, so they are searched too. (Adding a page also
// makes the "really is gone" test below stricter, which is the point.)
const PORT_PAGES = ['index.html', 'services.html', 'products.html', 'faq.html', 'about.html', 'payback-calculator.html', 'case-studies.html', 'automation.html'].map((p) =>
  path.join(ROOT, 'dist', p),
);
const PORT = PORT_PAGES[0]!;

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
    text: 'Nothing gets handed off. You talk to the two people doing the work.',
    why: 'founders closing line: hidden with the homepage section until portraits exist, and left off /about, where it repeated the section heading and the page lead (2026-11-27)',
  },
  {
    text: 'Your dashboard says the campaign is losing money.',
    why: 'hero headline replaced at the request of 2026-09-20 — the page now opens on what the work delivers rather than on a claim about the reader being wrong',
  },
  {
    text: "Your curve isn't a power law. That usually means a broken onboarding step, not a bad model.",
    why: 'D7 cross-check copy — the revision brief forbids claiming a mismatch proves an onboarding defect; it now says the model and the data disagree without asserting which is wrong',
  },
  {
    text: "Four stations. The output of the last one is the input to the first. That's the point.",
    why: 'Loop section lead replaced by the approved circular design — loop-circular-revision.png',
  },
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

  /* --- The November 2026 homepage rebuild -----------------------------------
     The owner approved new boards (design/v3/) and the homepage was rebuilt
     from them: see the header of src/pages/index.astro. Thirteen runs of the
     export's body copy went with the sections that were redrawn or removed.
     Each was searched for on every page above before it was listed here, and
     the test below fails if one of them comes back. The old components
     (src/components/Loop.astro, Proof.astro) still hold the wording, unused. */
  {
    text: 'Get the raw signal right at the source. Event taxonomy and naming, a written tracking plan the developers can actually implement, SDK integration and QA, consent and ATT prompt sequencing, debug and sandbox validation before anything ships.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 01 paragraph is on no page. Station 01 now reads "Get events, consent and server delivery working together."',
  },
  {
    text: 'Outcome: Events fire when they should, named what they should be, carrying what they should carry.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 01 outcome line is on no page. The station now ends "The output is a reliable source signal."',
  },
  {
    text: 'Connect the signal to a source. MMP configuration and audit, SKAdNetwork and AdAttributionKit conversion schemas, attribution window alignment, server-to-server events, deferred deep linking, conversion APIs to every ad platform, web-to-app click capture.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 02 paragraph is on no page. Station 02 now reads "Connect installs and revenue to sources. Check the gaps in reporting."',
  },
  {
    text: 'Outcome: Every install and every dollar traceable to the click that caused it.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 02 outcome line is on no page. The station now ends "The output is attribution you can inspect."',
  },
  {
    text: 'Turn clean data into a spending decision. Cohort LTV and retention decay, CAC payback curves by channel and by country, trial-to-paid economics, breakeven ceilings per market, paywall funnel diagnosis.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 03 paragraph is on no page. Station 03 now reads "Use retention, LTV and payback to set spending limits by market."',
  },
  {
    text: 'Outcome: A defensible number for what you can afford to pay for a user — market by market.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 03 outcome line is on no page. The station now ends "The output is a defensible acquisition ceiling."',
  },
  {
    text: 'Spend against those numbers. Google Ads app and web-to-app campaigns, Apple Ads, Meta, TikTok, ASO and store listing strategy, paywall and pricing tests, ad monetisation and mediation.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 04 paragraph is on no page. Station 04 now reads "Run campaigns and monetisation tests. Feed the results back into measurement."',
  },
  {
    text: 'Outcome: Budget deployed where the arithmetic says it works — and fresh signal flowing back into Station 01.',
    why: 'homepage rebuilt November 2026; the Full Loop was redrawn from the approved board (design/v3/Main.dc.html) as four photograph rows with two or three short sentences each, and this station 04 outcome line is on no page. The station now ends "The output is spend informed by evidence."',
  },
  {
    text: 'Most consultants stop after Station 02. The loop only closes when the same person walks all four.',
    why: 'homepage rebuilt November 2026; the Loop closing line became the section aside, which keeps its first sentence ("Most consultants stop after station 02.") and drops the second. The heading now carries the point: "four stations, one person accountable"',
  },
  {
    text: 'A dashboard reported an 11% trial-to-paid rate. The verified figure was closer to 17%. Every budget decision made from that dashboard had been built on the wrong number.',
    why: 'homepage rebuilt November 2026; the proof section (three findings from past audits) is not on the new homepage and was not moved to another page. Its two figures survive as the 11% and 17% bars on station 02 of the loop; the sentence does not',
  },
  {
    text: 'Share of new users in one app who ever reached a payment screen. Nobody had measured it. That single number was the reason the app lost money.',
    why: 'homepage rebuilt November 2026; the proof section (three findings from past audits) is not on the new homepage and was not moved to another page. This finding is not referred to anywhere on the rebuilt site',
  },
  {
    text: 'At one portfolio audit, the majority of spend was going to countries that mathematically could not break even. It had run that way for months.',
    why: 'homepage rebuilt November 2026; the proof section (three findings from past audits) is not on the new homepage and was not moved to another page. This finding is not referred to anywhere on the rebuilt site',
  },
  {
    text: 'Client names withheld. Details available on a call.',
    why: 'homepage rebuilt November 2026; the proof section (three findings from past audits) is not on the new homepage and was not moved to another page. This was its footnote. The statement itself is still made where client work is shown: /case-studies opens "Client names are withheld." and marks every case "client withheld" (tests/case-study.test.ts)',
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
  // Each page is extracted on its own and the results concatenated — never the
  // raw HTML. stripAdded() walks from a `data-added` opener to its matching
  // close, so on one long string of four concatenated documents it can run past
  // the end of one page and swallow the start of the next.
  const port = squash(
    PORT_PAGES.filter((p) => fs.existsSync(p))
      .map((p) => textRuns(fs.readFileSync(p, 'utf8')).join(''))
      .join(''),
  );

  const lost = SPLIT.flatMap(({ lead, rest }) =>
    [lead, rest].filter((half) => !port.includes(squash(half))),
  );

  assert.deepEqual(lost, [], 'A half of a split paragraph is missing: ' + lost.join(' | '));
});

test('no signed-off copy was quietly rewritten', { skip: !distExists && 'run `npm run build` first' }, () => {
  const squash = (t: string) => t.replace(/\s+/g, '');
  // Each page is extracted on its own and the results concatenated — never the
  // raw HTML. stripAdded() walks from a `data-added` opener to its matching
  // close, so on one long string of four concatenated documents it can run past
  // the end of one page and swallow the start of the next.
  const port = squash(
    PORT_PAGES.filter((p) => fs.existsSync(p))
      .map((p) => textRuns(fs.readFileSync(p, 'utf8')).join(''))
      .join(''),
  );

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
  // Each page is extracted on its own and the results concatenated — never the
  // raw HTML. stripAdded() walks from a `data-added` opener to its matching
  // close, so on one long string of four concatenated documents it can run past
  // the end of one page and swallow the start of the next.
  const port = squash(
    PORT_PAGES.filter((p) => fs.existsSync(p))
      .map((p) => textRuns(fs.readFileSync(p, 'utf8')).join(''))
      .join(''),
  );

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

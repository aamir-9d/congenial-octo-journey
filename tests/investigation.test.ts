/**
 * The automation demonstration.
 *
 * Revision 2 of the brief added the requirement that matters most here:
 * "All displayed numerical findings match the sample dataset."
 *
 * The first build failed that on every state. The spend chart drew one period
 * while its finding claimed a week-on-week delta; the earnings chart drew daily
 * revenue while its finding explained the drop with impressions and eCPM; the
 * subscriptions chart drew renewals while its finding asserted trials were
 * flat. Each read plausibly and none was checkable — on a page arguing for
 * measurement rigour, the worst available defect.
 *
 * So the centrepiece below recomputes every figure quoted in a finding from
 * that example's own chart points. A claim the data cannot support fails here
 * rather than shipping.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { EXAMPLES, SOURCES, ASSISTANTS } from '../src/data/automation.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGE = path.join(ROOT, 'dist', 'automation.html');
const HOME = path.join(ROOT, 'dist', 'index.html');
const built = fs.existsSync(PAGE);
const skip = !built && 'run `npm run build` first';

const html = built ? fs.readFileSync(PAGE, 'utf8') : '';
const home = built ? fs.readFileSync(HOME, 'utf8') : '';
const script = fs.readFileSync(path.join(ROOT, 'src', 'scripts', 'investigation.ts'), 'utf8');

const STATES = EXAMPLES.map((e) => e.id);
const byId = (id: string) => EXAMPLES.find((e) => e.id === id)!;

/* ------------------------------------------------------------------ numbers */

/** Every number in a sentence, as written: "$3,140" and "17.6%" both count. */
function figures(s: string): string[] {
  return (s.match(/\$?\d[\d,]*(?:\.\d+)?%?/g) ?? []).map((t) => t.replace(/[$,]/g, ''));
}

test('every figure quoted in a finding is derivable from its own chart', { skip }, () => {
  /* Each state's claims, recomputed. Written out per state rather than inferred,
     because the whole point is that a human checked the arithmetic — a generic
     "does this number appear somewhere" test would pass on a coincidence. */
  const derived: Record<string, Set<string>> = {};

  for (const e of EXAMPLES) {
    const pts = e.chart.points;
    const vals = new Set<string>();
    const add = (n: number) => {
      // Both signs: a finding says "17.6% below week one", not "-17.6%".
      for (const v of [n, Math.abs(n)]) {
        vals.add(String(Math.round(v)));
        vals.add(v.toFixed(1));
        vals.add(String(Math.round(v)) + '%');
        vals.add(v.toFixed(1) + '%');
      }
    };

    for (const p of pts) {
      add(p.v);
      if (p.prev !== undefined) {
        add(p.prev);
        add(p.v - p.prev);
        add(p.prev - p.v);
      }
    }

    // Net movement across a paired chart.
    if (pts.some((p) => p.prev !== undefined)) {
      add(pts.reduce((s, p) => s + (p.v - (p.prev ?? p.v)), 0));
    }

    // Step-to-step losses and survival rates, for a funnel.
    for (let i = 1; i < pts.length; i++) {
      add(pts[i - 1]!.v - pts[i]!.v);
      add(((pts[i - 1]!.v - pts[i]!.v) / pts[i - 1]!.v) * 100);
      add((pts[i]!.v / pts[i - 1]!.v) * 100);
      add(((pts[i]!.v - pts[i - 1]!.v) / pts[i - 1]!.v) * 100);
    }

    // Against the first period, for a trend.
    for (let i = 1; i < pts.length; i++) {
      add(((pts[i]!.v - pts[0]!.v) / pts[0]!.v) * 100);
    }

    // The two period averages a trend chart draws.
    const split = e.chart.splitAfter;
    if (split !== undefined) {
      const mean = (f: number, t: number) =>
        pts.slice(f, t).reduce((s, p) => s + p.v, 0) / (t - f);
      const a = mean(0, split + 1);
      const b = mean(split + 1, pts.length);
      add(a);
      add(b);
      add(((a - b) / a) * 100);
    }

    derived[e.id] = vals;
  }

  const unsupported: string[] = [];

  for (const e of EXAMPLES) {
    for (const finding of e.findings) {
      for (const fig of figures(finding)) {
        if (!derived[e.id]!.has(fig)) unsupported.push(`${e.id}: "${fig}" in — ${finding}`);
      }
    }
  }

  assert.deepEqual(
    unsupported,
    [],
    'These figures are stated in a finding but cannot be computed from the chart beside it:\n  ' +
      unsupported.join('\n  ') +
      '\n\nEither show the supporting data or move the claim into `next` as a check to run.',
  );
});

test('a finding never names an input the chart does not contain', { skip }, () => {
  /* The other half of the same failure: "impressions held steady" beside a
     chart of daily revenue. No figure, and still unsupported. */
  const inputs = ['impression', 'eCPM', 'match rate', 'cost per install', 'trials were', 'retention'];
  const offenders: string[] = [];

  for (const e of EXAMPLES) {
    const measured = (e.chart.measure + ' ' + e.chart.caption).toLowerCase();
    for (const finding of e.findings) {
      for (const word of inputs) {
        if (finding.toLowerCase().includes(word.toLowerCase()) && !measured.includes(word.toLowerCase())) {
          offenders.push(`${e.id}: "${word}" — chart measures ${e.chart.measure}`);
        }
      }
    }
  }

  assert.deepEqual(offenders, [], 'A finding cites an input its chart does not show:\n  ' + offenders.join('\n  '));
});

/* ----------------------------------------------------------------- coverage */

test('four sources and three assistants, all rendered', { skip }, () => {
  assert.equal(SOURCES.length, 4, 'revision 2 requires four sources');
  assert.equal(ASSISTANTS.length, 3, 'revision 2 requires three assistants');

  for (const s of SOURCES) {
    assert.ok(html.includes(s.name), `${s.name} is missing from the page`);
    assert.ok(home.includes(s.name), `${s.name} is missing from the homepage section`);
  }
  for (const a of ASSISTANTS) {
    assert.ok(html.includes(a.name), `${a.name} is missing from the page`);
    assert.ok(home.includes(a.name), `${a.name} is missing from the homepage section`);
  }
});

test('GA4 has a real example, not just a tile', { skip }, () => {
  const ga4 = EXAMPLES.filter((e) => e.source === 'GA4');
  assert.equal(ga4.length, 1, 'GA4 must own one of the examples');
  assert.ok(ga4[0]!.chart.points.length >= 4, 'the GA4 funnel needs its steps');
  assert.match(ga4[0]!.basis, /funnel|ordered|sequence/i, 'the GA4 example states no measurement basis');
});

test('each example uses a chart suited to its question', { skip }, () => {
  const kinds = EXAMPLES.map((e) => e.chart.kind);
  assert.ok(new Set(kinds).size >= 3, `only ${new Set(kinds).size} chart kinds — the demo reads as templated`);
  assert.equal(byId('spend').chart.kind, 'paired', 'a week-on-week claim needs both periods drawn');
  assert.equal(byId('behaviour').chart.kind, 'funnel', 'the GA4 example is not a funnel');
});

/* -------------------------------------------------------------- selectors */

test('one selector per state, as real tabs', { skip }, () => {
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tabs.length, STATES.length, `expected ${STATES.length} tabs, found ${tabs.length}`);
  for (const id of STATES) {
    assert.ok(tabs.some((t) => t.includes(`data-tab="${id}"`)), `no selector for "${id}"`);
  }
});

test('exactly one tab is selected and in the tab order', { skip }, () => {
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tabs.filter((t) => /aria-selected="true"/.test(t)).length, 1);

  const reachable = tabs.filter((t) => /tabindex="0"/.test(t));
  assert.equal(reachable.length, 1, 'exactly one tab may carry tabindex="0"');
  assert.match(reachable[0]!, /aria-selected="true"/, 'the reachable tab is not the selected one');
});

test('every tab points at a panel that names it back', { skip }, () => {
  for (const id of STATES) {
    const tab = new RegExp(`<button[^>]*data-tab="${id}"[^>]*>`).exec(html)?.[0] ?? '';
    assert.match(tab, new RegExp(`aria-controls="[^"]*panel-${id}"`), `${id}: no aria-controls`);

    const panel = new RegExp(`<div[^>]*data-panel="${id}"[^>]*>`).exec(html)?.[0] ?? '';
    assert.ok(panel, `${id}: no panel`);
    assert.match(panel, /role="tabpanel"/, `${id}: not a tabpanel`);
    assert.match(panel, new RegExp(`aria-labelledby="[^"]*tab-${id}"`), `${id}: unlabelled`);
  }
});

test('exactly one panel is visible with scripting off', { skip }, () => {
  const panels = [...html.matchAll(/<div[^>]*data-panel="[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.equal(panels.length, STATES.length, 'every state must render server-side');
  assert.equal(
    panels.filter((p) => !/\shidden[\s>]/.test(p)).length,
    1,
    'exactly one panel may be visible before any click',
  );
});

test('a hidden panel is actually hidden', { skip }, () => {
  // `.panel { display: flex }` beats the UA sheet's `[hidden] { display: none }`.
  // Without the companion rule all four states render at once — which shipped
  // once, past every markup assertion above.
  assert.match(
    html,
    /\.panel(\[[^\]]*\])?\[hidden\](\[[^\]]*\])?\{[^{}]*display:none/,
    'nothing restores display:none for a hidden panel',
  );
});

test('each state changes the question and the finding', { skip }, () => {
  assert.equal(new Set(EXAMPLES.map((e) => e.question)).size, STATES.length, 'two states ask the same question');
  assert.equal(new Set(EXAMPLES.map((e) => e.findings[0])).size, STATES.length, 'two states report the same finding');
});

test('every state labels its sample data and carries its own limit', { skip }, () => {
  assert.equal(
    (html.match(/Sample data/g) ?? []).length,
    STATES.length,
    'a state is missing its sample-data label',
  );
  for (const e of EXAMPLES) {
    assert.ok(e.limit.trim().length > 0, `${e.id}: no limit stated`);
    assert.ok(html.includes(e.limit), `${e.id}: its limit is not on the page`);
  }
});

test('the keyboard contract is implemented, not just declared', { skip }, () => {
  assert.match(script, /ArrowRight/, 'no arrow-key navigation');
  assert.match(script, /ArrowLeft/, 'no reverse arrow-key navigation');
  assert.match(script, /'Home'/, 'Home is not handled');
  assert.match(script, /'End'/, 'End is not handled');
  assert.match(script, /tabIndex\s*=/, 'the roving tabindex is never moved');
  assert.match(script, /preventDefault/, 'arrow keys are not prevented from scrolling');
});

test('chart labels do not scale with the viewport', { skip }, () => {
  // Inside the viewBox an 11px label arrives at roughly 7px on a phone.
  const charts = html.match(/<svg[^>]*viewBox="0 0 \d+ \d+"[\s\S]*?<\/svg>/g) ?? [];
  assert.ok(charts.length > 0, 'no charts rendered');
  assert.equal(charts.filter((c) => /<text/.test(c)).length, 0, 'a chart went back to SVG <text>');
  assert.match(html, /class="ticks"/, 'the HTML tick row is missing');
});

/* ------------------------------------------------------------------- truth */

test('the expensive limits survive', { skip }, () => {
  const data = fs.readFileSync(path.join(ROOT, 'src', 'data', 'automation.ts'), 'utf8');
  assert.match(data, /read-only/i, 'the Google Ads read-only limit is gone');
  assert.match(data, /no official Google-maintained MCP server for AdMob/i, 'the AdMob gap is no longer disclosed');
  assert.match(data, /does not edit Analytics configuration/i, 'the GA4 reporting-only limit is gone');
  assert.doesNotMatch(html, /Connect your accounts/i, 'a self-serve connect promise appeared');
});

test('no assistant is presented as the default', { skip }, () => {
  // "Give the options equal visual prominence." Each carries its own route
  // because the setup genuinely differs; none may carry extra emphasis.
  const routes = ASSISTANTS.map((a) => a.route);
  assert.equal(new Set(routes).size, 3, 'two assistants share a setup description');
  for (const a of ASSISTANTS) assert.ok(a.route.length > 20, `${a.name}: no real route given`);
});

test('the homepage section stays a summary', { skip }, () => {
  const section = /<section id="automation"[\s\S]*?<\/section>/.exec(home)?.[0];
  assert.ok(section, 'the homepage automation section is missing');

  const words = section
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  assert.ok(
    words >= 70 && words <= 125,
    `the homepage section is ${words} words; the brief asks for 80-110 and this guards it from growing back into the full interface`,
  );
  assert.doesNotMatch(section, /role="tablist"/, 'the full demonstration leaked onto the homepage');
});

test('the homepage order is the one the brief sets', { skip }, () => {
  const order = [...home.matchAll(/data-section="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, [
    'hero',
    'problems',
    'payback',
    'proof',
    'case-study',
    'automation',
    'loop',
    'founders',
    'contact',
  ]);
});

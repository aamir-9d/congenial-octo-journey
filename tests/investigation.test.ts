/**
 * The automation investigation canvas.
 *
 * The revision brief's test for the selectors was explicit: "A selector
 * changing only its active color is incomplete." So these assertions are about
 * whether each state carries genuinely different content, not whether three
 * buttons exist.
 *
 * They also pin the two things a static check can honestly guard about keyboard
 * use — the roles and the roving tabindex are in the served markup, and the
 * script intercepts the keys the pattern requires. Whether focus actually lands
 * where it should needs a browser; this stops the contract being deleted.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGE = path.join(ROOT, 'dist', 'automation.html');
const HOME = path.join(ROOT, 'dist', 'index.html');
const built = fs.existsSync(PAGE);
const skip = !built && 'run `npm run build` first';

const html = built ? fs.readFileSync(PAGE, 'utf8') : '';
const home = built ? fs.readFileSync(HOME, 'utf8') : '';
const script = fs.readFileSync(path.join(ROOT, 'src', 'scripts', 'investigation.ts'), 'utf8');

/** The three states the brief names. */
const STATES = ['spend', 'earnings', 'subs'];

test('three selectors exist, as real tabs', { skip }, () => {
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tabs.length, 3, `expected 3 tabs, found ${tabs.length}`);

  for (const id of STATES) {
    assert.ok(
      tabs.some((t) => t.includes(`data-tab="${id}"`)),
      `no selector for the "${id}" state`,
    );
  }
});

test('exactly one tab is selected and in the tab order', { skip }, () => {
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);

  const selected = tabs.filter((t) => /aria-selected="true"/.test(t));
  assert.equal(selected.length, 1, 'exactly one tab must start selected');

  // Roving tabindex: the group costs one Tab press, not three.
  const reachable = tabs.filter((t) => /tabindex="0"/.test(t));
  assert.equal(reachable.length, 1, 'exactly one tab may carry tabindex="0"');
  assert.ok(
    /aria-selected="true"/.test(reachable[0]!),
    'the reachable tab is not the selected one',
  );
});

test('every tab points at a panel that exists and names it back', { skip }, () => {
  for (const id of STATES) {
    const tab = new RegExp(`<button[^>]*data-tab="${id}"[^>]*>`).exec(html)?.[0] ?? '';
    assert.match(tab, new RegExp(`aria-controls="[^"]*panel-${id}"`), `${id}: no aria-controls`);

    const panel =
      new RegExp(`<div[^>]*data-panel="${id}"[^>]*>`).exec(html)?.[0] ?? '';
    assert.ok(panel, `${id}: no panel`);
    assert.match(panel, /role="tabpanel"/, `${id}: panel is not a tabpanel`);
    assert.match(panel, new RegExp(`aria-labelledby="[^"]*tab-${id}"`), `${id}: panel unlabelled`);
  }
});

test('exactly one panel is visible with scripting off', { skip }, () => {
  const panels = [...html.matchAll(/<div[^>]*data-panel="[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.equal(panels.length, 3, 'all three states must render server-side');

  const visible = panels.filter((p) => !/\shidden[\s>]/.test(p));
  assert.equal(visible.length, 1, 'exactly one panel may be visible before any click');
});

test('each state changes the question, the chart and the finding', { skip }, () => {
  // The whole point of the selectors. Three panels that differ only in a class
  // would pass every assertion above and fail the brief.
  const bodies = STATES.map((id) => {
    const start = html.indexOf(`data-panel="${id}"`);
    assert.ok(start > -1, `${id}: panel missing`);
    const next = STATES.map((o) => html.indexOf(`data-panel="${o}"`))
      .filter((i) => i > start)
      .sort((a, b) => a - b)[0];
    return html.slice(start, next ?? html.length);
  });

  const questions = bodies.map((b) => /class="panel__q[^"]*"[^>]*>([^<]+)/.exec(b)?.[1]?.trim());
  const findings = bodies.map((b) => /class="panel__finding[^"]*"[^>]*>([^<]+)/.exec(b)?.[1]?.trim());

  for (const [i, q] of questions.entries()) assert.ok(q, `${STATES[i]}: no question`);
  for (const [i, f] of findings.entries()) assert.ok(f, `${STATES[i]}: no finding`);

  assert.equal(new Set(questions).size, 3, 'two states ask the same question');
  assert.equal(new Set(findings).size, 3, 'two states report the same finding');

  // Charts must differ too — same bars under a different label is not a state.
  const bars = bodies.map((b) => (b.match(/<rect /g) ?? []).length);
  assert.ok(new Set(bars).size > 1, 'every state draws the same number of bars');
});

test('every state labels its sample data and carries its own limit', { skip }, () => {
  const samples = (html.match(/Sample data/g) ?? []).length;
  assert.equal(samples, 3, `expected a sample-data label on all 3 states, found ${samples}`);

  const limits = (html.match(/class="panel__limit[^"]*"/g) ?? []).length;
  assert.equal(limits, 3, 'a state is missing the limit that belongs beside it');
});

test('the keyboard contract is implemented, not just declared', { skip }, () => {
  assert.match(script, /ArrowRight/, 'no arrow-key navigation');
  assert.match(script, /ArrowLeft/, 'no reverse arrow-key navigation');
  assert.match(script, /'Home'/, 'Home is not handled');
  assert.match(script, /'End'/, 'End is not handled');
  assert.match(script, /tabIndex\s*=/, 'the roving tabindex is never moved');
  assert.match(script, /preventDefault/, 'arrow keys are not prevented from scrolling');
});

test('the two truthful limits survive anywhere they are stated', { skip }, () => {
  // These cost the most commercially and are the easiest to quietly soften.
  const data = fs.readFileSync(path.join(ROOT, 'src', 'data', 'automation.ts'), 'utf8');
  assert.match(data, /read-only/i, 'the Google Ads read-only limit is gone');
  assert.match(
    data,
    /no official Google-maintained MCP server for AdMob/i,
    'the missing AdMob MCP server is no longer disclosed',
  );
  assert.doesNotMatch(html, /Connect your accounts/i, 'a self-serve connect promise appeared');
});

test('the homepage teaser stays a teaser', { skip }, () => {
  const section = /<section id="automation"[\s\S]*?<\/section>/.exec(home)?.[0];
  assert.ok(section, 'the homepage automation teaser is missing');

  const words = section
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  assert.ok(
    words >= 60 && words <= 110,
    `the teaser is ${words} words; the brief asks for 70-100 and this is the guard against it growing back into a section`,
  );
  assert.match(section, /Sample/, 'the teaser does not label its sample figure');
});

test('a hidden panel is actually hidden', { skip }, () => {
  // The bug this exists for: `.panel { display: flex }` beats the UA sheet's
  // `[hidden] { display: none }`, so all three states rendered at once and the
  // selectors appeared to do nothing. Every markup assertion above passed while
  // that was true — the attribute was right and the stylesheet overrode it.
  //
  // Any author `display` on an element that also gets `hidden` needs this
  // companion rule, so the check is for the rule rather than for the attribute.
  assert.match(
    html,
    /\.panel(\[[^\]]*\])?\[hidden\](\[[^\]]*\])?\{[^{}]*display:none/,
    'nothing restores display:none for a hidden panel — all three states will render at once',
  );
});

test('chart labels do not scale with the viewport', { skip }, () => {
  // Inside the SVG viewBox an 11px label renders at about 7px on a 390px
  // screen. The ticks are HTML for that reason; SVG <text> in the chart would
  // be the regression.
  const charts = html.match(/<svg[^>]*viewBox="0 0 \d+ \d+"[\s\S]*?<\/svg>/g) ?? [];
  const withText = charts.filter((c) => /<text/.test(c));
  assert.deepEqual(withText.length, 0, 'a chart went back to SVG <text> for its labels');
  assert.match(html, /class="chart__ticks"/, 'the HTML tick row is missing');
});

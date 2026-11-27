/**
 * The November 2026 redesign: what it added that nothing else checks.
 *
 * The homepage was rebuilt from the boards in design/v3/ (see the header of
 * src/pages/index.astro and docs/redesign-brief.md). The rest of the suite was
 * repointed at the new pages; this file covers the behaviour that did not
 * exist before:
 *
 *   - the tools strip under the hero, which repeats itself to scroll;
 *   - the figures on the Full Loop's data cards and on the calculator preview,
 *     which are computed at build time and must equal what the data implies;
 *   - photographs, which the site did not have until now;
 *   - the light theme;
 *   - the phone swipe rows and the dots under them.
 *
 * The same rule as everywhere else here: a figure on the page is recomputed
 * from the file that owns it, never compared with a number typed into a test.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { RAW } from '../src/data/case-study.ts';
import { SERVICES } from '../src/data/services.ts';
import { INITIAL_STATE } from '../src/scripts/calc-model.ts';
import { computePayback, crossingLabel } from '../src/scripts/payback-model.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const built = fs.existsSync(path.join(DIST, 'index.html'));
const skip = !built && 'run `npm run build` first';

const home = built ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : '';

const text = (h: string) =>
  h
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** One homepage section, whole. Homepage sections never nest. */
const section = (name: string) =>
  new RegExp(`<section\\b[^>]*data-section="${name}"[\\s\\S]*?<\\/section>`).exec(home)?.[0] ?? '';

/** Every built page, relative to dist/. */
function builtPages(dir = DIST, prefix = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return e.name === '_astro' ? [] : builtPages(path.join(dir, e.name), `${prefix}${e.name}/`);
    return e.name.endsWith('.html') ? [`${prefix}${e.name}`] : [];
  });
}

/* ------------------------------------------------------------- tools strip */

test('the tools strip names each tool twice, the second time for the eye only', { skip }, () => {
  // The strip scrolls by animating one track that holds the list twice; when
  // the first copy has left, the second is exactly where the first began. A
  // screen reader must not hear fourteen names and then the same fourteen
  // again, so the second copy is aria-hidden. Lose the attribute, or let the
  // two copies differ, and one of those two things breaks.
  const track = /class="marquee__track"[^>]*>([\s\S]*?)<\/div>/.exec(section('hero'))?.[1];
  assert.ok(track, 'the tools strip is missing from the hero');

  const spans = [...track.matchAll(/<span\b([^>]*)>([^<]*)<\/span>/g)].map((m) => ({
    hidden: /aria-hidden="true"/.test(m[1]!),
    name: m[2]!.trim(),
  }));
  const said = spans.filter((s) => !s.hidden).map((s) => s.name);
  const shown = spans.filter((s) => s.hidden).map((s) => s.name);

  // The list is declared in the component; every name in it must be rendered.
  const source = fs.readFileSync(path.join(ROOT, 'src', 'components', 'HomeHero.astro'), 'utf8');
  const declared = [.../const TOOLS = \[([\s\S]*?)\];/.exec(source)![1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
  assert.ok(declared.length >= 10, 'the tools list in HomeHero.astro could not be read');

  assert.deepEqual(said, declared, 'the strip does not render the tools the component declares');
  assert.deepEqual(shown, said, 'the repeated copy differs from the first, or is not aria-hidden');
  assert.equal(new Set(said).size, said.length, 'a tool is named twice within one copy');

  // The first copy comes first: the hidden one is the tail.
  assert.ok(
    spans.slice(0, said.length).every((s) => !s.hidden) && spans.slice(said.length).every((s) => s.hidden),
    'the hidden copy is interleaved with the spoken one',
  );

  // It says what the names are: the tools worked in, not a client list.
  assert.match(text(section('hero')), /Works inside the stack you already run/);

  // With reduced motion the track stops, and the duplicate has no reason to
  // be on screen at all.
  const reduced = [...home.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\{((?:[^{}]|\{[^{}]*\})*)\}/g)]
    .map((m) => m[1]!)
    .join('\n');
  assert.match(reduced, /\.marquee__track\{[^{}]*animation:none/, 'the strip keeps moving under reduced motion');
  assert.match(
    reduced,
    /\.marquee__track>span\[aria-hidden="?true"?\]\{[^{}]*display:none/,
    'the duplicate names stay on screen when the strip is not scrolling',
  );
});

/* ------------------------------------------------------ figures on the loop */

const loop = section('loop');
const money = (n: number) => `$${n.toFixed(2)}`;
const within = (h: string, cls: string) =>
  text(new RegExp(`<[a-z]+\\b[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/[a-z]+>`).exec(h)?.[1] ?? '');

test('station 04 shows the cost per payer the case study totals give', { skip }, () => {
  // The case study left the homepage; its headline figure did not. Station 04
  // carries cost per payer, before and after, and links to /case-studies. It
  // is the same arithmetic tests/case-study.test.ts checks on that page, and a
  // homepage that quoted a different number for the same case would be the
  // exact fault this site sells against.
  const before = RAW.before.cost / RAW.before.paid;
  const after = RAW.after.cost / RAW.after.paid;

  assert.equal(within(loop, 'cost__now'), money(after), 'the after figure is not cost / paid for the after window');
  assert.equal(within(loop, 'cost__was'), money(before), 'the before figure is not cost / paid for the before window');

  // The reduction on the badge is derived from those two, to one decimal.
  assert.equal(
    within(loop, 'loop__badge--cost'),
    `${((1 - after / before) * 100).toFixed(1)}% lower`,
    'the badge states a reduction the two figures do not give',
  );

  // And the bar is drawn to the same ratio as the caption.
  const bar = /class="cost__on"[^>]*style="width:\s*([\d.]+)%"/.exec(loop)?.[1];
  assert.equal(bar, ((after / before) * 100).toFixed(1), 'the after bar is not scaled to after / before');

  assert.match(loop, /href="\/case-studies"/, 'station 04 no longer links the case study it quotes');
});

test('station 04 shows the install-to-trial rates the case study totals give', { skip }, () => {
  const rate = (w: typeof RAW.before) => `${((w.trials / w.installs) * 100).toFixed(2)}%`;

  // "0.62% → 4.00%": the before rate is its own element, the after rate is the
  // text beside the arrow.
  const stat = [...loop.matchAll(/<p\b[^>]*class="loop__stat tabular"[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1]!)
    .find((h) => /loop__was/.test(h));
  assert.ok(stat, 'the install-to-trial card is missing from station 04');

  assert.equal(within(stat, 'loop__was'), rate(RAW.before), 'the before rate is not trials / installs');
  assert.equal(text(stat), `${rate(RAW.before)} → ${rate(RAW.after)}`, 'the after rate is not trials / installs');
});

test('the breakeven day on the homepage is the one the calculator model gives', { skip }, () => {
  // Shown twice: on station 03 of the loop and on the calculator preview. Both
  // run the calculator's own default scenario through the model at build time,
  // so a visitor who opens /payback-calculator sees the same day on arrival.
  // A typed "Day 277" would survive the next change to the defaults; this does
  // not.
  const HORIZON = 365;
  const pb = computePayback(INITIAL_STATE, HORIZON);
  const label = crossingLabel(pb.crossing, HORIZON);

  assert.equal(within(loop, 'chart__day'), label, 'station 03 shows a different breakeven day than the model');

  const preview = section('payback-preview');
  const shown = /<span\b[^>]*data-preview-crossing[^>]*>([\s\S]*?)<\/span>/.exec(preview)?.[1];
  assert.ok(shown !== undefined, 'the preview has no [data-preview-crossing]');
  assert.equal(text(shown), label, 'the calculator preview shows a different breakeven day than the model');

  // Station 03's second card: revenue over spend at the horizon, from the same run.
  if (pb.roas !== null) {
    assert.ok(
      text(loop).includes(`Revenue / spend at D${HORIZON} ${(pb.roas * 100).toFixed(1)}%`),
      'station 03 shows a different return at the horizon than the model',
    );
  }

  // The preview's inputs are the scenario that produced that day.
  const s = INITIAL_STATE;
  const inputs = [...preview.matchAll(/<span\b[^>]*class="pv__input"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g)].map((m) => text(m[1]!));
  assert.deepEqual(
    inputs,
    [
      `Cost per install $${s.cpi.toFixed(2)}`,
      `Install → trial ${s.i2t}%`,
      `Trial → paid ${s.t2p}%`,
      `Renewal retention ${s.retention}%`,
      `Plan price $${s.price.toFixed(2)}`,
    ],
    'the preview lists inputs that are not the calculator defaults',
  );

  assert.match(preview, /href="\/payback-calculator"/, 'the preview does not lead to the calculator');
  assert.doesNotMatch(home, /data-payback[\s=>]/, 'the full calculator is back on the homepage');
});

test('station 02 draws the two rates it names, and the gap it claims', { skip }, () => {
  // 11% and 17% are written into HomeLoop.astro (they are the first finding of
  // the old proof section, src/components/Proof.astro). They are typed, so the
  // things derived from them are checked against them: the badge's "6 points"
  // and the height of the shorter bar.
  const card = /class="bars"[\s\S]*?class="bars__key"/.exec(loop)?.[0];
  assert.ok(card, 'the trial-to-paid card is missing from station 02');

  const cols = [...card.matchAll(/class="bars__v"[^>]*>(\d+)%<\/span>\s*<span\b[^>]*class="bars__bar"[^>]*style="height:\s*([\d.]+)%"/g)]
    .map((m) => ({ value: Number(m[1]), height: Number(m[2]) }));
  assert.equal(cols.length, 2, 'station 02 no longer draws two bars');

  const [dashboard, verified] = cols as [typeof cols[0], typeof cols[0]];
  assert.equal(verified.height, 100, 'the verified bar is not the full height');
  assert.ok(
    Math.abs(dashboard.height - (dashboard.value / verified.value) * 100) < 0.1,
    `the dashboard bar is ${dashboard.height}% tall; ${dashboard.value} / ${verified.value} is ${((dashboard.value / verified.value) * 100).toFixed(1)}%`,
  );

  const points = /class="badge loop__badge"[^>]*>(\d+) points/.exec(loop)?.[1];
  assert.equal(Number(points), verified.value - dashboard.value, 'the badge claims a gap the two rates do not give');

  assert.match(card, new RegExp(`aria-label="[^"]*${dashboard.value}%[^"]*${verified.value}%`), 'the chart label does not state both rates');

  // While the finding they come from is still in the repo, they must match it.
  const proof = path.join(ROOT, 'src', 'components', 'Proof.astro');
  if (fs.existsSync(proof)) {
    assert.ok(
      fs.readFileSync(proof, 'utf8').includes(`stat: '${dashboard.value}% → ${verified.value}%'`),
      'station 02 no longer shows the rates of the finding it is taken from',
    );
  }
});

/* ------------------------------------------------------------------ images */

test('every photograph is WebP, sized, and described', { skip }, () => {
  // The redesign brought the first photographs onto the site: four on the
  // loop, more in the posts. Three things go wrong with an image and none of
  // them fails a build: a JPEG shipped at full weight, an <img> with no
  // width/height (the page jumps as it loads), and no alt text.
  //
  // Icons and the share image are exempt by path: they are PNG or SVG on
  // purpose and are not <img> content.
  const EXEMPT = /(^|\/)(favicon|icon-|apple-touch-icon|og-image)/;
  const problems: string[] = [];
  let seen = 0;

  for (const file of builtPages()) {
    const html = fs.readFileSync(path.join(DIST, file), 'utf8');

    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0];
      const attr = (name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
      const src = attr('src') ?? '';
      if (EXEMPT.test(src)) continue;
      seen++;

      const where = `${file}  ${src.split('/').pop() || '(no src)'}`;
      if (!/\.webp(\?|$)/.test(src)) problems.push(`${where} — not served as .webp`);

      for (const candidate of (attr('srcset') ?? '').split(',').map((c) => c.trim().split(/\s+/)[0]!).filter(Boolean)) {
        if (!/\.webp(\?|$)/.test(candidate)) problems.push(`${where} — srcset entry ${candidate} is not .webp`);
      }

      if (!/^\d+$/.test(attr('width') ?? '')) problems.push(`${where} — no width`);
      if (!/^\d+$/.test(attr('height') ?? '')) problems.push(`${where} — no height`);
      if (!(attr('alt') ?? '').trim()) problems.push(`${where} — no alt text`);
    }
  }

  assert.ok(seen >= 4, `only ${seen} photographs found; the loop alone has four`);
  assert.deepEqual(problems, [], 'Images that will ship heavy, jump, or say nothing:\n  ' + problems.join('\n  '));

  // And the files the pages point at were actually written.
  for (const m of section('loop').matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(DIST, m[1]!.replace(/^\//, ''))), `${m[1]} is referenced but was not built`);
  }
});

test('the loop photographs are illustrations and are not captioned as people', { skip }, () => {
  // HomeLoop.astro: the four photographs are generated images. Nothing may
  // present them as the founders or as clients; the alt text describes the
  // scene and no more.
  const alts = [...section('loop').matchAll(/<img\b[^>]*\salt="([^"]*)"/g)].map((m) => m[1]!);
  assert.equal(alts.length, 4, 'the loop does not have one photograph per station');
  for (const alt of alts) {
    assert.doesNotMatch(alt, /aamir|faisal|founder|client|customer|our team|e2e/i, `"${alt}" presents an illustration as a real person`);
  }
});

/* ------------------------------------------------------------------ themes */

test('both themes ship: a light block that redefines the page, and the meta that allows it', { skip }, () => {
  // The site follows the device. The dark values are the :root defaults and
  // the light ones sit in a prefers-color-scheme block in tokens.css. If that
  // block is dropped the build stays green and every light-mode visitor gets
  // the dark site; if it loses one of these three tokens they get dark text
  // on a dark ground, or amber text that fails contrast on white.
  assert.match(home, /<meta name="color-scheme" content="dark light">/, 'the color-scheme meta is missing or changed');

  const css = [...home.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('\n');
  const light = /@media\s*\(prefers-color-scheme:\s*light\)\{((?:[^{}]|\{[^{}]*\})*)\}/.exec(css)?.[1];
  assert.ok(light, 'no prefers-color-scheme:light block is inlined on the homepage');

  const dark = css.replace(/@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
  const value = (block: string, token: string) => new RegExp(`${token}:\\s*([^;}]+)`).exec(block)?.[1]?.trim();

  for (const token of ['--color-bg', '--color-text', '--color-accent-text']) {
    const d = value(dark, token);
    const l = value(light, token);
    assert.ok(d, `${token} has no default (dark) value`);
    assert.ok(l, `the light theme does not redefine ${token}`);
    assert.notEqual(l, d, `${token} is the same in both themes`);
  }

  // Every page gets both, not only the homepage.
  for (const file of builtPages()) {
    const html = fs.readFileSync(path.join(DIST, file), 'utf8');
    assert.match(html, /<meta name="color-scheme" content="dark light">/, `/${file} has no color-scheme meta`);
    assert.match(html, /@media\s*\(prefers-color-scheme:\s*light\)\{:root\{/, `/${file} ships without the light theme`);
  }
});

/* ------------------------------------------------------------- swipe rows */

const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'track']);

/**
 * The element opening at `start`, and how many element children it has.
 * A tag walk, not a parser: it counts opens and closes, treating void elements
 * and self-closed SVG shapes as both.
 */
function element(html: string, start: number): { end: number; children: number } {
  const tags = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  tags.lastIndex = start;
  let depth = 0;
  let children = 0;

  for (let m = tags.exec(html); m; m = tags.exec(html)) {
    const closing = m[1] === '/';
    const leaf = !closing && (m[3] === '/' || VOID.has(m[2]!.toLowerCase()));

    if (closing) {
      depth--;
      if (depth === 0) return { end: m.index + m[0].length, children };
      continue;
    }
    if (depth === 1) children++;
    if (!leaf) depth++;
  }
  throw new Error('unbalanced markup; the swipe row could not be read');
}

test('every swipe row has a dot for each card', { skip }, () => {
  // Below 700px the services, the loop stations and the posts each become one
  // snapping row. src/scripts/swipe.ts lights the dot for the card in view by
  // index: dots[i] for row.children[i]. The dots are written in the markup, so
  // a card added without a dot leaves the last card with nothing lit, and a
  // dot too many leaves one that never lights.
  const rows = [...home.matchAll(/<[a-z]+\b[^>]*\sdata-swipe(?=[\s>])[^>]*>/g)];
  assert.equal(rows.length, 3, `expected the three homepage swipe rows, found ${rows.length}`);

  const counts: Record<string, number> = {};

  for (const row of rows) {
    const name = /class="([^"]*)"/.exec(row[0])?.[1] ?? row[0];
    const { end, children } = element(home, row.index!);

    // The meta block is the row's next sibling: swipe.ts looks for it inside
    // the row's parent, so nothing but whitespace may come between them.
    const after = home.slice(end);
    const meta = /^\s*<div\b[^>]*\sdata-swipe-meta(?=[\s>])[^>]*>/.exec(after);
    assert.ok(meta, `.${name}: the row is not followed by its [data-swipe-meta] block`);
    assert.match(meta![0], /aria-hidden="true"/, `.${name}: the dots are decoration and must be aria-hidden`);

    const block = after.slice(0, element(after, meta!.index).end);
    const dots = /<span\b[^>]*\sdata-swipe-dots(?=[\s>])[^>]*>([\s\S]*?)<\/span>/.exec(block)?.[1];
    assert.ok(dots !== undefined, `.${name}: no [data-swipe-dots]`);
    assert.equal((dots!.match(/<i\b/g) ?? []).length, children, `.${name}: ${children} cards but a different number of dots`);

    // The counter is server-rendered for the first card and names the total.
    const counter = text(/<span\b[^>]*\sdata-swipe-count(?=[\s>])[^>]*>([\s\S]*?)<\/span>/.exec(block)?.[1] ?? '');
    assert.match(counter, new RegExp(`\\b1 of ${children}$`), `.${name}: the counter reads "${counter}" for ${children} cards`);

    counts[/data-section="([a-z-]+)"/.exec(home.slice(home.lastIndexOf('<section', row.index!), row.index!))?.[1] ?? name] = children;
  }

  // And the rows hold what the page says they hold: the five services and AI
  // reporting, the four stations, the three newest posts.
  assert.deepEqual(counts, { services: SERVICES.length + 1, loop: 4, insights: 3 });

  // The script that drives them is real, and gives way to the visitor.
  const script = fs.readFileSync(path.join(ROOT, 'src', 'scripts', 'swipe.ts'), 'utf8');
  assert.match(script, /\[data-swipe-meta\]/, 'swipe.ts no longer finds the meta block');
  assert.match(script, /prefers-reduced-motion/, 'the rows move on by themselves even when motion is reduced');
});

test('the services row links every service page, the audit first', { skip }, () => {
  // "Start with the audit if you do not know which one you need." The lead
  // card is the audit, and each card goes to the page its name comes from.
  const cards = [...section('services').matchAll(/<a\b([^>]*class="[^"]*\bgcard\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: /href="([^"]*)"/.exec(m[1]!)?.[1],
    lead: /\bgcard--lead\b/.test(m[1]!),
    body: text(m[2]!),
  }));

  assert.deepEqual(
    cards.map((c) => c.href),
    [...SERVICES.map((s) => `/services/${s.slug}`), '/automation'],
    'the services grid does not link the five service pages and /automation, in order',
  );
  assert.deepEqual(cards.map((c) => c.lead), [true, false, false, false, false, false], 'exactly the first card should be the lead');

  SERVICES.forEach((s, i) => {
    assert.ok(cards[i]!.body.startsWith(s.name), `card ${i + 1} is not titled "${s.name}"`);
    assert.ok(cards[i]!.body.includes(s.summary), `card ${i + 1} says something its page's summary does not`);
  });
});

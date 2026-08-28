/**
 * The mark.
 *
 * `src/data/logo.ts` records path data rather than computing it, because the
 * geometry comes out of functions that live in a design export and evaluating
 * them at request time would mean shipping that machinery. Recorded data can
 * drift from its source silently, and a logo that is subtly wrong is the kind
 * of thing nobody notices until it is on a business card.
 *
 * So this re-evaluates `tile()` from the approved export and compares, which
 * makes the recording safe. If the design is ever revised, this fails and
 * points at exactly which path moved.
 *
 * Requires `npm run build` for the rendered checks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { FULL, COMPACT, COMPACT_AT_OR_BELOW, markup } from '../src/data/logo.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const DESIGN = path.join(ROOT, 'design', 'E2E Apps - Logo directions.dc.html');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist', 'index.html');

const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

/** Evaluate the export's own drawing code and hand back a flat node list. */
function drawFromDesign(size: number) {
  const src = fs.readFileSync(DESIGN, 'utf8');
  const script = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(src)![1]!;

  interface Node {
    tag: string;
    props: Record<string, unknown>;
    kids: Node[];
  }
  const el = (tag: string, props: Record<string, unknown>, ...kids: unknown[]): Node => ({
    tag,
    props: props ?? {},
    kids: kids.flat(Infinity).filter(Boolean) as Node[],
  });

  const sandbox: Record<string, unknown> = {
    React: { createElement: el },
    DCLogic: class {},
    Math,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${script}\nglobalThis.__c = new Component();`, sandbox);

  const root = (sandbox.__c as { tile: (s: number, fg: string, ac: string) => Node }).tile(
    size,
    '#E8EAED',
    '#E39A1F',
  );

  const flat: Node[] = [];
  const walk = (n: Node) => {
    flat.push(n);
    n.kids.forEach(walk);
  };
  walk(root);
  return flat;
}

test('the recorded geometry is exactly what the approved design draws', () => {
  for (const [label, size, form] of [
    ['full', 100, FULL],
    ['compact', 24, COMPACT],
  ] as const) {
    const nodes = drawFromDesign(size);

    const rect = nodes.find((n) => n.tag === 'rect');
    assert.ok(rect, `${label}: the design no longer draws a tile`);
    assert.equal(rect!.props.rx, form.rx, `${label}: tile corner radius has drifted`);

    const paths = nodes.filter((n) => n.tag === 'path').map((n) => n.props.d as string);
    assert.deepEqual(paths, form.paths, `${label}: the lettering geometry has drifted`);
  }
});

test('the mark reduces below the threshold the design states', () => {
  // Three glyphs cannot hold a 100-unit box down to a favicon; the design drops
  // to a single E at 24px and below, and that boundary is load-bearing.
  assert.equal(COMPACT.paths.length, 1, 'the compact form should be one glyph');
  assert.equal(FULL.paths.length, 3, 'the full form should spell E2E');

  assert.ok(markup(COMPACT_AT_OR_BELOW).includes(COMPACT.paths[0]!), 'does not reduce at 24px');
  assert.ok(markup(COMPACT_AT_OR_BELOW + 1).includes(FULL.paths[0]!), 'reduces too early at 25px');

  // The compact glyph is drawn heavier so it survives rasterising at 16px.
  assert.ok(COMPACT.glyphStroke > FULL.glyphStroke, 'the compact glyph should be the heavier one');
});

test('the on-accent treatment does not hide its own lettering', () => {
  // A filled amber tile on an amber ground is invisible, and ink lettering on
  // amber-on-amber is worse. The outline treatment is what the design specifies
  // for that case, so it must not emit a filled tile.
  const outline = markup(64, 'outline');
  assert.ok(!outline.includes('fill="#E39A1F"'), 'the outline treatment still fills the tile');
  assert.match(outline, /stroke="currentColor"/, 'the outline treatment has no visible tile');

  const filled = markup(64, 'filled');
  assert.ok(filled.includes('fill="#E39A1F"'), 'the filled treatment lost its amber tile');
  assert.ok(filled.includes('#101725'), 'the filled treatment lost its ink lettering');
});

test('every icon a browser or store asks for is generated', () => {
  const wanted = [
    'favicon.svg',
    'favicon-16.png',
    'favicon-32.png',
    'favicon-48.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'site.webmanifest',
  ];

  for (const f of wanted) {
    const file = path.join(PUBLIC, f);
    assert.ok(fs.existsSync(file), `${f} was not generated`);
    assert.ok(fs.statSync(file).size > 200, `${f} is suspiciously small`);
  }

  const mf = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'site.webmanifest'), 'utf8'));
  assert.equal(mf.name, 'E2E Apps');
  assert.ok(mf.icons.length >= 2, 'the manifest lists too few icons');
  // Base-path aware, or the manifest 404s on the project URL.
  for (const icon of mf.icons) {
    assert.ok(icon.src.startsWith('/'), `manifest icon src is not absolute: ${icon.src}`);
  }
});

test('the mark renders in the nav and the footer, without double-announcing', { skip }, () => {
  assert.ok(html.includes('class="logo'), 'the mark does not render on the page');

  // Both lockups pair the mark with a visible "E2E Apps" wordmark, so the mark
  // itself must be aria-hidden — otherwise a screen reader says it twice.
  const marks = [...html.matchAll(/<svg[^>]*class="logo[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.ok(marks.length >= 2, 'expected the mark in both the nav and the footer');
  for (const m of marks) {
    assert.ok(m.includes('aria-hidden'), 'a decorative mark is being announced: ' + m.slice(0, 90));
  }
});

test('the head points at the icon set', { skip }, () => {
  for (const rel of [
    /rel="icon"[^>]*favicon\.svg/,
    /rel="icon"[^>]*favicon-32\.png/,
    /rel="apple-touch-icon"[^>]*apple-touch-icon\.png/,
    /rel="manifest"[^>]*site\.webmanifest/,
  ]) {
    assert.match(html, rel, `missing head link: ${rel}`);
  }
});

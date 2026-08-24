/**
 * The two published design documents.
 *
 * `design/*.dc.html` are Claude Design exports, not web pages: they carry
 * `{{ }}` bindings, `<sc-for>`/`<sc-if>` elements and a `class Component
 * extends DCLogic` block, and they expect `support.js` — the design tool's
 * runtime, which pulls React from unpkg — to compile all of it in the browser.
 * That file is not in this repo. Published verbatim, an export renders a blank
 * page.
 *
 * `scripts/build-design-docs.mjs` does that work at build time instead. Its
 * failure mode is quiet and total: if the expansion breaks, the page is still
 * served, still 200s, and simply has nothing on it. Nobody notices until they
 * send the link to a client.
 *
 * So these assertions are about substance, not just presence — every mark,
 * every palette, every named style has to actually be in the output.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');

const DOCS = {
  'brand-book': path.join(DIST, 'brand-book', 'index.html'),
  'logo-directions': path.join(DIST, 'logo-directions', 'index.html'),
};

const built = fs.existsSync(DOCS['brand-book']);
const skip = !built && 'run `npm run build` first';
const read = (name: keyof typeof DOCS) => fs.readFileSync(DOCS[name], 'utf8');

test('both documents are published', { skip }, () => {
  for (const [name, file] of Object.entries(DOCS)) {
    assert.ok(fs.existsSync(file), `${name} was not built`);
    // A blank shell is about 1KB. Either real document is far larger.
    assert.ok(fs.statSync(file).size > 40_000, `${name} looks empty — expansion probably failed`);
  }
});

test('no template syntax survives into the published page', { skip }, () => {
  for (const name of Object.keys(DOCS) as Array<keyof typeof DOCS>) {
    const html = read(name);
    assert.ok(!/\{\{/.test(html), `${name} still contains {{ }} bindings`);
    assert.ok(!/<sc-(for|if)\b/.test(html), `${name} still contains <sc-for> or <sc-if>`);
    assert.ok(!/hint-placeholder/.test(html), `${name} still carries authoring-only attributes`);
    assert.ok(!/style-hover=/.test(html), `${name} still carries the inert style-hover attribute`);
  }
});

test('nothing loads from a third-party origin', { skip }, () => {
  // The same rule the site itself is held to. The exports reach for Google
  // Fonts and unpkg; the renderer substitutes the self-hosted faces and
  // inlines the icons.
  for (const name of Object.keys(DOCS) as Array<keyof typeof DOCS>) {
    const html = read(name);
    for (const origin of ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com', 'support.js']) {
      assert.ok(!html.includes(origin), `${name} still references ${origin}`);
    }
    assert.match(html, /\.\.\/fonts\/be-vietnam-pro-\d00-latin\.woff2/, `${name} lost its fonts`);
  }
});

test('every logo mark rendered at every size', { skip }, () => {
  const html = read('logo-directions');

  // Six from round 1, six from round 2.
  for (const id of ['1a', '1b', '1c', '1d', '1e', '1f', '2a', '2b', '2c', '2d', '2e', '2f']) {
    assert.ok(html.includes(`id="${id}"`), `mark ${id} is missing`);
  }

  // Twelve marks, each drawn at 8 sizes: big, lockup, three grounds, 32/24/16.
  const svgs = html.match(/<svg/g) ?? [];
  assert.equal(svgs.length, 96, 'expected 12 marks at 8 sizes each');

  // Geometry the shim had to compute rather than copy, so this proves the
  // export's own logic really ran.
  assert.ok(html.includes('M18 50 H82'), '1a lost its linked waist bar');
  assert.match(html, /stroke-dasharray="156\.8 44\.2"/, '2e ring dasharray was not computed');
  assert.equal((html.match(/<animateMotion/g) ?? []).length, 1, '1b travelling signal is wrong');
});

test('the brand book kept its substance', { skip }, () => {
  const html = read('brand-book');

  for (const palette of [
    'Signal Amber',
    'Attribution Blue',
    'Telemetry Green',
    'Cohort Violet',
    'Store Coral',
  ]) {
    assert.ok(html.includes(palette), `palette "${palette}" is missing`);
  }

  for (const style of ['Display / H1', 'H6 · Eyebrow', 'Pull quote', 'Code / value']) {
    assert.ok(html.includes(style), `text style "${style}" is missing`);
  }

  // Nested sc-for: colour groups each expand their own swatch list.
  for (const token of ['--color-bg', '--color-surface-sunk', '--color-accent-dim', '--color-line-soft']) {
    assert.ok(html.includes(token), `colour token ${token} is missing`);
  }

  // Computed inside the export's own P() helper, not written literally.
  assert.ok(
    html.includes('rgba(227,154,31,0.85)'),
    'the palette glow was not computed — renderVals() may not have run',
  );

  // Every Phosphor icon became an inline SVG rather than a font class.
  assert.ok(!/class="ph ph-/.test(html), 'an icon is still a Phosphor class');
  assert.ok((html.match(/<svg/g) ?? []).length >= 26, 'icons did not inline');
});

test('the documents stay out of the index', { skip }, () => {
  // Internal review pages. They are unlisted, not secret — but they should not
  // compete with the site in search.
  for (const name of Object.keys(DOCS) as Array<keyof typeof DOCS>) {
    assert.match(read(name), /<meta name="robots" content="noindex/, `${name} is indexable`);
  }
});

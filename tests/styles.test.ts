/**
 * Style-delivery checks.
 *
 * These exist because of a bug that every other test in this suite waved
 * through. Extracting Slider.astro out of Calculator.astro left the slider
 * markup in one component and its CSS in another, and Astro scopes a
 * component's <style> to that component's own elements — so the rules stopped
 * reaching the markup. The copy was right, the numbers were right, the markup
 * was right. Only the CSS never arrived, and the sliders rendered as
 * body-sized text beside a default-width input.
 *
 * Nothing structural can catch that. What can: checking that every class the
 * built page actually uses is reachable by at least one rule that would match
 * it.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const PAGES = ['index.html', 'privacy.html', 'terms.html', '404.html'];

const distExists = fs.existsSync(path.join(DIST, 'index.html'));
const skip = !distExists && 'run `npm run build` first';

const html = distExists ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : '';

/** Class names used by elements, and the scope token each element carries. */
function classUsage(source: string): Map<string, Set<string | null>> {
  const usage = new Map<string, Set<string | null>>();
  for (const tag of source.matchAll(/<[a-z][a-z0-9-]*\s[^>]*>/gi)) {
    const el = tag[0];
    const classAttr = /\sclass="([^"]*)"/.exec(el);
    if (!classAttr) continue;
    const scope = /data-astro-cid-([a-z0-9]+)/i.exec(el)?.[1] ?? null;
    for (const cls of classAttr[1]!.split(/\s+/).filter(Boolean)) {
      if (!usage.has(cls)) usage.set(cls, new Set());
      usage.get(cls)!.add(scope);
    }
  }
  return usage;
}

/** All CSS text in the page: inlined <style> blocks. */
function styleText(source: string): string {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]!).join('\n');
}

test('every class on every page is reachable by a rule that can match it', { skip }, () => {
  const problems: string[] = [];

  for (const page of PAGES) {
    const file = path.join(DIST, page);
    if (!fs.existsSync(file)) continue;

    const source = fs.readFileSync(file, 'utf8');
    const css = styleText(source);

    for (const [cls, scopes] of classUsage(source)) {
      const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const selectors = [...css.matchAll(new RegExp(`\\.${escaped}(?![\\w-])[^,{]*`, 'g'))].map(
        (m) => m[0],
      );

      if (!selectors.length) {
        problems.push(`${page}  .${cls} — used in the page, no rule defines it`);
        continue;
      }

      // A rule is reachable if it is unscoped, or scoped to a token the
      // element carrying that class actually has.
      const reachable = selectors.some((sel) => {
        const required = /data-astro-cid-([a-z0-9]+)/i.exec(sel)?.[1];
        return !required || scopes.has(required);
      });

      if (!reachable) {
        const need = selectors
          .map((s) => /data-astro-cid-([a-z0-9]+)/i.exec(s)?.[1])
          .filter(Boolean)
          .join(', ');
        const have = [...scopes].map((s) => s ?? '(none)').join(', ');
        problems.push(`${page}  .${cls} — rules need scope [${need}], element has [${have}]`);
      }
    }
  }

  assert.deepEqual(
    problems,
    [],
    `Styles cannot reach the markup they are written for:\n  ${problems.join('\n  ')}\n\n` +
      `Two causes. "no rule defines it" is a dead class — delete it from the markup.\n` +
      `A scope mismatch is the Slider.astro failure mode: markup in one component,\n` +
      `CSS scoped to another. Move the shared rules into a plain stylesheet under\n` +
      `src/styles/ rather than a component <style> block.`,
  );
});

test('slider fields carry their layout, not the browser default', { skip }, () => {
  const css = styleText(html);

  // The three declarations whose absence produced the visible bug: the field
  // head loses its flex row, and the input loses its full width.
  assert.match(css, /\.calc__field-head[^{]*\{[^}]*display:\s*flex/, 'field head has no flex row');
  assert.match(
    css,
    /\.calc__field-head[^{]*\{[^}]*justify-content:\s*space-between/,
    'field head does not space its label and value apart',
  );
  assert.match(css, /\.calc__range[^{]*\{[^}]*width:\s*100%/, 'range input is not full width');

  // And that those rules are not gated behind a component scope again.
  for (const cls of ['calc__field-head', 'calc__range', 'calc__field', 'calc__field-val']) {
    const scoped = new RegExp(`\\.${cls}(?![\\w-])[^,{]*data-astro-cid`).test(css);
    assert.ok(!scoped, `.${cls} is scope-gated; Slider.astro's markup cannot receive it`);
  }
});

test('every data-bind sits inside the element the calculator binds against', { skip }, () => {
  // calculator.ts binds to `.calc`. In the cream build the hero carried a
  // summary card and a mini chart outside it, which is why the root had to
  // widen to `#top` — bound narrowly they were server-rendered and then frozen.
  // The Bento hero has neither, so the narrow root is correct again, and this
  // is what stops a stray binding drifting back outside it.
  const start = html.indexOf('class="calc"');
  assert.ok(start > -1, 'no .calc root in the built page');

  const end = html.indexOf('</section>', start);
  assert.ok(end > start, 'could not find the end of the payback section');
  const inside = html.slice(start, end);

  const total = (html.match(/data-bind=/g) ?? []).length;
  const within = (inside.match(/data-bind=/g) ?? []).length;

  assert.equal(
    within,
    total,
    `${total - within} data-bind element(s) fall outside .calc and would never update`,
  );
  assert.ok(total > 30, `expected the calculator's bindings, found only ${total}`);
});

test('the payback model is its own section, not a child of the hero', { skip }, () => {
  const hero = html.indexOf('id="top"');
  const payback = html.indexOf('id="payback"');

  assert.ok(hero > -1 && payback > -1, 'a section marker is missing');
  assert.ok(hero < payback, 'the payback section renders before the hero');

  // The hero closes before the payback section opens — they are siblings.
  const heroClose = html.indexOf('</section>', hero);
  assert.ok(heroClose < payback, 'the payback section is still nested inside the hero');
});

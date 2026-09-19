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
const PAGES = ['index.html', 'services.html', 'products.html', 'faq.html', 'privacy.html', 'terms.html', '404.html'];

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

test('payback fields carry their layout, not the browser default', { skip }, () => {
  const css = styleText(html);

  // The declarations whose absence produced the visible bug: the field loses
  // its row layout, and the range input loses its full width.
  assert.match(css, /\.pm__field[^{]*\{[^}]*display:\s*grid/, 'the field has no row layout');
  assert.match(css, /\.pm__entry[^{]*\{[^}]*align-items:\s*center/, 'the entry does not align its unit');
  assert.match(css, /\.pm__range[^{]*\{[^}]*width:\s*100%/, 'range input is not full width');

  // And that those rules are not gated behind a component scope. The Payback
  // controller creates nodes at runtime which carry no scope attribute, so a
  // scoped rule would silently fail to reach them -- the Slider.astro failure
  // this originally pinned, in a new place.
  for (const cls of ['pm__field', 'pm__range', 'pm__entry', 'pm__num', 'pm__invalid-item']) {
    const scoped = new RegExp(`\\.${cls}(?![\\w-])[^,{]*data-astro-cid`).test(css);
    assert.ok(!scoped, `.${cls} is scope-gated; runtime-created markup cannot receive it`);
  }
});

test('every data-bind sits inside the element the calculator binds against', { skip }, () => {
  // payback.ts binds inside `[data-payback]`. A binding outside that root is
  // server-rendered once and then frozen for the life of the page — it will
  // show the example scenario's figure against whatever the visitor typed,
  // which is the worst failure this section can have.
  const start = html.indexOf('data-payback');
  assert.ok(start > -1, 'no [data-payback] root in the built page');

  const end = html.indexOf('</section>', start);
  assert.ok(end > start, 'could not find the end of the payback section');
  const inside = html.slice(start, end);

  const total = (html.match(/data-bind=/g) ?? []).length;
  const within = (inside.match(/data-bind=/g) ?? []).length;

  assert.equal(
    within,
    total,
    `${total - within} data-bind element(s) fall outside [data-payback] and would never update`,
  );
  assert.ok(total > 15, `expected the payback map's bindings, found only ${total}`);
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

test('no shared-component anchor is dead outside the homepage', { skip }, () => {
  // The nav and footer render on every page, but every section they point at
  // lives on the homepage. A bare `#contact` on /blog/a-post resolves against
  // that post, finds nothing, and the primary call to action silently does
  // nothing. That was true of the whole nav on five pages before it was found.
  const offenders: string[] = [];

  // `blog.html`, not `blog/index.html` — the build format is `file`, so the
  // index of a directory route is a sibling file. The old spelling existed but
  // never matched, so the blog index was silently exempt from this check.
  for (const page of PAGES.concat(['blog.html'])) {
    const file = path.join(DIST, page);
    if (!fs.existsSync(file) || page === 'index.html') continue;

    const html = fs.readFileSync(file, 'utf8');

    for (const m of html.matchAll(/href="(#[a-zA-Z][\w-]*)"/g)) {
      const hash = m[1]!;

      // A same-page target is the exception the rule is built to allow: the
      // skip link points at this page's own <main>, which every route renders.
      // Checking the target actually exists here is stricter than exempting
      // the name, and keeps a genuinely dead anchor failing.
      if (html.includes(`id="${hash.slice(1)}"`)) continue;

      offenders.push(`${page}  ${hash}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'These anchors point at sections that are not on the page:\n  ' +
      offenders.join('\n  ') +
      '\n\nPrefix with the base so they reach the homepage section instead.',
  );
});

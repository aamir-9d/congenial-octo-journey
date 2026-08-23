/**
 * Token hygiene.
 *
 * The redesign shipped a compatibility shim mapping the retired cream names
 * onto the new palette, so the site stayed coherent while sections were
 * rebuilt one at a time. That was the right call for the migration and a
 * liability afterwards, because two of the names changed meaning:
 *
 *   --c-paper  was the light ground, and was used for light text on the dark
 *              sections. The shim resolved it to the new dark ground, which
 *              put nine pieces of text at 1.02:1 — invisible, and invisible to
 *              every other check in this suite.
 *   --c-ink    was the dark text colour, and became a background.
 *
 * The shim is deleted. This is what stops it coming back: a stray `var(--c-*)`
 * would now resolve to nothing and inherit, which fails quietly rather than
 * loudly. Better to fail here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist', 'index.html');

/** Every .astro and .css file under src/. */
function sources(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sources(full, acc);
    else if (/\.(astro|css|ts)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/** The retired families. A `var()` reference to any of these is a bug. */
const RETIRED =
  /var\(\s*--(c-[a-z-]+|fs-[a-z0-9-]+|space-[a-z0-9]+|r-(?:2|3|6|8|12|pill)|measure-[a-z-]+|rgb-(?:ink|paper|white|amber|teal|red)[a-z-]*|font-display|wrap-cta|shadow-card|shadow-nav|ls-(?:hero|stat|slight|mono-[a-z]+|eyebrow-[a-z]+)|lh-(?:hero|display|verdict|outcome|normal|relaxed|loose|list))\s*\)/;

test('no source file still references a retired token', () => {
  const offenders: string[] = [];

  for (const file of sources(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    text.split('\n').forEach((line, i) => {
      // Prose in a comment may name one while explaining why it went.
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      const hit = RETIRED.exec(line);
      if (hit) offenders.push(`${path.relative(ROOT, file)}:${i + 1}  ${hit[0]}`);
    });
  }

  assert.deepEqual(
    offenders,
    [],
    'Retired tokens are still referenced:\n  ' +
      offenders.join('\n  ') +
      '\n\nThe compatibility shim is gone, so these resolve to nothing and the\n' +
      'property silently inherits. Use the current token — see src/styles/tokens.css.',
  );
});

test('the compatibility shim is not back in tokens.css', () => {
  const tokens = fs.readFileSync(path.join(SRC, 'styles', 'tokens.css'), 'utf8');
  const declarations = [...tokens.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]!);

  const revived = declarations.filter((d) =>
    /^--(c-|fs-|space-|measure-|r-[0-9]|rgb-(ink|paper|white|amber|teal|red)|font-display|wrap-cta)/.test(d),
  );

  assert.deepEqual(revived, [], 'These retired token names have been redeclared: ' + revived.join(', '));
});

test('no rendered text sits on a ground it cannot be read against', { skip: !fs.existsSync(DIST) && 'run `npm run build` first' }, () => {
  const html = fs.readFileSync(DIST, 'utf8');

  // An unresolvable var() is the failure mode the shim's removal introduces:
  // the declaration is dropped and the property inherits, usually invisibly.
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('');

  // Definitions also arrive on inline `style` attributes — the chart's label
  // geometry is set that way and then updated at runtime by calculator.ts.
  const inline = [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]!).join(';');

  const declared = new Set(
    [...(css + ';' + inline).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]!),
  );
  const referenced = new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]!));

  const dangling = [...referenced].filter((r) => !declared.has(r));
  assert.deepEqual(dangling, [], 'These custom properties are used but never defined: ' + dangling.join(', '));
});

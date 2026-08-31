/**
 * Render the Claude Design exports in `design/` to static HTML in `public/`.
 *
 * A `.dc.html` export is not a web page. It ships markup full of `{{ }}`
 * bindings, `<sc-for>` and `<sc-if>` elements, and a `class Component extends
 * DCLogic` block, and it expects `support.js` — Claude Design's internal
 * runtime, which self-loads React, ReactDOM and Babel from unpkg — to compile
 * all of that in the browser. `support.js` is not in this repo and is not
 * deployable, so copying an export into `public/` verbatim publishes a blank
 * page: the templates never expand and nothing renders.
 *
 * This script does at build time what `support.js` would have done at runtime.
 * It evaluates `renderVals()` behind a tiny `DCLogic` shim, expands the
 * template elements, and writes plain HTML with no framework, no template
 * syntax and no third-party origin left in it. The output is the same document
 * the design tool draws, and it is what actually gets published.
 *
 * Run: node scripts/build-design-docs.mjs
 * It is wired into `npm run build`, so the published pages cannot drift from
 * the exports they came from.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design');
const PUBLIC = path.join(ROOT, 'public');

/* --- the documents to publish ------------------------------------------- */

const DOCS = [
  {
    source: 'E2E Apps - Brand book.dc.html',
    out: 'brand-book',
    title: 'Brand book — E2E Apps',
    description:
      'Every colour, typeface, size and motion value in the E2E Apps site, in one place.',
  },
  {
    source: 'E2E Apps - Logo directions.dc.html',
    out: 'logo-directions',
    title: 'Logo directions — E2E Apps',
    description: 'Twelve logo directions for E2E Apps, drawn as geometry and shown at every size.',
    /**
     * Centre the card rows, so the page reads like the brand book.
     *
     * The export lays the marks out as a 500px-wide flex wrap inside a 1640px
     * column. On anything narrower than three cards the last row hugs the left
     * and leaves a wide gap at the right, which makes the page look
     * left-weighted next to the brand book's centred column.
     *
     * Done here rather than in `design/`, so the export on disk stays a
     * byte-exact copy of what the design tool produced.
     */
    transform: (html) => {
      const before = /display:flex;flex-wrap:wrap;gap:36px;margin-top:(\d+)px;align-items:flex-start/g;
      const out = html.replace(
        before,
        'display:flex;flex-wrap:wrap;justify-content:center;gap:36px;margin-top:$1px;align-items:flex-start',
      );
      const count = (html.match(before) ?? []).length;
      if (count !== 2) throw new Error(`expected 2 mark rows to centre, found ${count}`);
      return out;
    },
  },
];

/* --- Phosphor icons ------------------------------------------------------
   The brand book renders Phosphor by class name from a unpkg script. The site
   already vendors the paths it uses; these three are the ones only the brand
   book asks for. Regular weight, 256-unit box, same as the rest.             */

const EXTRA_ICONS = {
  check: '<polyline points="216 72 104 184 48 128"/>',
  'check-circle':
    '<circle cx="128" cy="128" r="96"/><polyline points="172 104 113.3 160 84 132"/>',
  'x-circle': '<circle cx="128" cy="128" r="96"/><line x1="160" y1="96" x2="96" y2="160"/><line x1="160" y1="160" x2="96" y2="96"/>',
};

function loadIcons() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'icons.ts'), 'utf8');
  const body = src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1);

  const icons = { ...EXTRA_ICONS };
  // `\r?\n`, not a bare `\n`. A branch switch on Windows can rewrite this file
  // with CRLF, and anchoring on the bare newline then matches nothing at all —
  // which surfaces as every icon appearing to be missing rather than as a
  // parse error.
  for (const m of body.matchAll(/'([a-z0-9-]+)':\s*\r?\n?\s*'([\s\S]*?)',\r?\n/g)) {
    icons[m[1]] = m[2].replace(/\\'/g, "'");
  }
  return icons;
}

const ICONS = loadIcons();

/** `<i class="ph ph-name" style="...">` -> an inline SVG at the same size. */
function inlineIcons(html) {
  const missing = new Set();

  const out = html.replace(
    /<i class="ph ph-([a-z0-9-]+)"([^>]*)><\/i>/g,
    (whole, name, rest) => {
      const paths = ICONS[name];
      if (!paths) {
        missing.add(name);
        return whole;
      }

      const style = /style="([^"]*)"/.exec(rest)?.[1] ?? '';
      const size = /font-size:\s*([0-9.]+)px/.exec(style)?.[1] ?? '16';
      // The icon inherits its colour, so whatever `color:` the export set on
      // the <i> still governs once it is an SVG.
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
        `viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" ` +
        `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ` +
        `style="${style};flex:none;display:block">${paths}</svg>`
      );
    },
  );

  if (missing.size) throw new Error('No vendored path for icon(s): ' + [...missing].join(', '));
  return out;
}

/* --- the DCLogic shim ----------------------------------------------------
   Only what the two exports actually call. `React.createElement` returns an
   HTML string wrapped in a marker so the template pass knows it is already
   markup and must not be escaped.                                            */

const RAW = Symbol('raw');
const raw = (html) => ({ [RAW]: true, html });
const isRaw = (v) => v !== null && typeof v === 'object' && v[RAW] === true;

const VOID_TAGS = new Set(['path', 'circle', 'rect', 'polygon', 'line', 'polyline', 'animateMotion', 'stop']);

/**
 * SVG attributes that are genuinely camelCase and must survive untouched.
 *
 * This is the difference between a mark that renders and one that does not.
 * Hyphenating `viewBox` to `view-box` silently removes the viewBox: the SVG
 * keeps its width and height but loses the coordinate system that maps the
 * 100-unit drawing onto them, so every mark renders at 1:1 pixels and a 16px
 * icon shows the top-left corner of the artwork. It looks like a dozen broken
 * logos and reads as a design problem rather than a build one.
 *
 * Only the attributes these documents can actually reach are listed; the full
 * SVG set is much longer, and guessing at it would hide the next omission.
 */
const CAMEL_SVG_ATTRS = new Set([
  'viewBox',
  'preserveAspectRatio',
  'pathLength',
  'repeatCount',
  'repeatDur',
  'attributeName',
  'attributeType',
  'calcMode',
  'keyPoints',
  'keyTimes',
  'keySplines',
  'gradientUnits',
  'gradientTransform',
  'patternUnits',
  'clipPathUnits',
  'maskUnits',
  'markerWidth',
  'markerHeight',
  'markerUnits',
  'refX',
  'refY',
  'spreadMethod',
  'startOffset',
  'stdDeviation',
  'textLength',
  'lengthAdjust',
]);

/** camelCase React prop -> the SVG/HTML attribute name it stands for. */
function attrName(key) {
  if (key === 'className') return 'class';
  if (CAMEL_SVG_ATTRS.has(key)) return key;
  if (key.includes('-')) return key; // already hyphenated, e.g. aria-label
  return key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
}

/**
 * CSS properties always hyphenate, so this deliberately does NOT share
 * attrName's camelCase exception list — those are attribute names, a different
 * namespace that happens to look similar.
 */
const cssName = (key) => key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

function styleObject(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${cssName(k)}:${v}`)
    .join(';');
}

function createElement(tag, props, ...children) {
  const attrs = Object.entries(props ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => {
      const value = k === 'style' && typeof v === 'object' ? styleObject(v) : v;
      return `${attrName(k)}="${escapeAttr(String(value))}"`;
    })
    .join(' ');

  const open = attrs ? `<${tag} ${attrs}` : `<${tag}`;
  const kids = children
    .flat(Infinity)
    .filter((c) => c !== null && c !== undefined && c !== false)
    .map((c) => (isRaw(c) ? c.html : escapeText(String(c))))
    .join('');

  if (!kids && VOID_TAGS.has(tag)) return raw(`${open}></${tag}>`);
  return raw(`${open}>${kids}</${tag}>`);
}

const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;');

/* --- template expansion -------------------------------------------------- */

/** Resolve a `{{ ... }}` expression against the current scope. */
function resolve(expr, scope) {
  const key = expr.trim();
  if (key === 'true') return true;
  if (key === 'false') return false;

  let value = scope;
  for (const part of key.split('.')) {
    if (value === null || value === undefined) return undefined;
    value = value[part];
  }
  return value;
}

/** Substitute every `{{ }}` in a run of text or attributes. */
function interpolate(text, scope) {
  return text.replace(/\{\{([^}]*)\}\}/g, (whole, expr) => {
    const value = resolve(expr, scope);
    if (value === undefined || value === null) return '';
    if (isRaw(value)) return value.html;
    return escapeText(String(value));
  });
}

/**
 * Find the balanced close of `<tag ...>` starting at `from`, counting nested
 * opens of the same tag. Returns [innerStart, innerEnd, afterEnd].
 */
function matchTag(html, tag, openStart) {
  const openEnd = html.indexOf('>', openStart) + 1;
  const open = new RegExp(`<${tag}[\\s>]`, 'g');
  const close = new RegExp(`</${tag}>`, 'g');

  let depth = 1;
  let cursor = openEnd;

  while (depth > 0) {
    open.lastIndex = cursor;
    close.lastIndex = cursor;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) throw new Error(`Unbalanced <${tag}>`);

    if (o && o.index < c.index) {
      depth++;
      cursor = o.index + 1;
    } else {
      depth--;
      cursor = c.index + `</${tag}>`.length;
      if (depth === 0) return [openEnd, c.index, cursor];
    }
  }
  throw new Error(`Unbalanced <${tag}>`);
}

/** Expand `<sc-for>` / `<sc-if>` and every binding, innermost scope first. */
function expand(template, scope) {
  const next = /<sc-(for|if)\b/.exec(template);
  if (!next) return interpolate(template, scope);

  const before = template.slice(0, next.index);
  const kind = next[1];
  const [innerStart, innerEnd, afterEnd] = matchTag(template, `sc-${kind}`, next.index);

  const openTag = template.slice(next.index, template.indexOf('>', next.index) + 1);
  const inner = template.slice(innerStart, innerEnd);
  const after = template.slice(afterEnd);

  let rendered = '';

  if (kind === 'for') {
    const listExpr = /list="\{\{([^}]*)\}\}"/.exec(openTag)?.[1] ?? '';
    const as = /as="([^"]*)"/.exec(openTag)?.[1] ?? 'item';
    const list = resolve(listExpr, scope);

    if (!Array.isArray(list)) {
      throw new Error(`<sc-for list="{{${listExpr}}}"> did not resolve to an array`);
    }
    for (const item of list) {
      rendered += expand(inner, { ...scope, [as]: item });
    }
  } else {
    const condExpr = /value="\{\{([^}]*)\}\}"/.exec(openTag)?.[1] ?? '';
    if (resolve(condExpr, scope)) rendered = expand(inner, scope);
  }

  return interpolate(before, scope) + rendered + expand(after, scope);
}

/* --- style-hover ---------------------------------------------------------
   Inert in the export: it is an authoring hint the design editor consumes,
   with no handler in support.js. The site build turned these into real CSS
   :hover rules; these documents do the same rather than dropping the intent. */

function liftHoverStyles(html) {
  const rules = [];
  let n = 0;

  const out = html.replace(/\s+style-hover="([^"]*)"/g, (whole, decls) => {
    const cls = `dc-h${++n}`;
    rules.push(`.${cls}:hover{${decls}}`);
    return ` data-hover="${cls}" class="${cls}"`;
  });

  return { html: out, css: rules.join('\n') };
}

/* --- the page shell ------------------------------------------------------ */

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, ' +
  'U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

/**
 * The exports pull Be Vietnam Pro and IBM Plex Mono from Google Fonts. The
 * site self-hosts both already, so these point at the same files rather than
 * introducing a third-party origin the rest of the build forbids. Relative,
 * so the pages work under any base path.
 */
const FONT_CSS = [
  [400, 'be-vietnam-pro-400-latin'],
  [500, 'be-vietnam-pro-500-latin'],
  [600, 'be-vietnam-pro-600-latin'],
  [700, 'be-vietnam-pro-700-latin'],
]
  .map(
    ([weight, file]) => `@font-face{font-family:'Be Vietnam Pro';font-style:normal;
font-weight:${weight};font-display:swap;src:url('../fonts/${file}.woff2') format('woff2');
unicode-range:${LATIN}}`,
  )
  .concat([
    `@font-face{font-family:'IBM Plex Mono';font-style:normal;font-weight:400;
font-display:swap;src:url('../fonts/ibm-plex-mono-400-latin.woff2') format('woff2');
unicode-range:${LATIN}}`,
  ])
  .join('\n');

function shell({ title, description, head, body, hoverCss }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeText(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<!-- An internal review document, not a page that should rank. -->
<meta name="robots" content="noindex, nofollow">
<link rel="preload" as="font" type="font/woff2" href="../fonts/be-vietnam-pro-700-latin.woff2" crossorigin>
<style>
${FONT_CSS}
</style>
${head}
${hoverCss ? `<style>\n${hoverCss}\n</style>` : ''}
</head>
<body>
${body}
</body>
</html>
`;
}

/* --- render one document ------------------------------------------------- */

function render(doc) {
  const source = fs.readFileSync(path.join(DESIGN, doc.source), 'utf8');

  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(source)?.[1] ?? '';
  const script = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(source)?.[1];
  if (!script) throw new Error(`${doc.source}: no <script type="text/x-dc"> block`);

  // Everything inside <x-dc>, minus the helmet and the logic block.
  let body = /<x-dc>([\s\S]*?)<\/x-dc>/.exec(source)?.[1] ?? '';
  body = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();

  // Evaluate the export's own logic behind the shim.
  const sandbox = {
    React: { createElement },
    DCLogic: class {},
    Math,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${script}\nglobalThis.__vals = new Component().renderVals();`, sandbox, {
    filename: doc.source,
  });

  let html = expand(body, sandbox.__vals);

  // Drop the authoring-only attribute the design editor uses for sizing.
  html = html.replace(/\s+hint-placeholder-(count|val)="[^"]*"/g, '');

  if (doc.transform) html = doc.transform(html);

  const lifted = liftHoverStyles(html);
  html = inlineIcons(lifted.html);

  // The head keeps the export's own <style>, minus every third-party origin:
  // the fonts are self-hosted above and the icons are inlined already.
  const head = helmet
    .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, '')
    .replace(/<script src="https:\/\/unpkg\.com[^>]*><\/script>\s*/g, '')
    .replace(/<meta name="design_doc_mode"[^>]*>\s*/g, '')
    .trim();

  const page = shell({
    title: doc.title,
    description: doc.description,
    head,
    body: html,
    hoverCss: lifted.css,
  });

  const dir = path.join(PUBLIC, doc.out);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page, 'utf8');

  return { out: `${doc.out}/index.html`, bytes: Buffer.byteLength(page) };
}

/* --- go ------------------------------------------------------------------ */

let failed = false;
for (const doc of DOCS) {
  try {
    const { out, bytes } = render(doc);
    console.log(`  ${out.padEnd(28)} ${(bytes / 1024).toFixed(0)} KB`);
  } catch (error) {
    failed = true;
    console.error(`  FAILED ${doc.source}: ${error.message}`);
  }
}
if (failed) process.exit(1);

/**
 * Generates one share image per key page into public/og/ (1200×630 each).
 *
 *   node scripts/build-og-cards.mjs
 *
 * Until November 2026 every page shared public/og-image.png, so a service
 * page, a post and the calculator all showed the same picture when a link was
 * pasted somewhere. This writes a card carrying the page's own name for: the
 * five service pages, every blog post, and the four pages people share most.
 *
 * The PNGs are committed. The site build does not run this; re-run it when a
 * post is added or a title changes. src/layouts/Base.astro picks a card up by
 * file name (the page path with slashes turned into dashes) and falls back to
 * og-image.png, so a page without a card still has an image.
 * tests/seo.test.ts fails if a post or service page has no card.
 *
 * Fonts: the same fontconfig hand-off as build-og-image.mjs, for the reason
 * written there. No dependency beyond `sharp`, which Astro already brings.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { markup } from '../src/data/logo.ts';
import { SERVICES } from '../src/data/services.ts';

const OUT = path.resolve('public/og');
const W = 1200;
const H = 630;

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&family=IBM+Plex+Mono:wght@400';

async function prepareFonts() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-og-'));
  const fontDir = path.join(dir, 'fonts');
  fs.mkdirSync(fontDir);
  // An ancient UA is what makes Google serve TTF rather than WOFF2.
  const css = await (await fetch(FONT_CSS, { headers: { 'User-Agent': 'Mozilla/4.0' } })).text();
  const urls = [...css.matchAll(/https:\/\/[^)]+\.ttf/g)].map((m) => m[0]);
  if (urls.length < 2) throw new Error('could not find TTF URLs in the Google Fonts CSS');
  for (const url of urls) {
    const name = url.includes('bevietnampro') ? 'BeVietnamPro-Bold.ttf' : 'IBMPlexMono.ttf';
    fs.writeFileSync(path.join(fontDir, name), Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  const conf = path.join(dir, 'fonts.conf');
  fs.mkdirSync(path.join(dir, 'cache'), { recursive: true });
  fs.writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${path.join(dir, 'cache')}</cachedir>
</fontconfig>`);
  return { dir, conf };
}

/* --- what gets a card ------------------------------------------------------- */

/** Title and tag from a post's front matter. Enough of YAML for these two keys. */
function posts() {
  const dir = path.resolve('src/content/blog');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const head = fs.readFileSync(path.join(dir, f), 'utf8').split(/^---\s*$/m)[1] ?? '';
      const get = (k) => (new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(head)?.[1] ?? '').trim().replace(/^(['"])(.*)\1$/, '$2');
      return { file: `blog-${f.replace(/\.md$/, '')}`, label: get('tag') || 'Blog', title: get('title') };
    });
}

const cards = [
  ...SERVICES.map((s) => ({ file: `services-${s.slug}`, label: 'Service', title: s.name })),
  ...posts(),
  { file: 'payback-calculator', label: 'Free tool', title: 'App payback calculator' },
  { file: 'mmp-audit-findings', label: 'Original data', title: 'What mobile attribution audits keep finding' },
  { file: 'case-studies', label: 'Case studies', title: 'Mobile attribution case studies' },
  { file: 'automation', label: 'The E2E Apps MCP', title: "Your app's growth data, inside Claude and ChatGPT" },
  { file: 'services', label: 'Services', title: 'Mobile attribution services for subscription apps' },
];

/* --- the card --------------------------------------------------------------- */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy wrap by an average glyph width; the face is bold, so be generous. */
function wrap(text, size, maxWidth) {
  const perChar = size * 0.56;
  const limit = Math.floor(maxWidth / perChar);
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > limit) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function card({ label, title }) {
  // Largest size at which the title fits in four lines.
  let size = 76;
  let lines = wrap(title, size, 1040);
  while (lines.length > 4 && size > 44) {
    size -= 4;
    lines = wrap(title, size, 1040);
  }
  const lead = size * 1.14;
  // Centre the block of lines in the space between the label and the rule.
  const cap = size * 0.74;
  const block = (lines.length - 1) * lead + cap;
  const top = 150 + (360 - block) / 2 + cap;
  const text = lines
    .map((l, i) => `<text x="72" y="${(top + i * lead).toFixed(1)}" font-family="Be Vietnam Pro" font-weight="700" font-size="${size}" letter-spacing="${(-size * 0.028).toFixed(2)}" fill="#E8EAED">${esc(l)}</text>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="a" cx="14%" cy="0%" r="70%"><stop offset="0" stop-color="#E39A1F" stop-opacity="0.26"/><stop offset="1" stop-color="#E39A1F" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="96%" cy="8%" r="70%"><stop offset="0" stop-color="#40568C" stop-opacity="0.42"/><stop offset="1" stop-color="#40568C" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0E1014"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="#E39A1F"/>

  <text x="72" y="104" font-family="IBM Plex Mono" font-size="22" letter-spacing="3.6" fill="#E39A1F">${esc(label.toUpperCase())}</text>
  ${text}

  <line x1="72" y1="538" x2="1128" y2="538" stroke="#2C3138" stroke-width="1"/>
  <g transform="translate(72 556) scale(0.42)">${markup(100)}</g>
  <text x="128" y="587" font-family="Be Vietnam Pro" font-weight="700" font-size="28" letter-spacing="-0.5" fill="#E8EAED">E2E Apps</text>
  <text x="1128" y="587" text-anchor="end" font-family="IBM Plex Mono" font-size="19" fill="#868D98">e2eapp.com</text>
</svg>`;
}

/* --- run -------------------------------------------------------------------- */

const self = fileURLToPath(import.meta.url);

if (!process.env.E2E_OG_CHILD) {
  const { dir, conf } = await prepareFonts();
  try {
    const run = spawnSync(process.execPath, [self], { stdio: 'inherit', env: { ...process.env, FONTCONFIG_FILE: conf, E2E_OG_CHILD: '1' } });
    process.exitCode = run.status ?? 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
} else {
  const { default: sharp } = await import('sharp');
  fs.mkdirSync(OUT, { recursive: true });
  let bytes = 0;
  for (const c of cards) {
    if (!c.title) throw new Error(`${c.file}: no title`);
    const file = path.join(OUT, `${c.file}.png`);
    await sharp(Buffer.from(card(c))).png({ compressionLevel: 9 }).toFile(file);
    bytes += fs.statSync(file).size;
  }
  console.log(`wrote ${cards.length} cards to public/og (${(bytes / 1024).toFixed(0)} KB in all)`);
}

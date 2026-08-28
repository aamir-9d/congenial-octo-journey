/**
 * Render the mark into every icon a browser or store will ask for.
 *
 * One source of geometry — `src/data/logo.ts`, which is itself checked against
 * the approved design file — rasterised with the sharp that already ships
 * inside Astro. No new dependency.
 *
 * The sizes are not arbitrary and they are not all the same drawing:
 *
 *   favicon.svg      scalable, and the only one that adapts to dark mode
 *   favicon-32.png   the tab icon most desktop browsers actually use
 *   favicon-16.png   the fallback, drawn in the reduced single-glyph form
 *   apple-touch-icon iOS home screen, 180px, must be opaque with no transparency
 *   icon-192 / 512   PWA manifest, 512 is also what stores and link unfurls take
 *
 * Run: node scripts/build-icons.mjs   (wired into `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { markup, COMPACT_AT_OR_BELOW } from '../src/data/logo.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public');

/** The page ground, for icons that cannot be transparent. */
const GROUND = '#0E1014';

/**
 * A complete SVG document for one size.
 *
 * `padded` insets the 100-unit artwork inside a larger opaque canvas — iOS
 * masks the home-screen icon itself and crops anything that runs to the edge,
 * so the tile needs breathing room there that it does not need in a browser tab.
 */
function document_(size, { opaque = false, padded = false } = {}) {
  const art = markup(size);
  const ground = opaque ? `<rect width="100" height="100" fill="${GROUND}"/>` : '';

  if (!padded) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${ground}${art}</svg>`;
  }

  // 12% inset on each side, which keeps the tile clear of an iOS mask.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` +
    `<rect width="100" height="100" fill="${GROUND}"/>` +
    `<g transform="translate(12 12) scale(0.76)">${art}</g>` +
    `</svg>`
  );
}

const TARGETS = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180, opaque: true, padded: true },
  { file: 'icon-192.png', size: 192, opaque: true },
  { file: 'icon-512.png', size: 512, opaque: true },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  /* The scalable one. Written at a size above the reduction threshold so it
     carries the full three-glyph form; a browser scaling it down keeps the
     lettering rather than swapping to the single E, which is correct — the
     reduction exists for raster legibility, not for vector. */
  const svg = document_(100);
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), svg + '\n', 'utf8');
  console.log(`  favicon.svg`.padEnd(30) + `${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);

  const mf = JSON.stringify(manifest(), null, 2);
  fs.writeFileSync(path.join(OUT, 'site.webmanifest'), mf + '\n', 'utf8');
  console.log('  site.webmanifest'.padEnd(30) + `${(Buffer.byteLength(mf) / 1024).toFixed(1)} KB`);

  for (const t of TARGETS) {
    const doc = document_(t.size, { opaque: t.opaque, padded: t.padded });
    const buf = await sharp(Buffer.from(doc), { density: 384 })
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(OUT, t.file), buf);

    const form = t.size <= COMPACT_AT_OR_BELOW ? 'compact' : 'full';
    console.log(`  ${t.file}`.padEnd(30) + `${(buf.length / 1024).toFixed(1)} KB`.padEnd(10) + form);
  }
}

/** The PWA manifest. Base-path aware, like every other asset URL here. */
function manifest() {
  const base = (process.env.SITE_BASE ?? '/congenial-octo-journey').replace(/\/$/, '');
  return {
    name: 'E2E Apps',
    short_name: 'E2E Apps',
    description: 'End-to-end mobile measurement, attribution and growth.',
    start_url: base + '/',
    display: 'standalone',
    background_color: GROUND,
    theme_color: GROUND,
    icons: [
      { src: base + '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: base + '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: base + '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

main().catch((error) => {
  console.error('  FAILED to build icons:', error.message);
  process.exit(1);
});

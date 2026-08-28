/**
 * Generates public/og-image.png (1200×630).
 *
 * Run with `node scripts/build-og-image.mjs`. The PNG is committed, so this
 * only needs re-running when the card's design or copy changes — the site build
 * does not depend on it.
 *
 * The card is on the Bento dark palette. It was left on the cream one through
 * the redesign, which nothing catches: the PNG is committed, the site build
 * does not depend on it, and it is only ever seen by someone pasting a link
 * somewhere else. tests/overflow.test.ts now fails if a cream value returns.
 *
 * Two things worth knowing:
 *
 * 1. The card draws the *real* payback curve. The series come from the same
 *    calc-model the page uses, at the same defaults, so the shape on the social
 *    card is the shape a visitor sees — including breakeven landing on day 277.
 *    If the model ever changes, this changes with it.
 *
 * 2. librsvg (inside sharp) ignores `@font-face` with a data: URI, so the brand
 *    faces are supplied through fontconfig instead: the script fetches the TTFs
 *    into a temp dir and writes a fontconfig pointing at it.
 *
 *    FONTCONFIG_FILE has to be in the environment when the process starts —
 *    assigning `process.env` from inside the script is too late, because the
 *    native library reads it as it loads. So the script prepares the fonts and
 *    then re-executes itself with the variable set. Without that, anything not
 *    installed system-wide silently falls back to a serif, which is easy to
 *    miss unless you look at the PNG.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { markup } from '../src/data/logo.ts';

const OUT = path.resolve('public/og-image.png');
const W = 1200;
const H = 630;

/* --- fonts ---------------------------------------------------------------- */

const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&family=IBM+Plex+Mono:wght@400';

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
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(path.join(fontDir, name), buf);
  }

  const conf = path.join(dir, 'fonts.conf');
  fs.writeFileSync(
    conf,
    `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${path.join(dir, 'cache')}</cachedir>
</fontconfig>`,
  );
  fs.mkdirSync(path.join(dir, 'cache'), { recursive: true });
  return { dir, conf };
}

/* --- chart ---------------------------------------------------------------- */

/** The subscription model at its defaults, inlined to keep this script standalone. */
function series() {
  const s = {
    i2t: 8, t2p: 35, price: 9.99, trialDays: 7, retention: 85,
    commission: 15, refund: 3, cpi: 1.2, skanNull: 35, webLoss: 20,
  };
  const r = s.retention / 100;
  const cd = 30;
  const i2p = (s.i2t / 100) * (s.t2p / 100);
  const net = s.price * (1 - s.commission / 100) * (1 - s.refund / 100);
  const cycles = (d) => (d < s.trialDays ? 0 : Math.floor((d - s.trialDays) / cd) + 1);
  const paymentsBy = (n) => (n === 0 ? 0 : (1 - Math.pow(r, n)) / (1 - r));
  const signal = (1 - s.skanNull / 100) * (1 - s.webLoss / 100);
  const trueRev = (d) => i2p * net * paymentsBy(cycles(d));
  const measRev = (d) => i2p * net * Math.min(1, cycles(d)) * signal;

  let be = null;
  for (let n = 1; n <= 900; n++) {
    const d = s.trialDays + (n - 1) * cd;
    if (trueRev(d) >= s.cpi) { be = d; break; }
  }
  return { trueRev, measRev, cpi: s.cpi, be };
}

function chartSvg(x0, y0, w, h) {
  const { trueRev, measRev, cpi, be } = series();
  const H_DAYS = 365;

  const days = Array.from({ length: H_DAYS + 1 }, (_, d) => d);
  const tv = days.map((d) => trueRev(d) - cpi);
  const mv = days.map((d) => measRev(d) - cpi);
  const all = [...tv, ...mv, 0, -cpi];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = (hi - lo) * 0.14;

  const sx = (d) => x0 + (d / H_DAYS) * w;
  const sy = (v) => y0 + h - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * h;

  const step = (vals) => {
    let p = `M${sx(0).toFixed(1)} ${sy(vals[0]).toFixed(1)}`;
    for (let i = 1; i < days.length; i++) {
      const x = sx(days[i]).toFixed(1);
      p += ` L${x} ${sy(vals[i - 1]).toFixed(1)} L${x} ${sy(vals[i]).toFixed(1)}`;
    }
    return p;
  };

  const truePath = step(tv);
  let gap = truePath;
  for (let i = days.length - 1; i >= 0; i--) {
    const x = sx(days[i]).toFixed(1);
    gap += ` L${x} ${sy(mv[i]).toFixed(1)}`;
    if (i > 0) gap += ` L${x} ${sy(mv[i - 1]).toFixed(1)}`;
  }

  const zeroY = sy(0);
  const beX = sx(be);

  return `
  <path d="${gap} Z" fill="#E39A1F" opacity="0.16"/>
  <line x1="${x0}" y1="${zeroY.toFixed(1)}" x2="${(x0 + w).toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="#5B626B" stroke-width="1"/>
  <path d="${step(mv)}" fill="none" stroke="#5B626B" stroke-width="2" stroke-dasharray="6 5"/>
  <path d="${truePath}" fill="none" stroke="#E39A1F" stroke-width="3"/>
  <line x1="${beX.toFixed(1)}" y1="${(zeroY - 46).toFixed(1)}" x2="${beX.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="#E39A1F" stroke-width="1.5" stroke-dasharray="2 3"/>
  <circle cx="${beX.toFixed(1)}" cy="${zeroY.toFixed(1)}" r="7" fill="#E39A1F" stroke="#0E1014" stroke-width="2.5"/>
  <text x="${(beX - 12).toFixed(1)}" y="${(zeroY - 56).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="19" fill="#E8EAED">breakeven: day ${be}</text>
  <text x="${sx(7).toFixed(1)}" y="${(y0 + h + 26).toFixed(1)}" font-family="IBM Plex Mono" font-size="17" fill="#7C838D">day 7</text>
  <text x="${(x0 + w).toFixed(1)}" y="${(y0 + h + 26).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="17" fill="#7C838D">day 365</text>`;
}

/* --- card ----------------------------------------------------------------- */

function card() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0E1014"/>
  <rect x="0" y="0" width="${W}" height="8" fill="#E39A1F"/>

  <text x="72" y="92" font-family="IBM Plex Mono" font-size="19" letter-spacing="3.4" fill="#7C838D">MOBILE GROWTH &amp; MEASUREMENT</text>

  <text x="72" y="184" font-family="Be Vietnam Pro" font-weight="700" font-size="56" letter-spacing="-1.4" fill="#E8EAED">It broke even in month nine.</text>
  <text x="72" y="252" font-family="Be Vietnam Pro" font-weight="700" font-size="56" letter-spacing="-1.4" fill="#E39A1F">You killed it in week one.</text>

  ${chartSvg(72, 316, 1056, 196)}

  <line x1="72" y1="566" x2="1128" y2="566" stroke="#23272E" stroke-width="1"/>
  <g transform="translate(72 578) scale(0.38)">${markup(100)}</g>
  <text x="122" y="600" font-family="Be Vietnam Pro" font-weight="700" font-size="26" letter-spacing="-0.5" fill="#E8EAED">E2E Apps</text>
  <text x="1128" y="600" text-anchor="end" font-family="IBM Plex Mono" font-size="18" fill="#7C838D">e2eapps.com</text>
</svg>`;
}

/* --- run ------------------------------------------------------------------ */

const self = fileURLToPath(import.meta.url);

if (!process.env.E2E_OG_CHILD) {
  // Parent: fetch the fonts, then hand off to a child that starts with
  // FONTCONFIG_FILE already in its environment.
  const { dir, conf } = await prepareFonts();
  try {
    const run = spawnSync(process.execPath, [self], {
      stdio: 'inherit',
      env: { ...process.env, FONTCONFIG_FILE: conf, E2E_OG_CHILD: '1' },
    });
    process.exitCode = run.status ?? 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
} else {
  const { default: sharp } = await import('sharp');
  await sharp(Buffer.from(card())).png({ compressionLevel: 9 }).toFile(OUT);

  const { size } = fs.statSync(OUT);
  console.log(`wrote ${OUT} (${W}x${H}, ${(size / 1024).toFixed(1)} KB)`);
}

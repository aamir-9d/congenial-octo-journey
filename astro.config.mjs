// @ts-check
import { defineConfig } from 'astro/config';

// ---------------------------------------------------------------------------
// Deployment target.
//
// GitHub Pages project site (current):
//   SITE = 'https://aamir-9d.github.io'
//   BASE = '/congenial-octo-journey'
//
// Custom domain (flip both lines, add public/CNAME containing `e2eapps.com`):
//   SITE = 'https://e2eapps.com'
//   BASE = '/'
//
// Everything downstream — canonical URLs, Open Graph, sitemap.xml, robots.txt
// and every internal link — reads from these two constants. Nothing else needs
// to change.
// ---------------------------------------------------------------------------
const SITE = process.env.SITE_URL ?? 'https://aamir-9d.github.io';
const BASE = process.env.SITE_BASE ?? '/congenial-octo-journey';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Emit `about.html` rather than `about/index.html`. GitHub Pages serves
    // both, but flat files keep the deployed tree readable.
    format: 'file',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});

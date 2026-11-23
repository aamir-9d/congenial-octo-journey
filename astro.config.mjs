// @ts-check
import { defineConfig } from 'astro/config';

// ---------------------------------------------------------------------------
// Deployment target.
//
// Custom domain (current; public/CNAME holds `e2eapp.com`):
//   SITE = 'https://e2eapp.com'
//   BASE = '/'
//
// GitHub Pages project site (before the domain; it now redirects):
//   SITE = 'https://aamir-9d.github.io'
//   BASE = '/congenial-octo-journey'
//
// Everything downstream — canonical URLs, Open Graph, sitemap.xml, robots.txt
// and every internal link — reads from these two constants. Nothing else needs
// to change.
// ---------------------------------------------------------------------------
const SITE = process.env.SITE_URL ?? 'https://e2eapp.com';
const BASE = process.env.SITE_BASE ?? '/';

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

import type { APIRoute } from 'astro';

/**
 * Four URLs. Hand-rolled rather than pulling in @astrojs/sitemap — the
 * dependency would earn its keep on a content collection, not on this.
 */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = PAGES.map(({ path, priority, changefreq }) => {
    const loc = new URL(`${base}${path === '/' ? '/' : path}`, site).href;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};

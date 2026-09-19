import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Static pages plus every blog post.
 *
 * Still hand-rolled rather than pulling in @astrojs/sitemap. The collection is
 * the case that would normally justify the dependency, but reading it is one
 * `getCollection` call — the package would be earning its keep on six lines.
 *
 * Posts carry their own publication date as `lastmod` rather than today's,
 * so a rebuild does not tell crawlers that year-old articles just changed.
 */
/* Every indexable route, not a subset. /services, /automation, /products and
   /faq were missing from this list for weeks while being linked from the nav
   on every page of the site — real content pages that no crawler was being
   told about. `tests/pages.test.ts` now walks dist/ and fails if a built,
   indexable page is not here, so the omission cannot repeat silently. */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/automation', priority: '0.9', changefreq: 'monthly' },
  { path: '/products', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...PAGES.map(({ path, priority, changefreq }) => ({
      path,
      priority,
      changefreq,
      lastmod: today,
    })),
    ...(await getCollection('blog')).map((post) => ({
      path: `/blog/${post.id}`,
      priority: '0.6',
      changefreq: 'yearly',
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
  ];

  const urls = entries
    .map(({ path, priority, changefreq, lastmod }) => {
      const loc = new URL(`${base}${path === '/' ? '/' : path}`, site).href;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};

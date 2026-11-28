import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SERVICES, UPDATED } from '../data/services';

/**
 * Static pages plus every blog post.
 *
 * Still hand-rolled rather than pulling in @astrojs/sitemap. The collection is
 * the case that would normally justify the dependency, but reading it is one
 * `getCollection` call — the package would be earning its keep on six lines.
 *
 * Posts carry their own publication date as `lastmod` rather than today's,
 * so a rebuild does not tell crawlers that year-old articles just changed.
 *
 * Static pages carry a `lastmod` typed here by hand: the date the page's own
 * copy last changed, never the build date. Each was set from the commit that
 * last changed the page's content (`git log -1 --format=%cs -- <files>`), or
 * from the date the page itself prints (/privacy, /terms, the service pages'
 * byline via UPDATED). Change a page's copy, change its date here. A date
 * that is always today teaches Google to ignore the field.
 */
/* Every indexable route, not a subset. /services, /automation, /products and
   /faq were missing from this list for weeks while being linked from the nav
   on every page of the site — real content pages that no crawler was being
   told about. `tests/pages.test.ts` now walks dist/ and fails if a built,
   indexable page is not here, so the omission cannot repeat silently. */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/services', priority: '0.9', changefreq: 'monthly', lastmod: '2026-11-28' },
  ...SERVICES.map((s) => ({
    path: `/services/${s.slug}`,
    priority: '0.9',
    changefreq: 'monthly',
    lastmod: UPDATED.iso,
  })),
  { path: '/automation', priority: '0.9', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/payback-calculator', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/case-studies', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/mmp-audit-findings', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/products', priority: '0.7', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly', lastmod: '2026-11-28' },
  { path: '/about', priority: '0.7', changefreq: 'monthly', lastmod: '2026-11-27' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly', lastmod: '2026-11-28' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-11-25' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: '2026-11-28' },
  { path: '/mcp/privacy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-11-28' },
  { path: '/mcp/terms', priority: '0.3', changefreq: 'yearly', lastmod: '2026-11-28' },
];

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const entries = [
    ...PAGES,
    // A post marked noindex stays live but is not offered to search engines.
    ...(await getCollection('blog')).filter((post) => !post.data.noindex).map((post) => ({
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
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
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

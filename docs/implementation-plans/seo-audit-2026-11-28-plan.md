# SEO, AEO and GEO audit of 28 November 2026: action plan

**Status: code-side actions 2, 5, 6, 7 (part), 8 and 11 delivered 28 November 2026 on branch `seo-audit-fixes`. Actions 1, 3, 4, 9, 10, 12 to 15 are open.**

## Context

A read-only audit of the live site on 28 November 2026 graded technical health
and speed A and authority F. Its summary: the site is healthy and fast, search
engines barely know it yet, and the five service pages were missing from
Google. The redesign had removed the brand name from the main copy of most key
pages and turned four H1s into slogans.

The audit lists fifteen actions. The owner is doing the indexing requests by
hand; this plan covers the rest.

## Approach, and why

Change wording and markup, not design. Each H1 that was a slogan now names
what a searcher types, and the slogan stays directly under it as a display
line, the pattern `/automation` already used. The brand name goes into the
first paragraph of each key page with the smallest edit that reads naturally.

Not done on purpose:

- **No change of voice.** Five pages mix "I" and "we" (`/`, `/services`,
  `/faq`, `/blog`, `/automation`). Which voice each page takes is the owner's
  decision; only the edited sentences were kept consistent.
- **No schema on `/products`.** Still an open owner decision.
- **Blog post titles left alone**, though some pass 60 characters.

## Actions

| # | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | URL Inspection and indexing requests for the five service pages and `/mmp-audit-findings` | Owner, by hand | Open |
| 2 | Name "E2E Apps" in the first paragraph of eight key pages | Code | **Delivered** |
| 3 | First outside links: directory listings, a guest post, community answers | Owner and partner | Open |
| 4 | Weekly AI citation check, first run Monday 30 November | Scheduled | Open |
| 5 | `data-nosnippet` on the cookie banner | Code | **Delivered** |
| 6 | Four H1s rewritten around the search term | Code | **Delivered** |
| 7 | Business `sameAs` no longer lists the founders' profiles; `Blog` schema on `/blog` | Code | **Delivered**, except `/products` |
| 8 | Titles over 60 characters | Code | **Delivered** for the homepage; service titles were already under 60 |
| 9 | Query fan-out for the tracker questions, sub-questions as H2s | Code | Open |
| 10 | Two buyer posts | Draft, then owner sign-off | Open |
| 11 | `/llms.txt`, `/favicon.ico`, `lastmod` on every sitemap URL, stale `/terms` heading | Code | **Delivered** |
| 12 | Separate share images per page type | Code | Open |
| 13 | Decide on the three off-topic posts | Owner | Open |
| 14 | Decide on Clarity; check Search Console is linked to GA4 | Owner | Open |
| 15 | Work that needs search data to exist | After 8 January | Waiting |

Also delivered: each service page links to `/case-studies` and
`/mmp-audit-findings` in its body, and the byline links to `/about`.

## Verification

Run 28 November 2026 on the branch: the build passes; 186 tests pass, eleven
of them new (the banner attribute, the brand name in eight page leads, one H1
per page, the schema changes, `llms.txt`, the favicon, a `lastmod` on every
URL); the contrast check passes in both themes. The four changed page headers
were looked at in screenshots at 1440px and 390px in the dark theme.

## Stated limits

- Nothing here is measured in search yet. Whether the service pages get
  indexed depends on actions 1 and 3, not on this branch.
- The light theme, a real phone and Lighthouse were not checked for this
  branch.
- Side effects to sign off: the homepage title lost "& Fixes" to fit 60
  characters; the service-page "updated" date and the `/terms` date moved to
  28 November 2026.
- Seen and left: `/terms` still says the payback model is "on the homepage";
  the blog's meta description leads with the off-topic posts.

## Critical files

| File | Role |
| --- | --- |
| `src/components/PageHero.astro` | The `line` prop that carries the old headline |
| `src/components/Schema.astro` | Business and Person nodes |
| `src/pages/sitemap.xml.ts` | `lastmod` per URL |
| `public/llms.txt` | Summary for AI tools |
| `tests/seo.test.ts` | Pins every item above |

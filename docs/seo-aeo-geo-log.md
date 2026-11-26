# SEO, AEO and GEO implementation log

A running record of what has been done to make e2eapp.com easier to find on
Google and Bing (SEO), easier to quote as a direct answer (AEO), and more likely
to be named by ChatGPT, Claude, Gemini, Perplexity and Copilot (GEO).

Add a section per session, newest first. Record only what was really done and
checked; anything not checked says so. This repository is public: no client
names, account details or confidential material.

Plan phases referred to below:

1. Site changes (code)
2. Accounts and listings (owner's logins)
3. Weekly AI-visibility routine
4. Fixes driven by Search Console data (from about 8 January 2027)

---

## 2026-11-26: Phase 1, first pass (branch `seo-aeo-phase1`)

### Already in place before this session (checked live)

| Item | State |
| --- | --- |
| Server-side HTML | Static Astro; full content in the raw HTML |
| Sitemap | Submitted to Google; 28 URLs before this session |
| robots.txt | Open; Googlebot, Bingbot and the main AI crawlers named and allowed |
| Titles, descriptions, one H1 | On every page checked |
| Structured data | Service, FAQPage, BreadcrumbList on service pages; BlogPosting and Person on posts; FAQPage on /faq |
| HTTPS | http and www both redirect to https |
| Images | The site has no `<img>` tags, so alt text and WebP do not apply |
| Speed and layout shift | CLS at most 0.009; Lighthouse runs on every pull request |
| Form protection | Honeypot, timing gate and field validation in the form Worker |

### Done

| # | Change | Why | Files |
| --- | --- | --- | --- |
| 1 | New `/about` page: who E2E Apps is, the two founders, the five services. Every sentence reuses copy already on the site. | AI answers name a business when the entity is clear and tied to real people. | `src/pages/about.astro`, `src/components/Founders.astro` (optional label prop) |
| 2 | `/about` structured data: AboutPage, ProfessionalService and both Person nodes with LinkedIn `sameAs`. | Lets search engines link the business to its people. | `src/pages/about.astro` (reuses `src/components/Schema.astro`) |
| 3 | `/about` added to the sitemap and the footer. | Discovery and internal links. | `src/pages/sitemap.xml.ts`, `src/components/Footer.astro` |
| 4 | Each service page intro now names E2E Apps. | Entity salience: the main entity named early. | `src/data/services.ts` |
| 5 | Eleven service-page section headings rewritten as the searches they answer, e.g. "What I check" became "What does an attribution audit check?". | Passage ranking: a heading that says what it answers can be quoted on its own. | `src/data/services.ts` |
| 6 | Each service page's mistakes heading is now specific, e.g. "Common ATT timing mistakes, and the fix.", instead of one shared line. | Same reason as 5; also removes duplicate headings across pages. | `src/data/services.ts`, `src/pages/services/[slug].astro` |
| 7 | SKAN blog post retitled "How SKAdNetwork Works: Attribution and Postback Copies" (URL unchanged). | It competed with the SKAN service page for the same searches. Now the post explains and the service page sells. | `src/content/blog/leveraging-skan-for-ios.md`, `src/data/services.ts` (link label) |
| 8 | `/services` gets an ItemList of the five service pages; `/automation` gets a Service node. | Both had breadcrumbs only. | `src/pages/services.astro`, `src/pages/automation.astro` |
| 9 | Four FAQ answers link to the matching service page (audit, SKAN, revenue, tracking plan). The link sits under the answer, so the FAQ structured data is unchanged. | Internal links into the new pages from a page Google already indexes. | `src/data/faq.ts`, `src/components/Faq.astro` |
| 10 | Package fixes within current versions (`npm audit fix`): 12 warnings down to 5. | Security hygiene; no new packages. | `package-lock.json` |
| 11 | Git history scanned for API keys and tokens. | Security check. | none changed |
| 12 | Six new tests guard items 1 to 9. | Stops these signals being removed by accident. | `tests/seo.test.ts`, three test page lists |

### Verified

- Build passes; 151 tests pass (6 new).
- Chrome at 390 and 1440 px: `/about`, `/faq`, `/services`, `/automation` and one service page have no sideways scroll.
  Screenshots of `/about` and an FAQ link checked by eye. FAQ links are 44 px tall.
- Secret scan: only placeholders (`re_xxx…`, `EAAxxx…`) and embedded font data in design SVGs. No real keys.

### Not done, and why

- **Astro 5 to 7 upgrade.** The remaining 5 package warnings (1 critical) are all in build-time tools and
  need this major upgrade. It is a separate task with its own testing.
- **Rich Results Test.** Run after merge, on the live URLs.
- **Per-page share images.** Lower priority; helps link previews, not rankings.
- **Schema for `/products`.** Waiting on the owner to confirm the tools are live products.
- **Original data from past audits.** Waiting on an owner decision.

### Waiting on the owner (Phase 2)

- Bing Webmaster Tools: import the site from Search Console, submit the sitemap, read AI Performance.
- ChatGPT Business Hub: check for a listing; join the waitlist if services are still "coming soon".
- Directory profiles: Clutch, GoodFirms, LinkedIn company page.
- Google Alerts for "E2E Apps" and "e2eapp.com".
- Decide on Microsoft Clarity (session recordings, loaded only after consent).
- After merge: request indexing for `/about` and the five service pages.

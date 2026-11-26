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

## 2026-11-26: Phase 2 started

### Done
- Search Console: indexing requested for `/about` and the five service pages. Each showed "Indexing
  requested" (priority crawl queue). Before the request, `/services/mobile-attribution-audit` was
  already on Google; the other five were "URL is unknown to Google".
- Listing copy written for Clutch, GoodFirms, LinkedIn and ChatGPT Business Hub:
  `docs/directory-profiles.md`. Taken from the site's own copy; unknowns left as placeholders.

- Bing Webmaster Tools: the owner signed in with Google; the site was imported from Search Console
  (no DNS step). Only e2eapp.com was imported.
- Bing sitemap: `https://e2eapp.com/sitemap.xml` submitted; Bing replied "successfully submitted for
  processing".
- Bing URL Submission: 24 of the 29 sitemap URLs submitted and listed as submitted (all pages except five
  blog posts). Before submission Bing showed most pages as "Discovered but not crawled" and `/about` and
  `/services/att-consent-timing` as "Not discovered". Daily quota is 100.
- Bing AI Performance baseline: 0 total citations (Copilot and partners).
- IndexNow set up: key file `public/89f118ff962dc811cb37e2aa654b8fc0.txt` (public by design) and
  `scripts/indexnow.mjs`, which submits the live sitemap, or given paths, to `api.indexnow.org` and refuses
  to run until the key file is live.

- Google Alerts created for `"E2E Apps"` and `e2eapp.com` (email alerts to the site owner's Google
  account); both listed under "My alerts".
- ChatGPT Business Hub checked: no existing E2E Apps listing; it offers "Create 'E2E Apps'". A different
  business with a similar name ("e2e Group of Companies", Lahore) appears among the matches, so the
  profile must use the exact name, website and description from `docs/directory-profiles.md`.
- ChatGPT business profile created (the owner accepted OpenAI's terms):
  - Domain verified with a DNS TXT record `openai-business-profile.e2eapp.com`, added in Cloudflare
    (TTL 300, with a comment naming its purpose). Keep it: removing it may undo the verification.
  - Category "Marketing agency"; description (the box allows 300 characters): "E2E Apps does mobile
    growth and measurement for subscription and ad-monetised apps: attribution audits, SKAN and
    AdAttributionKit setup, ATT timing, event tracking plans and subscription revenue tracking. Two
    specialists and no hand-offs: you talk to the people doing the work."
  - Contact email hello@e2eapp.com, verified with the emailed code. No phone (the site publishes none).
  - Delivery: "We don't offer delivery". Returns: "Returns not accepted" (a service, not goods).
  - Status: DRAFT. Publishing needs the owner's government-ID verification in Business Hub. Its
    insights page (mentions, website clicks) shows no data yet.

### Not done
- Five blog posts not yet submitted to Bing (one-campaign-per-language, leveraging-skan-for-ios,
  renewals-happen-while-your-app-is-closed, the-strategy-was-right-the-traffic-was-wrong,
  where-churn-shows-up-in-your-numbers): the batch form did not open in the automated browser. They go
  through IndexNow after this branch is merged.

---

## 2026-11-26: Phase 1 live check (after merge)

### Verified on e2eapp.com
- `/about` and all five service pages return 200, with and without a trailing slash; `/about` is in the
  sitemap (29 URLs) and linked from the homepage footer.
- `/services` carries the ItemList, `/automation` the Service node; `/faq` shows four service links.
- New headings, intros and the SKAN post title are live.
- Deploy and Lighthouse checks passed on the merge.
- Google Rich Results Test, run on `/about`, `/services/att-consent-timing` and `/faq`: each page has
  3 valid items (Breadcrumbs, Local business, Organisation). The Local business item reports
  2 non-critical issues on each page.

### Not checked
- What the 2 non-critical issues are: the tool's detail screen did not open in the automated browser.
  Probably the optional address and phone fields, which a remote business does not publish; to be
  confirmed by opening the test by hand.

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

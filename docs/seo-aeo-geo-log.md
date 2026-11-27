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

## 2026-11-27: Visitor counting and source tracking

### Found
- GA4, last 28 days (it went live on 25 November): 6 sessions, all Direct. Search Console, 23 to 25
  November: 0 clicks, 11 impressions, average position 44.5. Bing: no indexed pages yet. No real leads.
- Source tracking already works: a test visit tagged `utm_source=utm-check&utm_medium=test` sent GA4 a
  page view carrying those tags, with consent granted. The site also keeps UTMs, referrer and landing page
  and sends them with every enquiry. The "Direct" total reflects almost no outside visits yet, GA4's one-day
  processing delay, and visitors who never press Got it, whom GA4 does not record.

### Done (branch `cf-web-analytics`)
- Cloudflare Web Analytics site created for e2eapp.com and its beacon added to every page: a cookieless
  count of every visit, page, referrer and country, including visitors who never press Got it.
- `/privacy` updated to say so, in the short version, the no-consent section and the processor table.

---

## 2026-11-27: Indexing requested for the new pages (after PR #16)

- Live: `/payback-calculator`, `/case-studies` and `/mmp-audit-findings` return 200; the sitemap lists 32 URLs.
- IndexNow: all 32 sitemap URLs, HTTP 200.
- Google Search Console, URL Inspection then Request indexing: the three new pages (each was "URL is unknown
  to Google") and a recrawl of `/services` and the paywall case study (both already indexed). Each showed
  "Indexing requested".
- Bing Webmaster Tools, URL Inspection then Request indexing: the three new pages (each already "Discovered
  but not crawled" via IndexNow). Each showed "URL submitted successfully". 98 of 100 daily submissions left.

---

## 2026-11-27: Findings page from the 10 audits

The owner confirmed that text repeated across audit workbooks was left over from a copied template.

### Done (branch `growth-plan`)
- `/mmp-audit-findings`: nine findings, most common first, each with its count out of 10, what it does to
  the numbers, and a link to the page that fixes it. ATT handling 10 of 10, revenue or purchase events 9,
  SKAN conversion values or reporting 6, re-engagement settings 6, partner postbacks and integrations 6,
  uninstall measurement 5, view-through attribution 4, web-to-app tracking 3, server-side renewals 2.
- Method on the page: one count per audit when at least one check in the area needed fixing; attribution
  platform checks only; checks copied word for word between workbooks, and ones marked not applicable, not
  counted; every match read by hand. A "What this cannot show" note says the apps asked for an audit and
  ten is a small sample.
- Not counted: findings that only recommended adding SKAdNetworkItems to the advertised app.
- No app or client named anywhere (scanned). In the sitemap and footer; linked from `/case-studies`.
- One test; 158 pass.

---

## 2026-11-27: Growth plan, first build

Plan saved as `docs/growth-plan.md` (proof, entity and buyer content, from the three audits and a
competitor teardown).

### Done (branch `growth-plan`)
- `/case-studies`: one card per case with client type, market, windows compared and the work done; then
  problem, change, result, and "What this cannot show". Two cases, figures copied from the posts. In the
  sitemap and footer; CollectionPage structured data.
- `/services`: "Pick your situation" (seven situations, each linked to its page) and "Ways to work
  together": fixed-price audit, monthly retainer, and a free first look. No prices.
- Contact form: "send your app's store link and get three measurement checks in writing, free".
- Two tests; 157 pass. Pages checked with headless Chrome at 1440 px.

### Blocked
- Findings page from the 10 audits: the extraction (1,500 checks) found three files sharing about half their
  rows word for word, including status. The GA4 tab is identical in all eight files that have one, so it
  is excluded. Counts wait for the owner to confirm.

---

## 2026-11-27: Third outside audit (re-audit)

The re-audit found all 30 sitemap URLs pass the shared checks and confirmed the earlier fixes are live.

### Done (branch `reaudit-fixes`)
- Paywall case study: "Whatever moved below it moved because of the change" replaced. The post now says the
  change came with the paywall release and that the comparison cannot separate the three changes that shipped
  together. The figures are unchanged.

### Checked
- Old GitHub Pages link to the case study: HTTP 301 to the matching e2eapp.com page.

### Left as is, and why
- Its suggested SKAN heading ("Audit finding: this app's SKAN schema captured only revenue") describes one
  app. The card lists a common mistake, not a single finding, and already reads "Mistake: The SKAN schema
  measures only revenue".

### Not done
- URL Inspection for `/payback-calculator`: the automated browser disconnected; to run in the next session.

---

## 2026-11-27: Live check after merge (PR #13 and #14)

- Checked on e2eapp.com: `/payback-calculator` is live with its H1 and in the sitemap; the homepage links it
  and its three cards go to their own pages; the form shows "How did you hear about us?"; `/about` shows
  initials, no placeholder and no repeated closing line; `/products` and `/automation` show their specific
  H1s; the case study title, the "Mistake:" headings, the related-page link on posts and the JQL note are
  live; the homepage has no founders section.
- IndexNow: all 30 sitemap URLs submitted, HTTP 200. Passing single paths from Git Bash failed (422)
  because Git Bash rewrites `/path` arguments into Windows paths; prefix the command with
  `MSYS_NO_PATHCONV=1`, or submit the whole sitemap.

---

## 2026-11-27: Remaining audit items

### Done (branch `hide-homepage-founders`)
- New page `/payback-calculator`: the calculator, the method in plain words for subscription and ad-monetised
  apps, two worked examples, why dashboards show a later payback, and the model's limits. The examples are
  computed at build time by the calculator's own model from its default inputs (labelled as example inputs,
  not client data). WebApplication structured data; in the sitemap and footer; the homepage calculator links
  to it.
- Service pages: every mistake card heading now starts "Mistake:" (a visible label plus hidden text in the
  heading), so it reads on its own when quoted. The SKAN card now says "The SKAN schema measures only revenue".
- Blog: every post names its next page (`related` in the front matter, required for new posts) and links to
  it: a service page or the payback calculator. All 15 mapped.
- JQL tutorial: a dated note that Mixpanel lists JQL as in maintenance mode, with its recommended
  alternatives. The Python and Pandas tutorials use standard functions and were left as they are.
- `/about`: the founders' closing line, which repeated the heading and the page lead, removed there.
- Contact form: optional "How did you hear about us?" (Google search, ChatGPT, Claude, Perplexity, Gemini,
  Microsoft Copilot, LinkedIn, a colleague or referral, other). The form Worker accepts only those values and
  shows the answer in the lead email. Worker deployed with its existing settings and secret kept.
- Five new tests; 155 pass.

### Verified
- Test enquiry on the live site, tagged `utm_campaign=internal-form-test`: a blank submit showed four field
  errors, sent no analytics event and did not reach the Worker; the real submit showed the success message,
  sent exactly one `generate_lead` to GA4, and delivered one email within a second carrying the landing page,
  UTM source and campaign. A second test sent straight to the Worker with the new field delivered "Heard about
  us: ChatGPT". Both test leads are in GA4 under the internal campaign.
- Google: the Page indexing summary is dated 23 November (before the domain move) and shows 0 indexed, 19
  "Crawled, currently not indexed". URL Inspection today: the homepage and a blog post are indexed;
  `/services/att-consent-timing` is "Discovered, currently not indexed" (indexing requested on 26 November).
- Bing Site Explorer: no indexed URLs yet, two days after submission.
- GA4 already has a predefined "AI Assistant" channel in its default channel group, so visits from AI
  assistants get their own row without a custom group. A draft custom group was started and discarded unsaved.

### Not done
- Outreach for links (newsletters, practitioners, partners): needs a researched prospect list and the
  owner's emails.
- A case study from the owner's past audits: next content piece.
- IndexNow for the new and changed pages: after this branch is merged.

---

## 2026-11-27: Fixes from a second outside audit

An outside audit (ChatGPT, 27 November) checked all 29 sitemap URLs: each has a distinct title, one H1, a
meta description, a self-canonical and parseable structured data. Its fixes, and what was done:

### Done (branch `hide-homepage-founders`)
- Homepage "Find the gaps" cards: each linked "Learn more" to `/services`. Now each links to the page that
  answers it, with a label that says so: subscription revenue tracking, event tracking plan, and the payback
  map.
- `/about` founder cards: "Real portrait to be added" replaced by the founders' initials. The homepage
  section stays hidden until portraits exist.
- Specific H1s: `/automation` is now "AI reporting for app growth teams" and `/products` "Monetization and
  app store optimization tools", set as the eyebrow line so the page looks the same.
- Paywall case study retitled "Paywall case study: cost per payer fell from $92.95 to $20.91" (figures
  from the post itself; URL unchanged). The post already states the 18-day and 9-day windows.
- Already in place: old GitHub Pages links return 301 to the matching e2eapp.com page (checked).

### Not done
- Standalone payback calculator page with worked examples: planned, not built.
- Test enquiry end to end: waiting on the owner's go-ahead.
- The "SKAN only measures revenue" card heading: left as is; it sits under a heading that names it as a
  mistake.
- Blog-to-service mapping for the 15 posts: later, with Search Console data (Phase 4).

---

## 2026-11-27: Phase 3 set up

### Done
- Phase 2's remaining account work (social profiles, LinkedIn page, Clutch, GoodFirms, ChatGPT ID check) handed
  to the US-based founder, with a ready-made profile kit.
- Weekly AI citation tracker created as a private Google Sheet. Tabs:
  - Questions: 20 buyer questions, each tied to the page that should answer it. Q01 and Q02 are from the
    25 November baseline; the rest are written from the service pages.
  - Runs: one row per question per engine (ChatGPT, Perplexity, Claude, Gemini), with whether E2E Apps was
    named, whether e2eapp.com was cited, and which businesses were named.
  - Summary: counts and named rate per engine for a chosen week, plus the baseline (0 of 7).
- Formulas checked with a test row, then the row was removed.

### Not done
- First weekly run: planned for Monday 30 November; first comparison with the baseline around 10 December.

---

## 2026-11-27: Phase 2 continued

### Done
- IndexNow: all 29 sitemap URLs submitted after the key file went live (HTTP 202), including the five
  blog posts left over from Bing's form.

### Not done
- ChatGPT business profile: identity verification needs the US-based founder, with the company address
  and tax details. On hold.
- LinkedIn company page: on hold. A different business already has a LinkedIn page named "E2E Apps"
  (software development, Atlanta), so ours will need a distinct public URL and the same description as
  the other profiles.

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
- **Original data from past audits.** Owner decision (27 November): the audits are the owner's own work and can be used, anonymised, with no client names.

### Waiting on the owner (Phase 2)

- Bing Webmaster Tools: import the site from Search Console, submit the sitemap, read AI Performance.
- ChatGPT Business Hub: check for a listing; join the waitlist if services are still "coming soon".
- Directory profiles: Clutch, GoodFirms, LinkedIn company page.
- Google Alerts for "E2E Apps" and "e2eapp.com".
- Decide on Microsoft Clarity (session recordings, loaded only after consent).
- After merge: request indexing for `/about` and the five service pages.

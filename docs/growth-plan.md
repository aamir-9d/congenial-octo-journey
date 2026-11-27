# Growth implementation plan: proof, entity and buyer content

Written 27 November 2026. Sources:

- Three outside audits of e2eapp.com (27 November): the ChatGPT plan, the 29-page audit and the 30-page
  re-audit. Their technical findings are fixed; see `docs/seo-aeo-geo-log.md`.
- A teardown of a successful independent SEO consultant's site, used as a model for how a one- or
  two-person consultancy proves itself: a results page, a case-studies hub, a strong Google entity,
  posts for buyers choosing who to hire, and clear ways to engage.

This plan sits inside Phase 2 and 3 of the SEO/AEO/GEO plan. Progress is logged in
`docs/seo-aeo-geo-log.md`; this file is updated as items close.

## Rules

- Every figure comes from a real source: the owner's audit files, an existing post, or the calculator's
  model. Nothing is estimated and presented as measured.
- Client names never appear. Findings are counts and patterns.
- Facts the site does not yet have (prices, dates, addresses) are marked `[OWNER]` here and are not
  published until supplied. Work goes ahead around them.
- No new npm packages.

## Workstreams

| # | Item | Why | Needs from the owner | Status |
| --- | --- | --- | --- | --- |
| 1 | **Findings page: what 10 MMP audits found.** Counts of each problem across the audits (ATT timing, SKAN schema, uninstall measurement, web-to-app, renewals and others), each linked to the service that fixes it. | Original data no competitor has; the kind of page AI answers cite. | Owner confirmed (27 November) that repeated text was left over from a copied template. Copied checks are not counted. | Done: `/mmp-audit-findings`, nine findings |
| 2 | **Case-studies hub** at `/case-studies`: one card per case with market, problem, what changed, result and the window compared, linking to the full write-up. Starts with the paywall case and the portfolio paywall case already on the blog. | Proof in one place; the format buyers and AI answers can read quickly. | More cases later, from the owner's portfolio. | Done: `/case-studies`, two cases |
| 3 | **Ways to work together** on `/services`: fixed-price audit, monthly retainer, consulting; and "pick your situation" (traffic looks wrong, launching SKAN, revenue missing, starting with an MMP) pointing to the right service. | Shortens the path from problem to the right page. | Prices: `[OWNER]`. Until then: "Figures on a call", as the site says today. | Done: "Pick your situation" (7 routes) and the two engagement shapes the FAQ already names; no third shape invented |
| 4 | **Free first look:** "Send your app link and we will reply with three measurement checks." On the contact section and the service pages. | A low-risk first step for a buyer. | Confirm the offer stays (it is in the plan as approved on 27 November). | Done: on `/services` and the contact form |
| 5 | **Buyer posts**, each with FAQ, sources and a plain verdict: "Attribution consultant vs agency vs in-house", "AppsFlyer vs Adjust vs Singular for subscription apps", "What an MMP audit costs". | Covers the questions people ask before hiring. | Pricing post waits for prices `[OWNER]`. | Planned |
| 6 | **Google Business Profile** for E2E Apps as a service-area business (address hidden), then linked from the site's structured data. | Makes E2E Apps a known entity to Google and the assistants that use it. | US address and phone for verification `[OWNER/partner]`. | Handed to partner |
| 7 | **Founder timelines on `/about`**: roles and years for both founders. | Shows experience the way buyers check it. | Dates and roles `[OWNER]`, or permission to use the public LinkedIn profiles. | Waiting |
| 8 | **Indexing**: request indexing for `/payback-calculator` and each new page; IndexNow after every merge. | New pages found faster. | None. | Ongoing |

## Not doing

- A mocked search result or AI answer on the homepage that names E2E Apps. It would show something that
  has not happened.
- A place name in every title. E2E Apps serves clients anywhere; titles name the problem.
- Off-topic posts.

## Order

1, 2, 3 and 4 in the first branch; then 5 (two posts, pricing later); 6 and 7 when the owner's details
arrive; 8 after every merge.

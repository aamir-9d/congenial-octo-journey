# E2E Apps — website audit and redesign recommendation

**Date:** 19 September 2026  
**Reviewed revision:** 3f4ef61  
**Status:** Audit and proposed direction. Website implementation has not started.

**Recommendation**

Keep the existing logo, amber accent, dark palette, and typefaces. Recompose the site around visible evidence, specific services, and the people doing the work. Add automation as a service offering, with a concise homepage demonstration and a dedicated /automation page.

The user confirmed that Claude will connect to client accounts behind the scenes. A customer account portal is outside this scope.

The main opportunity is to shorten the distance between the promise and the proof. The current site has useful original material, but visitors must pass through a familiar hero treatment and a large problem section before reaching it.

**1. What was reviewed and how**

Reviewed the PRD, design-system document, previous redesign plan, brand brief, desktop and mobile implementation briefs, design-export structure and identity definitions, current Astro components, service/product/FAQ content, measurement scripts, and deployment workflow.

A fresh local build completed successfully. All 95 existing tests passed. The palette checker passed all 22 evaluated text/graphic pairings. These are useful safeguards; they do not establish full accessibility or conversion effectiveness.

Headless Chrome rendered the homepage at window widths 360, 390, 430, 640, 641, 768, 1024, and 1440. Screenshots were visually inspected at desktop and narrow widths. Follow-up browser checks covered the homepage, Services, Products, FAQ, sticky navigation, and mobile-menu keyboard behavior. Blog content and routes were inspected in source/build output; the temporary audit server did not resolve the blog directory route correctly, so that local harness result is not a site defect.

The first responsive run used desktop scrollbars: the 1440 window had 1425 CSS px of content width; the 390 window had 375 CSS px. A separate mobile-emulation interaction pass used a true 390 CSS px viewport.

External requests were blocked during browser checks. No contact form was submitted. Production booking, email delivery, analytics collection, Lighthouse scores, and client-platform connections were not verified.

**2. What the previous audit already resolved**

Do not repeat the previous audit as if it describes the current page:

- FAQ, products, and the detailed stack have already moved off the homepage.
- Navigation labels now point to the corresponding destinations.
- The scan-line animation has been removed, although its empty element remains.
- Button elevation uses neutral shadows.
- The dashboard chart line is now #5F666F and clears the tested contrast threshold.
- The homepage now contains eight principal content sections.
- A mobile navigation sheet exists.

The remaining work is substantial: section hierarchy, repeated layout patterns, early evidence, human presence, offer clarity, functional conversion paths, and automation positioning.

**3. Findings, ranked**

| Priority | Finding and evidence | Implication and recommended change |
| --- | --- | --- |
| P0 | The fresh local build contains no Calendly embed and no GTM loader. Their configuration lines remain commented out in .github/workflows/deploy.yml. | The visible “Book a call” promise currently leads to a contact section with a form in this build. Verify production configuration, make booking work, and confirm collection before judging conversion. If booking is unavailable, label the action honestly. |
| P1 | Sticky navigation fails in the browser: after scrollY=3000, its top is -3000 despite position: sticky. Its .page ancestor has computed overflow-y: auto. | The booking action disappears during a long page. Rework the overflow/scroll-container relationship and verify the CTA remains reachable while scrolling. |
| P1 | The mobile menu opens and receives focus, but Shift+Tab from its close button moves focus to the opener behind the overlay. The sheet has no dialog role. | Keyboard users can leave the visible interaction. Use complete modal-dialog behavior: a name, focus containment, inert background, Escape, and focus restoration. |
| P1 | The calculator begins approximately 2,172 px down the desktop build and 2,637 px down the narrow build. The Problems section alone is approximately 1,441 / 2,019 px tall. | The first distinctive interactive proof arrives late. Fold problem recognition into a compact introduction and move the calculator immediately after the hero and its evidence note. |
| P1 | Hero.astro combines a centered pill, headline, two buttons, seven platform chips, dot texture, and two drifting color blooms. | This is the most familiar template-like composition. Use a quieter split composition, clear service category, and an actual work artifact. |
| P1 | Most sections use the same centered eyebrow, h2, lead, and card pattern. Section padding and column width are largely uniform. | Important material does not stand out. Give the hero, calculator, case study, process, and people different layouts tied to their purpose. |
| P1 | Automation has no dedicated route, navigation entry, or explicit service scope. | Buyers cannot recognize this capability. Add /automation and one homepage section that demonstrates a concrete workflow. |
| P1 | The fixed-price audit and monthly implementation/growth retainer are explained in FAQ content, while /services opens with problems and technical bundles. | The buying decision is harder than it needs to be. State the engagement options, deliverables, and next step on Services and summarize them on the homepage. |
| P2 | No founder photographs are present in the expected public/img paths. Generic user icons appear instead. | The site promises direct work with two people but hides the strongest human evidence. Use real portraits when supplied; until then, use deliberate text introductions. |
| P2 | Case-study results are compressed into small monospace rows inside a large card. | Valuable evidence reads like footnotes. Enlarge one result, pair it with the real artifact, and retain the qualifying context beside it. |
| P2 | No main landmark was found on the inspected homepage, Services, Products, or FAQ routes. The mobile nav CTA measured approximately 42.4 px tall. | Add a main landmark and skip link, and meet the project's 44 px target for the booking control. Assess labeled control hit areas, not only raw input rectangles. |
| P2 | “Find what your stack is missing” links to contact, and “See how it works” points to the Loop. | The first label can imply an immediate diagnostic. Use “Book a call” consistently; make “Try the payback model” a subordinate text link to the calculator. |
| P2 | Product cards lead directly to PDFs. | Keep the PDFs, but explain each tool's availability and how someone can obtain it in HTML. Do not imply self-serve access where none exists. |
| P2 | The brand book still describes logo selection as pending, while the code/design system selects direction 1f. Historical notes contradict newer fixes. | Update the current design documentation and clearly identify archived guidance. Preserve original design exports unchanged. |

P0/P1 ordering reflects task importance, not a quantified conversion-loss estimate.

The current hero also contradicts the newer design-system description of one accent and no gradients: its blue bloom is explicitly hardcoded. Several scoped styles hardcode sizes and colors despite the token-only rule. The redesign should resolve these inconsistencies deliberately.

The headline's claim that the visitor killed a campaign that broke even in month nine is too universal. That is a modeled example under specific assumptions, not a fact about every visitor's account. Keep the underlying argument and attach the number to the calculator example.

The case study is an observational before/after comparison with several simultaneous changes. Similar spend and installs make the comparison useful; they do not make it a randomized experiment or isolate the effect of the purchase dialog.

**4. Three possible directions**

| Direction | Strength | Tradeoff |
| --- | --- | --- |
| Evidence-led consultancy — recommended | A real engagement artifact, prominent calculator, concise methodology, named operators, and practical automation. Builds on the existing strongest material. | Requires careful editing and real artifacts instead of decorative filler. |
| Founder-led practice | More personal opening, portraits and first-person explanations, a shorter technical introduction. | Strong when visitors already know Aamir; colder technical buyers may need evidence sooner. |
| Automation-led service | Leads with connected accounts, workflows, and Claude-assisted analysis. | Could obscure the core measurement/growth proposition and imply mature capabilities before delivery is validated. |

The recommended direction integrates automation into the existing argument: trusted measurement makes both human decisions and automated workflows more useful.

**5. Proposed hero**

Desktop: a roughly 60/40 split. Left: category, headline, short explanation, one primary action. Right: a cropped real artifact from the PDF scanner engagement with a clear caption and one qualified result.

Draft copy:

> Measurement, growth & automation for mobile apps
>
> **See what your app really earns.**
>
> We fix attribution, reconcile ad and subscription revenue, and turn it into clearer spending decisions. Aamir handles measurement and growth. Faisal builds the infrastructure and automation.
>
> **Book a call**
>
> Try the payback model →

Supporting line:

> Working across Google Ads, AdMob, RevenueCat, and your measurement stack.

The primary action retains the existing 30-minute-call framing if booking is configured. It should explain that the visitor will discuss the setup and determine the next step; avoid implying a complete account audit before access is granted.

Suggested evidence panel:

- Caption: “From a PDF scanner engagement.”
- A real paywall image or annotated crop from the existing article assets.
- Prominent result: cost per payer, $92.95 → $20.91.
- Nearby qualifier: 18-day before / 9-day after windows, similar daily spend, multiple paywall and billing changes.
- Link to the complete case study.

Use sanitized existing evidence. Do not expose client names or invent an activity feed, customer logos, testimonials, or screenshots.

If the actual screenshot cannot be used, the fallback is a clearly labeled illustrative payback chart generated from the existing model, not a pretend live dashboard. Day 277 must remain explicitly a model result.

Mobile order: category → headline → short lead → primary action → secondary link → compact evidence excerpt. Place the detailed artifact below the action so it does not delay the first useful click.

Remove the decorative grid, color blooms, badge pill, and scrolling chip inventory from the hero. Preserve the logo and typefaces. Let the headline render immediately; animate supporting material only when it helps.

**6. Proposed homepage sequence**

| Order | Section | Content and layout |
| --- | --- | --- |
| 1 | Hero with one evidence note | Split composition with an actual engagement artifact; concise category and consistent booking action. |
| 2 | Payback model | A dominant full-width section. Explain the question it answers before controls. Keep modes, presets, assumptions, caveats, and accessible summary. |
| 3 | Featured case study | An editorial two-column layout with a large result, short explanation, real visual, and explicit qualifiers. Merge selected Proof content into this section. |
| 4 | Automation | One worked example: connected sources → checked analysis → recommendation → approved action. Link to /automation. |
| 5 | How the engagement works | Compact sequence: audit → repair → operate and monitor. Explain the fixed-price audit, implementation/growth retainer, and where automation is scoped. |
| 6 | Aamir and Faisal | Names, real roles, short direct bios, portraits when available, and LinkedIn links. Avoid large identical bio cards. |
| 7 | Contact | Clear next step, working booking path, alternative form, and explanation of what happens after contact. |

The current four-stage Loop can be summarized inside the engagement section; its detailed explanation can remain on Services. Keep existing anchors where possible to preserve inbound links.

Use about 1,100–1,400 words of visible marketing narrative as an editorial budget, excluding expanded calculator assumptions and reference material. This is a proposed constraint, not a proven optimum.

Suggested top-level navigation:

**Services · Automation · Results · About · Insights · Book a call**

Results and About can be homepage anchors. Insights maps to the existing blog. Products and FAQ remain linked from Services, relevant sections, and the footer; retain their existing routes.

**7. Visual changes that will make the work feel authored**

- Establish three scales of emphasis: hero, major evidence sections, and supporting material.
- Use left-aligned editorial copy where a reader needs to compare paragraphs and evidence. Reserve centered treatment for a small number of deliberate moments.
- Vary spacing by purpose. Compress the transition into proof; give the calculator enough room to operate.
- Use full-width tonal bands for meaningful transitions, with restrained near-neutral grounds.
- Replace repeated rounded-card containers with open rows, rules, captions, and direct layouts.
- Make the most important result larger than its eyebrow. Keep monetary units and before/after labels adjacent.
- Use monospace for true data and labels; use readable body type for explanations and caveats.
- Show real work: the paywall, a redacted audit excerpt, a tracking-plan excerpt, or a source-backed automation report. Only use assets that can actually be supplied.
- Preserve keyboard access, readable chart labels, reduced motion, and the validated calculator behavior.
- Treat the existing 300 px phone chart as a known constraint. Do not change calc-model.ts or distort its chart to match an old 150 px mockup during this redesign.

The signed-off older layout explicitly requires every section header to be centered. The new recommendation intentionally changes that rule. Update docs/design.md and layout-specific tests together after direction approval; retain the tests protecting data accuracy, links, single h1, focus, and responsive behavior.

**8. Where automation belongs, and what the page should say**

Place Automation after the case study. Visitors first see the problem, explore it, and see evidence of practical work. Automation then shows how the monitoring and investigation can continue.

Homepage draft:

> **Ask one question across your growth stack.**
>
> We connect Google Ads, AdMob, and RevenueCat to Claude so your team can investigate changes, reconcile reports, and prepare the next action with the source data attached.
>
> Example: “What changed in spend, ad earnings, and subscription revenue last week?”
>
> **Explore automation →**

This is proposed service copy. Publish only capabilities that are available to deliver, and state the status of anything still being piloted.

Use one static or user-controlled workflow demonstration. Label example data clearly. Each stage should communicate an output:

1. Connect the approved accounts.
2. Validate dates, currencies, account mappings, and data freshness.
3. Produce an explanation with source references and unknowns.
4. Present any supported account change for approval.
5. Record the result and monitor the outcome.

The /automation page should contain:

- Outcomes: less repetitive reporting, faster investigation, and traceable decisions.
- Three platform-specific examples and a clear support matrix.
- One sample report with period, sources, findings, uncertainties, and next action.
- What access is required and who controls it.
- What runs automatically and what requires approval.
- Delivery scope and its relationship to the audit/retainer.
- A call to discuss the client's stack.

Avoid a public “Connect your accounts” button because the selected scope is a consulting service, not a client portal. Avoid claiming that Claude can “manage everything.”

**9. What the integrations actually support**

Verified against official sources on 19 September 2026:

| Platform | Practical starting scope | Boundary |
| --- | --- | --- |
| Google Ads | Account discovery, campaign reporting, budgets/status inspection, and GAQL-based diagnostics using the official MCP server. | The current official server is read-only. It cannot change bids, pause campaigns, or create assets. Those actions require a separately implemented and authorized Google Ads API workflow. |
| AdMob | Account/app/ad-unit information and network/mediation reporting through the documented API, exposed through an audited adapter. | No official Google-maintained AdMob MCP server was established by this review. Community implementations exist but require evaluation. The API exposes selected management operations in v1beta; validate each intended operation before offering it. |
| RevenueCat | Official hosted MCP access to projects, products, offerings, and analytics. | It also exposes configuration changes. Enable only needed tools and credentials; validate project permissions and the exact operation before enabling writes. |

Sources: [Google Ads MCP developer guide](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server), [Google Ads MCP repository](https://github.com/googleads/google-ads-mcp), [AdMob API reference](https://developers.google.com/admob/api/reference/rest), [RevenueCat MCP documentation](https://www.revenuecat.com/docs/tools/mcp).

Suggested first workflows:

- Google Ads: scheduled spend and conversion-value checks; explain changes and flag anomalies for review.
- AdMob: investigate estimated-earnings changes through impressions, eCPM, country, app, and ad-unit breakdowns.
- RevenueCat: review subscription trends, renewals, refunds, and billing issues where the connected tools expose the necessary data.
- Combined: produce an app/country/period operating brief with explicit limits on attribution.

AdMob reports expose estimated earnings and impression RPM, among other metrics. They do not alone establish user-level campaign profitability or provide all retention/DAU inputs needed for ARPDAU. [AdMob network-report reference](https://developers.google.com/admob/api/reference/rest/v1/accounts.networkReport/generate)

**10. How to centralize access for Claude**

Claude is the MCP client/host using tools exposed by servers. Those servers connect to Google, RevenueCat, or your own vetted data service.

For the first service implementation, use a private, client-scoped operator environment:

~~~mermaid
flowchart LR
    Operator["Aamir / Faisal"] --> Claude["Claude in a client-scoped workspace"]
    Claude --> Ads["Official Google Ads MCP · reporting"]
    Claude --> AdMob["Audited AdMob adapter"]
    Claude --> RC["RevenueCat MCP · selected tools"]
    Claude --> Data["Validated metric views and source snapshots"]
    Ads --> Google["Authorized Google Ads accounts"]
    AdMob --> Publisher["Authorized AdMob accounts"]
    RC --> Subs["Authorized RevenueCat projects"]
    Claude --> Proposal["Proposed supported change"]
    Proposal --> Approval["Operator / client approval"]
    Approval --> Executor["Separate scoped API executor"]
    Executor --> Log["Execution record and outcome checks"]
~~~

Centralize the operating context and definitions:

- Explicit mapping from client → app → Google Ads customer → AdMob app → RevenueCat project.
- Reporting timezone, currency, period, and source refresh time.
- Definitions for spend, gross receipts, net proceeds, refunds, subscription revenue, and estimated ad earnings.
- Reconciliation rules and known coverage gaps.
- A record of findings, approvals, executions, and errors.

Do not simply sum all dashboards. Google Ads conversion value may already represent revenue also present in RevenueCat or ad-monetization reports. It is not an additional revenue stream.

A shared date or country is not a campaign attribution key. Campaign/cohort profitability may require AppsFlyer, Adjust, Firebase/BigQuery, or impression-level revenue data with legitimate join keys. If those keys are absent, present aggregate comparisons and the limitation instead of inventing a ROAS calculation. Calendar-period revenue from old subscribers is not the return of newly acquired cohorts.

Start with provider servers plus validated data views. Add a shared store such as BigQuery when reproducible cross-source reports and historical snapshots justify it. Separate client credentials and enforce account/project restrictions in tools or backend authorization; a prompt alone is not an access boundary.

Claude Code supports local and remote MCP connections. A hosted operator service can use remote MCP connections through the Claude API, with authentication managed by the application. [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp), [Claude API MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)

Scheduled automation also needs a scheduler, job execution, retries, deduplication, source snapshots, and failure reporting. An MCP connection in a chat does not create an unattended daily service. Keep scheduled reporting separate from account mutations; later actions should have explicit limits, approval records, and post-execution checks.

The public Astro site remains static. Credentials, OAuth callbacks, scheduled jobs, and MCP services belong in a separate private runtime. They cannot run securely inside the public GitHub Pages bundle. The existing contact-form Worker has a different responsibility and should not become a general client-account automation gateway.

**11. Conversion and measurement**

Optimize for qualified conversations, matching the PRD. More clicks by themselves are not success.

The page should provide a simple sequence of reasons to continue: identify the app problem, see evidence, try the calculator, understand the service, meet the operators, and book.

Existing instrumentation includes calculator actions, section views, scroll depth, lead submission, and booking completion. It does not include a dedicated CTA-click event in the inspected analytics module. Add a small set of explicit events:

- cta_click with placement, destination, and service intent.
- automation_example_view or automation_example_select if the example is interactive.
- booking_start and booking_complete.
- form_start, validated generate_lead, and form_error.
- Qualified opportunity status from the actual sales process, with appropriate attribution.

Keep calculator and engagement events as diagnostic signals. Measure primary outcomes as qualified booked conversations and qualified enquiries, segmented by acquisition source, device, and service interest. Do not forecast a percentage uplift without a baseline.

Review section-view semantics: the code configures a 0.5 threshold but records any callback with isIntersecting, without checking intersectionRatio. Define whether the event means “entered the viewport” or “substantially viewed,” and test the chosen meaning on sections taller than a phone screen.

There is also a CI verification issue to address with the redesign: the deployment workflow's live checkout explicitly selects main even during a pull-request build. Preserve pinned-main deployment while ensuring a separate check actually tests the proposed PR revision. The preview tests and contrast step are advisory; they should not be mistaken for release-blocking acceptance.

**12. Delivery sequence and acceptance**

1. Agree on the evidence-led direction and proposed hero.
2. Turn this recommendation into the written redesign specification and implementation plan.
3. Recompose the public site: hero, earlier calculator, case study, automation section/page, service offers, founders, contact, and navigation.
4. Fix the browser-confirmed navigation and menu defects; verify booking and measurement configuration.
5. Validate desktop and mobile with real browser interaction, keyboard navigation, screenshots, and the existing numerical/content checks.
6. Pilot the private automation service with an authorized account and read-only reporting before enabling any account changes.

Acceptance for the public site:

- A visitor can identify the audience, service, evidence, and next step from the first screen.
- The calculator is the next principal section, with its validated six figures unchanged.
- The navigation/booking control remains reachable while scrolling.
- The mobile menu supports complete keyboard interaction.
- No clipped content at representative phone, tablet, or desktop widths.
- Exactly one h1 per route, useful landmarks, readable contrast, and reduced-motion support.
- Booking and form paths work against the intended production configuration.
- CTA and conversion events are observed in the actual collection pipeline.
- Automation copy distinguishes analysis, recommendations, and supported execution.
- No client names, fabricated metrics, or unlabeled sample data.
- Existing design exports and calc-model.ts remain unchanged.

Open implementation inputs: real founder portraits, the working booking destination, production analytics configuration, the final domain decision, and which automation workflows are already deliverable versus still to be piloted. These do not prevent the redesign direction from being reviewed.

**Evidence snapshots**

[Desktop hero](audit-assets/2026-09-19/home-desktop-before.png) · [Narrow hero](audit-assets/2026-09-19/home-narrow-before.png) · [Desktop case study](audit-assets/2026-09-19/case-study-before.png) · [Measured layout data](audit-assets/2026-09-19/layout-findings.json)

This audit makes design recommendations and records observed behavior. It does not claim that the redesign, production integrations, or account automations have been implemented.

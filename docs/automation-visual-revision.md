# Automation — revised audit and builder brief, revision 2

Date: 19 September 2026

Primary site: https://aamir-9d.github.io/congenial-octo-journey/

Reference for the automation defects: https://aamir-9d.github.io/congenial-octo-journey/next/automation

Scope: a revised public service offering, homepage placement, and dedicated automation page. This document supersedes the previous split-hero, three-source, Claude-only brief. It does not implement or publish website changes.

## 1. Direction and source of truth

Use the root homepage as the design and publishing target. Treat /next/ as an older preview, useful for examining the automation component shown in the supplied screenshot.

Retain E2E Apps' dark backgrounds, amber accent, typography, logo, and existing homepage identity. Position automation as a service: E2E connects the client's reporting sources, configures an appropriate assistant workflow, and helps investigate results.

Expand the service presentation to four data sources — Google Ads, GA4, AdMob, RevenueCat — and three assistant options — Claude, ChatGPT, Gemini. Give the options equal visual prominence without implying that every consumer chat product supports identical connections or that all three assistants run together.

**Publishing observation:** the root page retrieved during this audit contained no automation section, while the local branch already imports an Automation component. The deployment workflow builds the root from main and /next/ from redesign. Updating a preview component alone will therefore not establish the feature on the root site. Reconcile the intended implementation with the production branch through the normal review and publishing process.

## 2. Updated audit: what actually needs fixing

The preview has improved since the earlier audit. It now includes a contextual hero CTA, a source diagram, interactive example tabs, and a chart. The current problem is presentation, coverage, and evidence quality.

| Current observation | Consequence | Required revision |
| --- | --- | --- |
| Short left copy beside a much taller right panel | A large empty lower-left region makes the opening feel unfinished | Center the introduction above a full-width demonstration |
| Source list, assistant, tabs, chart, finding, qualification, and next check sit inside one tall card | Too many competing reading levels | Organize the demonstration into aligned horizontal rows |
| Only three sources appear | User behavior between acquisition and revenue is absent | Add GA4 to the diagram, copy, outcomes, and example data |
| Claude is the only assistant in copy and the diagram | The service appears exclusive to one provider | Present Claude, ChatGPT, and Gemini equally |
| The mobile source diagram consumes substantial height | Visitors reach the evidence slowly | Use a compact 2 × 2 source grid |
| Similar bar treatments serve different questions | The demo feels templated | Match each chart to its question |
| A week-on-week label accompanies current-period bars only | The displayed evidence cannot substantiate the comparison | Show both periods or remove comparative claims |
| Some sample findings cite inputs absent from the sample dataset | Even illustrative output can look untrustworthy | Supply coherent supporting inputs and calculate the claims |

Measured in the current browser capture:

| Measurement | Desktop, 1440 px window | Mobile, 390 px |
| --- | --- | --- |
| Document height | Approximately 2,808 px | Approximately 3,872 px |
| Automation hero section height | Approximately 1,039 px | Approximately 1,694 px |
| Main-content words | Approximately 344 | Approximately 344 |

These replace the earlier 621-word audit figures. The chart is rendered with native web elements; a zero image-element count would not mean the page has no visual content. Word reduction still helps, but hierarchy and the panel's height are now the larger issues.

Evidence: [root homepage](audit-assets/automation-revision-2-2026-09-19/root-homepage-hero.png), [desktop automation](audit-assets/automation-revision-2-2026-09-19/hero-1440.png), [mobile automation](audit-assets/automation-revision-2-2026-09-19/hero-390.png), [browser findings](audit-assets/automation-revision-2-2026-09-19/findings.json).

## 3. Exact placement on the root homepage

Preserve the root site's existing section sequence and insert Automation immediately after the case study and before The Loop:

**Hero → Problems → Payback calculator → Proof → Case study → Automation → The Loop → Founders → Contact**

This placement first establishes the business problem and evidence, then introduces ongoing reporting and investigation as a relevant next service. The Loop can explain the wider engagement afterward. Avoid calling automation “the fourth section”; that referred to a different homepage structure.

Add an Automation navigation link beside the service links. Use the same root-site header and footer on the dedicated page.

Intended production destinations:

- Homepage section: /congenial-octo-journey/#automation
- Dedicated page: /congenial-octo-journey/automation
- Consultation CTA: /congenial-octo-journey/#contact

The dedicated root route is a required destination, not a claim that it is already published. Generate internal links from the site's configured base path.

### Homepage section

Keep it compact: one heading, one short paragraph, a small visual, and two actions. Aim for 80–110 visible words including concise labels; do not embed the entire investigation interface here.

**Eyebrow:** AI reporting & automation

**Heading:** Your growth stack. Your choice of AI.

**Copy:** Bring Google Ads, GA4, AdMob, and RevenueCat into one reporting workflow. Investigate spend, user behavior, and revenue with Claude, ChatGPT, or Gemini.

**Primary action:** Explore automation

**Secondary action:** Discuss your setup

**Small note:** Connections are configured around your accounts and reporting needs.

Use four equal source tiles feeding a centered reporting line, with three equal assistant labels underneath. This makes the offer understandable before a visitor reads the paragraph. Keep these labels compact rather than turning each into a large card with explanatory text.

## 4. Symmetric automation page

Choose a **centered introduction above a full-width reporting demonstration**. This explicitly replaces the earlier 40/60 split recommendation.

Suggested desktop composition:

```text
               AI REPORTING & AUTOMATION
         Your growth stack. Your choice of AI.
                   One short sentence
                [ Discuss your setup ]

┌──────────────────────────────────────────────────────┐
│ [ Google Ads ] [ GA4 ] [ AdMob ] [ RevenueCat ]       │
│                  Connected reporting                 │
│          [ Claude ] [ ChatGPT ] [ Gemini ]            │
│                                                      │
│ Spend · User behavior · Ad earnings · Subscriptions   │
│ One business question                    Sample data │
│ ┌──────────────────────┬───────────────────────────┐ │
│ │ Chart / evidence     │ Finding                   │ │
│ │                      │ One next check           │ │
│ └──────────────────────┴───────────────────────────┘ │
│ Source and reporting period                          │
└──────────────────────────────────────────────────────┘
```

The diagram communicates the reporting workflow, not a deployed backend architecture.

Use a shared content width around 1,120–1,200 px, four equal source columns, three equal assistant columns, consistent gaps, and aligned chart/finding regions. Set the desktop chart and finding to equal-width columns. Balance their content rather than clipping text to enforce a fixed height.

Use 56–64 px desktop hero typography and approximately 34–40 px on mobile, adjusted to the existing font and line breaks. Use restrained borders and one amber emphasis within each visual. Introduce separation with spacing and background tones rather than multiple nested panels.

On mobile:

- Stack the introduction, source grid, assistant options, example tabs, chart, and finding.
- Use a 2 × 2 source grid and a 2 × 2 example selector.
- Keep the three short assistant names in equal columns where readable.
- Show one finding and one next step; move extra methodology into a details disclosure.
- Keep charts fluid, with readable labels and no horizontal page overflow.

Assistant names are compatibility labels unless there is a real behavior to switch. If a visual assistant selector is added, explain what changes and keep the selected state accessible. Do not suggest a live account connection or provider-generated response in a static demonstration.

## 5. Give GA4 a real role

Use four examples that explain four different business questions:

| Tab | Example question | Visual | Primary source |
| --- | --- | --- | --- |
| Spend | Which campaigns spent more this week? | Paired previous/current bars | Google Ads |
| User behavior | Where are users dropping out of onboarding? | Configured funnel or step-completion comparison | GA4 |
| Ad earnings | What moved ad revenue? | Revenue trend with a supported driver breakdown | AdMob |
| Subscriptions | How are renewals changing? | Renewal trend with clearly defined periods | RevenueCat |

For GA4, document the required events, population, sequence, and reporting window. A true funnel needs suitable funnel reporting or event-level data; raw counts of differently named events do not establish sequential conversion.

All examples should have a coherent synthetic dataset, a visible “Sample data” label, the source, and reporting period. Derive numerical claims from the values supplied. Remove unsupported cost-per-install, retention, match-rate, or billing explanations unless the demo also supplies their inputs.

Cross-source comparisons require compatible dates, currencies, account scope, and metric definitions. Put that implementation detail in a disclosure. Do not suggest that attribution across all four platforms reconciles perfectly by default.

## 6. Claude, ChatGPT/GPT, and Gemini: accurate presentation

Use **ChatGPT** as the public-facing assistant name. In the technical explanation, distinguish it from **OpenAI GPT models through the Responses API**.

| Public option | Implementation wording for the brief |
| --- | --- |
| Claude | Use the appropriate supported Claude MCP client or API integration for the engagement |
| ChatGPT / OpenAI | Configure an appropriate ChatGPT MCP app/plugin, or build with GPT models through the Responses API and supported MCP tools |
| Gemini | Use a supported Gemini CLI or Gemini API integration; confirm the chosen surface and transport |

Do not imply that one connection process works unchanged in every consumer app or workspace. Verify the offered routes before presenting them as available service capabilities. Keep this detail in the FAQ or engagement scoping rather than placing a technical comparison table in the hero.

The official Google Analytics MCP server supports read requests and does not edit Analytics settings. Describe GA4 reporting and investigation accordingly. Changes to campaigns, configuration, or accounts depend on the relevant tool and the agreed approval workflow.

Primary references checked:

- [Google Analytics MCP documentation](https://developers.google.com/analytics/devguides/MCP)
- [OpenAI Responses API connectors and MCP tools](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [ChatGPT MCP server documentation](https://developers.openai.com/plugins/concepts/mcp-server)
- [Gemini CLI MCP servers](https://geminicli.com/docs/tools/mcp-server/)
- [Gemini API function calling and remote MCP](https://ai.google.dev/gemini-api/docs/function-calling)
- [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp)

## 7. Images and visual assets

Prioritize recognizable sources and inspectable evidence:

1. **Official platform marks:** four source marks and three assistant marks, with visible names. Normalize optical size in equal containers, approximately 24–32 px marks. Follow official asset guidance; use text when a suitable asset is unavailable.
2. **A custom native SVG connection diagram:** four sources converge into a centered reporting workflow and lead to assistant options. Keep lines evenly spaced. Optional restrained motion should respect reduced-motion preferences.
3. **Question-specific charts:** paired bars, a properly defined funnel, a revenue trend, and renewal comparisons. These are the principal eye-catching visuals.
4. **A real, redacted output example when available:** an actual report or assistant response, cropped to the useful evidence. Until then use the labeled illustrative demo. Never attribute invented output to a provider or client.

Skip generic robot artwork, glowing brains, ornamental dashboards, and stock “person at laptop” imagery. Their space is better used to show the service's output. No generated photography is required for this direction.

## 8. Dedicated page sequence and text limits

1. Centered hero: heading, one-sentence lead, CTA.
2. Full-width demonstration: four sources, three assistant options, four example tabs.
3. Four outcomes: one sentence each — spend, behavior, ad earnings, subscriptions.
4. Three process steps: Connect → Investigate → Review.
5. Three concise disclosures: supported connections; access and approvals; data and reporting definitions.
6. Closing CTA: “Make your reporting easier to act on.” / “Discuss your setup.”

Target approximately 250–320 visible words in the initial page state, excluding global navigation/footer and collapsed technical details. Treat this as an editorial budget, not a requirement to remove necessary context. Use one primary action consistently.

## 9. Builder handoff

Update the root-site experience and the intended root /automation route. Reuse the current demo behavior where useful, but replace the oversized split hero with the centered layout specified above.

Relevant implementation files:

- src/components/Automation.astro — compact homepage service section.
- src/components/Investigation.astro — symmetric source/assistant/demo composition.
- src/data/automation.ts — four sources, four coherent example datasets, neutral copy.
- src/scripts/investigation.ts — accessible example switching and chart updates.
- src/pages/automation.astro — page structure, metadata, CTA destinations.
- src/pages/index.astro — insertion after the case study and before The Loop.
- Shared navigation/footer — root-site discovery and links.
- .github/workflows/deploy.yml — understand the production/preview branch mapping before publishing.

Do not copy the old /next/ homepage wholesale into production. Keep the root site's existing design context and calculator behavior.

Acceptance checks:

- Compare desktop 1440 px, tablet 1024 px, and mobile 390/360 px screenshots.
- Four sources and all three assistants are visible and consistently sized.
- The tall right panel and empty left-column imbalance are gone.
- GA4 has a functioning example with a defined measurement basis.
- Tabs work with keyboard and touch; focus, selected states, and panel semantics are correct.
- All displayed numerical findings match the sample dataset.
- No clipped copy, unreadable chart labels, overflowing rows, or mandatory horizontal scrolling.
- Reduced motion, contrast, and existing form/calculator behavior remain intact.
- Relevant build and existing checks pass before publishing.
- Inspect the actual published root homepage, root automation page, navigation, and CTA paths; a working preview alone is insufficient.

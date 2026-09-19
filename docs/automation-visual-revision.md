# Automation — visual audit and builder revision brief

Reviewed live: https://aamir-9d.github.io/congenial-octo-journey/next/automation  
Also reviewed: https://aamir-9d.github.io/congenial-octo-journey/next/  
Date: 19 September 2026  
Scope: focused visual and copy revision of the existing public service page and homepage teaser.

**The requested outcome**

Make the automation service immediately understandable and visually memorable. Visitors should see what connecting Google Ads, AdMob, RevenueCat, and Claude produces. They should be able to explore a sample and find the next action without reading the implementation details.

Retain the current E2E Apps logo, amber accent, dark grounds, Be Vietnam Pro, and IBM Plex Mono. The service remains a consulting engagement. The current task does not add a client portal or implement account automation.

**Audit of the live preview**

Browser inspection at 1440 px desktop and 390 px mobile found:

| Observation | Desktop | Mobile |
| --- | --- | --- |
| Document height | 4,346 px | 4,996 px |
| Main-content words | Approximately 621 | Approximately 621 |
| Main-content image/video/canvas elements | 0 | 0 |
| Automation-specific CTA begins | Approximately 3,895 px down | Approximately 4,449 px down |

The persistent general “Book a call” navigation action is present. The missing action is one contextual to the automation hero/demo.

The main problems:

1. **The service is described but never demonstrated.** There is no connected-source diagram, actual report, screenshot, chart, or visible finding.
2. **The opening is visually weak.** A centered heading and short lead float in a large empty area. The heading uses the regular section-heading scale.
3. **Every subsequent section is reading work.** Three question/answer rows, five process paragraphs, a capability table, a long caveat, and access requirements create one continuous prose-heavy experience.
4. **Technical caveats receive disproportionate emphasis.** “The boundary,” API access, joins, credentials, and the “arithmetic nobody checks” section dominate the sales narrative.
5. **Large section gaps amplify the length.** The five-stage process takes approximately 871 px on desktop before visitors reach the platform table.
6. **The mobile table is deliberately at least 620 px wide.** Its horizontally scrolling treatment makes a key comparison harder to consume at 390 px.
7. **The homepage repeats the page's question/answer material.** Its automation section is approximately 935 px high on desktop and begins around 3,875 px down the homepage.
8. **The homepage platform panel describes constraints first.** “Read-only” and “It also exposes configuration changes” do not explain why a visitor should care.
9. **Some wording suggests more certainty than the evidence supports.** “Until the change has a named cause” should allow inconclusive investigations. “The arithmetic nobody checks” is an unsupported absolute.
10. **Stage semantics conflict.** “Propose” is described as presenting a change, but the following note calls it the stage that touches an account. Distinguish proposal, approval, and execution wherever they are described.

Retain accurate capability limitations. Put the short, decision-relevant qualification beside the relevant example and place the full technical explanation in clearly labeled details.

**Recommended visual direction**

Use a **Claude investigation canvas**: three recognizable data sources, one real business question, a simple chart, and a short sourced finding.

This is the preferred direction because the visitor sees the service output immediately and can inspect the example. Build the demonstration in HTML/SVG so labels remain crisp and its mobile arrangement can genuinely change.

Two alternatives:

| Direction | Best use | Tradeoff |
| --- | --- | --- |
| Interactive investigation canvas — recommended | Main automation page; visitors choose a question and see the corresponding result | Needs three coherent example states |
| Annotated real report | Strongest evidence once a client-safe report or Claude capture exists | Requires a genuine artifact and appropriate redaction |
| Short operator walkthrough | Optional supporting explanation using an actual connected workflow | Slower to scan; use a click-to-play recording with a poster image and controls |

A recording can support the main visual later. The initial design should work fully without it.

**Hero copy and composition**

Desktop: an asymmetric two-column composition with roughly 40% copy and 60% demonstration. Align the heading left. Give the demo enough scale to read at normal size.

Draft copy:

> Google Ads · AdMob · RevenueCat
>
> **Your growth stack.  
> One conversation.**
>
> Ask Claude what changed across your ad spend, ad earnings, and subscriptions. Get a clear explanation with the source data attached.
>
> **Discuss your setup →**
>
> Explore the example ↓

The last link is only needed if the demonstration extends below the hero; otherwise focus the example directly. The primary CTA uses the existing contact path and preserves the configured deployment base.

The demonstration's visible question:

> Why did ad earnings fall last week?

Suggested composition:

- Small official Google Ads, AdMob, and RevenueCat marks with text labels.
- Thin connector paths leading toward a labeled Claude investigation.
- One prominent question, a small relevant chart, and a short result.
- A bottom line showing sources, comparison period, and “Example workflow.”
- An explicit sample-data label if the state is synthetic.

Example finding for a **clearly labeled illustrative dataset**:

> Impressions stayed steady. Lower eCPM in two markets explains most of the change. Review the country breakdown.

Use that finding only with a matching example dataset. For a real artifact, use the actual supported finding. Do not imply that the screen is connected to the visitor's accounts.

One source node can briefly illuminate on entry, followed by the finding appearing. Keep the animation finite, disable it for reduced motion, and leave the full explanation visible without animation.

**Interactive example**

Three short, keyboard-operable selectors:

- **Spend changes**
- **Ad earnings**
- **Subscriptions**

Each must change the question, chart or evidence, finding, and source labels. A selector changing only its active color is incomplete.

Suggested questions:

- Spend changes: “Which campaigns spent more this week?”
- Ad earnings: “Why did estimated ad earnings fall?”
- Subscriptions: “What changed in renewals and refunds?”

Keep findings source-specific when campaign attribution is unavailable. Use “source-linked finding,” “comparison,” or “suggested next check” where that is what the data supports.

Budget: one question, one chart, two brief findings, one next step per state. Avoid replicating an entire analytics product inside the page.

Mobile: heading → short explanation → CTA → source labels → question selector → chart → finding. Stack the diagram vertically and make the selected state usable without horizontal scrolling or hover.

**Images and graphic assets to add**

| Asset | Placement | Production direction |
| --- | --- | --- |
| Official platform and Claude marks | Hero/demo source nodes | Use approved SVG assets with readable labels; preserve brand proportions. Keep surrounding UI in E2E's palette. |
| Original connection diagram | Main hero demonstration; simplified on homepage | SVG paths and nodes with a left-to-right desktop flow and a vertical mobile arrangement. |
| A real redacted Claude investigation capture | Secondary evidence or an expandable example | Show the question and useful output; crop tool logs and remove private identifiers. Use selectable HTML captions. |
| A real sample report excerpt | Within the example or linked below it | Show period, sources, finding, and next action. Keep the text readable rather than shrinking a whole document into a thumbnail. |
| Small charts built from consistent sample data | Inside the interactive states | Label illustrative data; maintain units and source names. Favor one chart per state. |
| Optional 20–30 second operator recording | “Watch an example” link beside the demonstration | Click to play, muted preview poster, accessible controls, and captions. Use an actual workflow. |

Prioritize original diagrams and actual output over decorative stock photography. The connected sources and the resulting investigation are the visual subject. Extra images should explain another part of that subject.

**Page sequence and text budget**

Use four principal sections:

1. **Hero plus interactive example.** The promise, sources, visible output, and contextual CTA.
2. **Three practical outcomes.** Short open columns: “Review spend,” “Investigate ad earnings,” “Understand subscription changes.” One sentence each, with restrained mini graphics where useful.
3. **How we work.** One compact sequence: Connect → Investigate → Review. Below it, three labeled disclosures: “Supported actions,” “Access and control,” and “How we reconcile the numbers.”
4. **Closing CTA.** “Bring your stack. We’ll map the first workflow.” Brief explanation plus the same contact action.

Target **250–350 words of default-visible copy**, including the initially selected demo state. Keep complete technical detail in the labeled disclosures or linked supporting documentation. This is an editorial target, not a claim about an optimal conversion length.

Condense five process paragraphs into three short steps. Include qualifications relevant to the selected example beside it; disclosure should not conceal a material limitation or change the meaning of the promise.

**Homepage placement and sequence**

Current preview:

Hero → Calculator → Case study → Proof → Automation → Loop → Founders → Contact.

Recommended:

**Hero → Calculator → Case study with compact proof → Automation → How we work → Founders → Contact.**

Automation should be the **fourth principal section**, directly after the featured case study and before the process. Fold the separate Proof section into the case-study treatment so it no longer delays the new capability.

The visitor sequence is: understand the proposition → explore the numbers → see credible work → discover automation → understand the engagement → meet the operators → contact.

Retain a top-level Automation navigation link immediately after Services. The homepage hero can mention measurement, growth, and automation in its category line, without leading with MCP setup.

Homepage teaser:

- About **70–100 visible words**, including diagram labels.
- Heading: **“Your growth stack. One conversation.”**
- One short explanation.
- A compact connected-source graphic and one sample question/finding.
- Link: **“Explore automation →”**
- One brief qualification if needed.

Use the compact visualization as the bridge to the dedicated page. Keep the detailed platform limits and three question/answer pairs on the dedicated page in their redesigned form.

**Implementation handoff**

Revise:

- src/pages/automation.astro — main composition and page content.
- src/components/Automation.astro — compact visual homepage teaser.
- src/data/automation.ts — concise summaries, example-state data, and retained full technical detail.
- src/pages/index.astro — merge the proof movement and position automation fourth.
- Shared styles/tokens only where the composition needs reusable values.

Preserve the calculator model, existing routes/base-path handling, truthful platform capabilities, and original design exports.

Before finalizing:

- Inspect 1440 px desktop, tablet, and 390 px mobile.
- Ensure the first screen includes the proposition, an action, and a meaningful part of the demonstration.
- Confirm selectors change substantive content and support keyboard interaction.
- Verify no horizontally scrolling capability table remains on phones.
- Check reduced motion and the no-JavaScript fallback.
- Keep source labels, units, qualifications, and sample-data status visible.
- Run the existing build/tests and inspect the rendered result visually.
- Report what changed with before/after screenshots.

**Short prompt to give the builder**

> Redesign the Automation page and homepage teaser using this brief. The current page has about 621 words, no explanatory imagery, and almost 5,000 px of mobile scrolling. Make one large connected-source investigation example the visual centerpiece. Use Google Ads, AdMob, RevenueCat, and Claude marks; show one question, a chart, a brief finding, and a next step. Build it with responsive HTML/SVG. Add three selectors that change the example: Spend changes, Ad earnings, Subscriptions. Use the headline “Your growth stack. One conversation.” and add a contextual CTA in the hero. Reduce default-visible page copy to 250–350 words. Compress the process into Connect → Investigate → Review; retain full access/capability details in three labeled disclosures. Label sample data and keep relevant limits beside examples. On the homepage, use a 70–100 word visual teaser directly after the case study, folding the separate Proof section into that case-study movement. Keep the existing E2E identity and show desktop/mobile before-and-after screenshots.

**Before screenshots**

[Desktop opening](audit-assets/automation-2026-09-19/desktop-before.png) · [Mobile opening](audit-assets/automation-2026-09-19/mobile-before.png) · [Homepage teaser](audit-assets/automation-2026-09-19/homepage-before.png) · [Browser measurements](audit-assets/automation-2026-09-19/findings.json)

This document is an audit and handoff brief. It has not been sent to another assistant, and it does not change the website.

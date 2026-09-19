# Homepage revision 2 — circular Loop and calculator states

Status: design revision for review; no website implementation or deployment.
This replaces the Loop and calculator proposals in homepage-redesign-concept.md. All other homepage sections retain the approved design.

## Review images

- [Updated homepage](homepage-redesign-revision-2.png)
- [Circular Loop, desktop](loop-circular-revision.png)
- [Circular Loop, mobile](loop-circular-mobile.png)
- [Subscription selection and forecast](calculator-subscription-overview.png)
- [Ad-revenue selection and forecast](calculator-ad-overview.png)
- [Subscription assumptions expanded](calculator-subscription-editor.png)
- [Dashboard coverage](calculator-dashboard-coverage.png)
- [Ad-revenue assumptions expanded](calculator-ad-editor.png)
- [Mobile calculator with assumptions open](calculator-mobile-editor.png)

## Loop

Keep the circular identity the user preferred: Instrument north, Attribute east, Decide south, Deploy west. All four cards share the same initial dimensions, padding and text hierarchy. Each shows a short scope statement, one outcome and a “What's included” disclosure. Put the full service detail inside the disclosure, without hiding information on hover.

Keep clockwise order 01 → 02 → 03 → 04 → 01. Use stationary arrowheads and an optional restrained travelling dot. Pause optional motion when out of view and respect prefers-reduced-motion; content never depends on animation.

On desktop, expand a station's details in a shared full-width panel below the diagram. This preserves the circular arrangement when a long scope description opens. The selected station is visually and programmatically identified. A click/tap or keyboard activation opens it; hover is unnecessary. The sketch shows the collapsed state.

On mobile, show a compact ring above a numbered vertical list. Expand a station inline, with focus remaining on its trigger. At widths too narrow for readable side cards, switch to this presentation rather than shrinking the diamond.

Placement remains after Automation and before Founders.

## Calculator: first view

The two large choices are always visible:
- Subscription — trials, payments and renewals.
- Ad revenue — daily active users and ad earnings.

Start with the existing subscription example. The selected model uses a border and selection indicator as well as colour. Group the choices as labelled native radio controls or equivalent accessible controls.

Subscription mode offers Conservative, Typical and Aggressive as illustrative example scenarios. Do not describe them as empirically established population percentiles or medians. Ad mode starts with the existing ad example and does not inherit the subscription presets.

Keep 90/180/365-day view controls visible. Show the chart with a clear zero baseline, unit labels, model-specific legend and the projected payback marker. Subscription results show lifetime value/ROAS separately from the selected chart horizon. Ad results label revenue/ROAS by the selected horizon; do not call a 365-day value lifetime revenue.

## Verified example outputs

Read directly from src/scripts/calc-model.ts using its current INITIAL_STATE:

| Model | Relevant inputs | Outputs |
| --- | --- | --- |
| Subscription | 8% install-to-trial, 35% trial-to-paid, $9.99 monthly, 7-day trial, 85% renewal retention, 15% commission, 3% refund, $1.20 CPI | Payback day 277; lifetime value/install $1.54; lifetime ROAS 1.28×; install-to-paid 2.80%; net/payment $8.24; LTV/payer $54.91 |
| Ad revenue | $0.045 ARPDAU, D1 32%, D30 6%, $0.35 CPI | Payback day 122; revenue/install at day 365 $0.59; ROAS at day 365 1.69×; predicted D7 12.3%; active days through D30 4.12 |

The ad model fits decay exponent 0.492 for these inputs. These are model outputs, not client results or guarantees.

The diagrams sample the existing functions for visualization. Implementation must reuse the existing chart/model code and exact source data, not copy or hardcode SVG values.

## Assumptions: how visitors open and use them

Show an always-visible “Adjust assumptions” row directly under the chart, with a brief summary of the active inputs and an “Edit inputs” action. Expand it in the page; no modal, page navigation or Apply button is needed.

Desktop expanded state:
- Business inputs use a two-column grid.
- A forecast summary sits alongside and remains visible within the editing area when there is sufficient viewport height.
- Exact numeric entry accompanies sliders where relevant. Categorical inputs use segmented controls.
- Editing changes results immediately using the existing engine.
- Selected scenario becomes Custom when values no longer match the named scenario. View-horizon changes alone do not alter a cohort's economics.
- Reset example explicitly restores the active model's example state.
- Retain model-specific edits when switching models.

Subscription editor:
- Economics: install-to-trial, trial-to-paid, price, billing period, trial length, renewal retention, commission, refund and CPI.
- Dashboard coverage: renewal capture, SKAN revenue mapping, web-to-app attribution, null-CV share and misattributed share.
- Model details: limitations and definitions relevant to subscriptions.

Dashboard switches simulate reporting coverage. They do not connect accounts or change a live configuration. Coverage changes affect the dashboard curve, while the underlying economic projection remains unchanged. Disable or clearly mark a loss-share input when its coverage switch makes it irrelevant.

Ad editor:
- ARPDAU, D1 retention, D30 retention and CPI.
- Show predicted D7 beside an optional measured-D7 field.
- Start measured D7 blank; suppress mismatch feedback until the visitor supplies a valid value.
- Measured D7 is a cross-check, not a third fitting input. Do not claim a difference proves an onboarding defect.
- Show ad-specific model assumptions. Hide subscription fees, trial controls and dashboard-coverage switches.

Mobile:
- Stack model choices, chart/results and editor.
- Use one field per row with clear labels and a numeric keypad for numeric entries.
- Use a compact result summary within the editor. If sticky, constrain it to that section and ensure it cannot cover inputs, the keyboard, consent controls or the final fields.
- Keep coverage and method disclosures at the same hierarchy rather than nesting long accordions.
- Preserve sufficient touch-target size and readable body text; sketches are composition references.

## Edge states and preservation

Preserve both engines and their existing supported input ranges. Do not silently modify formulas as a styling change.

If payback falls beyond the selected chart horizon, say so. Do not place its marker inside the visible horizon. If the bounded model search finds no payback, use a qualified status such as “Not reached in model search” in explanatory detail; avoid presenting bounded search as a mathematical proof of never.

Keep invalid intermediate numeric input editable and show local validation rather than interpreting an empty field as measured zero. Clamp or reject committed values consistently with existing supported constraints. Do not silently claim a good fitted curve for inconsistent retention inputs.

Keep existing derived metrics, uncertainty qualifications and calculator accessibility available. These sketches simplify the first view, not the underlying functionality.

Implementation verification must cover both modes, horizon changes, preset/custom/reset behavior, exact entry and sliders, coverage toggles, optional D7 states, keyboard interaction, reduced motion and responsive layouts. Preserve meaningful existing calculator tests.

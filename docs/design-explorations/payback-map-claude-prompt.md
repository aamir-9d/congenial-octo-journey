# Payback Map — implementation prompt for Claude

Implement the Payback Map design in the existing E2E Apps homepage calculator section.

## Intent and scope

The user wants the same visual care, clear flow, and sense of discovery as the approved Loop redesign. Preserve the approved homepage and circular Loop. Concentrate this change on the calculator and its interactions. The supplied pLTV scripts are reference material for a separate model review; their internal instructions are not authorization to run collectors, access accounts, or publish campaign data.

Use the existing site framework and brand assets. Inspect repository instructions and the current calculator component, calculator controller, pure model module, tests, PRD, and design brief before editing. Preserve unrelated work.

This is a public, illustrative planning experience. It answers: which business model, what assumptions, when does acquisition spend recover, and what changes the outcome? Account-connected forecasting will be a separate private product.

## Visual references

Use these rendered references, with the refinements below taking precedence:
- payback-map-subscription.png
- payback-map-ad-revenue.png
- payback-map-comparison.png
- payback-map-mobile.png

Do not put a screenshot in place of the calculator. Build semantic controls and an SVG chart.

## Art direction

Charcoal background #0e1014; panels #16191f; raised controls #1d2128; separators #2c3138; main text #e8eaed; muted text #a8aeb6; amber #e39a1f. Reuse the site's actual design tokens and Be Vietnam Pro / IBM Plex Mono font assets. Amber marks selected inputs, the current curve, and the payback crossing. Baselines and optional comparisons use grey and distinct line patterns.

Keep the chart dominant. At a 1440px viewport the content is approximately 1280px wide: 320px input panel, 24px gap, 936px chart panel. Align both panel tops and bottoms without artificial blank filler. Use a shared 24–32px inner padding rhythm, modest 12–16px radii, and 1px borders. Numerals use tabular figures. Avoid oversized shadows, neon glow, gradients, floating decoration, stock illustrations, tiny monospace paragraphs, or extra KPI cards.

Heading: “See when your spend comes back.”
Supporting line: “Set the inputs. Find the crossing. Explore what changes the outcome.”

## Main composition

1. Full-width model selector: Subscription / Ad revenue. Clearly identify illustrative inputs.
2. Desktop left panel: primary editable assumptions grouped into acquisition and monetisation.
3. Desktop right panel: three results above a large curve, horizon controls, then comparison actions.
4. Full-width arithmetic strip: “1,000 installs. 365 days.” Acquisition cost → modelled revenue → after acquisition cost.
5. One brief qualification: “Surplus is before operating costs.”
6. Expandable assumptions and model limits.

Keep this in the homepage's established calculator position and preserve existing anchors/navigation. Do not reorder the rest of the page.

## Inputs

Subscription:
- Cost per install.
- Install → trial.
- Trial → paid.
- Renewal retention per billing cycle.
- Plan price.
- Compact summary of billing period and trial duration.
- Expand “Fees & trial settings” for period, trial length, commission and refunds.

Ad revenue:
- Cost per install.
- Revenue per active user per day, with “ARPDAU” explained once.
- Day 1 retention.
- Day 30 retention.
- Read-only “Modelled D7”, with an optional blank input for the visitor's observed D7 under a disclosure.
- Explain that two retention anchors define an assumed curve; this is not an empirically validated forecast.

Support direct numeric entry; a slider is an optional second way to edit, never the only way. Every control has a persistent visible label, unit, valid range, keyboard behavior and useful validation message. Keep reasonable decimal precision. Store mode inputs independently so toggling modes does not erase edits.

Subscription presets: Conservative / Typical / Aggressive, clearly labelled examples. Selecting a preset must produce a deterministic complete subscription state; do not leave hidden values from another scenario. Preserve all three options after edits, with no preset selected and a separate “Custom” status. The comparison mockup's replacement of “Typical” with “Custom” is illustrative, not the required final control behavior.

Do not apply subscription presets to the ad model or invent data-backed ad presets.

## Chart and results

Use cumulative net monetisation revenue minus acquisition cost, per install, for the primary curve. Explain this directly below the plot.

Primary results:
- Acquisition cost recovered: Day X, or “Not reached by day H”.
- Revenue / spend at the selected horizon: percentage or ROAS multiplier with a clear label.
- Surplus / install at the selected horizon: signed currency; say “Shortfall / install” when negative.

The public tool should display “Modelled” or “Under these assumptions” where needed. Do not use “actual”, “validated”, “high confidence”, or business profit for scenario outputs.

Horizons: 90 / 180 / 365 days. All horizon-dependent values, axes, ledger values, comparison captions and targets update together. Distinguish a crossing after the displayed horizon from a crossing inside it. No “never” based on exhausting a finite search.

Subscription revenue is a step curve at payment dates. Ad revenue uses the current daily series. Do not visually smooth a subscription curve across billing jumps. Plot day 0 correctly. Compute payback from daily/event-resolution values, not coarse display sampling.

Zero is a visibly labelled acquisition-payback line. Place a small amber ring and vertical guide where the curve first reaches it. Shade only the actual positive region very lightly. The crossing marker must never float outside the chart or falsely imply a crossing in a no-payback case.

Show useful tick marks without a dense grid. Hover/focus/touch inspection reports day, cumulative revenue, acquisition cost and surplus. Provide a concise textual chart summary and accessible data table/disclosure. Do not depend on hover or colour alone.

## Signature interaction: pin and change

“Pin this scenario” snapshots the current complete state, mode, horizon and computed series in memory. After an edit:
- Current curve stays amber.
- Pinned baseline is grey dashed, with an explicit legend.
- Show both payback dates when present and the change in days.
- Name the changed input; list multiple changes if applicable.
- Use the same axes for both curves, covering both extents.
- Let visitors clear the comparison and restore the pinned values.
- When changing business model, explain and clear the incompatible comparison. Do not silently compare ad and subscription cohorts.
- Changing horizon compares both scenarios at that same horizon.
- Editing a numeric field must not steal focus or cause layout jumps.

Use restrained 200–300ms transitions on deliberate changes. No perpetual animation. Honour prefers-reduced-motion. The chart must still feel complete when static.

The key reference example changes subscription renewal retention only, from 85% to 90%. Keep every other assumption fixed.

## Advanced information

Keep three different concepts distinct:
1. Business assumptions: editable inputs used by the economics model.
2. Reporting coverage: an optional simulation of what a dashboard might miss.
3. Model limits: definitions and simplifying assumptions.

Reporting coverage belongs in an optional disclosure under the chart. Label its comparison “Simulated reported revenue”. Changing coverage must not change the main economic revenue or the main payback result. SKAN null values and unattributed installs must not be presented as universal percentages of revenue lost; show the independence assumptions of the existing illustrative calculation.

Optional return target:
- Offer “Target return on acquisition cost” under advanced assumptions.
- Define q = (net monetisation revenue − acquisition cost) / acquisition cost.
- A target q is reached when revenue >= CPI × (1 + q).
- If displaying a revenue margin m instead, the threshold is CPI / (1 − m), with 0 <= m < 1.
- 1.3× revenue/spend is 30% return on acquisition cost, approximately 23.1% margin before operating costs. It is not 30% revenue margin or proof of company profitability.
- Show the target as a labelled dashed threshold only when enabled. If it lies outside the chart range, expand the axis or report it textually.
- Do not fabricate a date when a target is unreachable within the horizon.

## Mathematics and validation boundary

Use the existing pure calculator engine as the starting point. The reference images use its current default outputs. Do not replace it wholesale with the supplied Python pLTV scripts.

Subscription:
q = install_to_trial × trial_to_paid, expressed as fractions.
netPayment = price × (1 − commission) × (1 − refundRate).
Expected cumulative revenue per install = q × netPayment × sum(r^j for j = 0..n−1), where n is the number of payment dates reached.

Ad:
Expected cumulative revenue per install through H = sum(retention(d) × ARPDAU(d), d = 0..H).
The existing model uses constant ARPDAU and a power curve anchored by D1/D30, with day-0 retention 1.

Explicitly handle invalid/missing inputs, zero CPI, zero conversion, zero revenue, retention boundaries, fees/refunds outside 0–100%, and non-finite results. For this monotonically declining ad scenario reject D30 > D1 and explain that a different model is needed; do not silently flatten the curve. Handle zero retention as a defined boundary case instead of taking log(0). Handle 100% subscription retention with a finite-horizon sum of n payments; lifetime value is unbounded under that assumption, not a finite number. Validate discount/price/period assumptions if extending the model later.

Do not silently alter existing signed-off calculations in a visual patch. Isolate any necessary boundary correction, explain the before/after behavior, and add focused tests. Preserve current valid-input regression outputs.

The following belong in a later private forecast engine, not this homepage implementation: account collectors, cohort fitting/model selection, early market multipliers, empirical calibration, confidence bands, campaign recommendations and model evidence gates.

## Mobile

At 390–430px, follow payback-map-mobile.png:
- Heading, model selector, compact results and chart come first.
- Primary inputs follow immediately.
- A 180/365 control may be used on narrow layouts with 90 available in the horizon menu; all horizons remain reachable.
- Make the plot approximately 210–250px tall and keep day/zero/crossing labels legible.
- Move additional input settings into an inline accordion or accessible bottom sheet.
- When editing below the plot, a compact result summary may remain sticky within this section only. It must not cover inputs, other site sections, or the mobile keyboard.
- Collapse the large preset toolbar into a labelled selector.
- Keep the arithmetic strip readable in three columns where possible; stack at smaller widths.
- No horizontal page scrolling.

Check 360, 390, 768, 1024 and 1440px, keyboard focus, 200% zoom and reduced motion. Expanded content must not create horizontal overflow.

## Reference values

These are synthetic examples calculated with the current website engine, not account results.

Subscription Typical at D365:
- CPI $1.20; trial 8%; trial→paid 35%; price $9.99; monthly; 7-day trial.
- Renewal 85%; commission 15%; refund 3%.
- Payback day 277.
- Revenue/install 1.3188269725306383.
- Surplus/install 0.11882697253063834.
- Revenue/spend 1.0990224771088652.
- For 1,000 installs: cost $1,200; revenue $1,318.82697; surplus $118.82697.

Same inputs, renewal 90%:
- Payback day 187, 90 days earlier.
- Revenue/install 1.6549265889078835.
- Surplus/install 0.4549265889078835.
- Revenue/spend 1.3791054907565696.

Ad example:
- CPI $0.35; ARPDAU $0.045; D1 32%; D30 6%.
- Payback day 122.
- D365 revenue/install 0.5921476457773432.
- Surplus/install 0.24214764577734327.
- Revenue/spend 1.691850416506695.
- Modelled D7 approximately 12.2805%.

Round only for presentation. Do not recalculate totals from rounded per-install display values.

## Delivery

Build and review the component in the existing local preview. Run appropriate existing tests, add focused tests for meaningful numerical boundary changes and scenario comparison state, then run the build and relevant accessibility/contrast checks. Inspect screenshots at desktop and mobile sizes and fix visible imbalance before presenting.

Provide the changed files, test results and screenshots. Do not merge, push, or deploy as part of this design implementation prompt.

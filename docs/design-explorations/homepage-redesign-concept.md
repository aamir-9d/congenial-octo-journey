> Update: the Loop and calculator are superseded by [revision 2](homepage-loop-calculator-revision.md). All other sections remain approved.

# Homepage redesign — concept for review

Status: visual concept; not an implementation specification or deployed change.
Target: https://aamir-9d.github.io/congenial-octo-journey/
Reviewed: 19 September 2026.

## Intent

Help a technical founder or growth lead understand E2E Apps' measurement and growth work, inspect evidence, and start a qualified conversation. Retain the charcoal-and-amber brand and the approved automation layout. The consultancy, calculator, and real case evidence remain central.

## Direction options

1. Recommended: explain the mechanism and show evidence. Compact problem rows, the existing calculator, a substantial case study, then automation. Best fit for the technical audience and existing materials.
2. Founder-first: larger portraits and personal narrative in the hero. Strong human presence, but requires suitable photography and delays the technical demonstration.
3. Demo-first: the interactive calculator dominates the opening. Engaging for returning or technically informed visitors, but can overwhelm visitors before they understand the service.

The mockups explore option 1.

## Files

- [Desktop opening](homepage-redesign-opening.png)
- [Full desktop composition](homepage-redesign-desktop.png)
- [Case study and automation detail](homepage-redesign-evidence.png)
- [Mobile composition](homepage-redesign-mobile.png)
- [Desktop vector source](homepage-redesign-desktop.svg)
- [Mobile vector source](homepage-redesign-mobile.svg)

## Proposed sequence

Hero → three diagnostic rows → payback calculator → case study and related field note → automation → The Full Loop → founders → contact.

This full-page proposal revises the earlier instruction to retain every homepage section. It proposes combining proof into the case-study movement rather than retaining a separate large proof section. Do not silently apply that structural change under the previous automation-only brief.

The captured root page was approximately 9,255 px tall at a 1,440 px browser width. Its problem section occupied approximately 1,441 px and process section 1,506 px. The desktop concept is 4,310 px tall; that is a composition target, not a measured implemented reduction. Actual height depends on responsive copy, form states and disclosures.

## Design decisions

- Keep the existing hero claim. Pair it with a compact illustration of missing renewal reporting.
- Use a contact action and a secondary jump to the calculator.
- Replace the large problems grid with three short rows; retain the underlying technical explanations through appropriately placed details or linked content.
- Use the existing calculator engine, presets, input limits, assumptions and accessible controls. The SVG curve is a schematic, not numerical output.
- Keep case figures sourced from src/data/case-study.ts. Show the trial-to-paid qualification alongside the results. Omit the MRR headline from this compact summary, avoiding the need to compress its billing-frequency explanation.
- Use the approved charcoal automation preview. Its data is synthetic and explicitly labelled.
- Make the four-stage process readable as one desktop row and a vertical mobile sequence. Preserve fuller service details in accessible disclosures.
- Use actual founder portraits when available. The initials and portrait slots are placeholders; do not generate substitute identities.
- Reuse existing contact handling, validation, anti-spam fields and analytics. Form drawings are schematic. On mobile, final implementation should use comfortably sized inputs and preferably one field per row.
- Keep navigation destinations, including products, articles, FAQ, privacy and terms. Confirm anchors after restructuring.
- Preserve booking availability when configured; a design drawing must not remove the existing calendar option.

## Brand and asset treatment

Use existing Be Vietnam Pro and IBM Plex Mono font files and CSS colour tokens. Mockups embed these fonts for consistent viewing.

Background #0E1014; surface #16191F; raised surface #1D2128; primary text #E8EAED; secondary text #A8AEB6; amber #E39A1F.

Retain the actual E2E logo asset in implementation; the drawings approximate the lockup. Keep brand names labelled as tools used, without suggesting endorsements.

Use real portraits, real report excerpts when available, and purposeful native diagrams. No stock AI artwork is needed.

## Implementation boundaries

These are static visual explorations, not working responsive pages. Verify final chart geometry, touch targets, 16px-class body/form readability, keyboard controls, contrast, reduced motion, form states, and 360/390/1024/1440 layouts during implementation.

Existing automated checks may enforce earlier copy or section structure. Update those assertions only for approved content changes; preserve all calculator, source-data and accessibility protections.

Source files already showed in-progress automation edits when this exploration started. They were not changed by this work. Production deployment remains a separate step through the existing root/main workflow.

Implement only the redesigned “The Full Loop” section of the E2E Apps homepage.

The remaining homepage, calculator, automation section, forms and routes are already approved. Preserve them.

DESIGN REFERENCES
Read and inspect:
- docs/design-explorations/loop-orbit-desktop.png
- docs/design-explorations/loop-orbit-mobile.png
- docs/design-explorations/loop-orbit-detail.png
- Corresponding SVG files for geometry reference.
- src/components/Loop.astro and its existing interaction code.
- src/styles/tokens.css and applicable AGENTS.md instructions.

These references supersede the earlier north/east/south/west diamond arrangement and the four-column linear Loop. Rebuild the visual with semantic HTML, CSS and native SVG. Do not use the screenshot as a page image.

PLACEMENT
Keep the section after Automation and before Founders.
Preserve id="loop", existing section metadata and navigation anchors.

DESKTOP COMPOSITION
Use the existing 1280px maximum content width.

Header:
- Left eyebrow: “05 / HOW WE WORK”
- Left heading: “The Full Loop”
- Right supporting copy:
  “Measurement informs the spend.
   The results improve the next decision.”

Below, arrange four equal cards around a central ring:
- Upper left: 01 Instrument.
- Upper right: 02 Attribute.
- Lower right: 03 Decide.
- Lower left: 04 Deploy.

This forms the clockwise sequence 01 → 02 → 03 → 04 → 01.

Reference proportions:
- Outer card columns approximately 34% each.
- Central region approximately 32%.
- Cards approximately 438px wide and 197px high at the reference size.
- Ring approximately 244px in diameter.
- Two card rows with approximately 52px between them.

Treat these as visual proportions, not rigid heights. Use grid and content-aware sizing. Keep matched row heights without clipping text. Align all titles, card padding and disclosure actions consistently.

Draw thin connectors from each card’s inward-facing edge to its corresponding ring node. Connectors must meet the nodes correctly as the layout resizes. Prefer one SVG coordinate system or container-relative geometry over brittle viewport-specific pixel offsets.

CENTRAL RING
- Subtle outer circle.
- Fainter inner circle.
- Four amber-outlined numbered nodes at the diagonal positions.
- Four small stationary clockwise arrowheads on the circle.
- Center text:
  “Learn.
   Improve.
   Repeat.”

Keep the center text upright and stationary.
Avoid decorative spinning, glow effects or pulsing cards.
A subtle travelling dot is optional; respect reduced motion and pause it offscreen.
The static diagram must communicate the full sequence.

CARD CONTENT

01 — Instrument
Description:
“Get events, consent and server delivery working together.”
Outcome:
“A reliable source signal.”

02 — Attribute
Description:
“Connect installs and revenue to sources. Check the gaps in reporting.”
Outcome:
“Attribution you can inspect.”

03 — Decide
Description:
“Use retention, LTV and payback to set spending limits by market.”
Outcome:
“A defensible acquisition ceiling.”

04 — Deploy
Description:
“Run campaigns and monetisation tests. Feed the results back into measurement.”
Outcome:
“Spend informed by evidence.”

Each card contains:
- Small numbered badge beside the title.
- Short description.
- Thin divider.
- Outcome.
- A real “Explore scope” button with a plus indicator.

Use approximately 24px card padding, existing fonts and 12px corners.
Do not put the full technical scope inside the collapsed cards.

EXPANDED SCOPE
Preserve the existing detailed service descriptions.

All panels are initially collapsed when scripting is available.
Clicking “Explore scope”:
- Selects the station.
- Highlights its card and matching ring node.
- Opens that station’s detailed scope.
- Changes the plus indicator and accessible expanded state.

Desktop:
Show the detail in a full-width panel below the diagram.
Do not expand the card itself or move the ring.
Use loop-orbit-detail.png as the reference.
Include the station number/title, full scope, outcome and close button.

Only one station is open at a time.
Clicking the selected trigger again closes it.
Closing from the panel returns focus to the relevant trigger.

Keep meaningful content accessible if JavaScript fails.
Reuse the existing progressive-enhancement approach where practical.
Do not require hover to discover or read service details.

MOBILE AND TABLET
At widths where the desktop arrangement becomes cramped:
- Stack heading and supporting copy.
- Show a compact ring beneath the introduction.
- Show cards vertically in order 01, 02, 03, 04.
- Expand detail directly beneath the selected card.
- Use full-width cards and comfortable touch targets.

Follow loop-orbit-mobile.png.
Do not shrink the desktop diamond into unreadable miniature cards.
Do not force horizontal scrolling.
Choose the breakpoint based on actual content fit; a stacked treatment around tablet width is acceptable.

Keep each station’s content in a coherent accessible reading order.
Avoid duplicate focusable desktop/mobile copies.

CLOSING LINE
After the diagram:
“Fresh results flow back into measurement. That closes the loop.”

The desktop version may also include the compact sequence:
“01 → 02 → 03 → 04 → 01”

BRAND
Reuse existing tokens:
- Background #0E1014.
- Surface #16191F.
- Raised surface #1D2128.
- Main text #E8EAED.
- Secondary text #A8AEB6.
- Amber #E39A1F.
- Existing subtle border tokens.
- Be Vietnam Pro and IBM Plex Mono where appropriate.

Keep text readable. The screenshots illustrate composition; do not reproduce small image-preview text sizes at the expense of accessibility.

ACCESSIBILITY
- Logical DOM order: Instrument, Attribute, Decide, Deploy.
- Real keyboard-operable buttons.
- Visible focus.
- Correct aria-expanded and aria-controls relationships.
- A labelled detail region.
- Decorative SVG elements hidden from assistive technology when equivalent text already explains them.
- No duplicate keyboard stops on decorative ring nodes.
- At least 44px touch targets for controls.
- No animation dependence.

IMPLEMENTATION AND VERIFICATION
Inspect git status first and preserve existing user work.
Keep changes scoped to Loop.astro, its relevant styles/interaction code and focused checks.
Do not introduce a UI framework or animation dependency.

Inspect the actual rendered result at:
- 1440px desktop.
- 1024px tablet.
- 390px mobile.
- 360px mobile.

Verify:
- Balanced card sizes and spacing.
- Correct clockwise order and arrow orientation.
- Connector alignment.
- All four disclosure states and close behavior.
- Keyboard focus and reading order.
- Reduced motion.
- No overflow, clipping or content overlap.
- The surrounding homepage remains unchanged.

Run the build and relevant existing checks.
Provide desktop/mobile screenshots, including one expanded scope state.
Report changed files and actual verification results.

Complete the reviewable implementation. Do not merge, push or deploy.

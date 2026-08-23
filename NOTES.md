# NOTES

Findings, deliberate deviations, and verification results from porting the
Claude Design export to a shipped Astro site.

**Deployed:** https://aamir-9d.github.io/congenial-octo-journey/

Anything in **Flagged, not fixed** is a decision waiting on you. Nothing in that
list has been changed.

---

## Changed after review (2026-08-21)

Three things came out of looking at the deployed page next to a competitor.

### A regression I introduced, now fixed: sliders rendered unstyled

Extracting `Slider.astro` out of `Calculator.astro` left the slider markup in
one component and its CSS in another. Astro scopes a component's `<style>` to
that component's own elements, so the rules never reached the markup: every
slider field lost its flex row, its mono 11.5px label and its full width, and
rendered as body-sized text beside a default-width input.

**Not the export's fault and not a design decision — my bug.** The whole
existing suite waved it through, because the copy was right, the numbers were
right and the markup was right. Only the CSS did not arrive. This is precisely
the gap a screenshot diff would have caught, and precisely why the missing
browser matters.

Fixed by moving the rules into `src/styles/calculator.css`, imported rather than
scoped. `tests/styles.test.ts` now checks every class on every built page
against the rules that could match it. On its first run it found two more dead
classes, `.calc__swatch` and `.contact__block`, both since removed.

### Hero rebalanced

The export gave the text column `flex: 1 1 460px; max-width: 34em` and the card
`flex: 0 1 320px`. From 1024px up that left **190px of the row unused** — the
text column hit its 578px cap and stopped, and the card had `flex-grow: 0` so it
could not take the slack. A 58px headline then wrapped eight times inside 578px
while the card floated at the top of a much taller column.

Both columns now share the row about 3:1 — 691px and 397px at 1440px, no dead
space at any width. The row also moved from `align-items: flex-start` to
`stretch`, which finally activates the `align-items: flex-end` the card already
carried: it was asking to sit on the baseline of the headline block, and the
parent was collapsing its height so the instruction had nothing to align
against. Same shape of bug as the inert `style-hover` attributes.

No type, colour or copy changed. The h1 keeps its own `max-width: 16em` and the
paragraph its 34em measure.

**Honest caveat:** the mock-up shown at approval said the headline would drop
from eight lines to four. Measuring the column arithmetic rather than the text,
five or six is the realistic figure — I cannot measure text wrapping without a
browser. If it still reads too tall, dropping the h1 clamp from
`clamp(34px, 5.1vw, 58px)` to a 48px maximum is a one-line change, and the only
one of these that touches a signed-off type value.

### Hero entrance animation

Eyebrow, headline, paragraph, buttons and summary card now fade and rise in
sequence on load, 80–330ms apart, 550ms each. Pure CSS, no JS, gated on the same
`.js` class as the scroll reveal so nothing is ever hidden without scripting.

Only `opacity` and `transform` animate, both composited, so there is no layout
shift. The one cost: the headline is the LCP element and starts at opacity 0, so
its 80ms delay is added to LCP. That is why it has the shortest delay in the
sequence.

An animated backdrop was considered and rejected: it is the most expensive thing
on the competitor's page, it is a real risk to the 95+ mobile target, and a
low-contrast constellation that reads well on near-black will either disappear
or look noisy on `#F7F6F3`.

---

### A second binding bug: the hero card was frozen

The hero summary card is a **sibling** of `.calc`, not a descendant, and
`calculator.ts` scoped its binding query to `.calc`. So the six figures were
server-rendered with the defaults and then never updated again — while the card
read *"Live from the model below. Move a slider and these move."* It did not.

The binding root is now `#top`, which contains the calculator and both hero
cards. `tests/styles.test.ts` asserts every `data-bind` element falls inside it.

### Hero chart added

The bottom-aligned card left the whole upper-right quadrant empty, so the hero
still read as unbalanced even after the row was filled. There is now a compact
chart above the numbers, drawing the same two curves from the same model at a
fixed viewBox — teal for the money, dashed grey for what the dashboard reports,
amber for the gap between them, and the breakeven dot. It is live: the sliders
redraw it.

New design, so it is marked `data-added` and excluded from the copy-parity
comparison, like the contact form.

### Stack bundles evened up

The bundle grid is `align-items: start`, so every card sizes to its own content
and a one-line title sat a line shorter than a two-line one. `start` is the
right call for an accordion — `stretch` would make opening one card stretch
every sibling in its row — so instead the title and meta each reserve two lines
via `min-height: calc(2 * 1.65em)`. Closed cards line up; opening one still
grows only itself.

### Mobile pass (21 Aug)

Reviewed on a real phone, which turned up more than the desktop screenshots did.

- **Bio copy was being sliced mid-word** at 375/390/414px. Flagged item 2 above,
  now fixed.
- **Long descriptions collapse below 768px.** Problems, the Loop stations,
  Founders and Proof each put their body copy behind a tap target
  (`Disclose.astro`). The heading, the statistic and the red code line stay —
  those carry the point; the paragraph is for whoever wants it. Above 768px the
  toggle does not exist and everything reads as before.
  Collapsed state is CSS gated on `.js`, so it applies at first paint with no
  flash, and with scripting off nothing is ever hidden.
- **The empty founder photo frame is gone.** A 4:3 grey void is most of a phone
  screen showing nothing. The frame renders the moment a file appears in
  `public/img/`; that is a build-time change, so no visitor sees a shift.
- **Founders read as cards below 768px**, rather than two long runs of text
  sharing one background.
- **The nav pill was mostly empty on mobile.** Below 480px the links are hidden
  and their `margin-left: auto` went with them, so the CTA sat against the logo.
  The auto margin now moves to the CTA at the same breakpoint.
- **In-page anchors landed under the fixed nav.** Added `scroll-margin-top:
  96px` to the section targets.

The disclosure button labels are new UI text, so each button carries
`data-added` and the copy-parity check lifts it out. The body copy inside stays
in the comparison, unchanged.

### FAQ section added (21 Aug)

New section between the founders and the closing ask — objection handling
belongs immediately before the booking. Nineteen questions in two groups:
eight on working together (price, timeline, access, effort, risk) and eleven on
technical scope.

Native `details`/`summary` throughout, so it is keyboard-operable and
screen-reader labelled with no JS, findable by Ctrl+F when expanded, and
functional with scripting off. One row open per group.

New design, so the section carries `data-added` and is excluded from the
copy-parity comparison.

**Question count: the brief caps the FAQ at 18 and specifies 19.** Group A lists
7, Group B lists 11, and "the awkward one" — *Can you show me results from other
clients?* — is specified separately with "include it". 7 + 11 + 1 = 19. All
nineteen are built, because every answer is deliberate copy and choosing one to
delete is a content decision, not a formatting one. If 18 is a hard limit, the
weakest candidate for cutting is *Is SKAdNetwork being replaced by
AdAttributionKit?* — it is the shortest answer, it proves the least, and its
substance is already carried by the SKAdNetwork schema question above it.

The client-results question went into Group A rather than Group B. It is an
objection, not a capability question, and Group A is the group that opens — the
brief's own argument is that answering it openly converts a suspicion into a
demonstration of discretion, which a collapsed accordion would defeat.

`{{FOUNDER_1}}` / `{{FOUNDER_2}}` resolve to first names, "Aamir" and "Faisal",
matching how the founders section already refers to them in prose. Full names
sit directly above in the same viewport.

**JSON-LD and visible text come from one array.** `src/data/faq.ts` is the
single source; the section renders it and `Schema.astro` builds the `FAQPage`
node from the same objects with the inline markers stripped. Mismatched
structured data is a manual-action risk, and the reliable way to keep them
identical is never to write them twice. `tests/faq.test.ts` asserts every
structured answer has a matching visible one in the built HTML.

### Products section added (22 Aug)

Three cards between the audit findings and the founders, each opening its
product overview PDF. The PDFs are served from `public/pdf/` (4.0 MB total), so
they deploy with the site rather than depending on another host.

Every string on the cards is lifted from the PDF it links to — kicker, headline,
summary and figures are the documents' own words. The copy was read out of the
files rather than written: Monetization Scout had an HTML source in its repo,
and the two ASO overviews were decoded from the PDFs themselves (Chrome/Skia
output, hex glyph ids against subset fonts, resolved through each font's
ToUnicode CMap).

Card language is borrowed from the sections above rather than invented: the mono
kicker of Problems, the white card and hairline of Loop, the big Archivo figure
of Proof, and the existing `.eyebrow` / `.section-lead` primitives for the
header.

The whole card is a single `<a>` — not a card containing a button, which would
give two tab stops to one destination. Opens in a new tab, announced in the
`aria-label`, with the page count and file size stated before the click.

`tests/products.test.ts` asserts each card against the actual bytes in
`public/pdf/`: the file exists, starts with `%PDF-`, and its real size and page
count match what the card claims. Page counts are read from the PDFs, not
trusted — the ASO Agent card was written as 6 pages and the file has 8.

Opening an overview fires `product_overview_open` with the product id. It is the
strongest intent signal on the page short of the form, and it would be strange
for a site selling measurement to leave it to a generic outbound rule. The link
is never intercepted: no `preventDefault`, so a blocked tag manager cannot stop
the PDF opening.

**One thing to decide.** The FAQ answers *Can you show me results from other
clients?* with "Not yet as named case studies." That is still true — these are
our own tools, not client work — but a reader who has just scrolled past three
detailed product overviews may find the answer reads oddly. Adding a sentence
pointing at this section would resolve it. Not changed, because it is signed-off
copy from the FAQ brief.

### The Bento redesign (23 Aug)

Dark ground, Be Vietnam Pro, Phosphor icons, and every section rebuilt from
`design/E2E Apps - Bento.dc.html`. Built on the `redesign` branch and deployed
alongside the live site at `/next/` — see the deployment note in README.

**Three flagged items resolved by it.**

*Item 1 — amber-on-light contrast.* Seven pairings failed WCAG AA on the cream
ground. Inverting the ground resolves all of them: amber is 8.1:1 on `#0E1014`
and all four text tokens pass. `scripts/check-contrast.mjs` is rewritten for the
new palette and is down to a single finding — the dashboard chart line at
2.85:1 against a 3:1 requirement. Left failing rather than reclassified: the
dashed pattern does help distinguish it, but WCAG 1.4.11 covers graphics needed
to understand content and a chart series qualifies. `#5F666F` clears it at
3.03:1, and that is a design value, so it is your call. Lighthouse's
accessibility assertion is promoted from `warn` to `error`.

*Item 3 — 44px touch targets.* Fixed at the source rather than by escalating
specificity. The inline `height:20px` on the ranges and `width:16px;height:16px`
on the checkboxes are gone, and the controls are restyled: a 44px track with a
22px thumb, going to 26px under `@media (pointer: coarse)`.

*Item 4 — no navigation below 480px.* There is now a hamburger and a full-screen
sheet: six rows with an icon, a label, a one-line description and a trailing
arrow, with the CTA and email pinned to the bottom. Escape closes it, following
a link closes it, and focus returns to the button that opened it. The button is
hidden without JS, since the sheet could never open.

**Structural changes.**

- The payback model was a child of the hero, beside a summary card and a mini
  chart. The Bento hero has neither, so it is its own `#payback` section and the
  calculator's binding root narrowed from `#top` back to `.calc`. The
  frozen-bindings bug those blocks caused cannot recur — the elements are gone.
- CTA and Contact are one merged section. The form was left-aligned while its
  neighbours were centred; that was the misalignment.
- The Loop is a real cycle: a 3x3 grid with the ring in the centre cell and the
  four stations at N/E/S/W, one layout at every width. That removed the "back to
  01" marker, which was the contrast failure in item 1.
- `src/scripts/reveal.ts` is deleted. Scroll-driven CSS does the same job, and
  where `animation-timeline` is unsupported the animation runs once on load, so
  content is never left hidden.

**Copy.** `tests/copy-parity.test.ts` is rewritten. An ordered whole-page
comparison was right while the port was meant to be pixel-identical; it is the
wrong assertion for a deliberate redesign. It now asserts every substantial run
from the export still appears somewhere in the port, with a `REPLACED` list
recording each deliberate removal and its reason, a `SPLIT` list for paragraphs
now divided across a lead and a disclosure, and a second test asserting
everything listed as replaced really is gone — so the list cannot become a
dumping ground.

Where the design file abbreviates signed-off copy, the export's wording is kept:
the bento disclosures hold the full paragraphs, the Loop stations keep their
outcome lines, and card 03 keeps "A conversion schema built for nothing in
particular".

**New copy still awaiting sign-off**, all marked `data-added`:

1. The hero lead paragraph.
2. Bento card 05, "One stack, one person accountable."
3. The three Proof labels.
4. The two condensed founder bios.
5. The mobile menu's six link descriptions.

The blog posts are no longer placeholders — they are four real LinkedIn
articles, republished in full.

**Not done, and deliberate.** Be Vietnam Pro has no variable version on Google
Fonts despite the brief asking for one; four static weights ship instead, and
the set is smaller than what it replaced. `src/scripts/calc-model.ts` still
carries the `mini` chart geometry the hero no longer uses — dead, but removing
it means editing the one file the brief says not to touch, so it waits for a
word from you.

### The compatibility shim is gone, and it was hiding invisible text (23 Aug)

The redesign shipped an alias block mapping the retired cream token names onto
the new palette, so the site stayed coherent while sections were rebuilt one at
a time. That was the right call for the migration and a liability the moment it
outlived it.

Two names changed meaning when the ground inverted. `--c-paper` was the light
ground in the cream system and was used for *light text on the dark sections*;
the alias resolved it to the new dark ground. Nine pieces of text were therefore
rendering at **1.02:1** — the footer logo, the consent banner, and five places
in the contact form. Invisible, and invisible to every check in the suite,
because the markup was right, the copy was right and only the resolved colour
was wrong.

Found by auditing what still referenced the shim rather than by looking at the
page: 311 alias references across eight files, which is also the honest answer
to "this section was not restructured" — Footer, Contact, Stack, Products, the
blog routes, the consent banner and calculator.css were never converted. They
inherited the new palette through the shim and kept the old type scale, spacing
and measures.

All of it is converted and the block is deleted. `tests/tokens.test.ts` now
fails the build on any reference to a retired name, on the block being
redeclared, and on any `var()` in the output that resolves to nothing — which is
the quiet failure mode removing the shim introduces. It caught a real leftover
on its first run: an inline `var(--space-md)` built in calendly.ts, which no CSS
sweep would have found.

Also in this pass: the contact form sits in its own 760px surface card with a
centred sub-header, per the design; the footer is on the new scale with its
Blog link; and the phone layout landed for the hero, the bento cards and the
calculator from `design/E2E Apps - Bento mobile.dc.html`.

## Flagged, not fixed

The brief says that if something looks wrong, leave it and note it. These
qualify. Each has a fix ready; none has been applied.

### 0. The phone chart is 300 tall, not the design's 150

The mobile design draws the payback chart at 300x150. The port draws it at the
width of its wrapper by 300, because the height comes from

    VH = Math.max(300, Math.min(420, VW * 0.36))

in `src/scripts/calc-model.ts` -- the file the brief says never to edit. On a
375px phone that clamp bottoms out at 300, and no value of `chartPx` reaches
150. Forcing it in CSS instead would need `preserveAspectRatio: none`, which
stretches the curve and misrepresents the model.

So the phone chart is taller and squarer than the design. It is legible and the
geometry is right; it is simply not 2:1. Changing it is a two-line edit to the
protected file (`Math.max(300, ...)` becomes a breakpoint-aware floor) and your
call to authorise, since it is the one file I was told to leave alone.

### 1. Amber on white fails WCAG AA — 7 pairings

The brief predicted this ("verify contrast on the amber-on-white combinations
specifically — that pairing is the likeliest failure"). It was right.
`node scripts/check-contrast.mjs`:

| Where | Ratio | Needs |
| --- | --- | --- |
| Breakeven label on the calculator card | 2.36:1 | 4.5:1 |
| `STATION 01` labels on the Loop cards | 2.36:1 | 4.5:1 |
| Bundle numbers on the stack accordions | 2.36:1 | 4.5:1 |
| Founder role (`MEASUREMENT & GROWTH`) on paper | 2.18:1 | 4.5:1 |
| "back to 01" on the mobile Loop | 2.18:1 | 4.5:1 |
| Focus ring on paper | 2.18:1 | 3:1 |
| Focus ring on white | 2.36:1 | 3:1 |

**Amber on the dark sections is fine** — 7.61:1 on `#101725`, 8.13:1 on
`#0A0F1A`. The problem is only where amber meets a light ground.

The focus-ring rows are the ones I would fix first: an invisible focus indicator
breaks the keyboard path the brief asks for, and it is the only failure here
that stops someone using the page rather than just straining to read it.

**Fix:** add one token, `--c-amber-ink: #9F6C16` (4.53:1 on white, same hue),
and use it for amber text and the focus ring on light grounds only. The dark
sections keep `#E39A1F` and nothing about them changes. Roughly six declarations.

Advisory, not counted as a failure: the card border `#E2E0DA` on `#F7F6F3` is
1.22:1. WCAG 1.4.11 covers what is *required* to identify a component, and these
cards are also delimited by their fill and padding — so this is legitimate as
drawn. Recorded because it is the kind of number someone will ask about.

### 2. ~~Founder cards are clipped below 480px~~ — FIXED 21 Aug

Confirmed on a real phone: the bio copy was sliced mid-word ("carrier-g…",
"LTE and 5G c…"). `minmax(420px, 1fr)` has an inflexible floor, so at 375px the
343px-wide track overflowed by ~77px and `overflow-x: hidden` clipped it.

Now `minmax(min(420px, 100%), 1fr)` — keeps the 420px floor wherever there is
room and collapses where there is not. Cutting words in half on every phone is a
defect, not a signed-off decision.

### 3. The mobile touch-target rule in the export never fires

The export's stylesheet has:

```css
@media (max-width: 767px) {
  input[type=range] { height: 44px; }
  input[type=checkbox] { width: 22px; height: 22px; }
}
```

It has never had any effect. The controls carry inline `height:20px` and
`width:16px;height:16px`, and an inline style outranks an element selector. So
the sliders are 20px tall on mobile, not the 44px the author clearly intended.

Reproduced exactly, at the same specificity, so the rule stays inert and the
375px render matches. The comment in `global.css` says so.

**Fix:** raise the media query's specificity to `.calc__range` / `.calc__box`.
Visible change at 375px, so it is your call — though 44px targets are the right
answer for the accessibility pass.

### 4. No mobile navigation below 480px

`#nav-links { display: none }` at `max-width: 480px`, with no hamburger or any
replacement. Below 480px there is no in-page navigation at all — only the logo
and the "Book a call" button, and because the hidden group carried the
`margin-left:auto`, the button sits next to the logo rather than at the right.

Left exactly as designed. Adding a menu would be a redesign.

### 5. `style-hover` was inert in the export

Every hover state in the design was declared with a `style-hover="…"` attribute.
Neither `support.js` nor `image-slot.js` implements it — it is an attribute the
Claude Design editor consumes, so **no hover state in the original did anything
in a browser.**

Implemented here as real CSS `:hover`. The at-rest render is unchanged, so pixel
parity holds, and the design intent is unambiguous. If you would rather ship the
export's literal behaviour, delete the `:hover` blocks.

Related: the export's global `a { color: teal }` / `a:hover { amber }` rules were
also defeated almost everywhere, because nearly every link carried an inline
`color`. In practice that styling only ever reached the two founder LinkedIn
links. Rather than reproduce the accident through specificity games, link
styling is now opt-in via a `.link` class, applied to exactly the links that
received it originally.

---

## Deliberate deviations

Small, and none of them visible.

- **`sc-if` → `hidden`.** The export's conditional unmounted its children. The
  port hides them instead: identical on screen, and the copy stays in the DOM
  for search engines.
- **The accordion is `<details>`.** Ten bundles, zero JS. The `+`/`−` glyph is
  CSS `::before` on `[open]` rather than a template value.
- **The Loop's wide/narrow variants are a media query,** not a JS
  `window.innerWidth >= 1024` check. Same breakpoint, no layout shift while the
  script boots, and it works with JS off.
- **Scroll reveal starts hidden in CSS,** behind a `.js` class set in the head,
  rather than being hidden from JS on mount. The export flashed the content
  visible and then hid it. With JS off, everything stays visible.
- **The calculator is server-rendered at its defaults.** The export computed
  everything client-side, so the tiles were briefly empty. Here the chart, the
  tiles and the readouts are correct in the HTML before any JS runs.
- **`renderVals` exported five values nothing consumed** — `tickY`, `midTickX`,
  `yTopLabY`, `day7LabelX`, `day7LabelY`. Dropped.
- **The invisible SVG `<text>` was kept.** It renders at `opacity="0"` in the
  export and does here too. Harmless to screen readers because `role="img"`
  makes the SVG a leaf node.

## New design (Phase 2)

The export had no form, no booking, and no working CTA — its only outbound links
were two LinkedIn profiles and a `mailto:`. The contact form and the Calendly
block are therefore **new design**, built strictly from the existing tokens: the
same dark ground as the closing section, amber pill CTA, Plex Mono field labels,
12px radii. It is the one place new design was necessary.

Both are marked `data-added` in the markup, which is also how the copy-parity
test knows to exclude them from the comparison against the export.

## Fonts

- Self-hosted from `public/fonts`. No `fonts.googleapis.com`, no third-party
  request, no GDPR question.
- **Archivo ships as the variable face.** The h1 carries `font-stretch: 118%`,
  the only one in the design; a static instance drops it silently and the
  headline reflows. The `wdth` axis has to survive.
- IBM Plex Sans is also variable — Google serves one file for 400/500/600, so
  that is what we ship, once. Plex Mono 400 is a static file. Three files,
  152KB total. Plex Sans 500 and Plex Mono 500 were in the export's Google
  Fonts request but are used nowhere in the design, so they are not shipped.
- **The `unicode-range` is Google's `latin` subset, verbatim, and must not be
  widened.** It does not contain `→` (U+2192, used 14 times), `↗` (U+2197) or
  `≠` (U+2260). Those already fell back to a system font on the original;
  keeping the range identical keeps the rendering identical. Adding the glyphs
  would change pixels.

---

## Verification

### 1. Copy parity — automated

`tests/copy-parity.test.ts` extracts the visible text from the export's template
(with its `{{ }}` bindings resolved to the same defaults the port ships) and
from the built page, and asserts they carry the same copy. Whitespace is
ignored, because the port wraps some bound values in `<span>` so the client can
update them in place — that splits a text run without changing anything on
screen.

It passes. Not one string differs. A further test asserts the `data-added` strip
is actually removing the Phase 2 sections, so the check cannot pass by
accidentally comparing nothing.

The same suite asserts no `support.js`, `image-slot`, `DCLogic`, `sc-if`,
`x-dc` or `style-hover` reference survives, and that no `fonts.googleapis.com`,
`fonts.gstatic.com` or `unpkg.com` host is contacted.

### 2. Calculator — automated, all six figures reproduce

`npm test`, 17 tests, no dependencies:

| Check | Expected | Result |
| --- | --- | --- |
| Subscription defaults, breakeven | day 277 | ✅ |
| Cumulative at day 7 | $0.2306 | ✅ |
| Cumulative at day 37 | $0.4267 | ✅ |
| Ad-monetised decay exponent | 0.492 | ✅ |
| Ad-monetised predicted D7 | 12.3% | ✅ |
| Ad-monetised breakeven | day 122 | ✅ |
| All three gap boxes unchecked | measured breakeven `never` | ✅ |
| All three checked | both series coincide exactly | ✅ |

The last one is asserted day by day across the whole 365-day horizon, and on the
rendered SVG paths, not just the breakeven day.

Also covered: annual pins the horizon to 365; an unpayable campaign reports
`never` rather than throwing; the geometry stays finite across every slider
extreme including `d1 === d30`, which drives `log(1) = 0`.

`subModel`, `adModel` and `renderVals` were transcribed character-for-character.
No number was touched.

### 3. Screenshot diff at 1440 and 375 — **needs you**

No diff harness was added, per your "no new dependencies" decision, and this
environment has no browser. `scripts/compare.html` is the substitute: it loads
the original export and the built port in side-by-side iframes at any of the
seven widths, with a difference-blend mode where black means identical.

```sh
npm run build
npx serve -l 8080 .
# then open http://localhost:8080/scripts/compare.html
```

The original needs network access — `support.js` fetches React from unpkg. If
the left pane is blank, that is why.

**This is the one acceptance criterion I could not verify myself.** Everything
structural is confirmed by the automated checks above; what remains is whether
the rendered pixels agree, and that needs eyes on a browser.

### 4. No horizontal scroll at 375/390/414/768/1024/1280/1440 — **needs you**

Same reason. One thing to expect: `html, body { overflow-x: hidden }` is carried
over from the export, so there will be no scrollbar at any width — but see
flagged item 2, where content is clipped rather than fitted at the three
narrowest widths.

### 5. Form, email and conversion events — **blocked on deployment**

The form endpoint is a Cloudflare Worker (`worker/`), because GitHub Pages is
static and cannot run server code. Deploy it, set `RESEND_API_KEY`, put its URL
in `PUBLIC_FORM_ENDPOINT`, and the path is live. `worker/README.md` has curl
commands for the honeypot, the timing gate, field validation and the CORS
allowlist.

### 6. `?gclid=test123` reaches the form payload — **testable now**

`src/scripts/attribution.ts` reads `gclid`, `gbraid`, `wbraid`, `fbclid`,
`li_fat_id` and `ttclid` into the `e2e_attr` cookie for 90 days, and
`contact-form.ts` attaches the whole object to the submission. Load
`/?gclid=test123`, check `document.cookie`, submit. Full procedure in
`docs/measurement.md` §6.

### 7. Lighthouse mobile — **blocked on deployment**

`.github/workflows/lighthouse.yml` runs LHCI on every PR against a mobile
profile, asserting the brief's four targets as hard failures: LCP < 2.0s,
CLS < 0.05, TBT < 150ms, performance ≥ 95.

What was done for it: fonts self-hosted and preloaded (Archivo and Plex Sans,
the two above-the-fold faces); CSS inlined; GTM deferred to `requestIdleCallback`;
Calendly not fetched until its embed is within a viewport of the fold; the
Calendly container given a reserved height so the widget arriving does not shift
the page. Total client JS is ~10KB before gzip, and every page works with it
disabled.

Accessibility, SEO and best-practices are assertions at `warn` rather than
`error`, because two known exceptions would otherwise fail every PR for a reason
nobody can fix in that PR: the amber contrast decision above, and `404.html`
being deliberately `noindex`. Promote them once flagged item 1 is settled.

### 8. `axe` clean — **partially blocked**

No browser here to run axe. What was done and can be confirmed by reading the
markup:

- Every slider has a real `<label for>`, and `aria-valuetext` carrying the
  formatted readout, kept in step on every render — so a screen reader announces
  "8.0%" and "$1.20" rather than "8" and "1.2".
- Toggle buttons carry `aria-pressed`; the assumptions disclosure carries
  `aria-expanded` and `aria-controls`.
- The SVG chart keeps its `<title>` and `<desc>`, plus the `aria-live="polite"`
  text summary that names the breakeven day and the invisible-gap figure.
- `prefers-reduced-motion` disables the line draw, the area fade, the scroll
  reveal and smooth scrolling.
- The honeypot is off the keyboard path (`tabindex="-1"`) and out of the
  accessibility tree (`aria-hidden`).
- Hidden conditional blocks use the `hidden` attribute, so they leave the
  accessibility tree rather than lingering invisibly.

**Expected axe failures:** the seven contrast pairings in flagged item 1.
Nothing else is known.

### 9. Full keyboard pass, no trap — **needs you**

Nothing on the page can trap focus: there is no modal, no popup, no custom
focus management, and the only overlay is the consent banner, which is two
buttons and a link in normal document order. The Calendly embed is a
third-party iframe and is the one place worth checking by hand.

Note that flagged item 1 makes the focus ring hard to see on light grounds. The
keyboard path works; seeing where you are on it is the problem.

---

## Also worth knowing

- **`Design approval pending details.zip` is unrelated** and was not used. It
  contains a dark "Nocturne" design system — Inter, a blurple accent, `#161826`
  ground — that shares nothing with this page's cream and amber. It looks like a
  stray file.
- **Founder photos are not in the repo.** `Founders.astro` checks for
  `public/img/aamir.jpg` and `public/img/faisal.jpg` at build time and renders
  them if present; until then a token-coloured box holds the identical 4:3 frame
  so nothing shifts when they land. Drop the two files in and rebuild.
- **GitHub Pages has no PR previews.** The deploy workflow builds and tests
  every PR and uploads the result as an artifact, which is the closest thing
  available. A real preview URL needs a second host.
- **`og-image.png` is generated, not drawn** —
  `node scripts/build-og-image.mjs`. It plots the real payback curve from the
  same model the page uses, so the card shows the actual day-277 breakeven. It
  is committed; the site build does not depend on it.
- **The privacy page describes the tracking that is actually implemented**, tool
  by tool and retention period by retention period, including the fact that the
  attribution cookie is set regardless of consent choice and why. If the
  tracking changes, that page changes in the same commit.

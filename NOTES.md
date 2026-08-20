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

## Flagged, not fixed

The brief says that if something looks wrong, leave it and note it. These five
qualify. Each has a one-line fix ready; none has been applied.

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

### 2. Founder cards are clipped below 480px

`grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))` has an inflexible
420px floor. At 375px the wrapper is 343px wide, so the track overflows by ~77px
and `overflow-x: hidden` on `<body>` cuts it off — the right edge of the founder
bios is not readable at 375, 390 or 414px.

Every other grid in the design uses a 280px floor, which is why this reads as an
untested breakpoint rather than an intent. It behaves identically in the
original export.

**Fix:** one rule in `Founders.astro` —
`@media (max-width: 480px) { .founders__grid { grid-template-columns: 1fr } }`.
Not applied because it changes the 375px render, which is an acceptance
criterion.

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

# Handoff to Claude — implementing the Bento redesign

Two things in this file:

1. **[What to attach](#what-to-attach)** — the exact file list.
2. **[The prompt](#the-prompt)** — copy the block verbatim into Claude Code.

Everything after that is reference the prompt points at.

---

## What to attach

**Attach the repo folder itself** (`congenial-octo-journey/`) — Claude Code needs
write access to it, not a copy. Then attach these design files:

| File | Why it's needed |
| --- | --- |
| `E2E Apps — Bento.dc.html` | **The desktop design.** The source of truth for every value: colours, type sizes, spacing, the bento grid, the loop diagram, the calculator. |
| `E2E Apps — Bento mobile.dc.html` | **The mobile design.** Nav, menu sheet, preset calculator, 44px targets. |
| `CLAUDE-IMPLEMENTATION-PROMPT.md` | This file. |

Optional, only if useful:

| File | Why |
| --- | --- |
| `E2E Apps — Current (recreation).dc.html` | The before state, if you want a diff reference. |
| `E2E Apps — Directions.dc.html` | The three layout and three type options this was chosen from. |

**Do not attach** the `_ds/` folder. The Nocturne design system was evaluated and
rejected; nothing in the redesign uses it.

The two `.dc.html` files open directly in a browser. Tell Claude to open them and
read the computed styles rather than guessing — every number below is in there.

---

## The prompt

> I'm redesigning the E2E Apps marketing site. The repo is Astro + hand-written
> CSS, no framework. Two design files are attached: `E2E Apps — Bento.dc.html`
> (desktop) and `E2E Apps — Bento mobile.dc.html` (mobile). Both are
> self-contained and open in a browser — **open them, read the actual computed
> styles, and take every colour, size and spacing value from them.** Do not
> infer values from my description.
>
> Read `README.md` and `NOTES.md` first. `NOTES.md` records what was deliberately
> left alone and five flagged items; three of those are resolved by this redesign
> (see below).
>
> **The one hard rule: do not change a single number in
> `src/scripts/calc-model.ts`.** It is a character-for-character port of a
> validated model and `tests/calculator.test.ts` pins six figures. The redesign
> reproduces all of them (subscription breakeven day 277, ad-monetised day 122).
> Only the hex literals passed into the SVG change, and those live in
> `Calculator.astro` / `Hero.astro`.
>
> Work in this order, committing after each step so I can review:
>
> 1. **Tokens.** Replace `src/styles/tokens.css` with the palette, type scale and
>    spacing from the design files. Delete every `--c-*`, `--rgb-*`, `--fs-*`,
>    `--ls-*`, `--lh-*` and `--measure-*` token — they are the old cream system.
> 2. **Fonts.** Archivo and IBM Plex Sans go; **Be Vietnam Pro** replaces both.
>    IBM Plex Mono stays for eyebrows, labels, code lines and tabular figures.
>    Self-host Be Vietnam Pro variable into `public/fonts/` following the existing
>    `@font-face` pattern in `src/layouts/Base.astro` (the URLs need
>    `import.meta.env.BASE_URL` interpolated) and preload it. This removes the
>    `font-stretch: 118%` dependency, so the Archivo variable-face constraint in
>    `README.md` §Fonts and `NOTES.md` §Fonts no longer applies — **update both
>    files in the same commit.** Keep the `unicode-range` exactly as it is; the
>    reason in `NOTES.md` still holds.
> 3. **Phosphor icons.** Load once in `Base.astro`. They replace the two
>    hand-drawn arrow SVGs in `Loop.astro` and the chevron SVG in `Faq.astro`.
> 4. **Section by section**, in the order listed in "Section spec" below.
> 5. **Mobile**, from the mobile design file.
> 6. **Tests and docs**, per the last section.
>
> Ask me before inventing any value that isn't in the design files or the repo.

---

## Design tokens

Read these off the design file to confirm, but for reference:

```css
:root {
  /* Ground and surfaces */
  --color-bg: #0E1014;
  --color-surface: #16191F;
  --color-surface-sunk: #1D2128;
  --color-line: #23272E;
  --color-line-soft: #1D2027;

  /* Text — all four pass WCAG AA on --color-bg */
  --color-text: #E8EAED;    /* 16.8:1 */
  --color-text-2: #A8AEB6;  /*  8.6:1  body copy */
  --color-text-3: #8E959E;  /*  6.3:1  secondary */
  --color-text-4: #7C838D;  /*  5.0:1  labels, meta */

  /* Brand accent — kept from the current site */
  --color-accent: #E39A1F;        /* 8.1:1 on --color-bg */
  --color-accent-hover: #F0AB33;
  --color-accent-dim: rgba(227,154,31,0.12);
  --color-ink: #101725;           /* text on a filled accent button, 7.6:1 */

  /* Type */
  --font-heading: 'Be Vietnam Pro', system-ui, sans-serif;
  --font-body: 'Be Vietnam Pro', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  /* Space */
  --s2: 6px;  --s3: 9px;  --s4: 12px;  --s6: 18px;  --s8: 24px;
  --s12: 34px; --s16: 46px;
  --section-pad: clamp(72px, 8vw, 124px);
  --gutter: clamp(20px, 4vw, 44px);
  --wrap: 1280px;

  --radius-sm: 8px; --radius-md: 9px; --radius-lg: 14px;
  --ease-out-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

**Type scale.** Weights 400/500/600/700 only.

```
h1 (hero)      clamp(38px, 5.4vw, 68px) / 1.05 / -0.032em / 700
h2 (section)   clamp(30px, 3.4vw, 44px) / 1.08 / -0.028em / 700
h2 (closing)   clamp(30px, 3.8vw, 50px) / 1.06 / -0.032em / 700
h3 (card)      22–23px / 1.22 / -0.02em / 600
eyebrow        11.5px mono / 0.14em / uppercase / --color-text-4
body           16px / 1.6      lead  clamp(16px, 1.35vw, 18.5px) / 1.6
card body      14.5px / 1.6    meta  10.5–12.5px mono
```

Every figure gets `font-variant-numeric: tabular-nums`. Proportional digits
jitter when a slider moves.

**Buttons are filled, not outlined.**

```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 9px; white-space: nowrap;
  font-family: var(--font-heading); font-weight: 600; font-size: 15.5px;
  padding: 15px 26px; border-radius: var(--radius-md);
  background: var(--color-accent); color: var(--color-ink); border: 0;
  box-shadow: 0 8px 30px -10px rgba(227,154,31,0.7);
  transition: background 180ms var(--ease-out-soft), box-shadow 180ms var(--ease-out-soft);
}
.btn-primary:hover {
  background: var(--color-accent-hover);
  box-shadow: 0 12px 40px -8px rgba(227,154,31,0.9);
}
.btn-secondary { color: var(--color-text); border: 1px solid #2C3138; background: transparent; }
.btn-secondary:hover { background: rgba(232,234,237,0.06); border-color: #3D444D; }
```

Every CTA carries a Phosphor arrow: `ph-arrow-right` in-page,
`ph-arrow-up-right` when it leaves the page.

---

## Section spec

Sections are in page order. **All section headers are centred** with a
`max-width` in `ch` and `margin: 0 auto` — the old mix of left- and
centre-aligned headers is what made the page feel unaligned.

### 1. Nav — `Nav.astro`

Sticky full-width bar, not a floating pill. `rgba(14,16,20,0.86)` +
`backdrop-filter: blur(14px)`, 1px `--color-line-soft` bottom border. Brand
left, links right, filled amber CTA. **Add a Blog link.** Dropping the fixed
pill means `scroll-margin-top` can come down from 96px to 72px.

### 2. Hero — `Hero.astro`

Centred, not split. In order: an accent pill
(`ph-plugs-connected` + "Attribution, fixed at the source"), the h1 at 19ch, a
lead paragraph at 58ch, two CTAs, then a row of platform chips.

The lead is **new copy** and needs my sign-off:

> It broke even in month nine — you killed it in week one. I fix the attribution,
> close the marketing gaps it was hiding, and grow the app on numbers you can
> defend.

**Animated backdrop**, three composited layers, all `overflow: hidden` on the
section:

1. A dot grid — `radial-gradient(circle at center, rgba(232,234,237,0.055) 1px, transparent 1px)`
   at `background-size: 34px 34px`, masked with
   `radial-gradient(ellipse 78% 62% at 50% 34%, #000 30%, transparent 78%)`.
2. Two drifting blooms — amber at 0.26 alpha and a cool `rgba(64,86,140,0.34)`,
   `filter: blur(44px)` / `blur(50px)`, on 28s and 36s `ease-in-out infinite`
   translate/scale loops.
3. A 38%-wide accent line sweeping the section's top edge, 11s linear infinite,
   inside a 1px `overflow: hidden` strip.

Entrance: pill → h1 → lead → CTAs → chips, fade + 16px rise, 600ms
`--ease-out-soft`, delays 0/80/160/240/320ms. The h1 is the LCP element, so its
80ms delay is the whole performance cost — same trade the current site already
makes.

### 3. Bento — `Problems.astro`

**This is the section that was unbalanced.** A 12-column grid, `gap: 16px`:
row one is `span 7` + `span 5`, row two is three `span 4`.

Every card has the same five parts in the same order:

1. Icon + mono kicker
2. `<h3>` with a `min-height` — **1.22em for row one, 3.66em for row two**
3. A lead `<p>` with a `min-height` — **6.4em for row one, 8em for row two**
4. A `<details>` disclosure, "Why it happens", holding the full signed-off
   paragraph
5. A visual, `margin-top: auto` so it pins to the bottom

Those `min-height` values are load-bearing. They are what makes every card in a
row the same height with its disclosure trigger at the same offset. I measured
it: 368px / 368px in row one, 456px × 3 in row two, triggers at 193px and 270px.
If you change a lead's wording, re-check the offsets.

The card visuals, in order: a dying retention curve (SVG, `a·d^-b` with
a = 0.32 and D30 = 0.03, drawn once at a fixed 300×96 box, with a dashed payback
horizon marker); a two-bar dashboard-vs-true comparison that grows on load; two
mono code blocks (`white-space: pre-line` — the newline matters); and a chip
cluster.

Card 01 keeps its amber ring (`box-shadow: 0 0 0 1px rgba(227,154,31,0.34)`) —
it's the one that isn't a measurement fix. Card 05 is new: "One stack, one
person accountable."

### 4. Payback model — `Calculator.astro` + `Slider.astro`

Every control from the current site is present. Do not drop any of them.

**Above the chart:** the mode toggle (Subscription / Ad-monetised), then — in
subscription mode only — three preset radios, then the horizon segmented control
(90d / 180d / 365d) and the breakeven readout.

Presets, which are new UI:

| Preset | i2t | t2p | price | retention | CPI | Breakeven |
| --- | --- | --- | --- | --- | --- | --- |
| Conservative | 5% | 25% | $7.99 | 78% | $1.60 | never |
| Typical | 8% | 35% | $9.99 | 85% | $1.20 | **day 277** |
| Aggressive | 12% | 45% | $12.99 | 90% | $0.90 | day 37 |

Typical is the repo's own `INITIAL_STATE`, so it must reproduce day 277 exactly.
Touching any slider moves the selection to an implicit fourth "your numbers"
state, so no preset stays lit against values it doesn't describe.

**Behind an "Adjust the assumptions" `<details>`:** all six subscription sliders
(install→trial, trial→paid, plan price, renewal retention, refund rate, CPI) or
all four ad sliders (ARPDAU, D1, D30, CPI); the three segmented groups (billing
period, trial length, store commission); the four derived figures (install→paid,
net per payment, LTV per payer, LTV per install); the annual-SKU warning; the
three gap checkboxes **with their two nested sliders** (share of iOS installs
with null CV, share miscredited to organic); and the ad-mode D7 cross-check
number input with its mismatch warning.

**The chart's axis labels must be HTML, not SVG `<text>`.** The current
`Calculator.astro` already does this and it is the right call — the SVG scales to
its column, so `<text>` inside it shrinks with it and becomes illegible. Keep
the existing `.chart__lbl` approach. Two details from the design:

- The y-label gutter is a **fixed 54px flex column outside the viewBox**, with
  the labels right-aligned in it. Don't reserve the gutter inside the viewBox —
  the label widths are real px and the viewBox units are not, so the two can't
  be reconciled at every width.
- The x labels sit inside a `position: relative` wrapper around the SVG,
  positioned as **percentages** of the SVG box (`fx(d)/VW*100`), so they track
  the curve at any rendered width while their type stays at real px.

Chart colours: true revenue `--color-accent` at 2.6px; dashboard
`#5B626B` at 2px `stroke-dasharray: 6 5`; the invisible gap
`--color-accent` at `opacity: 0.16`; axes `#2C3138`; zero and day-7 lines
`#4A515A`; breakeven dot `--color-accent` at r=5.

### 5. The Loop — `Loop.astro`

**Replace the rounded-rectangle diagram with a real cycle.** A 3×3 grid: the
circle SVG in the centre cell, and the four station cards in the N / E / S / W
cells, so reading order runs clockwise. Station 04 is right-aligned, 01 and 03
centred, 02 left-aligned — each card points at the circle.

The SVG is a 300×300 viewBox with a 112px-radius circle in `#2C3138`, four
`r=19` node circles with amber strokes and the station number inside, four small
tangent arrowheads showing direction of travel, and "SIGNAL IN / SPEND OUT" at
the centre.

**One dot travels the circle** via
`<animateMotion dur="11s" repeatCount="indefinite" path="M 150 38 A 112 112 0 1 1 149.9 38 Z">`,
with a second `r=11` outline circle on the same path at 0.35 opacity as a halo.
**Do not add a rotating dashed arc** — I tried it and the moving line reads as
broken. The dot alone is the effect.

This replaces both the wide diagram and the narrow stacked fallback; one layout
at every width, which also removes the "back to 01" marker that was failing
contrast (flagged item 1 in `NOTES.md`).

### 6. Proof — `Proof.astro`

Three cards, not three bare columns. Each gets a **descriptive label above the
figure** — the figure alone wasn't saying anything:

| Label (new copy) | Figure |
| --- | --- |
| Trial-to-paid, misreported | 11% → 17% |
| The paywall nobody reached | ~5% |
| Spend in markets that cannot pay back | Most of the budget |

Labels have `min-height: 2.7em` and figures `min-height: 1.9em` so the three
cards line up. A 2px amber rule sits between label and figure.

### 7. The full stack — `Stack.astro`

Largely unchanged: ten `<details>` bundles, four filter chips, `align-items:
start`. Centre the header, restyle the chips to pill + amber tint when pressed,
and swap the `+`/`−` CSS glyph for `ph-plus`. Keep the two-line `min-height`
reservations on title and meta.

### 8. Products — `Products.astro`

**Drop the stats row entirely** — the three figures per card go. Keep kicker
(`min-height: 3.1em`), name, headline (`min-height: 2.7em`), summary, stack line
and "Read the overview" with its page count and file size. The headline moves
from teal to `--color-text`. Card hover: `translateY(-3px)` plus an amber
hairline. `tests/products.test.ts` still passes — it asserts page counts and
byte sizes, which the card still states.

### 9. Blog — new, `Blog.astro`

New section between Products and Founders. Header row with the section title and
an "All posts" secondary button. Then rows in a
`110px / 1fr / 190px / auto` grid: date (mono), title + kicker, a mono tag, and
`ph-arrow-up-right`. Row hover tints `rgba(232,234,237,0.03)`.

The four posts in the design are **placeholders drawn from real material in
`NOTES.md` and `src/data/faq.ts`** — the Google Ads value-and-currency loss, the
subscription-versus-game SKAN schema, deferred deep links failing for new
installs, and the server-side renewal path. Replace with real posts or keep them
as the launch set; either way the copy needs my sign-off.

You'll need a content collection or a `src/data/posts.ts`, plus a
`/blog/[slug]` route and an index page. Propose the shape before building it.

### 10. Founders — `Founders.astro`

Two cards. A 78px rounded photo slot beside the name and role, then a
**single-paragraph** bio (the three paragraphs are condensed to one — new copy,
needs sign-off), a row of mono credential tags, and the LinkedIn link. The
build-time `fs.existsSync` check stays; the slot renders a `ph-user` glyph on a
diagonal-stripe ground until the file lands.

### 11. FAQ — `Faq.astro`

**The width problem:** the FAQ was in a 760px column while everything around it
used the 1200px wrap, so its edges didn't line up. Now it sits in the same
1280px wrap as every other section, as **two columns** — "Working together"
(8 questions) and "Technical scope" (11) — with all nineteen answers unchanged
from `src/data/faq.ts`. Answers cap at 72ch for readability. Header centred.
`Schema.astro` and `tests/faq.test.ts` need no change; the data source is
untouched.

### 12. Closing CTA and contact — `CTA.astro` + `Contact.astro`

**Merged into one section, centred.** The contact form was left-aligned while
its neighbours were centred; that's the misalignment you're fixing. Centred
heading and lead, then the form in a 760px surface card with its own centred
sub-header. Full-width filled submit button. One amber bloom behind the section.

### 13. Footer — `Footer.astro`

Ground `#111318`, `--color-line-soft` top border. Brand and tagline left, link
row right (add Blog), legal row beneath a hairline.

---

## Mobile

From `E2E Apps — Bento mobile.dc.html`.

**Nav below 480px** — `NOTES.md` flagged item 4, no navigation existed at all.
Brand left, filled amber "Book a call", then a 44×44 hamburger. Tapping it opens
a full-screen sheet: `rgba(14,16,20,0.98)` + `blur(20px)`, six links on **62px
rows** — a 19px Phosphor icon, a 23px/600 label, a 12.5px description beneath
it, and a trailing `ph-arrow-right` — with the CTA and email pinned to the
bottom and one amber bloom lower-left. Entrance is fade + 16px rise, 280ms.
Needs a small script: class toggle, `Escape` to close, focus returned to the
hamburger.

The six descriptions: Services → "Where the money goes missing"; The Loop →
"Four stations, one cycle"; Approach → "The full stack, in bundles"; Products →
"Tools built for this work"; Blog → "Findings from live stacks"; FAQ → "Before
you book".

**44px touch targets** — flagged item 3. Fix it properly rather than by raising
the media query's specificity: remove the inline `height:20px` /
`width:16px;height:16px` from the controls and restyle the range input.

```css
.calc__range { -webkit-appearance: none; appearance: none; background: transparent; height: 44px; }
.calc__range::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: #2C3138; }
.calc__range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 26px; height: 26px; margin-top: -11px;
  border-radius: 50%; background: var(--color-accent);
  border: 3px solid var(--color-surface);
  box-shadow: 0 0 14px -2px rgba(227,154,31,0.9);
}
```

A 26px thumb in a 44px track gives a real target without a 44px-tall bar.
Checkboxes go to 22px inside a 44px label row. Mirror the `-moz-` selectors.

**Calculator on a phone** — the presets carry the load, with the full control
set behind the "Adjust the assumptions" disclosure. Same three presets, same
segmented groups, same nested gap sliders, stacked one per row.

**Bento on a phone** — the 12-column grid collapses to a single column; cards
keep their visuals but drop the `min-height` reservations, since nothing is
sitting beside them to line up with.

---

## Motion

Everything is `opacity` and `transform` only, so no layout shift and no CLS cost.
The existing `prefers-reduced-motion` block extends to cover the new keyframes.

**Scroll reveal: delete `src/scripts/reveal.ts`.** Scroll-driven CSS animations
do the same job with no JS and no `.js` class gate:

```css
[data-reveal] {
  animation: reveal-up 0.65s var(--ease-out-soft) both;
  animation-timeline: view();
  animation-range: entry 4% entry 55%;
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(22px) }
  to   { opacity: 1; transform: none }
}
```

Where `animation-timeline` is unsupported the animation runs once on load rather
than on scroll, so content is never left hidden — the same guarantee the `.js`
gate was providing. That also removes the last reason for the `.js` class, so the
head script in `Base.astro` can go with it.

**Performance watch.** The two blurred drifting blooms in the hero are the only
continuous work on the page and the thing most likely to move the mobile
Lighthouse number. Both are `transform`-only on composited layers and both sit
behind `prefers-reduced-motion`, but check
`.github/workflows/lighthouse.yml` before shipping. Everything else stops once
the entrance finishes.

---

## Contrast

`NOTES.md` flagged item 1 listed seven amber-on-light failures. Inverting the
ground resolves all of them — amber is 8.1:1 on `#0E1014`, and all four text
tokens pass AA. Rewrite the pair list in `scripts/check-contrast.mjs` for the new
palette and re-run it, then promote the accessibility assertion in
`.github/workflows/lighthouse.yml` from `warn` to `error`. The reason for the
exception is gone.

Focus ring: `2px solid var(--color-accent)`, `outline-offset: 3px`, `border-radius: 4px`.

---

## Tests and docs to update in the same commit

- `tests/styles.test.ts` — the class inventory changes substantially. It caught
  two dead classes on its first run; expect it to earn its keep again.
- `tests/copy-parity.test.ts` — mark the new copy `data-added`: the hero lead,
  the bento card 05, the three Proof labels, the condensed founder bios, and the
  whole blog section.
- `tests/products.test.ts` — should still pass. Confirm, don't assume.
- `scripts/check-contrast.mjs` — rewrite the pair list.
- `scripts/build-og-image.mjs` — retune to the new palette, or the social card
  will be the only cream artefact left.
- `README.md` §Fonts — the Archivo variable-face constraint is gone.
- `NOTES.md` — flagged items 1, 3 and 4 are resolved; move them into a "Changed"
  section rather than deleting them, since the reasoning is the record of why.
- `docs/measurement.md` — unaffected. No event names change. Add
  `blog_post_open` if you want the blog instrumented.

## New copy needing sign-off

Collected in one place so it's easy to review:

1. The hero lead paragraph.
2. Bento card 05, "One stack, one person accountable."
3. The three Proof labels.
4. The two condensed founder bios.
5. The four blog post titles and kickers.
6. The mobile menu's six one-line link descriptions.

Everything else on the page is the existing signed-off copy, verbatim —
including all nineteen FAQ answers and every stack bundle.

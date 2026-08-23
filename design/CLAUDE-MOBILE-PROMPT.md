# Handoff to Claude — fixing the mobile build

The desktop build is live at `aamir-9d.github.io` and largely correct. **Mobile is
not.** This file is the mobile brief on its own, because the mobile half of
`CLAUDE-IMPLEMENTATION-PROMPT.md` was not applied.

---

## What to attach

**Attach the repo folder** (`congenial-octo-journey/`) — Claude Code needs write
access. Then attach:

| File | Why |
| --- | --- |
| `E2E Apps — Bento mobile.dc.html` | **The mobile design. Seven screens, every module.** The source of truth. |
| `E2E Apps — Bento.dc.html` | The desktop design, for the shared tokens and the sections mobile inherits. |
| `CLAUDE-MOBILE-PROMPT.md` | This file. |

Both `.dc.html` files open in a browser. **Tell Claude to open the mobile one and
resize to 402px wide**, then read the computed styles. Every number below is in
there.

---

## The prompt

> The desktop build of the E2E Apps site is live and correct. The mobile build is
> not — the mobile half of the brief was skipped. Two design files are attached:
> `E2E Apps — Bento mobile.dc.html` is the mobile source of truth (seven phone
> screens covering every module), and `E2E Apps — Bento.dc.html` is the desktop
> reference.
>
> **Open the mobile design file in a browser at 402px wide and read the actual
> computed styles.** Do not infer values from my description, and do not reuse
> the desktop values at a smaller size — mobile has its own type sizes, its own
> shortened copy, and in the case of The Loop an entirely different layout.
>
> Read `README.md` and `NOTES.md` first. **Do not change a single number in
> `src/scripts/calc-model.ts`** — `tests/calculator.test.ts` pins six figures and
> the mobile design reproduces all of them (subscription day 277, ad-monetised
> day 122).
>
> Work in this order, committing after each step:
>
> 1. **The six bugs in "Bugs to fix first" below.** These are visible on the live
>    site right now. Fix them before adding anything.
> 2. **The Loop, rebuilt for mobile.** It is a different component below 768px,
>    not a scaled-down circle. Spec in "The Loop" below.
> 3. **The modules that have no mobile treatment at all** — Proof, the stack
>    bundles, Products, Blog, Founders, FAQ, the closing CTA, the contact form and
>    the footer. Spec in "Module-by-module" below.
> 4. **A 402px pass over the whole page.** No horizontal scroll anywhere at
>    360px, 390px and 430px. The acceptance test is in "How to verify" below.
>
> Ask me before inventing any value that isn't in the design files or the repo.

---

## Bugs to fix first

All six are visible in the screenshots I took of the live site.

### 1. Horizontal overflow on every data row

The calculator's readout rows, the derived-figure rows and the gap checkboxes all
run off the right edge — `day 2…`, `nev…`, `$11…`, `$1.…`, `1.2…`, `0.4…`,
`4.12 da…` are all clipped.

**Cause:** `white-space: nowrap` on the row container. It stops the label from
wrapping, so the row's intrinsic width exceeds the viewport and the whole card
scrolls sideways.

**Fix:** `nowrap` belongs on the *value* only, never the row or the label.

```css
.calc__row      { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.calc__row-lbl  { flex: 1; min-width: 0; }            /* may wrap */
.calc__row-val  { flex: none; white-space: nowrap; }   /* may not */
```

`min-width: 0` is the load-bearing part — a flex child defaults to
`min-width: auto` and refuses to shrink below its content.

### 2. UA margins on native controls

Every `input[type=range]` at `width: 100%` overflows its container by 4px, which
is enough to trigger a horizontal scrollbar on the card. Checkboxes do the same
with their 3px UA margin.

**Fix:** `input, select, textarea, button { margin: 0; }` in `global.css`.

### 3. Row labels are too long for 402px

Even wrapping correctly, some labels are too long to sit beside their value.
Shorten them below 768px:

| Desktop | Mobile |
| --- | --- |
| Invisible / 1,000 installs | Invisible / 1,000 |
| Install → trial start | Install → trial |
| Renewal retention per cycle | Retention per cycle |
| Share of iOS installs with null CV | iOS installs with null CV |
| Share miscredited to organic | Miscredited to organic |
| Model predicts D7 | Predicts D7 |
| ROAS at D30 · measured → true | *(drop on mobile — it is in the chart)* |

### 4. A visually-hidden paragraph is rendering visible

On mobile, a long mono paragraph appears under the verdict, starting "Subscription
model. 2.80% of installs become payers at $8.24 net per payment…". That is the
screen-reader summary in `Calculator.astro`. Its `.sr-only`/clip rule is being
overridden or is missing at mobile widths.

**Fix:** restore the standard clip pattern and make sure no mobile media query
resets its `position`, `width`, `height` or `clip-path`. It must stay in the
accessibility tree and out of the visual one.

### 5. Chart labels collide

"Breakeven: day 277" is drawn on top of the "day 7" axis label.

**Fix:** on mobile the breakeven figure is **not on the chart**. It sits in the
card header, right-aligned opposite the eyebrow. The chart keeps only `day 0` and
`day 365` on the x-axis and the three y-labels in their 46px gutter. Drop the
day-7 line's text label below 768px — the dashed line stays, the words go.

### 6. The chart is using the old palette

The true-revenue line is rendering teal with a brown fill. Those are
`--c-teal` and the old amber-at-low-opacity from the pre-redesign tokens.

**Fix:** true revenue is `--color-accent` #E39A1F at 2.6px, the gap fill is
`--color-accent` at `opacity: 0.16`, the dashboard line is `#5B626B` dashed. Same
as desktop. Check `scripts/build-og-image.mjs` for the same drift.

---

## The Loop

**This is a different component on mobile, not a reflowed one.** On the live site
the circle diagram sits above four full-length station cards, so the animation and
the content are two disconnected things and neither explains the other.

Below 768px, replace the circle with a **vertical rail**:

- A two-column grid per station: a 36px rail column and the content.
- The rail column holds a 36px circular node with the station number in mono
  amber, and below it a 2px line that grows to fill the row
  (`linear-gradient(180deg, rgba(227,154,31,0.5), var(--color-line))`).
- The content column holds the title at 21px/600, a **one-sentence** lead at
  13.5px, and the outcome line at 11px mono amber. Not the desktop paragraph.
- After station 04, an inline SVG draws a dashed amber path down from the rail and
  out to the right, followed by a tinted callout: "Fresh signal flows back into
  Station 01. That's the loop closing." with a `ph-arrow-u-left-up` icon.

The animation is the signal travelling: each node lights in sequence on a 5.2s
cycle with delays 0 / 1.3 / 2.6 / 3.9s.

```css
@keyframes loop-node {
  0%, 68%, 100% { background: var(--color-surface); box-shadow: none }
  10%, 38%      { background: rgba(227,154,31,0.2); box-shadow: 0 0 18px -2px rgba(227,154,31,0.75) }
}
```

The rail *is* the loop, the nodes light in order, and the return path closes it.
That is what the circle was failing to communicate on a phone.

Shortened station leads (mobile only — desktop keeps the full paragraphs):

| Station | Lead | Outcome |
| --- | --- | --- |
| 01 Instrument | Event taxonomy, a written tracking plan, SDK integration and QA, consent and ATT sequencing. | Events fire when they should, carrying what they should. |
| 02 Attribute | MMP audit, SKAN and AdAttributionKit schemas, server-to-server events, web-to-app capture. | Every dollar traceable to the click that caused it. |
| 03 Decide | Cohort LTV, payback curves by channel and country, breakeven ceilings per market. | A defensible number for what a user is worth. |
| 04 Deploy | Google, Apple Ads, Meta, TikTok, ASO and pricing — spent against those numbers. | Budget where the arithmetic says it works. |

---

## Module-by-module

Mobile type scale, from the design file:

```
h1 (hero)     32px / 1.08 / -0.03em / 700
h2 (section)  25px / 1.16 / -0.026em / 700
h3 (card)     19–21px / 1.2–1.24 / -0.022em / 600
eyebrow       10px mono / 0.12em / uppercase
body          15px / 1.6      card body 13.5–14px / 1.6
meta          10–11.5px mono
```

Gutter is 18px. Section rhythm is 46px. Every tap target is ≥44px.

**Hero.** Keep it. The pill needs `white-space: nowrap` and drops to 10px so it
stays one line. h1 at 32px. Both CTAs full-width stacked, 52px tall.

**Platform chips.** Currently they wrap into five ragged centred rows. Make the
row a single horizontally-scrolling strip: `display: flex; overflow-x: auto`, each
chip `flex: none`. Hide the scrollbar.

**Bento.** One column. **Drop every `min-height` reservation** — those exist to
level cards sitting side by side, and there is nothing beside them on a phone.
Keep the visuals. The code blocks need `overflow-wrap: anywhere` alongside
`white-space: pre-line`, and their content breaks over two lines
(`web_click → install` / `→ ??? → subscription`).

**Proof.** Three cards, not three bare columns. Each: a mono label, a 2px amber
rule, the figure at 28px, then **one short sentence** — not the desktop
paragraph:

- Trial-to-paid, misreported / 11% → 17% / "Every budget decision had been built on the wrong number."
- The paywall nobody reached / ~5% / "Share of new users who ever saw a payment screen. Nobody had measured it."
- Markets that cannot pay back / Most of the budget / "Months of spend in countries that mathematically could not break even."

**The full stack.** Filter chips become a horizontally-scrolling strip, each 44px
tall. The ten `<details>` stack one per row; title 16.5px, meta 10.5px mono, body
11.5px mono with `overflow-wrap: anywhere` (the bundle bodies contain long
slash-separated tokens that will otherwise force a scrollbar).

**Products.** One column. Kicker, name, headline, summary, then a hairline, the
stack line, and a row with "Read the overview" on the left and the file size on
the right. No stat figures — they were dropped in the redesign.

**Blog.** The desktop `110px / 1fr / 190px / auto` grid does not fit. On mobile
each row is a stacked block: date and tag on one line, then the title at 17px,
then the kicker, then a "Read" link. An "All posts" secondary button, full-width,
after the list.

**Founders.** A 64px photo slot beside the name and role, then the condensed
one-paragraph bio, the credential tags, and the LinkedIn link at 44px tall.

**FAQ.** Single column — the desktop two-column split collapses. Group headers
stay ("Working together", "Technical scope"). Questions at 15.5px/600 with a
44px minimum row. All nineteen answers unchanged from `src/data/faq.ts`.

**Closing CTA.** h2 at 27px, lead at 15px, one full-width filled button, the email
beneath in mono.

**Contact form.** Currently the tallest thing on the page. Fix three things: the
textarea is `height: 96px` with `resize: none` (not 130px and not resizable), the
labels are **10.5px mono uppercase** (the live site renders them at ~15px mono
sentence case, which is why they look oversized), and every input is 46px tall.
Submit is full-width, 52px.

**Footer.** Brand, tagline, then the link list as a **two-column grid** with 40px
rows, then the legal line.

---

## How to verify

Run these at 360px, 390px and 430px. All three must pass.

1. **No horizontal scroll.** In the console:

   ```js
   [...document.querySelectorAll('*')].filter(el => {
     const s = getComputedStyle(el);
     return el.scrollWidth - el.clientWidth > 2 && el.clientWidth > 0
       && s.overflowX !== 'auto' && s.overflowX !== 'scroll';
   })
   ```

   Must return an empty array. The two deliberate scrollers — the platform chip
   strip and the stack filter strip — are excluded by the `overflowX` check.

2. **`document.documentElement.scrollWidth === window.innerWidth`.**

3. **Every tap target ≥44px:**

   ```js
   [...document.querySelectorAll('a,button,input,select,summary,label')]
     .filter(el => { const h = el.getBoundingClientRect().height; return h > 0 && h < 44; })
   ```

4. **The pinned figures still reproduce.** Typical preset → day 277.
   Ad-monetised at defaults → day 122. `npm test` stays green.

5. **The screen-reader summary is invisible but present** —
   `getComputedStyle(el).clipPath !== 'none'` and it is still reachable by name.

6. **Lighthouse mobile ≥95.** The hero blooms are the only continuous animation;
   everything else stops after its entrance.

---

## New copy needing sign-off

Mobile-only shortened text, all condensed from copy already signed off:

1. The four station leads and outcome lines in The Loop.
2. The three Proof one-liners.
3. The five bento card leads.
4. The shortened verdict: "Your dashboard says pause. The real numbers return 1.28× over the subscription's life."
5. The six menu-sheet link descriptions.
6. The shortened row labels in the table above.

Everything else is the existing signed-off copy verbatim, including all nineteen
FAQ answers and all ten stack bundles.

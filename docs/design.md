# E2E Apps — Design System

The visual system behind e2eapps.com, as built. Companion to
[`prd.md`](prd.md): the PRD says what the site must do, this says what it must
look like.

**Written 19 September 2026** against `main` at `dd9a52c`. Every figure here was
read off the source or measured by a script, not recalled — the contrast ratios
come from `scripts/check-contrast.mjs`, the tokens from `src/styles/tokens.css`,
the component inventory from `src/components/`.

---

## 0. The chain of authority

Four links, and the order matters when two of them disagree.

| | Source | Authority |
| --- | --- | --- |
| 1 | `design/E2E Apps - Bento.dc.html` | The signed-off desktop design. Byte-exact copy of the Claude Design export — **never edited**. Adjust at render time. |
| 2 | `design/E2E Apps - Bento mobile.dc.html` | The signed-off phone design. A separate design, not a narrower rendering of the first. |
| 3 | `src/styles/tokens.css` | Every value in 1 and 2, extracted. **The single source for code.** |
| 4 | Component `<style>` blocks | Composition only. A hardcoded colour or size here is a bug. |

**Nothing in this document is a judgement call.** Where a value looks arbitrary
it was read off the design file, and the comment in `tokens.css` says so.

### Where the design lives

| Path | What is in it |
| --- | --- |
| `design/E2E Apps - Bento.dc.html` | **The desktop design.** Every colour, size and spacing value on the site was read off this file |
| `design/E2E Apps - Bento mobile.dc.html` | **The phone design.** Separate and signed off in its own right |
| `design/E2E Apps - Bento mobile updated.dc.html` | The revised phone pass — restores the blog kicker |
| `design/E2E Apps - Brand book.dc.html` | Identity: palette, type styles, voice, the mark's rules |
| `design/E2E Apps - Logo directions.dc.html` | Six explored directions. **1f is the chosen one** |
| `design/CLAUDE-BRAND-BRIEF.md` | The brief that commissioned the icon and brand book |
| `design/CLAUDE-IMPLEMENTATION-PROMPT.md`, `CLAUDE-MOBILE-PROMPT.md` | The authoring briefs behind the two exports |
| `src/styles/tokens.css` | **183 lines. The single source for code.** Nothing else may hardcode a design value |
| `src/styles/global.css` | Shared patterns: `.section`, `.section-head`, `.card`, buttons, `.eyebrow`, disclosures |
| `src/styles/calculator.css` | The payback model's own sheet — 933 lines, the largest single component |
| `src/components/*.astro` | Scoped `<style>` blocks. **Composition only** |
| `src/data/logo.ts`, `src/data/icons.ts` | The mark's geometry and 26 vendored Phosphor paths |
| `public/fonts/` | Five self-hosted `.woff2` — Be Vietnam Pro 400/500/600/700, IBM Plex Mono 400 |
| `public/brand-book/`, `public/logo-directions/` | The two design documents rendered to real pages at build time. `noindex`, never hand-edited |
| `scripts/build-design-docs.mjs` | The renderer that turns a `.dc.html` export into a deployable page |
| `scripts/check-contrast.mjs` | Reads `tokens.css` directly and reports every pairing |
| `scripts/build-icons.mjs` | Favicon, PNG set, apple-touch, PWA icons and manifest — all from `logo.ts` |

The `.dc.html` files do not run on their own: they depend on Claude Design's
`support.js`, which self-loads React from a CDN. `build-design-docs.mjs` expands
the template syntax at build time so the published pages are static.

---

## 1. Colour

Dark, near-monochrome, one accent. No second brand hue, no gradients, **no red
anywhere in the system** — including for errors, which use copy and an amber
rule instead.

### Ground and surface

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#0E1014` | The page |
| `--color-surface` | `#16191F` | Cards, calculator shell, form panel |
| `--color-surface-sunk` | `#1D2128` | Tiles and code blocks inside a card |
| `--color-band` | `#111318` | Alternating section wash, footer ground |

Four grounds, not three: depth comes from stepping between them, never from a
gradient across a card.

### Text

All four pass WCAG AA on every ground they are used on. Ratios below are
measured on `--color-bg`.

| Token | Value | Ratio | Use |
| --- | --- | --- | --- |
| `--color-text` | `#E8EAED` | **15.80:1** | Headings, figures, primary copy |
| `--color-text-2` | `#A8AEB6` | **8.52:1** | Body copy, card paragraphs |
| `--color-text-3` | `#8E959E` | **6.30:1** | Secondary detail, disclosure bodies |
| `--color-text-4` | `#7C838D` | **4.98:1** | Eyebrows, labels, metadata, axis ticks |

`--color-text-4` on `--color-surface` is **4.60:1** — the tightest pairing in
the system, and the reason nothing smaller or lighter than this exists.

### Accent

| Token | Value | Note |
| --- | --- | --- |
| `--color-accent` | `#E39A1F` | **8.08:1** on ground, 7.47:1 on surface |
| `--color-accent-hover` | `#F0AB33` | Filled buttons only |
| `--color-accent-dim` | `rgba(227,154,31,0.12)` | Chips, pills, callouts |
| `--color-ink` | `#101725` | Text on filled amber — **7.61:1** |

> **Amber must never be set on a light ground.** It falls to 2.2:1. This is the
> single reason the site is dark rather than a stylistic preference: on cream,
> the brand colour is unusable for text. On light, use `#101725` for text and
> `#8F5900` if the accent must appear.

### Lines

`--color-line` `#23272E` · `--color-line-soft` `#1D2027` ·
`--color-line-strong` `#2C3138` · `--color-line-hover` `#3D444D`

Card outlines are a **1px `box-shadow`, never a `border`** — a border changes
the box and every grid it sits in has to account for it.

Line colours are decorative and sit at 1.27:1 and 1.34:1. That is intentional
and the contrast script reports them as `note`, not `fail`: they carry no
information a user has to read.

### Chart

| Token | Value | Meaning |
| --- | --- | --- |
| `--chart-true` | = accent | True revenue |
| `--chart-measured` | `#5F666F` | What the dashboard sees — **3.03:1**, dashed |
| `--chart-axis` | `#2C3138` | Axis |
| `--chart-rule` | `#4A515A` | Gridlines |
| `--chart-bar-dim` | `#3A4048` | Unemphasised bars |

**True revenue is the only saturated thing on any chart.** The measured series
is grey and dashed — the argument the site makes, encoded in the palette. The
3.03:1 on the measured line is deliberate and barely clears the 3:1 floor for
non-text graphics; `#5B626B` was there first at 2.85:1 and failed.

### Enforcement

`scripts/check-contrast.mjs` reads `tokens.css` directly, so it cannot drift
from what ships. **All 22 text and graphic pairings currently pass.**

---

## 2. Typography

Two families. The split is semantic, not decorative: **mono means "this is a
machine value or a label"**, never "this is small text".

| Family | Weights | Role |
| --- | --- | --- |
| **Be Vietnam Pro** | 400 / 500 / 600 / 700 | Headings and body |
| **IBM Plex Mono** | 400 | Eyebrows, labels, metadata, code, axis ticks |

Both self-hosted from `public/fonts/` as five `.woff2` files and preloaded. The
`unicode-range` is Google's `latin` subset **deliberately**: `→ ↗ ≠` fall
outside it and drop to a system face, which is the original design's behaviour
and not a regression.

Every figure carries `font-variant-numeric: tabular-nums`. Proportional digits
jitter as a slider moves, and watching a number change is the calculator's
entire point.

### Scale

21 size tokens. The ones that carry most of the page:

| Token | Value |
| --- | --- |
| `--t-h1` | `clamp(38px, 5.4vw, 68px)` |
| `--t-h2` | `clamp(30px, 3.4vw, 44px)` |
| `--t-h2-closing` | `clamp(30px, 3.8vw, 50px)` |
| `--t-h2-card` | `clamp(26px, 2.8vw, 36px)` |
| `--t-h3` | `23px` |
| `--t-stat` | `clamp(28px, 3vw, 38px)` |
| `--t-lead` | `clamp(16px, 1.35vw, 18.5px)` |
| `--t-body` | `16px` |
| `--t-card` | `14.5px` |
| `--t-mono` | `12.5px` |

Plus 12 leading tokens (`--lh-h1` 1.05 through `--lh-mono` 1.85) and 13 tracking
tokens (`--ls-h1` −0.032em through `--ls-eyebrow` +0.14em). Tight negative
tracking on display sizes, generous positive tracking on uppercase mono — the
two ends of the same idea.

**At ≤640px the tokens themselves change**, not the components:

```css
--t-h1: 32px;  --t-h2: 25px;  --t-h2-closing: 27px;
--t-h2-card: 25px;  --t-h3: 21px;
```

Fifteen components read from these, so every heading moves together instead of
fifteen rules drifting apart. The breakpoint is **640px, not 767px** — a tablet
at 700px still has room for the desktop scale.

### Rules

- Headings take `text-wrap: balance`.
- `h2` capped at **24ch**, section leads at **62ch**.
- **A measure is set on the element that owns the font size.** A `ch` cap on a
  16px container constraining a 44px heading gives the wrong measure. This
  shipped once.
- Never all-caps outside mono labels. Never letter-spaced body copy.

---

## 3. Space, shape, elevation

**Seven space steps**, and nothing between them:

`--s2` 6 · `--s3` 9 · `--s4` 12 · `--s6` 18 · `--s8` 24 · `--s12` 34 · `--s16` 46

**Rhythm and measure:**

| Token | Value |
| --- | --- |
| `--section-pad` | `clamp(72px, 8vw, 124px)` |
| `--gutter` | `clamp(20px, 4vw, 44px)` |
| `--wrap` | `1280px` |
| `--wrap-form` | `760px` |
| `--wrap-loop` | `1120px` |

**Radii:** 8 focus and chips · 9 buttons and inputs · 12 cards · 14 panels ·
16 large panels · 999 pills.

**Elevation is one hairline plus, at most, one ambient shadow. Never stack
shadows.**

The shadow tokens are **neutral, not chromatic**:

```css
--shadow-accent:       0 8px 24px -12px rgba(0,0,0,0.9);
--shadow-accent-hover: 0 12px 32px -10px rgba(0,0,0,0.95);
--shadow-accent-sm:    0 6px 18px -10px rgba(0,0,0,0.85);
```

The names are historical. A zero-offset coloured halo on a dark ground is the
default look of generated interfaces; the amber fill already carries the
emphasis, and a neutral shadow under it reads more expensive. Three of these
were amber glows and were replaced.

---

## 4. Motion

**Opacity and transform only**, so there is no CLS cost. One easing curve for
the whole site: `--ease-out-soft: cubic-bezier(0.22, 0.61, 0.36, 1)`.

Everything stops after its entrance. The only continuous motion left is the two
hero glows and the Loop's travelling signal — an infinite scan-line marquee was
removed as an AI tell.

Scroll reveals use `animation-timeline: view()` — no JavaScript, no class gate,
and no flash of hidden content with scripting off.

**Every keyframe sits behind `prefers-reduced-motion`.**

---

## 5. Components

### Buttons

Primary is filled amber with `--color-ink` text; secondary is a hairline.
`.btn-primary` / `.btn-secondary` for the page, `.btn-amber` / `.btn-ghost` for
denser contexts.

Every CTA carries an arrow — **right when it stays in the page, up-right when it
leaves**. Never all-caps, never letter-spaced.

### Chips and segmented controls

Selected state is an amber tint plus an amber border — **never a solid fill on a
chip**. Segmented controls do fill the active cell. Minimum 44px at phone width.

### Inputs

46px tall. Labels 10.5–11.5px mono uppercase. `caret-color` amber.

**Every native control carries `margin: 0`.** A `width: 100%` range input is 4px
wider than its container with the UA margin left on, which is enough to give the
whole card a horizontal scrollbar. *This shipped once.*

### Focus

`2px solid #E39A1F`, offset 3px, on `:focus-visible` only. Selection is amber at
30% — never browser blue.

### Cards and disclosures

`.card` is surface + hairline; `.card--raised` adds the one ambient shadow.
Disclosures are native `<details>`; the `+`/`−` glyph is CSS on `[open]`, so the
pattern needs no JavaScript at all.

`Disclose.astro` takes a `label` that must **say what is behind it** — never
"read more".

### Section patterns

Every section shares one shell:

```
.section  →  .wrap  →  .section-head ( .eyebrow → h2 → .section-lead )  →  content
```

Headers are **centred**. This is the pattern that distinguishes a section from a
sub-page header, and getting it wrong is what made the sub-pages read as a
different site.

`.section--lead` is for a section that opens its own page. It clears the fixed
nav with `calc(var(--section-pad) * 0.6 + 74px)` — deliberate about the ~70px
bar rather than stacking a full section gap on top of it.

### The props that let one component serve two pages

| Component | Prop | Effect |
| --- | --- | --- |
| `Problems` | `compact` | Drops the five "why it happens" disclosures (homepage) |
| `Problems`, `Products`, `Faq` | `lead` | Promotes the section `h2` to the page `h1` and applies `.section--lead` |

**A section that opens a page *is* that page's header.** There is no separate
page-header component, and adding one back would reintroduce the duplicate-
heading bug it was created to fix.

### Two-ended rows

Label one side, value the other. **The system's most repeated pattern and its
most repeated bug.**

> `white-space: nowrap` belongs on the **value only**. The label gets
> `flex: 1; min-width: 0`.

`nowrap` on the row stops the label wrapping, the row's intrinsic width exceeds
the viewport, and the whole page scrolls sideways. *Tested.*

### Grid floors

Always wrapped: `minmax(min(280px, 100%), 1fr)`.

A bare px floor cannot shrink below itself. And a floor only has to be narrower
than **its own container**, which static analysis cannot see — a 280px floor in
a 263px card is a bug that a "floors must be under 360px" rule waves through.
*Tested.*

---

## 6. The mark and icons

### The mark

Logo direction **1f, "App tile"** — a rounded amber tile with "E2E" drawn as
geometry, so it depends on no font.

| | |
| --- | --- |
| Full | rx 23, glyph stroke 6.4, three paths |
| Compact | rx 20, glyph stroke 12, one path — **at or below 24px** |
| Nav | **40px**, matched to the 42.4px CTA beside it |
| Phone nav | **36px**, wordmark dropped |
| Footer | **44px** |

Below 25px it reduces to a single E on a heavier stroke — three glyphs cannot
hold a 100-unit box down to a favicon.

Geometry lives in `src/data/logo.ts` and is re-evaluated against the approved
design export at test time, so it cannot drift. Both lockups pair the mark with
a **visible wordmark**, so the mark is `aria-hidden` — announcing "E2E Apps"
twice is worse than once.

`scripts/build-icons.mjs` generates the favicon, PNG set, apple-touch icon, PWA
icons and manifest from that one source, using the `sharp` already inside Astro.

### Icons

26 vendored Phosphor paths in `src/data/icons.ts`, rendered with `currentColor`
and `aria-hidden` by default. Amber when carrying meaning, `#8E959E` when
decorative. **Never emoji, never dingbats.**

---

## 7. Phone

`design/E2E Apps - Bento mobile.dc.html` is a **separate signed-off design**.
Notable divergences from a naive reflow:

- The **Loop** becomes a vertical rail with sequenced nodes — a substitution,
  not a reflow.
- **Blog rows** become stacked blocks closing on a "Read" affordance.
- The **calculator header** goes left-aligned where desktop is centred; controls
  stack one per row.
- Hero CTAs stack full width at 52px; segmented controls hold 44px.

Every tap target is **≥44px**, enforced by a test that parses the phone media
blocks out of the built CSS — no other test in the suite can see what a rule is
gated behind, so a phone rule could be deleted and everything else would stay
green.

---

## 8. The failure modes worth knowing

Institutional memory. Each of these shipped, or nearly did.

| # | Failure | Rule that now prevents it |
| --- | --- | --- |
| 1 | **Astro scope mismatch — five occurrences.** A selector in component A compiled to `.x[scope-A]` while the element carried scope B, so the rule silently did nothing. | Cross-component selectors use `:global()`. A test asserts scope identity. |
| 2 | **A compatibility alias resolved to the wrong ground.** `--c-paper` meant "light" in the retired cream system and mapped onto the new dark ground — nine pieces of text at **1.02:1**, invisible. | The alias block is deleted. `tests/tokens.test.ts` fails the build if any retired name returns. |
| 3 | **`viewBox` written as `view-box`.** SVG attributes are camelCase; CSS properties are hyphenated. All 96 logo marks lost their coordinate system. | `CAMEL_SVG_ATTRS` in the doc renderer, with `attrName()` separated from `cssName()`. |
| 4 | **Nested `nowrap` in a shrinking flex child** gave the page a horizontal scrollbar. | See §5, two-ended rows. *Tested.* |
| 5 | **A bare `minmax(280px, 1fr)`** inside a ~263px container. | Floors must be `min()`-wrapped. *Tested.* |
| 6 | **Duplicate page headers.** A `.page-head` bolted onto components that already render a centred `.section-head` — `/products` printed its eyebrow and heading twice, word for word, and left-aligned against a centred site. | The `lead` prop. `tests/pages.test.ts` checks one `h1` per page and rejects near-duplicate headings. |
| 7 | **CRLF conversion on 63 of 89 files** after a branch switch broke every `\n`-anchored parser — and CI never saw it, because a Linux runner checks out LF. | `.gitattributes` with `* text=auto eol=lf`. |
| 8 | **A bare `#contact` anchor on a blog post** resolved against the post and silently killed the primary CTA on five page types. | All in-page anchors are base-aware via `anchor()` in `Nav.astro`. *Tested.* |

---

## 9. How it is enforced

**95 tests across 15 files**, `node --test` with `node:assert` and native
TypeScript stripping — zero test dependencies.

| File | Guards |
| --- | --- |
| `tokens.test.ts` | No retired token name; no unreadable pairing; no shim |
| `styles.test.ts` | Scope identity; shared-class integrity |
| `pages.test.ts` | One `h1` per page; no repeated or near-duplicate heading; centred pattern; nav clearance |
| `mobile.test.ts` | Phone media blocks: type scale, stacking, 44px targets |
| `overflow.test.ts` | Grid floors, nowrap placement |
| `logo.test.ts` | Mark geometry against the design export |
| `copy-parity.test.ts` | Rendered copy against the design file |
| `design-docs.test.ts` | The DCLogic renderer |
| `calculator.test.ts`, `presets.test.ts` | The six pinned model figures |
| `case-study.test.ts`, `products.test.ts`, `faq.test.ts`, `blog.test.ts` | Content claims against real files |
| `layout-402.test.ts` | A specific narrow-width regression |

Plus `scripts/check-contrast.mjs`, which reads the tokens directly.

**What no test catches:** whether the page is *good*. The build was green and 91
tests passed while `/products` printed its heading twice. Tests protect against
regression, not against bad design — a person still has to look.

---

## 10. Not decided

Carried from `prd.md` §12, the open items that are visual:

- **Section rhythm is uniform.** Every section takes the same `--section-pad`
  and sits in the same 1280px column. There is no full-bleed moment and no
  compression before a major one. `docs/redesign-plan.md` §2 and §6 call for
  three tiers instead of one flat beat; **this is the largest piece of design
  work still outstanding.**
- **Flat heading hierarchy.** `--t-h2` carries nearly every section heading, so
  the scale's range is unused and the calculator has the same visual weight as
  the founder bios.
- **The phone chart is 300px tall** against a design calling for 150. The height
  comes from `VH = Math.max(300, ...)` inside the protected model file, which
  cannot be edited without sign-off.
- **The OG image still reads `e2eapps.com`**, which is not yet the live domain.

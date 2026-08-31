# E2E Apps — Product Requirements & Design System

**Status:** live on the `redesign` branch · 91 automated checks · last revised 29 August 2026
**Related:** [`NOTES.md`](../NOTES.md) (decisions and open findings) · [`docs/measurement.md`](measurement.md) (analytics wiring) · [`docs/credentials.md`](credentials.md) (secrets runbook) · [`design/CLAUDE-BRAND-BRIEF.md`](../design/CLAUDE-BRAND-BRIEF.md) (identity work)

This document describes what the site is for, what it must do, and the design
system it is built on. It is written to be usable by someone who has never seen
the repository — a designer, a contractor, or the author six months from now.

Where a value here differs from the code, **the code is right and this document
is stale.** Several values are enforced by tests; those are marked.

---

## 1. What this is

A single-page marketing site plus a blog for **E2E Apps**, a two-person mobile
measurement and growth consultancy. It sells two things: a fixed-price audit of
a mobile measurement stack, and a retainer that implements the fixes and runs
the media against them.

### The argument the site makes

Everything on the page serves one claim, and the structure should not be changed
in a way that breaks it:

> Your dashboard says the campaign is losing money. It broke even in month nine —
> you killed it in week one.

That is: attribution is usually broken in ways that are invisible, the missing
revenue makes good campaigns look bad, and the person who fixes the measurement
should also be the person spending against it. The payback calculator exists to
let a visitor prove this to themselves with their own numbers rather than take
it on trust.

### Why the site's own rigour matters

The product is measurement rigour. A marketing site for that product that
overstates a figure, cites an unattributed statistic, or ships an inaccessible
control undermines the pitch more than it helps. This is the reason for the
unusually heavy test suite described in §11 — most of those tests exist because
a specific defect shipped once.

---

## 2. Audience

**Primary:** a growth lead, head of UA, or technical founder at a subscription
or ad-monetised mobile app. Technical enough to know what SKAdNetwork is and to
be irritated by hand-waving. Usually arrives suspecting their numbers are wrong
but unable to prove it.

**Secondary:** an agency or in-house UA team looking for a specialist to audit
work they cannot audit themselves.

**Not the audience:** non-technical small-business owners, web-only marketers,
anyone shopping on price.

### What the visitor is trying to do

1. Work out whether this person actually knows the subject, in under a minute.
2. Find out whether their own specific problem is one this person has solved.
3. Establish that the numbers being quoted are real.
4. Book a call without a form fight.

The page order in §4 follows that sequence deliberately.

---

## 3. Goals and non-goals

### Goals

| # | Goal | How it is measured |
| --- | --- | --- |
| G1 | A qualified visitor books a call or submits the form | Conversion events in GA4 and Google Ads (§9) |
| G2 | The site demonstrates competence rather than claiming it | Calculator use, scroll depth, blog dwell |
| G3 | Every published figure is defensible | Enforced by tests (§11) |
| G4 | Rank for specific technical queries | Blog posts targeting mechanism-level searches |
| G5 | The site measures itself correctly | It sells measurement; broken analytics falsifies the pitch on page one |

### Non-goals

- **Not a lead-volume play.** Few, well-qualified enquiries beat many.
- **No gated content, no newsletter, no nurture sequence.** Stated explicitly in
  the contact copy and the privacy page; do not add one without changing both.
- **No live chat, no exit popups, no cookie-wall dark patterns.**
- **Not a portfolio site.** Client names are withheld throughout (§7).
- **No CMS.** Content is code; edits go through the repository.

---

## 4. Information architecture

### Homepage sections, in order

Order is enforced by tests where a section's position carries meaning.

| # | Section | Component | Job |
| --- | --- | --- | --- |
| 1 | Nav | `Nav.astro` | Mark + wordmark, six links, persistent "Book a call" |
| 2 | Hero | `Hero.astro` | The claim, in one sentence, plus two CTAs and platform chips |
| 3 | Problems (bento) | `Problems.astro` | Five cards: where the money goes missing |
| 4 | Payback model | `Calculator.astro` | The interactive proof (§6) |
| 5 | The Full Loop | `Loop.astro` | Four stations: how the work is sequenced |
| 6 | Proof | `Proof.astro` | Three findings from real audits, one line each |
| 7 | Case study | `CaseStudy.astro` | One finding shown all the way down |
| 8 | The stack | `Stack.astro` | Ten capability bundles behind a filter |
| 9 | Products | `Products.astro` | Three tools, each linking to a hosted PDF |
| 10 | Blog | `Blog.astro` | Four most recent posts |
| 11 | Founders | `Founders.astro` | Two people, named, with LinkedIn |
| 12 | FAQ | `Faq.astro` | 19 questions in two groups |
| 13 | Contact | `Contact.astro` | Calendly embed plus the form |
| 14 | Footer | `Footer.astro` | Lockup, links, legal |

### Routes

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `pages/index.astro` | The single marketing page |
| `/blog` | `pages/blog/index.astro` | All posts, newest first |
| `/blog/<slug>` | `pages/blog/[slug].astro` | One post; build format is `file`, so **no trailing slash** |
| `/privacy`, `/terms` | own pages | Describe the tracking actually implemented, not a template |
| `/404` | `pages/404.astro` | |
| `/brand-book/`, `/logo-directions/` | generated into `public/` | Internal review documents, `noindex` |

---

## 5. Section requirements

Only the requirements that are non-obvious or have bitten before are listed.

**Nav.** Six links plus a CTA. All in-page anchors carry the base path — a bare
`#contact` on a blog post resolves against that post and silently does nothing
(this shipped once and killed the primary CTA on five page types). Below 640px
the links collapse into a full-screen sheet behind a 44px button, and the bar
shows the mark alone. *Tested.*

**Hero.** The `h1` is the LCP element; nothing may delay it. Entrance animation
is staggered opacity and transform only — never a property that triggers layout.

**Problems.** Twelve-column bento grid collapsing to one column below 900px.
Long descriptions sit behind a disclosure on phones; the lead stays visible.

**Loop.** Two entirely different components. Desktop is a circle with a
travelling signal; below 768px it is a vertical rail whose nodes light in
sequence. Not a reflow — a substitution.

**Proof.** Three findings, one figure each, client names withheld.

**Case study.** Leads with the control (same daily spend, same daily installs),
not the result. Carries its qualifying caveats on the card, not only in the
article. Every figure is recomputed from raw totals at test time. *Tested.*

**Stack.** Ten bundles as `<details>`; the `+`/`−` glyph is CSS on `[open]`, so
no JavaScript. Filter chips set `hidden` on non-matching cards.

**Products.** Three cards, each a whole-card link to a PDF in `public/pdf/`.
Page counts and file sizes are asserted against the real files. *Tested.*

**FAQ.** 19 items, two groups, `<details>`. Single source in `src/data/faq.ts`,
which also feeds the `FAQPage` JSON-LD. Copy rules: never answer "yes" alone,
no exclamation marks, never invent a client, metric or timeline.

**Contact.** Calendly lazy-loads on IntersectionObserver entry so it never
blocks first paint. Form posts cross-origin to the Worker (§10).

---

## 6. The payback calculator

The most important interactive element and the most constrained.

### Hard rule

**`src/scripts/calc-model.ts` must not be edited.** It is a character-for-character
port of a validated model. Six figures are pinned by `tests/calculator.test.ts`:

| Mode | Figure | Value |
| --- | --- | --- |
| Subscription | Breakeven | **day 277** |
| Subscription | Cumulative net at day 7 | **$0.2306** |
| Subscription | Cumulative net at day 37 | **$0.4267** |
| Ad-monetised | Decay exponent `b` | **0.492** |
| Ad-monetised | Predicted D7 retention | **12.3%** |
| Ad-monetised | Breakeven | **day 122** |

Any change to that file that moves any of these fails the build. If the model
genuinely needs to change, the figures change deliberately and the tests are
updated in the same commit with a stated reason.

### Structure

Centred header → mode toggle (Subscription / Ad-monetised) → three cohort
presets → horizon selector → chart beside its readout → everything else behind
one "Adjust the assumptions" disclosure.

**Presets** (`src/data/presets.ts`) must produce **never / day 277 / day 37**,
and `Typical` is `INITIAL_STATE` by identity rather than a copy of its numbers,
so the two cannot drift. *Tested.*

**Chart.** Axis labels are HTML positioned over the SVG as percentages, never
SVG `<text>` — the SVG scales to its column and inner text would shrink with the
viewBox. The y-axis gutter is a fixed flex column outside the viewBox.

**Accessibility.** Every slider is keyboard-operable with `aria-valuetext`
carrying the formatted readout. An `aria-live` summary announces the breakeven
and gap; it is clipped, not hidden, so it stays in the accessibility tree.

### Known limitation

The mobile design specifies a 300×150 chart. `VH = Math.max(300, …)` in
`calc-model.ts` cannot reach 150 and that file is under the hard rule, so the
phone chart is taller than the design. Recorded in `NOTES.md`; requires
explicit sign-off to change.

---

## 7. Content model

| Content | Source | Shape |
| --- | --- | --- |
| Blog | `src/content/blog/*.md` | Astro content collection, `glob()` loader |
| FAQ | `src/data/faq.ts` | 19 items, two groups |
| Products | `src/data/products.ts` | 3 items; `pages`/`bytes` asserted against real PDFs |
| Case study | `src/data/case-study.ts` | Raw period totals plus derived display figures |
| Logo geometry | `src/data/logo.ts` | Extracted from the approved design export |
| Icons | `src/data/icons.ts` | 26 vendored Phosphor paths |

### Blog frontmatter

```
title    string    the h1 and the row title
kicker   string    one line, also the meta description
date     date      ISO; drives ordering
tag      string    keep the vocabulary small
source   url?      LinkedIn original, for republished posts only
cta      string    REQUIRED — tailored closing call to action
```

`cta` is required so a post cannot ship without one, and tests fail if two posts
share the same text or if one uses `unlock`, `supercharge` or an exclamation
mark. *Tested.*

### Editorial rules

These are enforced socially, and several by test:

- **Client names are withheld.** Always.
- **Never invent a figure.** Where a real number is missing, say so.
- **Attribute third-party statistics and keep their qualifiers.** "Up to 2%"
  stays "up to"; a conditional rate is never reported as a population rate.
- **Do not republish third-party copyrighted material.** Google's decks are
  cited, never reproduced; original diagrams are drawn instead.
- **Say the awkward thing.** The case study leads with the metric that got worse.

---

## 8. Design system

Dark, near-monochrome, one accent. 103 tokens in `src/styles/tokens.css`, which
is the single source — a retired token name anywhere in source fails the build.

### 8.1 Colour

**Ground and surface**

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#0E1014` | The page |
| `--color-surface` | `#16191F` | Cards, calculator shell, form panel |
| `--color-surface-sunk` | `#1D2128` | Tiles and code blocks inside a card |
| `--color-band` | `#111318` | Alternating section wash, footer ground |

**Text** — all four pass WCAG AA on the ground

| Token | Value | Contrast | Use |
| --- | --- | --- | --- |
| `--color-text` | `#E8EAED` | 15.8:1 | Headings, figures, primary copy |
| `--color-text-2` | `#A8AEB6` | 8.5:1 | Body copy, card paragraphs |
| `--color-text-3` | `#8E959E` | 6.3:1 | Secondary detail, disclosure bodies |
| `--color-text-4` | `#7C838D` | 5.0:1 | Eyebrows, labels, metadata, axis ticks |

**Accent** — one hue, no second brand colour, no gradients

| Token | Value | Note |
| --- | --- | --- |
| `--color-accent` | `#E39A1F` | 8.1:1 on the ground |
| `--color-accent-hover` | `#F0AB33` | Filled buttons only |
| `--color-accent-dim` | `rgba(227,154,31,0.12)` | Chips, pills, callouts |
| `--color-ink` | `#101725` | Text on filled amber, 7.6:1 |

**Amber must never be set on a light ground** — it falls to 2.2:1. On light, use
`#101725` for text and `#8F5900` if the accent must appear.

**Lines** — card outlines are a 1px `box-shadow`, never a border, so they never
affect layout. `--color-line` `#23272E`, `--color-line-soft` `#1D2027`,
`--color-line-strong` `#2C3138`, `--color-line-hover` `#3D444D`.

**Chart** — `--chart-true` (accent), `--chart-measured` `#5B626B`,
`--chart-axis` `#2C3138`, `--chart-rule` `#4A515A`. True revenue is the only
saturated thing on a chart; what the dashboard sees is grey and dashed. **No red
anywhere in the system.**

`scripts/check-contrast.mjs` reads these tokens directly and reports every
pairing. One known failure is recorded in §12.

### 8.2 Typography

Two families, and the split is semantic rather than decorative: mono means "this
is a machine value or a label", never "this is small text".

- **Be Vietnam Pro** — 400/500/600/700 — headings and body
- **IBM Plex Mono** — 400 — eyebrows, labels, metadata, code, axis ticks

Both self-hosted from `public/fonts/` and preloaded. The `unicode-range` is
Google's `latin` subset deliberately: `→ ↗ ≠` fall outside it and fall back to a
system face, which is the original behaviour and not a regression.

Every figure carries `font-variant-numeric: tabular-nums`. Proportional digits
jitter as a slider moves, and watching a number change is the calculator's
entire point.

**Scale** (21 tokens). Key values: `--t-h1` `clamp(38px, 5.4vw, 68px)`,
`--t-h2` `clamp(30px, 3.4vw, 44px)`, `--t-h3` `23px`, `--t-lead`
`clamp(16px, 1.35vw, 18.5px)`, `--t-body` `16px`, `--t-card` `14.5px`,
`--t-mono` `12.5px`. At ≤640px `--t-h1` becomes `32px` and `--t-h2` `25px`, so
every heading moves together rather than per component.

Headings use `text-wrap: balance`; `h2` is capped at 24ch and section leads at
62ch. Measures are set on the element that owns the font size — a `ch` cap on a
16px container constraining a 44px heading produces the wrong measure, which
shipped once.

### 8.3 Space, shape, elevation

Seven steps: `--s2` 6 · `--s3` 9 · `--s4` 12 · `--s6` 18 · `--s8` 24 ·
`--s12` 34 · `--s16` 46.

Section rhythm `clamp(72px, 8vw, 124px)` · gutter `clamp(20px, 4vw, 44px)` ·
wrap 1280px · form wrap 760px · loop wrap 1120px.

Radii: 8 focus/chips · 9 buttons and inputs · 12 cards · 14 panels · 16 large
panels · 999 pills.

Elevation is one hairline plus, at most, one ambient shadow. **Never stack
shadows.** Depth comes from surface steps and blurred radial glows behind a
section, never a gradient across a card.

### 8.4 Components

**Buttons.** Primary is filled amber with `#101725` text and a resting glow;
secondary is a hairline. Every CTA carries an arrow — right in-page, up-right
when it leaves. Never all-caps, never letter-spaced.

**Chips and segmented controls.** Selected state is an amber tint plus an amber
border, never a fill on a chip. Segmented controls fill the active cell.

**Inputs.** 46px tall, labels 10.5–11.5px mono uppercase, `caret-color` amber.
Every native control carries `margin: 0` — a `width: 100%` range input is 4px
wider than its container with the UA margin on, which is enough to give the
whole card a horizontal scrollbar. *This shipped once.*

**Focus.** `2px solid #E39A1F`, offset 3px, on `:focus-visible` only. Selection
is amber at 30%, never browser blue.

**Two-ended rows** (label one side, value the other) are the system's most
repeated pattern and its most repeated bug. The rule: `white-space: nowrap`
belongs on the **value only**; the label gets `flex: 1; min-width: 0`. `nowrap`
on the row stops the label wrapping, the row's intrinsic width exceeds the
viewport, and the page scrolls sideways. *Tested.*

**Grid floors** must be wrapped: `minmax(min(280px, 100%), 1fr)`. A bare px
floor cannot shrink below itself, and a floor only has to be narrower than *its
own container* — which static analysis cannot see. *Tested.*

### 8.5 Motion

Opacity and transform only, so there is no CLS cost. One easing curve —
`cubic-bezier(0.22, 0.61, 0.36, 1)`. Everything stops after its entrance except
the two hero glows and the loop's travelling signal. Scroll reveals use
`animation-timeline: view()` — no JavaScript, no class gate, no flash of hidden
content with scripting off. Every keyframe sits behind `prefers-reduced-motion`.

### 8.6 Icons and the mark

Icons are 26 vendored Phosphor paths in `src/data/icons.ts`, rendered with
`currentColor` and `aria-hidden` by default. Amber when carrying meaning,
`#8E959E` when decorative. Never emoji, never dingbats.

**The mark** is logo direction **1f, "App tile"** — a rounded amber tile with
"E2E" drawn as geometry, so it depends on no font. Below 25px it reduces to a
single E on a heavier stroke; three glyphs cannot hold a 100-unit box down to a
favicon. Path data lives in `src/data/logo.ts` and is re-evaluated against the
approved design export at test time so it cannot drift.

Sizes: **40px** in the nav (matched to the 42.4px CTA beside it), **36px** on
phones with the wordmark dropped, **44px** in the footer. Both lockups pair the
mark with a visible wordmark, so the mark is `aria-hidden` — announcing "E2E
Apps" twice is worse than once. *All tested.*

`scripts/build-icons.mjs` generates the favicon, PNG set, apple-touch icon, PWA
icons and manifest from that one source, using the sharp already inside Astro.

### 8.7 Mobile

`design/E2E Apps - Bento mobile.dc.html` is a **separate signed-off design**,
not a narrower rendering of the desktop one. Notable divergences: the Loop
becomes a vertical rail; blog rows become stacked blocks closing on "Read"; the
calculator header goes left-aligned and controls stack one per row.

Every tap target is ≥44px, and a test parses the phone media blocks out of the
built CSS to enforce it — no other test in the suite can see what a rule is
gated behind.

---

## 9. Measurement

Full wiring in [`docs/measurement.md`](measurement.md). Requirements:

- **GTM + GA4**, Consent Mode v2 defaulted to `denied`, updated on consent.
- **Click-ID capture on landing** — `gclid`, `gbraid`, `wbraid`, `fbclid`,
  `li_fat_id`, `ttclid` into a first-party cookie for 90 days, attached to every
  submission. This is the exact mechanic the page sells; running it on ourselves
  is the point.
- **Google Ads** conversions with enhanced conversions, and `gclid` carried
  through to Offline Conversion Import so a closed deal posts back to the click.
- **Meta and LinkedIn CAPI server-side from the Worker**, not browser pixels, so
  an ad blocker cannot lose the conversion.
- **Calculator instrumentation** — mode switch, slider change (debounced 800ms
  so a drag is one event), gap toggle, breakeven computed. This is lead
  intelligence: $4 CPI on a $99 annual plan is a different buyer from $0.30
  weekly.
- **Scroll depth and section visibility** via IntersectionObserver.
- **Consent banner** covering all of it, written plainly.

---

## 10. Infrastructure

**Static Astro**, TypeScript, no CSS framework, **no runtime dependencies
beyond Astro itself**. This constraint is deliberate and has been reaffirmed
repeatedly; adding a package requires asking first.

**Hosting.** GitHub Pages. GitHub allows one deployment per repository, so the
workflow builds `main` into the root and `redesign` into `/next` as a preview
with `SITE_PREVIEW=1` (noindex, no GTM). The live build is pinned to `ref: main`
regardless of trigger; preview tests are advisory so a red preview cannot block
the live site.

**Custom domain.** `SITE_URL` / `SITE_BASE` constants switch between the project
URL and a custom domain in one edit, plus a `public/CNAME`. `e2eapps.com` is
registered but dormant and not owned by us — the domain is an open decision.

**Form endpoint.** Cloudflare Worker at `e2e-apps-forms.e2eapps.workers.dev`,
deployed with `wrangler`, so no dependency enters the site's `package.json`. It
re-validates every field, reapplies both spam gates (honeypot plus a render
timestamp), sends via Resend, then fans out to Meta CAPI, LinkedIn CAPI and GA4.
CORS is an explicit origin allowlist.

**Secrets** live in Cloudflare via `wrangler secret put`, never in the
repository. `PUBLIC_*` values are non-secret and safe to commit.

**Build pipeline.** `npm run build` chains: icon generation → design-document
rendering → `astro build`. Generated artefacts cannot fall behind their sources.

---

## 11. Quality gates

**91 tests**, `node --test` with `node:assert` and native TypeScript stripping —
zero test dependencies. Most exist because a specific defect shipped.

| Suite | Guards |
| --- | --- |
| `calculator` (12) | The six pinned figures, and the gap-box behaviour |
| `logo` (8) | Geometry matches the design export; reduction threshold; icon set; scope reach |
| `design-docs` (8) | The brand book and logo sheet render rather than publishing blank |
| `overflow` (8) | Horizontal overflow causes |
| `blog` (7) | Frontmatter, code fences, tailored CTAs |
| `faq` (7) | 19 items, group split, JSON-LD parity |
| `layout-402` (6) | Every `minmax` floor wrapped in `min()`; nested nowrap |
| `mobile` (6) | Phone rules exist behind the right media query; 44px targets |
| `presets` (6) | Preset breakevens computed from the model, not typed |
| `products` (6) | Page counts and byte sizes match the real PDFs |
| `case-study` (6) | Every displayed figure recomputed from raw totals |
| `styles` (5) | Every class is reachable by a rule that can match it |
| `copy-parity` (3) | Deliberate copy changes are declared, accidental ones fail |
| `tokens` (3) | No retired token; no `var()` resolving to nothing |

### Two failure modes worth naming

**Astro scope mismatch.** A component's CSS is scoped to its own elements. A
`.logo` selector written inside `Nav` compiles to `.logo[nav-scope]` and matches
nothing — the rule ships, the build is green, the style silently does not apply.
This has bitten five times. `styles.test.ts` catches the general case; the logo
suite checks scope *identity*, which reachability cannot.

**Invisible text.** A token that changes meaning can put text at 1.02:1 —
present, correct, unreadable. The `tokens` suite fails on any `var()` that
resolves to nothing, which is what removing a compatibility shim introduces.

---

## 12. Open decisions and known issues

| # | Item | Status |
| --- | --- | --- |
| 1 | **Domain.** `e2eapps.com` is registered but dormant and offered via a broker. Buy, or take `.io`/`.app` | Yours |
| 2 | **Chart line contrast.** `#5B626B` on `#16191F` is 2.85:1, under the 3:1 floor for non-text. `#5F666F` gives 3.03:1 | Yours |
| 3 | **Brand book section 01** still says six directions are out for review; 1f is chosen. Job B in the brand brief | Pending |
| 4 | **OG image** still reads `e2eapps.com` | Blocked on #1 |
| 5 | **Phone chart** is 300 tall, design says 150; requires editing the protected model file | Yours |
| 6 | **Six pieces of new copy** await sign-off — hero lead, bento card 05, three Proof labels, condensed founder bios, six menu descriptions | Pending |
| 7 | **`main` still serves the old cream site.** `redesign` is ahead and fast-forward clean | Yours |
| 8 | **Founder photos** not supplied; placeholders hold the layout | Yours |
| 9 | Unused `mini` chart block in `calc-model.ts`; removing it means editing the protected file | Deliberate |

---

## 13. Rules of engagement

For anyone working on this repository:

1. **Do not edit `src/scripts/calc-model.ts`.**
2. **Do not add dependencies** without asking. The suite, the icons, the image
   pipeline and the design-document renderer all use what already ships.
3. **Never invent a figure.** If it cannot be computed or cited, do not print it.
4. **Client names stay withheld.**
5. **Targeted changes stay targeted.** Fix what was asked; suggest the rest.
6. **Design files in `design/` are byte-exact copies** of what the design tool
   produced. Adjust at render time, not in the source.
7. **Run `npm test` before pushing.** The preview's tests are advisory; that is a
   safety net for the live site, not permission to ship red.

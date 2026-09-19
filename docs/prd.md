# E2E Apps — Product Requirements

**Status:** live on `main` · 95 automated checks · last revised 19 September 2026
**Related:** [`design.md`](design.md) (the design system) · [`NOTES.md`](../NOTES.md) (decisions and open findings) · [`docs/measurement.md`](measurement.md) (analytics wiring) · [`docs/credentials.md`](credentials.md) (secrets runbook) · [`design/CLAUDE-BRAND-BRIEF.md`](../design/CLAUDE-BRAND-BRIEF.md) (identity work)

This document describes what the site is for, what it must do, and how the
repository is laid out. The visual system has its own document,
[`design.md`](design.md). It is written to be usable by someone who has never seen
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

## 4. Structure: repository, pages, routes

### Repository map

Everything a newcomer needs to find, and nothing generated.

| Path | Holds | Notes |
| --- | --- | --- |
| `design/` | **The signed-off designs.** Three `.dc.html` exports (desktop, phone, phone-updated), the brand book, the logo-directions sheet, and three authoring briefs | **Byte-exact copies. Never edited.** Adjust at render time |
| `src/components/` | 21 `.astro` components — one per section, plus `Logo`, `Icon`, `Disclose`, `Slider`, `Schema`, `Analytics`, `ConsentBanner` | Composition and scoped CSS only |
| `src/pages/` | The routes. `index`, `services`, `products`, `faq`, `privacy`, `terms`, `404`, `blog/` and `sitemap.xml.ts` | File-based routing |
| `src/layouts/` | `Base.astro` (head, fonts, analytics) and `Prose.astro` (blog article shell) | |
| `src/styles/` | `tokens.css` (the single source of design values), `global.css` (shared patterns), `calculator.css` | 1,726 lines total |
| `src/scripts/` | 12 TypeScript modules — calculator, attribution, analytics, consent, contact form, nav menu, filters | `calc-model.ts` is **protected**, see §6 |
| `src/data/` | Content as typed modules: `faq`, `products`, `case-study`, `presets`, `icons`, `logo`, `decay` | Single source for both the page and its JSON-LD |
| `src/content/blog/` | 15 markdown posts | Astro content collection |
| `public/` | Static, served as-is: `fonts/` (5 woff2), `pdf/`, generated icons, `og-image.png`, `robots.txt`, manifest | |
| `public/brand-book/`, `public/logo-directions/` | Rendered from `design/` at build time | `noindex`; never hand-edited |
| `scripts/` | Build and audit tooling: icon generation, OG image, design-document renderer, contrast checker | Node built-ins plus the `sharp` inside Astro |
| `tests/` | 15 suites, 95 checks | `node --test`, zero dependencies |
| `worker/` | The Cloudflare Worker behind the contact form | Deployed with `wrangler`, not part of the site build |
| `docs/` | `prd.md`, `design.md`, `measurement.md`, `credentials.md`, `redesign-plan.md` | |
| `.github/workflows/` | `deploy.yml`, `lighthouse.yml` | |

Untracked or incidental at the root: `E2E Apps Homepage.dc.html`, `support.js`
and `image-slot.js` are the original Claude Design export and its runtime, kept
for reference and not deployable.

### Homepage sections, in order

Eight content sections, in funnel order. Order is enforced by tests where a
section's position carries meaning. The homepage was 4,269 words across
twelve sections and is now 2,056 — **nothing was deleted, four sections moved to
their own pages.**

| # | Section | Component | Job |
| --- | --- | --- | --- |
| — | Nav | `Nav.astro` | Mark + wordmark, five links, persistent "Book a call" |
| 1 | Hero | `Hero.astro` | The claim, in one sentence |
| 2 | Problems | `Problems.astro` `compact` | Five cards: where the money goes missing. `compact` drops the disclosures |
| 3 | Payback model | `Calculator.astro` | The interactive proof (§6) |
| 4 | Proof | `Proof.astro` | Three findings from real audits, one line each |
| 5 | Case study | `CaseStudy.astro` | One finding shown all the way down |
| 6 | The Full Loop | `Loop.astro` | Four stations: how the work is sequenced |
| 7 | Founders | `Founders.astro` | Two people, named, with LinkedIn |
| 8 | Contact | `Contact.astro` | Calendly embed plus the form |
| — | Footer | `Footer.astro` | Lockup, links, legal |

**The order is the argument:** claim → the problem → prove it with their own
numbers → prove it with ours → show the method → show the people → ask. The
calculator sits at 3 because it is the only thing a competitor cannot copy, and
it used to sit at 4 behind two sections of preamble.

### Routes

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `pages/index.astro` | The marketing page |
| `/services` | `pages/services.astro` | `Problems lead` + `Stack` — the full problem statement and the ten capability bundles |
| `/products` | `pages/products.astro` | `Products lead` — three tools, each linking to a hosted PDF |
| `/faq` | `pages/faq.astro` | `Faq lead` — 19 questions in two groups, and the `FAQPage` JSON-LD |
| `/blog` | `pages/blog/index.astro` | All posts, newest first |
| `/blog/<slug>` | `pages/blog/[slug].astro` | One post; build format is `file`, so **no trailing slash** |
| `/privacy`, `/terms` | own pages | Describe the tracking actually implemented, not a template |
| `/404` | `pages/404.astro` | |
| `/brand-book/`, `/logo-directions/` | generated into `public/` | Internal review documents, `noindex` |

---

## 5. Section requirements

Only the requirements that are non-obvious or have bitten before are listed.

**Nav.** Five links plus a CTA, and **every label names its destination** — `Services` and `Approach` used to point at each other's sections.  All in-page anchors carry the base path — a bare
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

**Sub-pages.** `Problems`, `Products` and `Faq` each take a `lead` prop that
promotes their section `h2` to the page `h1` and adds nav clearance. **A section
that opens a page is that page's header** — there is no separate page-header
component, and adding one back reintroduces the duplicate-heading bug it was
created to fix. *Tested.*

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

**Moved.** The full system — 103 tokens, the type scale, the component
vocabulary, the mark, the phone design and the eight failure modes that shaped
them — is now [`docs/design.md`](design.md).

It lives on its own because two documents describing one set of tokens is
precisely how this project's last three drift bugs started. The one-screen
version:

- **Dark, near-monochrome, one accent.** Four grounds (`#0E1014` page, `#16191F`
  surface, `#1D2128` sunk, `#111318` band), four text greys, one amber
  `#E39A1F`. No second hue, no gradients, **no red anywhere**.
- **Amber is unusable on light** — 2.2:1. That is why the site is dark.
- **Two families, split semantically.** Be Vietnam Pro for reading, IBM Plex
  Mono for machine values and labels — never for "small text".
- **Seven space steps, six radii, one easing curve.** Elevation is one hairline
  plus at most one neutral shadow; never stacked, never chromatic.
- **`src/styles/tokens.css` is the single source.** A retired token name
  anywhere in source fails the build.
- **All 22 contrast pairings pass**, verified by `scripts/check-contrast.mjs`
  reading the tokens directly.

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

**95 tests across 15 suites**, `node --test` with `node:assert` and native TypeScript stripping —
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
| `pages` (4) | One `h1` per page; no repeated or near-duplicate heading; shared centred header; nav clearance |

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
| 2 | ~~**Chart line contrast.**~~ Fixed — `#5F666F` gives 3.03:1, and the full sweep is clean | **Done** |
| 3 | **Brand book section 01** still says six directions are out for review; 1f is chosen. Job B in the brand brief | Pending |
| 4 | **OG image** still reads `e2eapps.com` | Blocked on #1 |
| 5 | **Phone chart** is 300 tall, design says 150; requires editing the protected model file | Yours |
| 6 | **Six pieces of new copy** await sign-off — hero lead, bento card 05, three Proof labels, condensed founder bios, six menu descriptions | Pending |
| 7 | **`/next` is now the frozen "before".** It holds the pre-restructure site by design; decide when to retire it | Yours |
| 8 | **Founder photos** not supplied; placeholders hold the layout | Yours |
| 9 | Unused `mini` chart block in `calc-model.ts`; removing it means editing the protected file | Deliberate |
| 10 | **Section rhythm is uniform** — one beat, one column width, no full-bleed moment. `redesign-plan.md` §2 and §6. The largest piece of design work outstanding | Yours |

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

# Building a page in the November 2026 redesign

The site was redesigned in November 2026. The homepage is built
(`src/pages/index.astro`, `src/components/Home*.astro`). This is the brief for
building any other page to match it.

## What you are doing

Rebuild the page(s) named in your task so they match their approved design
board in `design/v3/<Name>.dc.html`, using the shared pieces that already
exist. The boards are static mock-ups: take LAYOUT and LOOK from them, and take
CONTENT from the page's existing source and data files.

## Read first

1. `src/styles/redesign.css`: every shared class. Use these; do not restate them.
2. `src/styles/tokens.css`: the tokens, including the light theme block.
3. `src/components/HomeServices.astro`, `HomeLoop.astro`, `HomeInsights.astro`,
   `PageHero.astro`, `Cta.astro`: worked examples.
4. Your board(s) in `design/v3/`.
5. The page's current source, all of it, before changing it.

## Rules (each one has bitten this repo before)

**Themes.** The site has a dark and a light theme and follows the device
(`prefers-color-scheme`). Never hard-code a colour: use tokens only
(`var(--color-…)`, `rgba(var(--rgb-accent), …)`, `rgba(var(--rgb-text), …)`).
Amber as TEXT is `var(--color-accent-text)`; amber as a FILL, bar or ring is
`var(--color-accent)` with `var(--color-ink)` text on it. Chart strokes use
`var(--chart-true)` / `--chart-bar-dim` / `--chart-rule`. The one exception is a
card on a photograph (`.scene--photo .dcard`), already handled.

**No overflow, ever.** Every grid track is `minmax(0, 1fr)`; every flex or grid
child that holds text gets `min-width: 0`; rows of chips or buttons
`flex-wrap: wrap`; tables go in an `overflow-x: auto` box; no fixed pixel widths
on text containers; long strings (URLs, code) wrap or scroll inside their own
box. It must hold at 320, 390, 768, 1024 and 1440 px.

**Shared pieces to use.**
- Page header: `<PageHero label title lead cta section>` (the page's ONE h1).
  Keep `<Breadcrumbs>` above it where the page has one.
- Section: `<section class="section">` → `<div class="wrap">` →
  `<div class="shead">` (`.shead__label`, `<h2 class="shead__title">`, optional
  `<p class="shead__aside">`) → `<div class="sbody">`. Add `section--band` to
  alternate grounds. `.shead--center` centres a head.
- Cards: `.gcard` (+ `.gcard--lead` for the ONE featured card of a group), with
  `.gcard__icon`, `.gcard__kicker`, `.gcard__title`, `.gcard__text`,
  `.gcard__go`. Place the corner glow per card with
  `style="--gx:100%;--gy:0%"` (vary the corner across a group). Grids:
  `.ggrid` + `.ggrid--3` / `.ggrid--4`.
- Visual panels: `.scene` with `.dcard` / `.dcard--raised`, `.dcard__label`,
  `.badge`, `.tag--fix|review|ok`. Alternating rows: `.rows` > `.row`
  (`.row--flip` on every second).
- Phone swipe rows: add `swipe` and `data-swipe` to a grid, followed by the
  `.swipe__meta` block exactly as in `HomeServices.astro`. Use it where a page
  would otherwise stack four or more same-shaped cards on a phone.
- Closing band: `<Cta />` as the last thing in `<main>`, on every page.
- Buttons: `.btn-primary`, `.btn-secondary`, `.pill-link`. Icons: `<Icon name>`;
  only names that exist in `src/data/icons.ts` (do not add icons).

**Content.** Keep the page's real copy. Do not delete signed-off sentences,
do not invent figures, clients, dates or results. Figures come from the data
files, computed or imported, never typed. If the board shows wording the source
does not have, prefer the source's wording.

**Never show the count of audits.** No "10 audits", "of 10", "/ 10", "ten
audits". Use the board's wording ("in every audit", "in more than half") and
bars with no numeric scale. Do not build "track record" strips.

**SEO / AEO / GEO must survive.** Keep exactly one `<h1>` per page; keep every
`<title>`, meta description, canonical path, `<Breadcrumbs>` and every JSON-LD
block (`Schema`, FAQPage, Service, Article, ItemList, BreadcrumbList) unless
your task says otherwise; keep headings in order (h1 → h2 → h3); keep visible
text matching any structured data built from the same source; keep internal
links and their descriptive anchor text; keep `data-section` attributes; keep
question-style h2s and short direct answers where the page has them (they are
what AI assistants quote). Images: `astro:assets` `<Image>` with `format="webp"`,
explicit `widths`/`sizes`, `loading="lazy"` below the fold, real `alt`.

**Motion.** Opacity and transform only; `data-reveal="1"` for scroll reveal;
everything stops under `prefers-reduced-motion`.

**Accessibility.** Real `<a>`, `<button>`, `<details>`; touch targets ≥ 44 px
at phone width; text contrast ≥ 4.5:1 in BOTH themes; visible focus.

**Scope.** Edit only the files your task names. Do not edit
`src/styles/redesign.css`, `src/styles/tokens.css`, `src/styles/global.css`,
`src/layouts/Base.astro`, `src/components/Nav.astro`, `Footer.astro`,
`Contact.astro`, `PageHero.astro`, `Cta.astro`, any `Home*.astro`, anything in
`tests/`, `src/scripts/calc-model.ts`, or `package.json`. No new dependencies.
If you need something shared that does not exist, put it in your component's
own `<style>` and say so in your report. Do not commit, push or run git
commands that change state.

## Check your work (required)

The dev server is already running at http://localhost:4321 (do not start
another, do not run `npm run build`: other people are editing in parallel and
a build would collide). Screenshot each page in both themes at both widths:

```bash
S="C:/Users/Aamir/AppData/Local/Temp/claude/cc6737e4c858fe07/0878ac76-6b33-432d-a0f4-df9ccae85f86/scratchpad"
bash "$S/snap.sh" <name>-dd /your-path dark desktop 7000
bash "$S/snap.sh" <name>-ld /your-path light desktop 7000
bash "$S/snap.sh" <name>-lp /your-path light phone 9000
bash "$S/snap.sh" <name>-dp /your-path dark phone 9000
```

Tiles land in `$S/shots/<name>-dd-0.png` … Read every tile that has content.
Use a unique `<name>` prefix so you do not overwrite another person's shots.
Look for: text overlapping or clipped, anything wider than the screen, uneven
columns, a section whose left edge differs from the others, unreadable text in
the LIGHT theme (the usual culprit is a hard-coded dark colour), empty gaps.
Fix and re-shoot until clean. The screenshots force reduced motion, so the
marquee and reveals appear static; that is expected.

## Report back

For each page: files changed; what the layout is, in two lines; anything from
the board you did not build and why; any copy you changed or removed; any
existing test you expect to fail and why (do not edit tests); anything you
could not verify.

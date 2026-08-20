# E2E Apps

Marketing site for E2E Apps — mobile growth and measurement for subscription and
ad-monetised apps.

**Live:** https://aamir-9d.github.io/congenial-octo-journey/

Ported from a Claude Design export (`E2E Apps Homepage.dc.html`) to Astro. The
export depended on Claude Design's internal runtime — `support.js`, which
self-loads React and Babel from unpkg, and `image-slot.js` — and did not render
without them. Neither ships here.

**Read [NOTES.md](NOTES.md)** before changing anything visual. It records what
was deliberately left alone, five findings awaiting a decision, and what still
needs verifying by hand.

## Stack

Astro (static), TypeScript, hand-written CSS. No framework, no CSS library, no
runtime dependencies. The only production dependency is Astro itself.

```
src/
  pages/       index  privacy  terms  404  sitemap.xml
  layouts/     Base (head, fonts, consent, GTM) · Prose (legal pages)
  components/  Nav Hero Calculator Slider Problems Loop Stack Proof
               Founders CTA Contact Footer Analytics ConsentBanner Schema
  scripts/     calc-model  calculator  attribution  consent  analytics
               engagement  contact-form  calendly  reveal  stack-filters
  styles/      tokens.css  global.css
public/        fonts/  img/  og-image.png  favicon.svg  robots.txt
worker/        the form endpoint (Cloudflare Workers)
scripts/       build-og-image  check-contrast  compare.html
docs/          measurement.md — GTM container spec and OCI runbook
tests/         calculator  copy-parity
```

## Commands

```sh
npm install
npm run dev            # http://localhost:4321
npm run build          # → dist/
npm test               # 17 tests; needs a build first for the parity checks

node scripts/check-contrast.mjs    # WCAG audit of the palette
node scripts/build-og-image.mjs    # regenerate the social card
```

`npm test` runs on `node --test` with `node:assert`. Both are built in and Node
strips the TypeScript itself, so the suite adds no dependencies.

## The calculator

`src/scripts/calc-model.ts` is a character-for-character port of the export's
model. **Do not change a number in it.** The figures were validated separately
and `tests/calculator.test.ts` pins all six:

- subscription defaults → breakeven day 277, $0.2306 at day 7, $0.4267 at day 37
- ad-monetised defaults → decay exponent 0.492, D7 12.3%, breakeven day 122

If the maths looks wrong, flag it rather than fixing it.

## Deployment

Pushes to `main` build and deploy to GitHub Pages via
`.github/workflows/deploy.yml`. PRs build and test but do not deploy — Pages has
no native preview environments.

The site URL lives in two constants at the top of `astro.config.mjs`, overridable
by `SITE_URL` / `SITE_BASE`:

| Target | `SITE_URL` | `SITE_BASE` |
| --- | --- | --- |
| Pages project site (current) | `https://aamir-9d.github.io` | `/congenial-octo-journey` |
| Custom domain | `https://e2eapps.com` | `/` |

For the custom domain, change both in `deploy.yml` and add `public/CNAME`
containing `e2eapps.com`.

## The form endpoint

GitHub Pages is static, so the contact form posts to a Cloudflare Worker in
`worker/`. See [worker/README.md](worker/README.md) to deploy it and set its
secrets. Wrangler is invoked through `npx`, so it never enters this project's
dependencies.

## Measurement

The page pushes a documented event stream to `dataLayer`; the GTM container that
consumes it lives in Google's UI. [docs/measurement.md](docs/measurement.md) is
the spec for that container — every tag, trigger, variable and custom dimension
— plus the Offline Conversion Import runbook that closes the loop from a closed
deal back to the original ad click.

Set `PUBLIC_GTM_ID` to switch tracking on. Without it, nothing analytics-related
renders, so local builds stay clean.

## Environment

**[docs/credentials.md](docs/credentials.md) is the setup runbook** — every key
the site needs, where to get it, where it goes, and what it unblocks. Start
there.

Copy `.env.example` to `.env`. `PUBLIC_*` values are inlined into the page and
are safe to expose; everything else is a Worker secret and belongs in
`wrangler secret put`, never in the repo.

## Fonts

Self-hosted in `public/fonts`, three files, 152KB. Archivo must stay the
**variable** face — the h1 uses `font-stretch: 118%` and a static instance drops
it silently. The `unicode-range` is Google's `latin` subset verbatim and must not
be widened; see NOTES.md for why.

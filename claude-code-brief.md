# Claude Code Brief — Port, Wire & Ship

Run this from an empty repo with `E2E_Apps_Homepage_dc__1_.html` in the root.

---

## Read this first — the file does not run on its own

The Claude Design export depends on two runtime files it doesn't ship with:

```html
<script src="./support.js">      <!-- Claude Design's mini-framework -->
<script src="./image-slot.js">   <!-- its image placeholder system -->
```

The page defines `class Component extends DCLogic` and uses a `{{ }}` template syntax and a `setState` implementation that all live inside `support.js`. **Without those files nothing renders.** They are Claude Design's internal runtime, not something to deploy.

So job one is not "add features." It's **removing the dependency on `DCLogic` without changing a single pixel.**

Treat the HTML as a **visual specification**, not as source code. Every colour, font size, spacing value, border radius, shadow and copy string in it is a decision that was already made and signed off. Reproduce them exactly.

---

## Non-negotiables

1. **Do not redesign anything.** No "improvements" to layout, palette, type, copy or spacing. If something looks wrong to you, leave it and note it in `NOTES.md` at the end.
2. **Pixel parity is the acceptance bar.** Screenshot the original at 1440px and 375px before you start, screenshot your port at the end, and diff them.
3. **Ask before adding a dependency.** Every package needs a reason.
4. Commit at the end of each phase with a message naming the phase.

---

## Phase 1 — Port to Astro

**Stack:** Astro (static output), TypeScript, no CSS framework. Astro because the page is 95% static, it ships zero JS by default, and content collections will handle the blog and case studies later without a rewrite.

```
src/
  pages/index.astro
  pages/privacy.astro
  pages/terms.astro
  pages/404.astro
  layouts/Base.astro
  components/Nav.astro  Hero.astro  Problems.astro  Loop.astro
             Stack.astro  Proof.astro  Founders.astro  CTA.astro  Footer.astro
  scripts/calculator.ts        ← the only real interactivity
  styles/tokens.css            ← every colour, space and type value as CSS vars
  styles/global.css
public/  fonts/  og-image.png  favicon.svg  robots.txt
```

**How to port:**

- Extract every hardcoded value from the inline styles into `tokens.css` as custom properties first. Then rebuild the sections referencing tokens. Do not carry inline `style=""` attributes across.
- **Self-host the fonts.** The export loads Archivo, IBM Plex Sans and IBM Plex Mono from `fonts.googleapis.com` — that's a render-blocking third party and a live GDPR question for EU visitors. Download the WOFF2 subsets into `public/fonts/`, declare `@font-face` with `font-display:swap`, and preload the two faces used above the fold.
- **Rewrite the calculator in plain TypeScript.** It's the only genuinely stateful part — mode toggle, sliders, three gap checkboxes, an SVG chart and some derived output tiles. No framework needed. Keep the maths byte-identical to the current implementation; the numbers were validated separately and must not drift.
- The accordion (stack bundles) and the filter chips become `<details>` and a tiny vanilla toggle. No JS framework.
- Everything else is static markup.

**Phase 1 is done when** the site builds, runs with no console errors, has no `support.js` or `image-slot.js` reference anywhere, and the two screenshots match the originals.

---

## Phase 2 — Make it actually do something

Right now the page has no form, no booking and no working CTA — the only outbound links are two LinkedIn profiles.

**Booking.** Embed Calendly inline in the closing CTA section (not a popup — popups get blocked and lose the conversion). Lazy-load the widget on scroll into view; the Calendly script is heavy and must not block first paint.

**Contact form.** Name, work email, app store URL, monthly ad spend (select), message. Submit via an Astro API route to **Resend** for the email. Honeypot field plus a timing check for spam — no CAPTCHA, it costs conversions. Server-side validation on every field. Success and error states written in the site's voice, per the copy rules.

**Both paths must fire a conversion event.** See Phase 3.

---

## Phase 3 — The measurement stack (the important one)

This site sells measurement. If its own analytics are broken, that's the entire pitch falsified on the first page. Build this to the standard the site claims.

There's also a commercial reason to over-invest here: **once this is instrumented, the founder can screen-share his own GA4 and Google Ads dashboards on a sales call as live proof.** That's a better demo than any case study, and it costs one day of work.

**Wire, in this order:**

1. **GTM container + GA4**, with **Consent Mode v2** defaulted to denied and updated on consent. Non-negotiable for EU traffic.
2. **Click-ID capture on landing.** Read `gclid`, `gbraid`, `wbraid`, `fbclid`, `li_fat_id`, `ttclid` from the query string, store in a first-party cookie for 90 days, and attach them to every form and booking submission. This is the exact mechanic the site sells under "web-to-app attribution" — run it on themselves.
3. **Google Ads conversion tracking** with enhanced conversions on both form submit and booking complete. Wire the captured `gclid` through to **Offline Conversion Import** so a closed deal can be posted back against the original click.
4. **Meta CAPI** and **LinkedIn Conversions API**, server-side from the API route, not browser pixels. LinkedIn matters most here — it's where B2B app-growth buyers actually are.
5. **Calculator instrumentation.** This is real lead intelligence, not vanity:
   - `calc_mode_switch` — subscription vs ad-monetised
   - `calc_slider_change` — slider name, final value, debounced 800ms so a drag is one event
   - `calc_gap_toggle` — which of the three attribution-gap boxes, on or off
   - `calc_breakeven_computed` — the resulting breakeven day, CPI, price and LTV per install

   Someone who sets CPI to $4 and a $99 annual plan is a very different lead from someone at $0.30 and weekly. Feed these into GA4 as custom dimensions.
6. **Scroll depth and section visibility** via IntersectionObserver — 25/50/75/100 and per-section, so it's visible which sections people actually reach.
7. **Cookie consent banner** covering all of the above. Written plainly, not legalese.

---

## Phase 4 — SEO, performance, accessibility, legal

**SEO.** Title and meta description per page. Open Graph and Twitter cards with a real 1200×630 `og-image.png`. `sitemap.xml`, `robots.txt`, canonical URLs. JSON-LD: `ProfessionalService` for the business, two `Person` entries for the founders linking to the LinkedIn URLs already in the file.

**Performance targets** — Lighthouse mobile, not desktop: LCP under 2.0s, CLS under 0.05, TBT under 150ms, performance score 95+. Preload the hero fonts, defer all third-party scripts, inline critical CSS. The Calendly and GTM scripts are the two things that will break this — load both late.

**Accessibility.** Keyboard path through the whole page. Visible amber focus rings. Every slider reachable and operable by keyboard with `aria-valuenow` updating. The SVG chart needs a `<title>`, `<desc>` and a live text summary that includes the breakeven day and the gap figure. Respect `prefers-reduced-motion`. Verify contrast on the amber-on-white combinations specifically — that pairing is the likeliest failure.

**Legal.** Privacy policy and terms pages that actually describe the tracking implemented in Phase 3. Don't paste a generic template; list the real tools and the real retention periods.

---

## Deployment

Cloudflare Pages or Netlify, GitHub repo, automatic deploy on push to `main`, preview deploys on PRs. Point the apex and `www` at it, force HTTPS, redirect `www` → apex. Set up a Lighthouse CI check on PRs so performance can't silently regress.

Environment variables in `.env.example`, never committed: `RESEND_API_KEY`, `GA4_MEASUREMENT_ID`, `GTM_ID`, `GOOGLE_ADS_CONVERSION_ID`, `META_CAPI_TOKEN`, `LINKEDIN_CAPI_TOKEN`, `CALENDLY_URL`.

---

## Verification before you call it done

Run through all of these and report results in `NOTES.md`:

1. Screenshot diff against the original at 1440px and 375px — differences named and justified.
2. No horizontal scroll at 375, 390, 414, 768, 1024, 1280, 1440.
3. Calculator returns the validated figures: subscription defaults → breakeven **day 277**, cumulative **$0.2306** at day 7 and **$0.4267** at day 37; ad-monetised defaults → decay exponent **0.492**, predicted D7 **12.3%**, breakeven **day 122**.
4. With all three attribution-gap boxes unchecked, measured breakeven reads **never**; checked, both series coincide exactly.
5. Form submits, email arrives, conversion events fire in GA4 DebugView and Google Ads diagnostics.
6. A visit with `?gclid=test123` stores the cookie and the value reaches the form payload.
7. Lighthouse mobile scores pasted in.
8. `axe` clean, or every exception listed with a reason.
9. Full keyboard pass with no trap.

---

## What not to do

- Don't switch to Next.js, React, Tailwind or a component library. The design is already built; a framework adds weight and risks drift.
- Don't "modernise" the copy. Every string was written deliberately.
- Don't add a chat widget, exit-intent popup, newsletter modal or scroll-triggered CTA bar.
- Don't add testimonials, client logos or trust badges — there are no real ones yet, and placeholders have a way of surviving to production.
- Don't change any number in the calculator. If the maths looks wrong, stop and flag it rather than fixing it.
- Don't commit secrets. Check before every commit.

---

## Suggested order of work

Phase 1 alone is a real day's work and it's the one that unblocks everything. Ship it, deploy it, confirm it looks right on a real phone, then start Phase 2. Don't attempt all four phases in one pass — the measurement wiring in Phase 3 needs a live URL to test against anyway.

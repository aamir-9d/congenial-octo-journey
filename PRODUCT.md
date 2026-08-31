# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** a growth lead, head of user acquisition, or technical founder at a
subscription or ad-monetised mobile app — usually one with a portfolio or a
meaningful ad budget. Technical enough to know what SKAdNetwork is and to be
irritated by hand-waving. They arrive suspecting their numbers are wrong but
unable to prove it, and they are the person who can commission a retainer.

**Secondary:** an agency or in-house UA team that needs a specialist to audit
work they cannot audit themselves.

**Not the audience:** non-technical small-business owners, web-only marketers,
and anyone shopping primarily on price.

A second channel is being opened on Upwork. Confirmed: that channel is a
**feeder**, not a second audience. Upwork work is qualified upward toward the
retainer buyer above; the site is not to be re-aimed at project-scoped hourly
clients.

## Product Purpose

Fix mobile attribution and measurement, then spend against the numbers that
recovers. The consultancy sells a **fixed-price audit** of a measurement stack
and a **retainer** that implements the fixes and runs the media.

Confirmed: **the audit is a wedge, not the product.** It is priced to be an easy
yes and to qualify both sides; the revenue is in the implementation and media
work that follows. Success is a small number of retained clients, not enquiry
volume.

## Positioning

The claim a neighbouring consultancy could not truthfully copy: **the same
person fixes the measurement and spends the budget.** Most practitioners pick a
side — the plumbing or the media buying. Owning both is why the numbers survive
contact with a real budget, and it is the reason the diagnosis is trustworthy.

The argument the whole product rests on: attribution is usually broken in ways
that are invisible; the missing revenue makes good campaigns look bad; a
campaign killed in week one may have broken even in month nine.

## Operating Context

Clients operate inside: an MMP (AppsFlyer, Adjust, Singular, Branch); the
platform ad accounts (Google App Campaigns, Apple Search Ads, Meta, TikTok);
a subscription platform (RevenueCat, Adapty) or an ad-mediation stack; and
analytics (Firebase, GA4, BigQuery). Server-side notification paths — App Store
Server Notifications V2, Google Play RTDN — are frequently absent, which is
where a large share of the invisible revenue sits.

Evaluation typically starts with a reconciliation dispute: the numbers do not
match across the MMP, the ad platform, and the subscription platform.

## Capabilities and Constraints

- Delivered by **two people**: one owns measurement, attribution and media; the
  other owns server-side infrastructure. Capacity is **very limited** — a small
  number of concurrent engagements. The site must filter as hard as it attracts.
- **No new runtime dependencies** beyond Astro. Reaffirmed repeatedly; adding a
  package requires asking first.
- **`src/scripts/calc-model.ts` must not be edited.** Six figures are pinned by
  test (subscription breakeven day 277; $0.2306 at day 7; $0.4267 at day 37;
  ad decay exponent 0.492; predicted D7 12.3%; ad breakeven day 122).
- Static hosting on GitHub Pages, which permits one deployment per repository;
  the form endpoint therefore lives on a separate Cloudflare Worker.
- **Undecided:** the production domain. `e2eapps.com` is registered but dormant
  and broker-listed; no replacement chosen. Founder photographs have not been
  supplied. Whether games are in scope alongside apps is unresolved and must not
  be claimed either way until it is.

## Brand Commitments

- Name **E2E Apps**; wordmark set in Be Vietnam Pro 700 at −0.032em, never
  re-spaced or set in another face.
- Mark: logo direction **1f**, a rounded amber tile with "E2E" drawn as
  geometry, reducing to a single glyph at 24px and below.
- One accent (amber `#E39A1F`) on a near-black ground. No second brand hue, no
  red anywhere, no gradient fills.
- Two typefaces only: Be Vietnam Pro and IBM Plex Mono, where mono means "this
  is a machine value or a label", never "this is small text".
- **Voice:** name the mechanism, never the benefit. Say the awkward thing. No
  exclamation marks; never "unlock", "supercharge" or "game-changing". Figures
  carry their unit and their basis.

## Evidence on Hand

Real and usable:

- **PDF scanner case study** with verified figures — install-to-trial 0.62% →
  4.00% on unchanged daily spend, cost per payer $92.95 → $20.91, MRR ~$31k →
  ~$52k — plus the paywall screenshot and RevenueCat charts.
- **Portfolio segmentation case study** (50 apps), mechanism only, no figures.
- **Three audit findings**: trial-to-paid misreported 11% → 17%; ~5% of new
  users ever reached a paywall; most of one budget in markets that could not
  break even.
- **Three products** with hosted PDFs: Monetization Scout, ASO Suite, ASO Agent.
- **15 blog posts.**
- Portfolio scale: 50+ iOS and Android apps, 48 AppsFlyer accounts.

Absences future work must not fabricate: **no named client case studies, no
testimonials, no client logos, no press.** Portfolio work was done under
employment and those revenue figures are not ours to publish. Client names are
withheld everywhere.

## Product Principles

1. **Every published figure must be defensible.** The product is measurement
   rigour; an overstated number on the marketing site falsifies the pitch.
2. **Demonstrate rather than claim.** The payback calculator exists so a visitor
   can prove the argument with their own numbers instead of trusting ours.
3. **Filter as hard as you attract.** Capacity is very limited; repelling a poor
   fit is as valuable as winning a good one.
4. **Say the awkward thing.** Naming what got worse, or what we cannot publish,
   is what makes the rest credible.
5. **The audit is the door, not the room.** Every surface should make the next
   conversation easy, not close a transaction.

## Accessibility & Inclusion

WCAG AA for all text. Full keyboard path with visible focus rings; every slider
keyboard-operable with `aria-valuetext` carrying the formatted readout; the
chart's live summary present in the accessibility tree; `prefers-reduced-motion`
respected on every keyframe; 44px minimum touch targets on mobile.

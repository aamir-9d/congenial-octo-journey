---
title: Your app's quality score decides whether your ads run at all
kicker: Store platforms score apps on uninstalls, engagement, ad load and stability, and that score gates access to ad inventory. No bid change and no support ticket can override it.
date: 2026-02-17
tag: Campaigns
cta: >-
  If a campaign stopped spending and the bids, budget and policy status are all clean, the next thing to check is not in the ad account at all. Working out whether a serving restriction is a media problem or a product problem is usually a day, and it changes who owns the fix.
---

Here is a failure that reliably sends media teams down the wrong path for a week.

A campaign that has been spending its full budget for months stops. Nothing was changed in the account. Bids are where they were, budget is where it was, no policy flags, no disapprovals. A second campaign in the same account carries on spending normally.

Everything in the ad account looks fine, because the cause is not in the ad account.

## Stores score your app, and the score gates inventory

App store platforms maintain a quality assessment of every app, and that assessment governs eligibility to serve on the store's own high-value ad surfaces. Fall below a threshold and those surfaces close. The campaign keeps running; it just has far less inventory to buy, and if the store surfaces were where it was winning, it effectively stops.

What goes into the score is not mysterious, and it is mostly not about your advertising:

**User metrics.** Uninstall rate carries heavy weight — the share of installs that remove the app, and how quickly. Daily and monthly active users sit alongside it. This is the store asking whether the traffic it sends you stays.

**In-app experience.** Ad load, general usability, and how much your app actually does relative to comparable apps in the same category. An app that opens onto an interstitial, shows another after the first tap, and offers three screens of function is being measured against category peers that do more with less interruption.

**Technical vitals.** Crash rate and application-not-responding rate, against strict thresholds. This is the least argued-about component and the most frequently ignored one.

<figure>
<svg viewBox="0 0 720 250" role="img" aria-label="Diagram showing three quality inputs feeding an eligibility gate, which either opens or closes access to store ad inventory">
  <rect x="0" y="20" width="180" height="46" rx="8" fill="#16191F" stroke="#23272E"/>
  <text x="90" y="40" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="600" fill="#E8EAED">User metrics</text>
  <text x="90" y="57" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10.5" fill="#8E959E">uninstalls · DAU · MAU</text>

  <rect x="0" y="82" width="180" height="46" rx="8" fill="#16191F" stroke="#23272E"/>
  <text x="90" y="102" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="600" fill="#E8EAED">In-app experience</text>
  <text x="90" y="119" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10.5" fill="#8E959E">ad load · depth vs peers</text>

  <rect x="0" y="144" width="180" height="46" rx="8" fill="#16191F" stroke="#23272E"/>
  <text x="90" y="164" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="600" fill="#E8EAED">Technical vitals</text>
  <text x="90" y="181" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10.5" fill="#8E959E">crash rate · ANR</text>

  <path d="M180 43 L250 105 M180 105 L250 105 M180 167 L250 105" fill="none" stroke="#4A515A" stroke-width="1.5"/>

  <rect x="250" y="82" width="150" height="46" rx="8" fill="#E39A1F"/>
  <text x="325" y="111" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="14" font-weight="700" fill="#101725">Quality tier</text>

  <path d="M400 105 L470 62 M400 105 L470 150" fill="none" stroke="#4A515A" stroke-width="1.5"/>

  <rect x="470" y="40" width="240" height="44" rx="8" fill="#16191F" stroke="rgba(227,154,31,0.34)"/>
  <text x="590" y="67" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="600" fill="#E8EAED">Store ad surfaces available</text>

  <rect x="470" y="128" width="240" height="44" rx="8" fill="#1D2128" stroke="#2C3138"/>
  <text x="590" y="155" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="13" font-weight="600" fill="#8E959E">Store ad surfaces closed</text>

  <text x="0" y="222" font-family="IBM Plex Mono, monospace" font-size="11" fill="#E39A1F">NOTHING IN THE AD ACCOUNT REACHES THIS GATE</text>
  <text x="0" y="240" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">Not the bid. Not the budget. Not a support ticket.</text>
</svg>
<figcaption>The gate sits upstream of the auction. A campaign can be perfectly configured and still have almost nothing to bid on.</figcaption>
</figure>

## Two shapes this takes

**It coincides with a release.** A campaign stops spending on a particular day, and that day is the day an app update shipped. A release can trigger re-evaluation, and a regression in stability or a change to the first-run experience can move the app below the threshold within days. If a campaign died on a date, check what was deployed on that date before checking anything in the account.

**Uninstalls spiked.** A promotion, a burst of poorly matched traffic, or a change that annoyed existing users pushes the uninstall rate up. The score follows. This is the case where the ad account is genuinely blameless and the media team is asked to fix it anyway.

Note the diagnostic tell in both: **some campaigns stop and others do not.** Campaigns weighted toward store inventory die; campaigns weighted elsewhere continue. If the pattern across your campaigns is uneven, that asymmetry is the clue.

## The part that is hard to hear

Lowering the target does not help. Raising the budget does not help. Raising a support ticket does not help, and this is the expensive misunderstanding, because a ticket takes days to route and the answer at the end of it is *working as intended*.

There is no media lever for this. The in-app experience has to change.

## Which is also the opportunity

The same mechanism runs in the other direction, and that is the part worth internalising: **retention work is media work**.

One utility app in an ad-monetised portfolio changed its first-run landing experience — a single recommendation, not a rebuild. Day-one retention moved from around 14 per cent to around 18 per cent. The app's quality tier improved, the store surfaces reopened, and monthly spend on that app scaled by roughly three-quarters.

That is one app and a single case rather than a benchmark, and the specific numbers should not be treated as a forecast. What transfers is the chain, because the chain is not obvious from either end:

> a better first screen → fewer early uninstalls → a higher quality tier → access to inventory → more spend at the same efficiency → more revenue

A growth team looking at that app's spend chart would have seen a media result. The cause was a product change, and nobody in the media meeting would have proposed it.

## What to do about it

**Put uninstall rate on the media dashboard.** It is a media input, whatever the org chart says. Weekly, by app, with releases marked on it.

**Annotate deploys on your spend charts.** Half the diagnostic value here is being able to see that a spend cliff and a release share a date. That takes ten minutes to wire up once.

**Watch crash and ANR rates against store thresholds**, not against your own tolerance. Your users may forgive a crash rate the store does not.

**Audit your ad load against category peers.** Especially first-run. An app that shows two interstitials before any function is being scored on that, and it is the same decision that governs whether new users stay.

**Route the diagnosis before you route the ticket.** A campaign that stops spending has perhaps four possible causes — bid or budget, creative coverage, policy, or serving eligibility. Three of them are in the account and take minutes to rule out. Doing that first is the difference between a same-day fix and a week of waiting for an answer that was never going to be a media answer.

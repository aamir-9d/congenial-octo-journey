---
title: The churn that has nothing to do with your product
kicker: A large share of subscription cancellations are failed payments, not decisions. Grace Period, Account Hold and in-app messaging are configuration rather than product work — and most teams have never measured the split.
date: 2026-03-17
tag: Subscriptions
cta: >-
  Most teams cannot say what share of their churn is involuntary, because the cancellation reaches analytics as one undifferentiated event. Separating the two is a measurement change, not a product change, and it usually reorders the roadmap.
---

There are two ways a subscriber stops paying you, and they have almost nothing in common.

**Voluntary churn** is a decision. Someone opened the subscription centre, chose to cancel, and meant it. Fixing that means changing something about the product, the price or the perceived value.

**Involuntary churn** is a card that expired. Nobody decided anything. The subscriber may not even know it happened until access disappears.

They need completely different work, and most teams cannot tell you the split. The cancellation arrives in analytics as one undifferentiated event, so it gets attributed to the product, and a quarter gets spent on a retention feature to solve a payments problem.

## The recovery tools are configuration, not engineering

Google Play has three mechanisms for this, and two of them are on by default — which means a good number of apps are already running them without measuring what they do.

**Grace Period** keeps the subscriber's access while Play retries the payment and asks them to fix it. Configurable from 0 to 30 days. The billing date does not move, so a recovered subscriber continues as though nothing happened.

**Account Hold** suspends access while the same recovery runs. Configurable from 0 to 60 days. The renewal date resets when payment succeeds.

The two are sequential, not alternatives: grace period first with access, then hold without it. Play requires the combined recovery window to be **at least 30 days and no more than 60**, and the grace period cannot exceed the base plan's billing period — which quietly rules out a 30-day grace period on a weekly plan.

**In-app messaging** is the third, and it is the one that requires an actual integration: one module in Play Billing Library 5.0 or newer. Play detects the failed payment itself and surfaces a prompt that deep-links into the payment update screen. There is no developer-side check to write.

<figure>
<svg viewBox="0 0 720 260" role="img" aria-label="Timeline showing grace period followed by account hold, with the combined recovery window bounded at 30 to 60 days">
  <text x="0" y="16" font-family="IBM Plex Mono, monospace" font-size="12" fill="#7C838D">PAYMENT FAILS</text>
  <line x1="0" y1="30" x2="0" y2="150" stroke="#E39A1F" stroke-width="2"/>

  <rect x="4" y="44" width="230" height="34" rx="6" fill="rgba(227,154,31,0.14)" stroke="#E39A1F" stroke-width="1"/>
  <text x="20" y="66" font-family="Be Vietnam Pro, sans-serif" font-size="14" font-weight="600" fill="#E8EAED">Grace Period · 0–30 days</text>
  <text x="20" y="98" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#A8AEB6">Keeps access. Billing date unchanged.</text>

  <rect x="244" y="44" width="330" height="34" rx="6" fill="#1D2128" stroke="#2C3138" stroke-width="1"/>
  <text x="260" y="66" font-family="Be Vietnam Pro, sans-serif" font-size="14" font-weight="600" fill="#E8EAED">Account Hold · 0–60 days</text>
  <text x="260" y="98" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#A8AEB6">No access. Billing date resets on recovery.</text>

  <line x1="4" y1="128" x2="574" y2="128" stroke="#4A515A" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="4" y="148" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#7C838D">Combined window must be 30–60 days</text>

  <line x1="574" y1="30" x2="574" y2="150" stroke="#5B626B" stroke-width="2"/>
  <text x="584" y="16" font-family="IBM Plex Mono, monospace" font-size="12" fill="#7C838D">CANCELLED</text>

  <text x="0" y="196" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#7C838D">RECOVERY IS FRONT-LOADED</text>
  <rect x="4" y="208" width="26" height="34" rx="2" fill="#E39A1F"/>
  <rect x="36" y="216" width="26" height="26" rx="2" fill="#E39A1F" opacity="0.8"/>
  <rect x="68" y="223" width="26" height="19" rx="2" fill="#E39A1F" opacity="0.62"/>
  <rect x="100" y="228" width="26" height="14" rx="2" fill="#E39A1F" opacity="0.46"/>
  <rect x="132" y="232" width="26" height="10" rx="2" fill="#3A4048"/>
  <rect x="164" y="234" width="26" height="8" rx="2" fill="#3A4048"/>
  <rect x="196" y="236" width="26" height="6" rx="2" fill="#3A4048"/>
  <text x="236" y="232" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#A8AEB6">Most recoveries land in the first days,</text>
  <text x="236" y="248" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="#A8AEB6">not spread evenly across the window.</text>
</svg>
<figcaption>The two windows are sequential and jointly bounded. The bars are illustrative of the shape Google Play describes, not measured data — the point is that the distribution is front-loaded, which is what should drive the length you choose.</figcaption>
</figure>

## What Google Play reports, and how to read it

These are Google's own figures, from Google's own tests, and they are worth taking as a ceiling rather than a forecast:

- **Account Hold:** 8% lower involuntary churn and 35% higher recovery rates.
- **In-app messaging:** roughly 2× subscription recovery when users saw the message, from experiments with early adopters.
- **Grace Period:** +57% recovery rate cited for granting extra days to fix payment issues.
- **Tuning both together:** up to a 10% reduction in involuntary churn rates, based on internal data and early testing.

Every one of those carries a qualifier in the source, and the qualifiers matter. "Up to" is doing real work in that last figure. "When users saw the message" is doing real work in the second — it is a conditional rate, not a population rate, and your population rate depends on how many failed-payment users open the app at all during the window.

Take them as evidence the mechanism works. Do not put them in a forecast.

## The decision that actually needs data

The interesting configuration question is not *whether* to use these — two of them are already on — but **how long the grace period should be**.

The instinct is to maximise it: more days, more chances. That is not obviously right, because the two windows trade against each other inside a fixed 30-to-60-day budget, and they are not equivalent. Grace period keeps the subscriber using the product while they are, in effect, not paying. Account hold does not.

Google's own illustration of a 14-day grace period shows roughly 80% of recoveries landing by day 7. If your curve looks like that, days 8 through 14 are buying very few recoveries and giving away a week of free access to everyone who was never going to recover. The remaining days do more work as account hold, where you keep the pressure without giving away the product.

That is a real trade with a real answer, and the answer is in your own recovery-by-day distribution — which is exactly the report most teams have never opened.

## The measurement work that comes first

None of this is worth configuring until you can see it, and seeing it is the part that is genuinely not turnkey.

**Split the churn.** Voluntary and involuntary cancellations need to arrive in your analytics as different events. Real-Time Developer Notifications carry the state changes that let you do that, which is a separate piece of infrastructure and a separate conversation.

**Report recovery by day**, not just in aggregate. A single "recovery rate" tells you nothing about where to set the boundary between grace and hold. The distribution does.

**Check what your ad platforms think happened.** This is the part that reaches outside retention and into acquisition. A subscriber who fails a payment, sits in grace, and recovers on day 3 never stopped being a customer — but if your server-side events reported a cancellation and never reported the recovery, every channel that acquired that cohort now looks worse than it is, and the bidding is being optimised against a number that is wrong.

That last one is why involuntary churn is not only a retention problem. It is a measurement problem that happens to show up in the retention numbers first.

## The short version

Some of your churn is a card that expired. That share is recoverable with configuration you may already have switched on, and Play does most of the work. But you cannot tune what you have not separated, and you cannot separate it from client-side data alone.

Start by finding out what the split is. The rest of the decisions follow from it, and most of them turn out to be smaller than expected.

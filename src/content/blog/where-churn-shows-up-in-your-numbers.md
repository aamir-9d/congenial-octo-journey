---
title: Where churn actually shows up in your numbers
kicker: Subscription revenue decomposes into four measurable nodes. Churn appears in three of them, in different disguises, which is why a single churn rate tells you nothing about what to fix.
date: 2026-06-23
tag: Analytics
cta: >-
  If your subscription reporting is one revenue line and one churn rate, no decision can be traced to a cause. Decomposing it is a week of analytics work and it usually settles arguments the roadmap has been having for months.
---

Most subscription dashboards show two numbers that matter: revenue, and a churn rate. Both are true and neither is actionable, because each one is several different things added together.

Subscription revenue decomposes cleanly, and once it does, churn stops being a single metric and becomes three distinct symptoms with three different treatments.

## The decomposition

```text
Total subscription revenue
├── Total subscribers
│   ├── New subscribers          ← install → trial → subscriber
│   └── Recurring subscribers    ← survivors of previous cohorts
└── Average revenue per subscriber
    ├── Price per SKU length     ← avg price paid per renewal period
    └── SKU length duration      ← number of payments per SKU
```

Four leaf nodes. Every subscription business is the product of those, and any movement in the top line traces to at least one of them.

The two acquisition rates underneath, worth defining precisely because inconsistent definitions are the most common cause of two teams disagreeing about the same funnel:

- **Install → free trial:** new installs starting a free trial within **30 days**, where a trial is offered.
- **Install → subscriber:** new installs starting an active subscription within **60 days**.

Those windows are the ones Google Play uses. Whatever windows you pick, the important thing is that everyone uses the same ones — a team quoting 7-day install-to-trial and a team quoting 30-day install-to-trial will never reconcile, and both will believe the other is wrong.

## Churn wears three different costumes

**1. It shows up in recurring subscribers.** The obvious one. Churn causes recurring subscribers to decline over time, so the base you start each month with is smaller. If new subscribers are flat and total subscribers are falling, the leak is here and nothing about acquisition will fix it.

**2. It shows up in SKU length duration.** This is the one that gets missed. High churn means subscribers make a **low number of payments per SKU** — so it registers as reduced average revenue per subscriber, not as a subscriber count problem at all. A team watching only subscriber counts can have a serious churn problem that presents as an ARPU problem, and will go looking for it in pricing.

**3. It shows up in price per SKU length.** Subscribers not renewing is frequently a pricing matter — the price is above what the market bears, or a price increase landed badly. That surfaces as the average price paid drifting away from list price as people migrate to cheaper plans, or as non-renewal concentrated in particular markets after a price change.

The same underlying phenomenon, appearing in three places, with three different-looking diagnoses. This is why "our churn is 8%" is not a number anyone can act on.

## SKU composition is the variable nobody watches

Alongside those four nodes sits one more: **the share of subscribers on each SKU length**.

It moves quietly and it changes the arithmetic of everything else. Shift a cohort from monthly to weekly and revenue per subscriber rises without a single new subscriber, because a weekly plan bills 4.33 times as often per year at the same nominal price. Shift them to annual and MRR appears to collapse while the cash position improves.

Neither movement is a business change. Both look like one on a dashboard. If you have run a plan-mix experiment and not held SKU composition as a control, the result is uninterpretable — and mix shifts are exactly what a paywall redesign produces.

We covered a case of this in detail: a [PDF scanner app whose MRR rose 68% while subscriber count rose only 16%](the-dialog-between-the-trial-button-and-the-trial), where the gap was entirely billing frequency.

## What good instrumentation looks like here

**Report every node, not just the top.** Six numbers instead of one. It is not more work to collect; it is the same data grouped differently.

**Cohort everything.** A blended churn rate across cohorts acquired under different campaigns, prices and paywalls is an average of things that have no business being averaged. Cohort by acquisition month at minimum, and by SKU.

**Hold SKU composition visible on every revenue chart.** Not in a separate report. On the same chart, so nobody reads a mix shift as a performance change.

**Define your windows once and write them down.** Then make every team's query use them.

**Separate voluntary and involuntary churn at the source.** Node 1 and node 2 both absorb payment failures, and a failed card is not a retention signal about your product. If they are mixed you will read a payments problem as a value problem and spend accordingly.

## The point

A churn rate is a summary statistic of a system with four inputs. Summaries are useful for telling you something moved and useless for telling you what to do.

The decomposition above is not sophisticated — it is arithmetic, and it takes an afternoon to build. What it changes is that every subsequent argument about pricing, retention or acquisition has somewhere specific to point.

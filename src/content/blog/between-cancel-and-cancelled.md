---
title: Everything that happens between "Cancel" and cancelled
kicker: Tapping cancel is the start of a funnel, not the end of one. Most subscription apps have several intervention points already switched on by default and instrument none of them.
date: 2026-05-26
tag: Subscriptions
cta: >-
  Pause, resubscribe and the cancellation survey are on by default, which means you are probably already running interventions you have never measured. Reading what they are doing takes a subscription platform audit, not a development cycle.
---

When a subscriber taps cancel, most teams treat it as a terminal event. The row moves from active to churned, the dashboard updates, and attention moves on.

It is not terminal. There is a sequence of steps between the tap and the entitlement actually ending, several of them are enabled by default on Google Play, and each one is a place where a decision can be reversed. The reason they go unexploited is not that they are hard — it is that almost nobody has instrumented the funnel, so there is no evidence any of it is worth attention.

## The steps, in order

**Before the tap: Subscription Benefits.** A list of what the subscriber is about to lose, surfaced at the moment they are considering losing it. Google Play reports **up to a 2% decrease in voluntary churn** in A/B tests comparing developers who added benefits against those who did not — their figure, their test, and "up to" is doing real work in that sentence. Since Q1 2025 the benefits you configure also appear during cart abandonment, in the cancellation flow, in the Subscriptions Centre and in notification emails, which means the setup work is done once and reused across surfaces you do not control.

**At the tap: alternatives to cancelling outright.**

- **Pause.** One week to three months, depending on the recurring period. Enabled by default. A paused subscription is not a lost one; it is a subscriber who has told you when to expect them back.
- **Downgrade or cross-grade.** Move them to a cheaper SKU rather than to nothing. A subscriber at half price is not a failure; a subscriber at zero is.
- **Winback offers.** A discounted SKU, a free trial, or an introductory price presented at the decision point.
- **Promo codes.** One-time products or trials, granted free.

**After the tap: the window is longer than you think.** There is a period between cancellation and the entitlement actually ending, and RTDN tells you the moment the cancellation happens rather than when the entitlement lapses. That gap is the whole opportunity — and Truecaller reported users reactivating up to three weeks after the fact.

**After the entitlement ends: Resubscribe.** On by default in the Subscriptions Centre. Google notes it is especially worth implementing in-app for apps with all-or-nothing paywalls, where an expired subscriber has no path back other than the paywall they already rejected once.

**And the part nobody reads: the cancellation survey.** Play runs one. The result is available in the cancellation report in Play Console, and programmatically as `CancelSurveyResult` on `purchases.subscriptionsv2`.

That last item deserves its own paragraph, because it is free qualitative data on the exact question every subscription team argues about — *why are they leaving* — and it is sitting behind an API field that most stacks never call.

## The awkward part

Several of these are on by default. Pause, grace period and resubscribe all are.

Which means, for a large number of apps, the honest position is: **you are already running interventions you have never measured.** Subscribers are pausing instead of cancelling right now. Some are resubscribing from the Subscriptions Centre. Those events are happening in your account and, unless you have a server-side path consuming subscription state changes, they are not in your analytics at all.

That is a strange thing to discover, and it changes the first task. The question is not "which of these should we build". It is "what are the ones already running actually doing", and the answer is a measurement question before it is a product one.

## What to instrument, in the order that pays

**1. Make the cancellation funnel a funnel.** Cancellation initiated, alternative offered, alternative accepted, cancellation completed, entitlement ended, resubscribed. Six states, not one. Until these are distinct events you cannot say whether any intervention works, and you will keep arguing about it from intuition.

**2. Separate voluntary from involuntary.** A payment failure and a decision to leave both end in a churned row and need opposite responses. Splitting them is the single highest-value change in this whole area, and it is upstream of everything else here.

**3. Read the survey.** Pull `CancelSurveyResult` and put it next to the cohort data. "Too expensive" from a market where your price is above local norms is a pricing action. "Too expensive" from your highest-ARPU market is usually a value-communication problem wearing a price costume. The same answer means different things by segment, and you cannot see that without joining it to cohort.

**4. Only then, change something.** With a funnel and a reason code, testing a winback offer or a pause prompt produces an answer. Without them it produces a debate.

## Framing, briefly

Google Play's own guidance on the messaging side is worth repeating because it is unusually concrete for retention advice: identify the renewal window and act inside it; highlight what the subscriber has actually accumulated — streaks, progress, saved work — rather than what the product does; surface features they have never touched; and create a price reference point rather than stating a price in isolation.

All of that is downstream of knowing who is at risk, which is a modelling problem, which is a data problem. The order matters. Every one of those tactics is cheap to run and impossible to evaluate against an undifferentiated churn number.

## The short version

Cancellation is a funnel with at least six states and several interventions that may already be live in your account. The reason it looks like a single event is that it arrives in your analytics as one — and that is a fixable problem that has to be fixed before any of the retention work can be judged.

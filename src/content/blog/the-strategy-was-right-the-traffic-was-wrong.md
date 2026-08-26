---
title: The strategy was right. The traffic was wrong.
kicker: A fifty-app portfolio copied a competitor's paywall wholesale and it failed twice over — once on ad revenue, once on subscriptions. The fix was not a better paywall.
date: 2026-08-26
tag: Monetisation
cta: >-
  If you are running a portfolio on ad revenue and want a subscription track that does not cannibalise it, the segmentation is the part that takes real work: deciding what the first screen is, per user, before the first screen renders. That is a conversation rather than a blog post.
---

Across a category of utility apps — document readers, QR scanners, screen-mirroring tools — a monetisation pattern had converged. The same shape everywhere: a feature-comparison paywall setting a free column against a premium one, a single plan rather than a menu, and that plan billed weekly at a price well above the category norm. Not $6.99 or $9.99. Closer to $19.99.

The apps running it were doing several hundred thousand dollars a month. The pattern was documented app by app, the price points were checked market by market, and a decision was taken at director level: roll it out across the whole portfolio. Fifty apps.

It did not work. Not "underperformed" — it went backwards, and it went backwards for two separate reasons that took a while to pull apart from each other.

## What was actually shipped

The paywall itself was a faithful copy of the pattern, and there was nothing wrong with it.

What changed alongside it was placement. The portfolio's first run opened with a splash interstitial ad. Under the new strategy that ad moved: the paywall came first, and the interstitial was shown after the paywall was dismissed. The reasoning was reasonable enough — put the monetisation decision in front of the user while attention is highest, and collect the ad impression afterwards.

## The first failure: the placement *was* the revenue

The splash interstitial was carrying 70 to 80 per cent of total ad revenue across the portfolio.

That is easy to underrate and not unusual for the category. A splash placement takes a guaranteed impression from every session opener, at the point of highest attention, before there is any opportunity to bounce. Every other placement in the app — banners, natives, back-press interstitials — is competing for a fraction of what that one slot delivers.

Moving it behind a paywall dismissal changed its inventory from *every session* to *every session that got past a paywall*. The paywall absorbed the attention the ad had been monetising, and a large share of those impressions stopped existing.

So the strategy cost most of the ad revenue on day one, before anything about subscriptions was even in question.

## The second failure: the traffic was never buying

The subscriptions did not arrive either, and this is the part worth the write-up.

The portfolio's user acquisition was optimised for ad engagement. The campaigns had been trained, over a long period and a lot of spend, to find people who open a utility app, tap through it, and generate ad impressions. That is what the bidding was pointed at, and that is what it delivered — reliably, and cheaply.

Those are not the people who buy a $19.99 weekly subscription. They were never selected for it. Showing them a paywall does not convert them; it interrupts them on the way to the behaviour they were bought for.

The competitors running the same paywall profitably were not running it against the same traffic. Their acquisition was pointed at purchase intent, and the paywall was the last step of a funnel built end to end for that. The portfolio had copied the last step and left everything underneath it untouched.

**A monetisation strategy is not portable on its own. It travels with the acquisition strategy that feeds it, and copying one without the other fails in a way that looks like the paywall's fault.**

## The fix

The instinct after a failure like this is to fix the paywall — new copy, new price, new layout, run it again. That would not have helped, because the paywall was never the defect.

The fix was to stop asking one funnel to do two jobs.

The existing portfolio and its campaigns were left alone. They worked: they bought ad-engaging users cheaply and monetised them with ads, and the splash placement went back where it had been. Nothing about that needed changing, and changing it had already proved expensive.

Alongside it, a second acquisition track was started — new campaigns optimised for in-app purchase rather than ad engagement, so the bidding would go and find people with purchase intent instead.

Which created the actual problem to solve. Two kinds of user now arrived at the same binary, and each needed a different first run. The ad-optimised user needed the splash interstitial that pays for them. The purchase-optimised user needed the paywall-first flow they were bought for. Getting it wrong in either direction costs money: a paywall shown to an ad user loses the impression, and an interstitial shown to a purchase user wastes the premium paid to acquire them.

So the first run branches on which campaign acquired the user, resolved early enough in the launch to decide what the first screen is. Ad-acquired users see what they always saw. Purchase-acquired users get the IAP-first flow. One binary, two funnels, neither degrading the other.

That worked. Subscription revenue grew on the new track while ad revenue on the existing track stayed intact — which was the entire point, because a subscription strategy that quietly destroys 70 per cent of your ad revenue is not a win, however good the subscription chart looks on its own.

## No figures on this one

The portfolio work behind this was done under employment and the revenue numbers are not ours to publish, which is the same standard any client's data would get here. What is above is the mechanism, and the mechanism is the part that transfers.

## The general point

Copying a competitor's monetisation is one of the most common strategic moves in mobile and one of the most commonly botched, because the visible half of a funnel is the half that gets copied. The paywall is public. The bid strategy, the conversion events being optimised toward, the audience the campaigns have spent months learning to find — none of that is, and that is where the result actually comes from.

Before adopting a pattern that is working for somebody else, the question is not *is this paywall better than ours*. It is *what traffic is this paywall being shown to, and are we buying that traffic*.

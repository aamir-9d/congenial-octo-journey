---
title: The conversion work that happens after the buy button
kicker: Paywall optimisation usually stops at the paywall. The billing sheet is a funnel step too, it converts differently in every market, and most teams have never seen their own in the markets that matter.
date: 2026-07-21
tag: Monetisation
cta: >-
  If you have never seen your own purchase flow in your top three non-home markets, your paywall conversion rate is an average of experiences you have not looked at. Testing that is a day of work and it routinely finds a market where the flow is simply unavailable.
---

Almost every paywall project measures the same thing: what share of people who saw the paywall tapped the button.

Then it stops. What happens after the tap — the payment sheet, the form of payment, the error if it fails — is treated as infrastructure, someone else's surface, not a place where conversion is won or lost.

It is a funnel step. It converts differently in every market you sell in. And it is the step you are least likely to have ever seen with your own eyes.

## Why it varies so much by market

The reason this matters more in mobile than in most commerce is the sheer spread of how people pay.

Google Play supports credit or debit cards in **190+ markets**, direct carrier billing in **60+ markets covering over a billion active devices**, **300+ local payment methods across 65+ markets**, and **1.2 million physical locations** to buy gift cards or top up balances across 30 markets.

That range is the point. In a market where carrier billing dominates, a purchase flow that surfaces cards first is asking most of your buyers to do something inconvenient before they can do the thing they wanted. The paywall conversion rate you measure there is not a measure of your paywall — it is a measure of a payment mismatch.

Play does work on this itself: ranking the most relevant forms of payment by market, surfacing them before the buy button rather than after, highlighting active offers during the flow, and reducing the number of steps. Google reports **$650M in incremental buyer spend, +7% new paying users and +3% conversion rate** from that work, and TikTok is quoted reporting a **6% uplift in conversion globally** from collaborating on buyflow performance. Those are Google's and TikTok's figures on Google's platform.

## The part you own

Play optimising its own sheet does not remove your side of it. Three things stay yours:

**Error clarity.** Google's framing is blunt and correct: vague errors hurt user confidence, clear errors encourage retries, guidance reassures. A purchase that fails with an unexplained message is usually a purchase that does not get retried. If your app surfaces its own messaging around a failed or pending purchase, that copy is conversion copy and deserves the same attention as the paywall headline.

**Pending states.** A purchase that is already pending is not a failure, and telling the user it is one loses the sale twice. Handling the pending case properly — explaining it, offering to change payment or view details — is a small amount of code that people skip because it is an edge case in their home market and routine in others.

**Knowing what it looks like.** Which brings us to the actual problem.

## Nobody tests this, for an understandable reason

Historically, seeing your own purchase flow in another country required a VPN, a new Google account, and a payment method local to that market. That is enough friction that it does not happen — so teams ship a paywall globally and inspect it in exactly one country.

**Play Billing Lab** removes that. It lets you sign in with a licensed test account and override the testing country, so you can walk your own purchase flow as a user in another market without a VPN, without creating new emails, and without an international card. It also lets you test price changes and configuration against a test subscription before they touch production.

The reason to care is not thoroughness for its own sake. It is that country-level conversion differences are usually the largest unexplained variance in a subscription funnel, and they are attributed to "that market just converts badly" because nobody has looked. Sometimes that is true. Sometimes the flow does not work there.

Our [PDF scanner case study](the-dialog-between-the-trial-button-and-the-trial) is a version of this: install-to-trial varied from 0.3% to 1.3% across countries before the fix, and the cause turned out to be a dialog nobody had walked past. Country-level variance is a signal to go and look, not a fact about the country.

## Recovering the buyers who hesitate

Play is also building recommendation surfaces into the purchase flow — presenting an alternative or a related item when a buyer abandons, or an upsell after a successful purchase. Reported impact for one-time products is an average **+3.1% uplift in user spend**, based on Google Play internal data, with the subscription equivalent described as work in progress.

Two things worth separating here. High-intent users hesitating at the sheet is a real and underserved segment — they came to buy and stopped at the last step, which is the cheapest audience in the entire funnel to recover. But an alternative-plan prompt is also a downgrade offer, and if you present a cheaper plan to everyone who pauses, you will convert some people downward who would have paid full price. That is a targeting question, and it needs the same treatment as any other offer: measured incrementally, not on raw conversion.

## What to do this quarter

1. **Walk your own purchase flow in your top three non-home markets.** Play Billing Lab, an afternoon. Note what payment methods appear and in what order.
2. **Instrument the gap.** Paywall CTA tapped, billing sheet shown, purchase completed. If you only have the first and last, you cannot tell a paywall problem from a payments problem.
3. **Read your error and pending copy.** Out loud, as a user who has just been declined.
4. **Look at conversion from CTA-tap to completion by country.** The outliers are your list.

None of that is a project. All of it is the difference between a paywall conversion rate that means something and one that is an average of experiences you have never seen.

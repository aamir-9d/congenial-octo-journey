---
title: Renewals happen while your app is closed. Nothing is listening.
kicker: A renewal is a server-side event on Google's or Apple's infrastructure. No client SDK sees it, so it never reaches your MMP or your ad platforms — and every channel looks worse than it is.
date: 2026-04-21
tag: Subscriptions
cta: >-
  If your renewal revenue is not reaching your ad platforms, the bidding is being optimised against first payments only, and your best cohorts are the ones being underbid. Finding out whether that is happening takes about an hour with access to your MMP and your subscription platform.
---

Here is a sequence that runs a few thousand times a day in a healthy subscription app, and that most measurement stacks cannot see.

A subscriber's plan renews. Google Play — or the App Store — charges the card, extends the entitlement, and records the transaction. The app is closed. It has been closed for eleven days. No SDK initialises, no client event fires, and nothing in the app is aware that money changed hands.

The revenue is real. The measurement is not there.

## Why this is an attribution problem and not an accounting one

You will still see the money. It appears in Play Console, in your subscription platform, and eventually in the bank. Finance is fine.

What breaks is the link between that money and the click that caused it.

Your ad platforms optimise against the conversion events you send them. If the only subscription event that reaches Google Ads or Meta is the *first* payment, then every channel is being valued at first payment only. A cohort that converts at a slightly worse rate but renews for fourteen months looks worse than one that converts well and churns in six weeks — and the bidding will systematically move budget toward the second.

That is not a rounding error. On a subscription app it is the single largest distortion in the account, and it is invisible because nothing is broken. Every event that fires, fires correctly. The events that do not exist do not raise alarms.

## What Real-Time Developer Notifications actually are

Google Play's answer is **Real-Time Developer Notifications** — a Pub/Sub topic that receives a push whenever a subscriber's state changes. Apple's equivalent is App Store Server Notifications V2.

RTDN is usually introduced as a retention tool, which undersells it. It is the only mechanism that tells you, in something close to real time:

- a renewal succeeded
- a payment failed and the subscription entered grace or hold
- a subscriber cancelled, and when
- a subscription was paused, or the pause schedule changed
- a refund was issued and an entitlement revoked

Google Play's own framing lists both jobs: a real-time performance tracking tool, and a tool to enable win-back strategies. Almost everyone builds the second and skips the first.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-label="Subscription state machine showing active, voluntary cancellation, involuntary hold or grace, and expiry, with recovery paths returning to active">
  <rect x="250" y="10" width="220" height="46" rx="8" fill="#E39A1F"/>
  <text x="360" y="39" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="15" font-weight="700" fill="#101725">Subscription Active</text>

  <line x1="300" y1="56" x2="180" y2="112" stroke="#4A515A" stroke-width="1.5"/>
  <text x="176" y="90" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">user cancels</text>
  <line x1="420" y1="56" x2="540" y2="112" stroke="#4A515A" stroke-width="1.5"/>
  <text x="546" y="90" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">payment fails</text>

  <rect x="40" y="112" width="250" height="62" rx="8" fill="#16191F" stroke="#23272E"/>
  <text x="165" y="138" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="14" font-weight="600" fill="#E8EAED">Voluntary</text>
  <text x="165" y="158" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#8E959E">cancelled, entitlement runs on</text>

  <rect x="430" y="112" width="250" height="62" rx="8" fill="#16191F" stroke="#23272E"/>
  <text x="555" y="138" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="14" font-weight="600" fill="#E8EAED">Involuntary</text>
  <text x="555" y="158" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#8E959E">grace period, then account hold</text>

  <path d="M40 143 L20 143 L20 33 L250 33" fill="none" stroke="#E39A1F" stroke-width="1.5" stroke-dasharray="5 4"/>
  <path d="M680 143 L700 143 L700 33 L470 33" fill="none" stroke="#E39A1F" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="360" y="204" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="#E39A1F">both paths can return to active — RTDN is how you know</text>

  <line x1="165" y1="174" x2="165" y2="232" stroke="#4A515A" stroke-width="1.5"/>
  <line x1="555" y1="174" x2="555" y2="232" stroke="#4A515A" stroke-width="1.5"/>
  <rect x="250" y="232" width="220" height="46" rx="8" fill="#1D2128" stroke="#2C3138"/>
  <text x="360" y="261" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="15" font-weight="600" fill="#8E959E">Subscription Expired</text>
  <line x1="165" y1="232" x2="250" y2="255" stroke="#4A515A" stroke-width="1.5"/>
  <line x1="555" y1="232" x2="470" y2="255" stroke="#4A515A" stroke-width="1.5"/>
</svg>
<figcaption>Every transition here is a server-side event. A client SDK sees none of them, which is why a stack without a server-side path reports the first payment and then goes quiet.</figcaption>
</figure>

## What Truecaller found

Google published a case study on this that is worth reading for the shape rather than the numbers.

Truecaller discovered that **50% of Truecaller Monthly Premium subscribers were cancelling within 60 days**. They used RTDN to test whether those cancellations were decisions or drift — people losing track of a subscription in the absence of any messaging — and enabled account hold and grace period so they could identify payment failures separately from cancellations.

The reported results:

- Grace period and on-hold users: **40% of accounts reactivated, against 15% before RTDN**, with some users reactivating up to three weeks later.
- Cancelled users: **20% re-subscribing, against 3% earlier**.

Those are Truecaller's numbers on Truecaller's product, published by Google, and they should be read as an existence proof rather than a benchmark. The transferable part is the diagnosis: a 50% two-month cancellation rate looked like a product problem and turned out to be substantially a communication and payments problem. They could only tell the difference once the states were separated.

## The build, honestly described

This is server-side work and there is no client-side shortcut.

**A receiver.** RTDN publishes to Google Cloud Pub/Sub; you need an endpoint that consumes it. Apple posts ASSN V2 to a URL you host. Both need to validate, deduplicate, and survive retries — these systems will deliver the same notification more than once, and an at-least-once pipeline that treats every delivery as a new event will inflate everything downstream.

**A source of truth for entitlement.** The notification tells you something changed; the Play Developer API or App Store Server API tells you the current state. Building on the notification payload alone is how entitlement drifts out of sync with billing.

**Relays.** Once the state is correct server-side, the renewal has to travel onward: to your subscription platform if you use one, to your MMP so the cohort is credited, and to the ad platforms via their conversion APIs so bidding sees the full value of an install rather than its first payment.

That last hop is the one that pays for the project, and it is the one most often left out — because by the time the data is clean in the warehouse, it feels finished.

## How to tell whether you have this problem

Two checks, both quick:

1. **Compare payment counts.** Take one cohort, one month. Count the payments your subscription platform recorded. Count the purchase events your MMP recorded for the same cohort. If the second number is roughly the number of *subscribers* rather than the number of *payments*, you are sending first payments only.

2. **Look at a channel's ROAS at day 30 versus day 180.** If it barely moves, you are almost certainly not sending renewals. Real subscription cohorts keep accruing; a flat line means the measurement stopped, not the revenue.

Neither requires a project to answer. Both change what you do next.

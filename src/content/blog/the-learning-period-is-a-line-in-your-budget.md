---
title: The learning period is a line in your budget
kicker: An automated app campaign spends badly for about two weeks by design. Changing bids or budget by more than a fifth restarts that clock, and most accounts restart it repeatedly without noticing.
date: 2026-01-20
tag: Campaigns
cta: >-
  If your campaigns are edited more than once a fortnight, the account may never have left its learning period, and the performance you are judging is the performance of a system that has not finished calibrating. Auditing the change log against the conversion curve usually answers that in an afternoon.
---

An automated app campaign does not know anything when it launches. It has a target, a budget, and a creative set, and it has to discover the relationship between the inventory it can buy and the conversions that come out of the other end.

That discovery takes roughly a fortnight, and it looks like failure the whole time.

## What the first two weeks actually look like

The pattern is consistent enough to plan around. In the first days, cost per install swings wildly and sits above target — sometimes far above. Conversion volume is low and erratic. Then the swings narrow, volume climbs, and cost settles at or below the target it was missing badly a week earlier.

A campaign with a $0.90 target may spend its first fortnight around $1.00 and its second fortnight around $0.88. Nothing changed except that the system now has enough conversions to predict with.

<figure>
<svg viewBox="0 0 720 260" role="img" aria-label="Chart showing cost per install fluctuating above target for fourteen days, then settling below target as conversion volume rises">
  <line x1="60" y1="200" x2="700" y2="200" stroke="#2C3138" stroke-width="1"/>
  <line x1="60" y1="20" x2="60" y2="200" stroke="#2C3138" stroke-width="1"/>

  <rect x="60" y="20" width="290" height="180" fill="rgba(227,154,31,0.07)"/>
  <text x="70" y="38" font-family="IBM Plex Mono, monospace" font-size="11" fill="#E39A1F">LEARNING · ~14 DAYS</text>
  <text x="366" y="38" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">CALIBRATED</text>

  <line x1="60" y1="120" x2="700" y2="120" stroke="#4A515A" stroke-width="1" stroke-dasharray="5 4"/>
  <text x="8" y="124" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">target</text>

  <g fill="#3A4048">
    <rect x="72" y="192" width="14" height="8" rx="2"/><rect x="93" y="189" width="14" height="11" rx="2"/>
    <rect x="114" y="182" width="14" height="18" rx="2"/><rect x="135" y="186" width="14" height="14" rx="2"/>
    <rect x="156" y="176" width="14" height="24" rx="2"/><rect x="177" y="170" width="14" height="30" rx="2"/>
    <rect x="198" y="162" width="14" height="38" rx="2"/><rect x="219" y="166" width="14" height="34" rx="2"/>
    <rect x="240" y="152" width="14" height="48" rx="2"/><rect x="261" y="146" width="14" height="54" rx="2"/>
    <rect x="282" y="136" width="14" height="64" rx="2"/><rect x="303" y="140" width="14" height="60" rx="2"/>
    <rect x="324" y="130" width="14" height="70" rx="2"/>
  </g>
  <g fill="#E39A1F" opacity="0.55">
    <rect x="356" y="126" width="14" height="74" rx="2"/><rect x="377" y="116" width="14" height="84" rx="2"/>
    <rect x="398" y="122" width="14" height="78" rx="2"/><rect x="419" y="108" width="14" height="92" rx="2"/>
    <rect x="440" y="112" width="14" height="88" rx="2"/><rect x="461" y="104" width="14" height="96" rx="2"/>
    <rect x="482" y="110" width="14" height="90" rx="2"/><rect x="503" y="102" width="14" height="98" rx="2"/>
    <rect x="524" y="106" width="14" height="94" rx="2"/><rect x="545" y="100" width="14" height="100" rx="2"/>
    <rect x="566" y="104" width="14" height="96" rx="2"/><rect x="587" y="98" width="14" height="102" rx="2"/>
    <rect x="608" y="106" width="14" height="94" rx="2"/><rect x="629" y="100" width="14" height="100" rx="2"/>
  </g>

  <path d="M72 60 L93 44 L114 96 L135 88 L156 52 L177 54 L198 78 L219 80 L240 66 L261 62 L282 72 L303 96 L324 112 L356 128 L377 132 L398 126 L419 134 L440 130 L461 136 L482 132 L503 138 L524 134 L545 137 L566 133 L587 138 L608 135 L629 137"
        fill="none" stroke="#E39A1F" stroke-width="2.4" stroke-linejoin="round"/>

  <text x="60" y="222" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">day 0</text>
  <text x="330" y="222" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">day 14</text>
  <text x="640" y="222" font-family="IBM Plex Mono, monospace" font-size="11" fill="#7C838D">day 28</text>
  <text x="60" y="248" font-family="IBM Plex Mono, monospace" font-size="11" fill="#A8AEB6">Bars: conversions.  Line: cost per install.</text>
</svg>
<figcaption>The shape, not measured data. What matters is the order of events: the cost line settles only after conversion volume has risen enough to predict from. Judging the campaign inside the shaded region is judging a system that has not finished calibrating.</figcaption>
</figure>

## Why a large edit costs a fortnight

Bid and budget are not dials that adjust output smoothly. They determine which auctions the campaign is eligible for at all.

Raise the bid substantially and a whole tier of inventory opens up — more expensive placements, different surfaces, different audiences. Lower it substantially and that tier closes. Either way the campaign is now buying from a different distribution than the one it learned on, and its predictions are calibrated to the old one. It has to relearn.

The rule of thumb that follows is a change of **no more than about 20 per cent** at a time. Past that, expect the calibration to restart, and expect roughly **100 conversions under the new settings** before the system is confident again.

This is a guideline rather than a law, and it has an honest exception. If you are running a two-week promotion and need budget up 60 per cent tomorrow, take the instability — the promotion is worth more than the calibration. What you should not do is make a change that size *because performance looked bad on Tuesday*, which is the version that happens by accident.

## The counterintuitive one: a low bid can raise your cost per install

The instinct is that bidding less means paying less per install. It frequently means the opposite.

Inventory is not uniform. Some placements carry much higher CPMs than others, and they also convert differently. A very low target excludes the campaign from the auctions where those placements are sold — so the campaign competes only in a narrow, crowded slice of the market, wins fewer of those auctions, and ends up with a *worse* blended cost than it would have had with access to the full range.

The practical consequence: if a campaign is struggling to spend, the answer is usually to **loosen the target in small steps of 10 to 20 per cent**, not to tighten it further and not to jump it by half. Tightening is what caused the problem.

## Three symptoms and what they actually mean

**Not spending, or not scaling.** Usually the target is too restrictive, the creative set is too thin to qualify for much inventory, or the geography is too narrow. Loosen the target gradually; fill the missing asset slots before concluding the target is the issue.

**Spend dropped suddenly.** Check the change log first. A top-performing asset paused, a target moved more than a fifth, or a policy disapproval will each do this. If a large change was made recently, the campaign is relearning — the correct action is to make no further changes and let it run three to seven days.

**Hitting volume but missing the return target.** Check conversion lag before touching anything. Subscription and purchase events arrive days after the install, so a recent window is always incomplete and always looks worse than it will. Segment by days-to-conversion and let the window mature. Reacting to incomplete data is the most common way an account talks itself into a change it did not need.

## The compounding cost

Each of those reactions is individually defensible and collectively expensive.

A campaign edited every few days never leaves its learning period. Its performance is permanently the performance of an uncalibrated system, which then justifies the next edit. Accounts get stuck in this loop for months, and the diagnosis is not visible in any performance report — it is only visible in the change log, laid next to the conversion curve.

If you want one number to watch: how many days pass between edits to a campaign, on average. If it is under fourteen, that is the finding.

## What to do instead

- **Set a change window and hold it.** Fortnightly for bid and budget, unless something is genuinely broken.
- **Write down what you expect before you change anything**, so you can tell later whether the change worked or the campaign simply finished learning.
- **Cap edits at a fifth**, and accept larger ones only for a reason that is not "performance looks bad".
- **Read the change log before the performance report** when something moves. Most sudden drops have a cause you can date.

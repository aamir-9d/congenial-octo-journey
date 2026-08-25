---
title: The dialog between the trial button and the trial
kicker: A PDF scanner app ran the same daily spend through a rebuilt paywall. Install-to-trial went from 0.6% to 4.0%, and the top of the funnel never moved.
date: 2026-08-26
tag: Paywall
---

A PDF scanner app was buying about 4,300 installs a day and converting 0.6% of them into a trial. That number had been flat for months. The spend was working — installs arrived, at a stable cost, from the countries the campaigns targeted — and almost none of them reached a paywall decision.

The cause was a native confirmation dialog. Tapping the trial button did not start the trial; it raised a system alert asking the user whether they were sure they wanted to purchase. It had been live for four to five months. Nobody had flagged it, because nothing was broken in the sense that a crash reporter or a dashboard understands: the button worked, the alert fired, the purchase sheet appeared behind it. The funnel was intact and almost nobody walked it.

Client name withheld.

## Why this read is unusually clean

Most paywall case studies compare two periods that differ in more than the paywall. This one does not, and that is the reason it is worth writing up.

| Per day | Before | After | Change |
| --- | --- | --- | --- |
| Ad spend | $651 | $665 | +2.1% |
| Installs | 4,283 | 4,293 | +0.2% |

Eighteen days before the change, nine days after, both windows aged until the trials in them had resolved. Same daily budget, same daily install volume, same campaigns, same countries. The top of the funnel was held still. Whatever moved below it moved because of the change.

## What actually changed

Three things shipped together.

1. **The confirmation dialog was removed.** The trial button now starts the trial.
2. **The paywall was rebuilt around a feature comparison** — a free column and a Pro column, five rows, so the user can see what they get rather than read a claim about it.
3. **The plan set collapsed to one.** Monthly at $9.99 and annual were replaced by a single weekly plan at the old monthly price.

## What moved

| Mature cohorts | Before | After | Change |
| --- | --- | --- | --- |
| Install → trial | 0.62% | **4.00%** | 6.5× |
| Trial → paid | 26.5% | **18.5%** | −7.9 pts |
| Install → paid | 0.163% | **0.740%** | 4.5× |
| Trials per day | 26.4 | **171.6** | 6.5× |
| Payers per day | 7.0 | **31.8** | 4.5× |
| Cost per trial | $24.61 | **$3.87** | −84% |
| Cost per payer | $92.95 | **$20.91** | −78% |

Totals across 25 countries: 77,094 installs and 476 trials before, 38,638 installs and 1,544 trials after. The install counts differ because the windows are different lengths; the per-day rates above are the comparable figures.

## The number that got worse

Trial-to-paid fell from 26.5% to 18.5%, and that is not a footnote — it is what should happen.

The old funnel was a filter. Getting past a dialog that asked whether you were sure you wanted to purchase selected for users who had already decided, so the handful who started a trial converted at 26.5%. Removing the filter let in everyone who was merely interested. A wider funnel admits weaker intent, and the rate per trial falls.

It falls without mattering. Payers per day went from 7.0 to 31.8 on the same spend. A conversion rate is a ratio, and optimising it in isolation is how an app ends up with an excellent percentage of a number too small to pay for anything.

## Where the revenue actually came from

MRR went from about $31k to about $52k over the four weeks after the change — roughly +68%. Active subscriptions over the same period went from about 2,200 to about 2,550, which is +16%.

Those two numbers do not match, and the gap is the whole story. Revenue per subscription rose about 45%, and it rose because a weekly plan bills 4.33 times as often per year as a monthly one at the same price. Most of the MRR lift is billing frequency, not subscriber growth.

That is worth stating plainly, because "we rebuilt the paywall and MRR went up 68%" invites the reader to credit the conversion work for all of it. The conversion work produced 4.5× the payers per day. The pricing change produced the rest. They are different levers and they carry different risks.

## What can and cannot be attributed

Three changes shipped at once, so no single number here belongs to a single change. What can be said from the shape of the data:

- The install-to-trial jump is almost certainly the dialog and the clearer paywall. That is the exact step the dialog blocked, and it moved 6.5× while nothing above it moved at all.
- The trial-to-paid drop follows mechanically from the wider funnel, not from anything about the new paywall's persuasiveness.
- The MRR lift beyond subscriber growth is the weekly plan, and that part is arithmetic rather than inference.

Separating the first two would have needed the dialog removal and the paywall rebuild shipped a fortnight apart. That was not the trade the client wanted, and with a defect that old sitting in the highest-value step of the funnel, waiting to measure it more precisely would have cost more than the measurement was worth.

## What is still open

Weekly plans bill fast, and they churn fast. Twenty-six days of MRR is enough to establish that the change worked and not enough to establish that it holds. The subscription curve is already flattening near 2,550. The real test is week eight to twelve retention on the weekly plan against the old monthly cohort's, and that data does not exist yet.

The other open question is price. The weekly plan sits at what the monthly plan used to cost, which was chosen because it was a known-acceptable number, not because it was tested. It is the obvious next thing to put a real test against.

## The general point

The defect was not in the measurement stack. Attribution was fine, the events fired, the dashboard was accurate — it accurately reported a 0.6% install-to-trial rate for four months. No amount of attribution work would have surfaced this, because nothing was misattributed.

What surfaced it was walking the funnel as a user, on a device, to the point where money changes hands. A conversion rate that has been flat for months is not a baseline. It is a description of something, and it is worth finding out what.

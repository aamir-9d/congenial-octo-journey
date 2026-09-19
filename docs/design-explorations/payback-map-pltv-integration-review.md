# Payback Map + updated pLTV: design-preserving integration review

Reviewed 19 September 2026. This is a design and source review, not a validation of campaign forecasting accuracy.

## Recommendation

Keep the redesigned public Payback Map and approved Loop. Improve the calculator's definitions and numerical boundaries now. Develop account-connected pLTV as a separate private workspace under the E2E Apps brand, initially delivered as a managed service.

These experiences can share their visual system and result schema without sharing all their controls:
- Homepage: “What happens under these assumptions?” Model choice → inputs → payback map → pinned comparison.
- Private workspace: “What do these cohorts support?” Select app/campaign → observed history → forecast tail → evidence → scenario comparison.

Do not transplant the existing payback.tpl.html into the homepage. It is a campaign console, with very different information density and account data.

The four Payback Map concept images remain the visual direction. Changes recommended here affect behavior, definitions and the engine roadmap.

## What can be incorporated

| Capability | Public Payback Map | Private forecasting workspace |
|---|---|---|
| Subscription/ad model selection | Keep explicit and prominent | Route to the appropriate estimator |
| Revenue minus acquisition-cost curve | Main visual | Same visual with observation boundary |
| Pin scenario / change one assumption | Add now | Add after history-preservation fix |
| Horizon-specific LTV, ROAS and payback | Add clear labels now | Require horizon-specific evidence |
| Acquisition return target | Optional advanced setting | Same definition, include cost coverage |
| Input validation / empty states | Add now | Validate schema and source quality too |
| Signed revenue and refunds | Preserve if observations are introduced; explain current expected refund rate | Required throughout collection, replay, projection and UI |
| Observed prefix + forecast tail | Not available from sliders alone | Core architecture |
| First vs sustained payback | Usually identical in current nonnegative scenarios | Show both when refunds create recrossings; qualify “through day H” |
| Multiple fitted retention/ARPDAU families | Do not expose as homepage complexity | Evaluate on relevant history |
| Early market multiplier | Not a generic public default | Evaluate by market, app, maturity and available training labels |
| Prediction intervals | No invented bands | Calibrate on out-of-time residuals for the exact published estimator |
| Scale / cut / kill recommendation | Exclude | Withhold until explicit evidence and denominator gates pass |

## Formula boundary

The current public ad model already has the same basic decomposition:

LTV(H) = sum from day 0 to H of retention(d) × revenuePerActiveUser(d).

The newer model adds data fitting, more curve families, pooling, calibration machinery, signed observations and evaluation. That is a change in required evidence, not simply a better formula that can be pasted over two sliders.

For a fixed acquired cohort of N users, the preferred connected formulation is:

LTV(H | observedThrough=o)
= sum(d=0..min(o,H), signedNetRevenue(d) / N)
+ sum(d=o+1..H, predictedRetention(d) × predictedARPDAU(d)).

Use directly recorded revenue for observed days, including refunds on days with zero active users. Do not reconstruct these days solely as retention × ARPDAU. Explicitly distinguish missing data from a verified zero.

Keep the target population consistent between prediction and actuals. When aggregating cohorts, carry identity and weights together, and use the same target cohort set at every compared horizon.

For pooled daily retention/ARPDAU over a consistent set:
retention = sum(activeUsers) / sum(acquiredUsers).
ARPDAU = sum(revenue) / sum(activeUsers).
The product reproduces revenue per acquired user when these denominators and included rows align. A zero-active adjustment still requires the direct revenue series.

Keep the subscription planner's expected-payment formula:
installToPaid × netPayment × sum(renewalRetention^j, j=0..n−1).

An ad activity model is not a drop-in replacement for subscription billing cycles. A connected subscription product needs renewal/payment timing, trial conversion, cancellations, refunds, failed-payment recovery and consistent net revenue definitions. Validate it separately.

Acquisition surplus(H) = net monetisation revenue(H) − acquisition cost.
ROAS(H) = net monetisation revenue(H) / acquisition cost.
A 30% return on acquisition cost means revenue >= 1.3 × cost.
A 30% margin on revenue means revenue >= cost / 0.7.
Neither establishes total business profit when operating costs are absent.

## Findings in the supplied files

Paths below are relative to the attached pltv directory. “Confirmed” refers to the supplied source, not a deployed production service.

### 1. The published estimator is explicitly unvalidated

scripts/pltv_project.py:290–306 returns unknown validation for its pooled projection and explains that its estimator differs from the replayed cohort blend.

The supplied scripts/dash_data.json contains 24 campaign rows, all with NO CALL, and an unresolved acquisition denominator. This is evidence from that snapshot, not a live account conclusion.

Do not advertise the published console as a validated recommendation engine or reuse another estimator's accuracy claim.

### 2. The temporal interval construction still leaks outcome availability

scripts/pltv_temporal.py:172–204 sorts forecasts by origin, then immediately adds each eventual outcome residual to hist. Before the next origin, it does not check whether that previous forecast's target horizon plus reporting lag has completed. Same-origin rows can also enter one another's interval history.

The multiplier training cutoff at lines 64–91 is a useful improvement, but it does not fix the residual-history branch. Require residual availability date <= current forecast origin; process same-origin predictions as a batch before updating eligible history.

This is a source finding; historical coverage was not rerun.

### 3. Scenario levers rewrite observed history

scripts/pltv_project.py:185–233 says levers apply to the forecast tail, but the direct-observation branch runs only when all levers equal 1. Other settings rebuild and scale observed days. The lever calls around 519–522 also omit the direct revenue series.

A synthetic, offline call confirmed that recorded day-0 revenue 0.01 becomes 0.011 after an ARPDAU +10% lever. Measured history must stay fixed in a forward-looking what-if.

The public scenario calculator has no observed history, so changing its entire hypothetical curve is valid. Keep those two semantics distinct.

### 4. Acquisition denominator validation can fail open

scripts/pltv_project.py:275–287 reports resolved for an empty install_actions object because it only checks existing entries for empty lists.

An offline in-memory test confirmed that {"install_actions": {}} returns resolved. Require a nonempty configuration and coverage of every relevant account, with validated install action definitions.

Also, unfiltered Google Ads conversions are not inherently installs, nor does metrics.conversions necessarily include every action in an account. Resolve the actual conversion definitions rather than relying on the script's broad wording.

### 5. Cohort membership changes over time

scripts/pltv_project.py:86–172 explicitly acknowledges that truncation does not hold population membership constant. Its own comments record a synthetic mismatch from integrating across different cohort populations.

Freeze the target cohort identities at the prediction origin. Forecast each eligible cohort and aggregate using aligned weights. Evaluate against the same identities.

### 6. Weekly/monthly data are shape-compatible, not statistically interchangeable

scripts/pltv_cohorts.py:109–124 labels a weekly bucket “day 7”, a monthly bucket “day 30”, and carries period active users and period revenue. Daily consumers cannot treat these as one-day observations or interpret day 3 of a weekly series as a complete three-day observation.

Carry granularity and interval boundaries explicitly. Use a period-aware model or collect true daily age data. Do not fill the six omitted day keys with zeros and fit a daily curve.

### 7. Refund handling and confidence remain inconsistent in the early path

scripts/pltv_early.py:51 retains a regression multiplier floor of 1, justified by the incorrect statement that cumulative revenue cannot fall. The market branch can use a multiplier below 1, so behavior differs by fallback.

At 176–198, market ranges are historical multiplier quartiles; regression/global ranges are fixed multipliers around the point estimate. These are not calibrated forecast intervals.

At 201–234, the early path emits ON TRACK / AT RISK / KILL with confidence labels and does not share the mature publication eligibility gate.

Treat early forecasts as a separately validated estimator and bring them under a shared publication contract.

### 8. The evaluation and projection paths differ in refund handling

scripts/pltv_fit.py:129–136 and scripts/pltv_temporal.py:100–103 reconstruct observed values using retention and ARPDAU; their underlying cohort builder omits ARPDAU when active users equal zero.

The baseline projection has a direct signed revenue path. That fix is not automatically shared with the evaluators. Use one canonical prediction function and direct observed revenue across replay and publication.

### 9. The template has independent numerical and labelling logic

scripts/payback.tpl.html:
- Around 340–350, curveOf scales existing history when adjusting levers.
- profOf and table labels hard-code 1.3× as profitability, even though the Python builder accepts a configurable target.
- crossDay works on the sampled chart grid; the X-factor branch applies grid-derived shifts to published scalar dates.
- Missing crossing is labelled “never” rather than not reached within the modelled horizon.
- Zero actual revenue is tested as falsy and can be displayed as not mature.

Generate numerical summaries from the same full-resolution engine and model metadata used by the chart. The browser should format results and evaluate explicitly defined scenarios, not silently redefine the model.

### 10. Enrichment can become stale or collide

scripts/pltv_enrich.py carries prior audit fields, including action and required lifts, into fresh projections. Its join uses campaign name only.

Use a stable composite key including account/app and campaign ID, track enrichment freshness separately, and recompute or invalidate derived action/lift fields after model changes. A fresh projection timestamp does not make carried-forward annotations fresh.

### 11. Documentation and diagnostic twins have drifted

SKILL.md, references/early-ltv.md and parts of pltv_fit.py retain stronger accuracy/interval language than the newer README supports. Model-family selection in pltv_model.py chooses an in-sample fit score, not a held-out predictive winner.

pltv_signed_compare.py's local signed twins still use older ARPDAU pooling/reconstruction and no longer match all current projection corrections. Treat that script as a historical comparison, not proof that the current production projection is correct.

### 12. Smaller boundaries should be fixed before packaging

- pooled_curves returns three dictionaries for an empty campaign but four for a nonempty one; an offline call confirmed the inconsistent return shape.
- Supplied public calc-model.ts needs explicit handling of 100% renewal retention, log(0), invalid D30/D1 anchors and non-finite inputs if these are allowed in the redesigned controls.
- Public ad payback search begins at day 1 although day-0 revenue exists. Include day 0 when applicable.
- Finite search limits must not become an unconditional “never”.
- Cohort builders fill missing days as zero. Confirm collection completeness before accepting that interpretation.
- Positive-only tail families preserve signed observed refunds in some paths but do not thereby become a model of future refund risk.

## Product and deployment route

Use the homepage as the attractive entry point. Below the calculator, a small CTA can say “Model your own campaigns” with supporting copy “Connect acquisition, retention and revenue.” Link to the Automation service section/contact flow until an actual private workspace exists.

Recommend a managed pLTV service first:
1. Harden one canonical estimator and aligned data contract.
2. Validate on rolling forecast origins for the exact target product.
3. Establish source/denominator and granularity correctness.
4. Deliver a private workspace with source dates, model version and evidence status.
5. Productise repeated onboarding and reporting after those foundations work.

GitHub Pages can continue hosting the public homepage and illustrative browser calculator. It is static hosting; the Python/account-connected product needs separate execution, storage and authenticated access. payback_build.py embeds JSON directly into HTML, so publishing that generated console publicly would publish its included campaign payload. Keep account data and credentials out of the public site/repository/build artifacts.

Claude, GPT and Gemini can later access a shared authenticated tool layer with scoped, read-only analytical operations. They should consume the same canonical forecasts and evidence, rather than each generating its own numerical truth. A future account-changing workflow is a separate scope.

Official references:
- [GA4 metric definitions](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema): cohort retention uses cohortActiveUsers/cohortTotalUsers; revenue definitions need to match the chosen model.
- [Google Ads conversion reporting](https://developers.google.com/google-ads/api/docs/conversions/reporting): distinguish configured conversion metrics from identified install actions.
- [GitHub Pages hosting model](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): static website hosting.

## Review scope and verification

Read the supplied README, skill/reference documents, model/fit/project/early/temporal/backtest code, relevant collector/cohort/enrichment/build/template code, fixtures and signed comparison, plus the existing website calculator. Inspected JSON schema and status metadata without reproducing campaign payloads in the design.

Ran only small offline synthetic function checks: lever/history mutation, empty denominator configuration, empty-pool return shape, and first versus sustained crossing. Did not run collectors, historical backtests, account writes, enrichment, publication or the full fixture suite.

Design images use illustrative outputs from the existing website calculator. Website implementation, predictive model repairs and production deployment are not part of this artifact delivery.

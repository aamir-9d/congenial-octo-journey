# Measurement setup

The site pushes a clean, documented event stream to `dataLayer`. Turning that
stream into GA4 reports and Google Ads conversions happens in the GTM container,
which lives in Google's UI rather than in this repo — so this file is the spec
for it. Build the container to match and the code needs no changes.

This site sells measurement. Its own instrumentation is the demo: once this is
live, the founder can screen-share GA4 and Google Ads on a sales call and show a
working web-to-app attribution loop rather than describing one.

---

## 1. What the page already does

| Concern | Where | Notes |
| --- | --- | --- |
| Consent Mode v2 defaults | `src/components/Analytics.astro` | All four signals `denied` before the container loads |
| GTM container load | `src/components/Analytics.astro` | Deferred to idle so it never competes with the LCP |
| Consent banner + update | `src/scripts/consent.ts` | Decision stored 180 days in `e2e_consent` |
| Click-ID capture | `src/scripts/attribution.ts` | 90 days in `e2e_attr` |
| Calculator events | `src/scripts/calculator.ts` | Sliders debounced 800ms |
| Scroll + section events | `src/scripts/engagement.ts` | IntersectionObserver, once per page view |
| Lead + booking events | `src/scripts/contact-form.ts`, `calendly.ts` | Both carry the click IDs |
| Server-side CAPI | `worker/index.js` | Meta, LinkedIn, GA4 Measurement Protocol |

Set `PUBLIC_GTM_ID` to switch the container on. With it unset, `Analytics.astro`
renders nothing — local builds stay clean.

---

## 2. Events

### Calculator

The point of these is lead qualification, not engagement scoring. Someone
setting CPI to $4 against a $99 annual plan is a very different prospect from
someone at $0.30 weekly, and what they type into the model is a better
qualifier than anything the form asks.

| Event | Parameters |
| --- | --- |
| `calc_mode_switch` | `calc_mode` (`sub` \| `ad`) |
| `calc_slider_change` | `slider_name`, `slider_value`, `calc_mode` |
| `calc_gap_toggle` | `gap_name` (`renewalCapture` \| `skanMapped` \| `webStitched`), `gap_enabled` |
| `calc_breakeven_computed` | `calc_mode`, `breakeven_day`, `cpi`, `price`, `billing_period`, `ltv_per_install` |

`calc_slider_change` and `calc_breakeven_computed` are debounced 800ms, so
dragging a slider produces one event at the value the user settled on.

### Engagement

| Event | Parameters |
| --- | --- |
| `scroll_depth` | `percent_scrolled` (25 \| 50 \| 75 \| 100) |
| `section_view` | `section_name` (`hero`, `problems`, `loop`, `stack`, `proof`, `founders`, `cta`, `contact`) |

### Conversions

| Event | Parameters |
| --- | --- |
| `generate_lead` | `form_name`, `monthly_spend`, `has_app_url`, `gclid`, `gbraid`, `wbraid`, `li_fat_id`, `utm_source`, `utm_campaign`, `event_id`, `enhanced_conversion_data.sha256_email_address` |
| `booking_complete` | `method`, `gclid`, `gbraid`, `wbraid`, `li_fat_id`, `utm_source`, `utm_campaign` |
| `form_error` | `form_name`, `error_fields` |

---

## 3. GTM container

### Variables

One **Data Layer Variable** per parameter above. Name them `dlv - <parameter>`
(`dlv - calc_mode`, `dlv - gclid`, …). Version 2, no default value.

### Triggers

- **Custom Event** triggers, one per event name in the tables above. The event
  name is an exact match; no filters.
- A **Consent Initialization – All Pages** trigger, which GTM provides.

### Tags

**GA4 Configuration** — fires on Initialization – All Pages. Measurement ID
`PUBLIC_GA4_MEASUREMENT_ID`. Under *Consent Settings*, require
`analytics_storage`.

**GA4 Event** — one per event, name matching, parameters mapped from the `dlv -`
variables. Require `analytics_storage`.

**Google Ads Conversion Tracking** — two tags, on `generate_lead` and
`booking_complete`.
- Conversion ID: `PUBLIC_GOOGLE_ADS_CONVERSION_ID`
- Labels: `PUBLIC_GOOGLE_ADS_FORM_LABEL` / `PUBLIC_GOOGLE_ADS_BOOKING_LABEL`
- **Enhanced conversions: on**, user-provided data from
  `dlv - enhanced_conversion_data`. It already carries a SHA-256 hex digest of
  the trimmed, lowercased email, which is the format Google expects — do not
  add a hashing transform on top.
- Transaction/Order ID: `dlv - event_id`, so the browser conversion dedupes
  against the Worker's server-side copy.
- Require `ad_storage` and `ad_user_data`.

### Custom dimensions in GA4

Admin → Custom definitions → Create custom dimension, **event-scoped**, one per
parameter you want to segment on:

`calc_mode`, `breakeven_day`, `cpi`, `price`, `billing_period`,
`ltv_per_install`, `slider_name`, `gap_name`, `monthly_spend`, `section_name`.

Register these before you need them — GA4 does not backfill a dimension onto
events collected before it existed.

---

## 4. Consent Mode v2

Defaults are set inline, before the container loads, in `Analytics.astro`:

```
ad_storage         denied
ad_user_data       denied
ad_personalization denied
analytics_storage  denied
functionality_storage granted
security_storage      granted
wait_for_update    500ms
```

`ads_data_redaction` is on and `url_passthrough` is on, so a denied visitor
still preserves the `gclid` across navigation without a cookie being written.

`consent.ts` calls `gtag('consent','update', …)` on a decision and replays the
stored decision on every subsequent page load, before any tag fires.

The ordering is the part that is easy to get wrong: a default that arrives after
the container has already fired is a default that did nothing. Check it in
Tag Assistant — the `default` command must appear above `gtm.js` in the
dataLayer.

---

## 5. Offline Conversion Import

This is what closes the loop, and it is the part most setups skip.

`gclid` is captured on landing, held for 90 days, attached to the form
submission, and printed in the notification email under **Attribution**. When a
lead becomes a paying client, upload the value the deal actually closed for
against that original click.

**Google Ads → Goals → Conversions → Uploads → Upload conversions.**

CSV format:

```csv
Parameters:TimeZone=Europe/London
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
Cj0KCQjw...,Qualified lead,2026-03-04 14:22:31,2500,GBP
```

Rules that bite:
- The conversion action must be created with **Import → From clicks** first.
- Conversion time must be after the click and within the click's conversion
  window. Widen the window to 90 days to match the cookie, otherwise long sales
  cycles silently drop.
- One row per conversion. Re-uploading the same gclid and action double-counts.

Upload monthly. Once a few closed deals are in, Google Ads is bidding toward
revenue rather than form fills — which is the entire argument the homepage
makes, running on the homepage itself.

---

## 6. Verifying it

1. **Consent** — load in a clean profile. Before choosing, Tag Assistant should
   show consent `denied` and no `_ga` cookie. Accept; `_ga` appears and the
   queued hits send.
2. **Click ID** — load `/?gclid=test123`, check `document.cookie` for
   `e2e_attr` containing it, submit the form, confirm `test123` reaches the
   `generate_lead` payload and the notification email.
3. **GA4 DebugView** — with the GA Debugger extension on, exercise the
   calculator and watch `calc_*` events land with their parameters.
4. **Google Ads diagnostics** — Goals → Conversions → the action → Diagnostics.
   Enhanced conversions should report matched data, not "no data received".
5. **CAPI** — Meta Events Manager → Test Events; LinkedIn Campaign Manager →
   the conversion's activity. Both should show the server event, and Meta should
   report it deduplicated against the browser event via `event_id`.
6. **Worker** — `npx wrangler tail` while submitting. The email send is awaited;
   the CAPI fan-out runs in `waitUntil` and logs failures without ever turning a
   delivered email into a visible error.

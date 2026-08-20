# Credentials — what to get, where to get it, where to put it

Everything the site needs from you, in the order worth doing it.

**Do not send me any of these in chat.** Secrets go straight into Cloudflare or
GitHub, where only you can read them. The `PUBLIC_*` values are not secrets —
they are visible in any browser's network tab — so those can go in the repo.

---

## The short version

| # | You need | Looks like | Secret? | Blocks |
| --- | --- | --- | --- | --- |
| 1 | Cloudflare account | — | no | the form |
| 2 | Resend API key | `re_abc123…` | **yes** | the form |
| 3 | Calendly event URL | `https://calendly.com/…/30min` | no | booking |
| 4 | GTM container ID | `GTM-ABC1234` | no | all analytics |
| 5 | GA4 measurement ID | `G-ABCD123456` | no | analytics |
| 6 | GA4 API secret | random string | **yes** | server-side backup |
| 7 | Google Ads conversion ID + labels | `AW-123456789` + labels | no | ad measurement |
| 8 | Meta pixel ID + CAPI token | number + `EAA…` | token **yes** | Meta ads |
| 9 | LinkedIn conversion ID + token | number + `AQV…` | token **yes** | LinkedIn ads |
| 10 | Two founder photos | `.jpg` | no | the founders section |
| 11 | Domain + DNS access | — | no | custom domain |

**Minimum to be genuinely useful:** 1, 2, 3, 10. That gets you a working form,
a working booking flow, and a complete page. Analytics can follow.

Everything is on a free tier at your volume. Nothing here should cost money.

---

## 1. Cloudflare account — runs the form

GitHub Pages only serves files. It cannot run code, so it cannot send an email.
One small Cloudflare Worker does that job. Free tier is 100,000 requests a day;
you will use a handful.

1. Sign up at **dash.cloudflare.com**. You do **not** need to move your domain
   to Cloudflare — the Worker gets its own `*.workers.dev` address.
2. In this repo:
   ```sh
   cd worker
   npx wrangler login      # opens a browser, click Allow
   npx wrangler deploy
   ```
3. **The first deploy asks you to pick a workers.dev subdomain. This one
   catches everybody.**

   > `What would you like your workers.dev subdomain to be?`

   It is **not** a yes/no question, despite following one. It wants a *name* —
   typing `y` or `yes` registers those as your subdomain, and both were claimed
   years ago, so you get `Subdomain is unavailable` and the prompt loops.

   Type something unique instead: `e2eapps`, or `e2e-apps` / `aamir-e2eapps` /
   `e2eapps-growth` if that is gone. Lowercase, letters, numbers and hyphens.
   It is a global namespace shared by every Cloudflare customer, so short words
   are long gone — longer and more specific is likelier to be free.

   This is **account-wide and one-time**: every Worker you ever deploy sits
   under it. Changeable later in the dashboard, but it rewrites every Worker
   URL, so pick one you will still want.

   `Ctrl+C` is safe at this prompt — nothing has deployed yet, and re-running
   `npx wrangler deploy` resumes.

4. It prints a URL combining the Worker name from `wrangler.toml` with your
   subdomain: `https://e2e-apps-forms.<your-subdomain>.workers.dev`. **Save it.**

**Gives you:** the value for `PUBLIC_FORM_ENDPOINT`, which is that URL with
`/submit` on the end. It goes in `.env` and in the `env:` block of
`.github/workflows/deploy.yml`.

The deploy succeeds without a Resend key, but submitting the form then returns
502 — do step 2 next.

---

## 2. Resend — sends the email

3,000 emails a month free.

1. Sign up at **resend.com**.
2. **Domains → Add Domain →** `e2eapps.com`.
3. Resend shows three DNS records (DKIM, SPF, and usually DMARC). Add them at
   whoever hosts your DNS, then press **Verify**. Propagation is normally
   minutes, occasionally a few hours.
   - *No domain yet?* Skip verification and use Resend's sandbox sender. It can
     only email **your own** address, which is fine for testing — the form
     sends to you anyway.
4. **API Keys → Create API Key.** Name it `e2e-apps-site`, permission
   **Sending access**, and scope it to your domain if offered.
5. Copy it immediately — it is shown once. Format: `re_` then ~30 characters.

Store it in the Worker, never in the repo:

```sh
cd worker
npx wrangler secret put RESEND_API_KEY     # paste when prompted
```

Also set the addresses in `worker/wrangler.toml` (these are not secrets):

```toml
RESEND_TO   = "hello@e2eapps.com"
RESEND_FROM = "forms@e2eapps.com"
```

`RESEND_FROM` must be on the domain you verified. `RESEND_TO` can be anything.

**Verify:** submit the form. `npx wrangler tail` streams the Worker's logs live
if it does not arrive.

---

## 3. Calendly — the booking widget

1. **calendly.com** → sign up → create an event type. A **30 Minute Meeting**
   matches the page copy ("A 30-minute call, no pitch").
2. Open the event → **Copy link**. It looks like
   `https://calendly.com/aamir-e2eapps/30min`.

**Gives you:** `PUBLIC_CALENDLY_URL`.

The free plan allows one event type, which is all this needs. If the value is
missing the whole booking block is skipped and the page still renders correctly.

---

## 4. Google Tag Manager — the container everything else runs through

1. **tagmanager.google.com** → **Create Account**.
   - Account name: `E2E Apps`
   - Container name: `e2eapps.com`, target platform **Web**
2. Accept the terms. It shows two install snippets — **ignore them.** The site
   already loads GTM itself, deliberately deferred so it cannot hurt the
   Lighthouse score.
3. Copy the container ID from the top bar: `GTM-` plus 7 characters.

**Gives you:** `PUBLIC_GTM_ID`.

This one is a gate: with it unset, no analytics code renders **and the cookie
banner does not appear** — because a banner asking consent for cookies that
never load would be a false statement.

Once you have the ID, build the container to match
[docs/measurement.md](measurement.md). That file lists every tag, trigger,
variable and custom dimension. It is an hour of clicking, and it is the part
that turns the event stream into actual reports.

---

## 5 & 6. GA4 — measurement ID and API secret

1. **analytics.google.com** → **Admin** → **Create** → **Property**.
   - Name `E2E Apps`, your timezone and currency.
2. **Data Streams** → **Web** → URL `https://e2eapps.com`, name `Website`.
3. The **Measurement ID** is on the stream page: `G-` plus 10 characters.
   → `PUBLIC_GA4_MEASUREMENT_ID`
4. Same page → **Measurement Protocol API secrets** → **Create** → name it
   `worker`. Copy the value.
   → Worker secret, not repo:
   ```sh
   npx wrangler secret put GA4_API_SECRET
   ```
   Also put the measurement ID in `wrangler.toml` under `GA4_MEASUREMENT_ID`.

The API secret exists so the Worker can report a lead server-side. If a
visitor's browser blocks the beacon, the conversion still lands.

**While you are there:** Admin → Data Settings → Data Retention → set to
**14 months**. The default is 2 months, and the privacy page states 14.

---

## 7. Google Ads — conversion tracking

Needs an active Google Ads account.

1. **ads.google.com** → **Goals → Conversions → Conversion actions** → **New
   conversion action** → **Website**.
2. Enter `e2eapps.com`, then **Add a conversion action manually**.
   - Category **Submit lead form**, name `Contact form`
   - Value: pick one and use it consistently — even a nominal £50 makes the
     reports sortable
   - Count **One**
3. Repeat for a second action named `Call booked`.
4. Open each → **Tag setup** → **Use Google Tag Manager**. It shows:
   - **Conversion ID** — `AW-` plus 9 digits, the same for both
   - **Conversion label** — a different ~17-character string per action

→ `PUBLIC_GOOGLE_ADS_CONVERSION_ID`, `PUBLIC_GOOGLE_ADS_FORM_LABEL`,
`PUBLIC_GOOGLE_ADS_BOOKING_LABEL`

**Two settings that matter and are easy to miss:**

- On each action, turn **Enhanced conversions** on and choose *Google Tag
  Manager*. The site already sends a SHA-256 hash of the email; do not add a
  hashing step on top of it.
- Set the **conversion window to 90 days** to match the click-ID cookie.
  The default is 30, and a B2B sales cycle will quietly fall outside it.

**For Offline Conversion Import** — the part that closes the loop from a signed
client back to the ad click — create a third action with **Import → From
clicks**. The upload format and the rules that bite are in
[measurement.md §5](measurement.md).

---

## 8. Meta — pixel ID and CAPI token

Skip unless you actually advertise on Meta.

1. **business.facebook.com** → **Events Manager** → **Connect data sources** →
   **Web** → **Meta Pixel**.
2. The **Pixel ID** is a ~15-digit number under the dataset name.
   → `wrangler.toml`, `META_PIXEL_ID` (not a secret)
3. Same dataset → **Settings** → scroll to **Conversions API** → **Generate
   access token**. Starts `EAA`, and it is long.
   ```sh
   npx wrangler secret put META_CAPI_TOKEN
   ```

The Worker sends `Lead` server-side with a shared `event_id`, so if you ever add
a browser pixel too, Meta deduplicates rather than double-counting.

---

## 9. LinkedIn — conversion ID and CAPI token

The fiddliest one by a distance. Worth it for you specifically, since B2B
app-growth buyers are on LinkedIn — but do it last.

1. **Campaign Manager** → **Analyze → Conversion tracking** → **Create
   conversion** → **Conversions API**.
   - Name `Contact form`, type **Lead**
2. After creating it, the URN looks like
   `urn:lla:llaPartnerConversion:1234567`. The trailing number is what you need.
   → `wrangler.toml`, `LINKEDIN_CONVERSION_ID`
3. The token is the awkward part. LinkedIn does not hand these out from Campaign
   Manager:
   - **linkedin.com/developers** → **Create app**, associated with your company
     page
   - **Products** tab → request **Conversions API**
   - Once granted, **Auth** tab → generate a token with the
     `rw_conversions` scope
   ```sh
   npx wrangler secret put LINKEDIN_CAPI_TOKEN
   ```

Approval can take a couple of days. Everything else works without it — the
Worker skips any conversion API whose token is missing, so you can wire these up
one at a time.

---

## 10. Founder photos

Not a credential, but the last visible gap on the page.

Drop two files into `public/img/`:

- `aamir.jpg`
- `faisal.jpg`

**Roughly 1200×900 (4:3), under ~300KB each.** The build detects them
automatically — no code change. Until they exist, a neutral box holds the exact
same frame, so nothing on the page moves when they land.

---

## 11. Domain and DNS — optional

The site is live at
`https://aamir-9d.github.io/congenial-octo-journey/` right now. The design
prints `e2eapps.com` in the footer, so moving to it is worth doing.

1. Create `public/CNAME` containing one line: `e2eapps.com`
2. In `.github/workflows/deploy.yml`, change the two env values:
   ```yaml
   SITE_URL: https://e2eapps.com
   SITE_BASE: /
   ```
3. At your DNS host, add:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `aamir-9d.github.io.` |

4. Repo **Settings → Pages** → set the custom domain, then tick **Enforce
   HTTPS** once the certificate is issued (usually under an hour).

GitHub redirects `www` to the apex automatically once the CNAME file is present.

---

## Where each value goes

**In the repo** — safe, public, commit them:

`astro.config.mjs` reads `SITE_URL` / `SITE_BASE`. The rest go in `.env`
locally, and in `.github/workflows/deploy.yml` under `env:` for the build:

```
PUBLIC_GTM_ID
PUBLIC_GA4_MEASUREMENT_ID
PUBLIC_GOOGLE_ADS_CONVERSION_ID
PUBLIC_GOOGLE_ADS_FORM_LABEL
PUBLIC_GOOGLE_ADS_BOOKING_LABEL
PUBLIC_CALENDLY_URL
PUBLIC_FORM_ENDPOINT
```

**In Cloudflare** — secrets, `npx wrangler secret put NAME`:

```
RESEND_API_KEY
GA4_API_SECRET
META_CAPI_TOKEN
LINKEDIN_CAPI_TOKEN
```

**In `worker/wrangler.toml`** — not secret, commit them:

```
RESEND_TO  RESEND_FROM  META_PIXEL_ID
LINKEDIN_CONVERSION_ID  GA4_MEASUREMENT_ID
```

**Nowhere, ever:** a real key in `.env.example`, in a commit, or in a chat
message. `.env` is gitignored. If you paste a key somewhere by accident, rotate
it rather than deleting the message — assume anything pasted is burned.

---

## Suggested order

**Session one, about an hour** — a working site
1. Cloudflare account, `wrangler deploy` (#1)
2. Resend key + domain (#2)
3. Calendly link (#3)
4. Founder photos (#10)
5. Set `PUBLIC_FORM_ENDPOINT` and `PUBLIC_CALENDLY_URL`, push

At that point the form sends, booking works, and the page is complete.

**Session two, about two hours** — measurement
6. GTM container (#4), GA4 (#5, #6)
7. Build the container per [measurement.md](measurement.md)
8. Google Ads conversions (#7)
9. Verify in GA4 DebugView and Google Ads diagnostics

**Session three, when you need them**
10. Meta (#8), LinkedIn (#9), custom domain (#11)

---

## Checking it worked

| Check | How |
| --- | --- |
| Form sends | Submit it. `npx wrangler tail` for live logs. |
| Spam gates hold | The curl commands in [worker/README.md](../worker/README.md) |
| Click IDs captured | Load `/?gclid=test123`, check `document.cookie` for `e2e_attr`, submit, confirm `test123` is in the email |
| Consent behaves | Fresh profile: no `_ga` cookie before you choose; it appears after Accept |
| GA4 receiving | DebugView with the GA Debugger extension, then work the calculator |
| Ads conversions | Goals → Conversions → Diagnostics should stop saying "no data received" |

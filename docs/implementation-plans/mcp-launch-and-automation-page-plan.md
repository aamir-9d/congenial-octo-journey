# MCP launch and the new Automation page: implementation plan

**Status: phases 1 and 3 delivered 28 November 2026 (the server is live at `https://mcp.e2eapp.com/mcp`; the new Automation page is built on branch `automation-mcp-page`). Phase 2 is half done (the two pages exist; the code is not public yet). Account sign-in, phases 4 to 10, is not started.**

## Context

The owner wants the E2E Apps MCP to be the easy way in: a person adds one
address to Claude or ChatGPT, signs in once, and can ask about their Google
Ads, GA4, AdMob and subscription data, with no separate setup per platform.
The Automation page is to be rebuilt around that, and the server deployed and
listed with the assistants.

This changes the earlier design, in which the server held method tools only
and signed in to nothing (`e2e-apps-mcp-plan.md`). The method tools stay, and
stay usable without any sign-in. Account access is added on top.

## What the research found (28 November 2026)

Read from the vendors' own pages; links at the end. Three findings shape the
plan.

1. **Google Ads cannot be passed through a hosted server.** Google's Ads
   developer policy lists, under prohibited programmatic use, a third-party
   hosted interface, wrapper service or MCP server that solely re-exposes
   Google Ads capabilities as an intermediate layer. It says open-source tools
   that users download and connect themselves are not restricted. It does not
   rule on a hosted tool where each user signs in with their own Google
   account and the tool adds its own analysis. Google is reviewing existing
   integrations (announced 31 August 2026); no deadline is given. Developer
   tokens were retired on 9 September 2026; access now belongs to the Google
   Cloud project.
2. **Google sign-in for the public needs Google's approval.** Until an app
   is verified it is capped at 100 users for the life of the project and shows
   a warning screen. While in testing, a user's access expires after seven
   days. Verification needs a published brand (homepage, privacy policy,
   domain proven in Search Console), a written reason for each permission and
   a video of the sign-in. Google's FAQ gives about ten business days for
   sensitive permissions; not guaranteed. Whether the GA4 and AdMob read
   permissions count as sensitive is shown only in the Cloud Console.
3. **The assistants differ.** Claude lets every plan add a custom connector by
   address (one on the free plan). ChatGPT lets Business, Enterprise and Edu
   add a custom server; Pro gets read and fetch only; Plus was not confirmed.
   Both directories require OAuth sign-in on a server that has accounts, a
   privacy policy and a support contact. Claude's review criteria also say a
   server should call its own first-party APIs or ones it legitimately
   proxies, which may count against a listing that reads Google and
   RevenueCat data.

## Approach, and why

Two lanes, shown as one product on the page.

| Lane | Platforms | Where it runs | Sign-in |
| --- | --- | --- | --- |
| Hosted | GA4, AdMob, RevenueCat | Our server | Google once for GA4 and AdMob; a read-only key for RevenueCat |
| On the user's computer | Google Ads | A small open-source connector the user installs with one command | The user's own Google sign-in, on their machine |

Rejected:

- **Everything hosted, Google Ads included.** The smoothest for users and
  the owner's first wish. It risks the Google Cloud project's API access under
  finding 1, and with it GA4 and AdMob for every user. Open again only if
  Google's compliance team says in writing that our use is allowed.
- **Method tools only, users set up every platform themselves.** Safe, and
  what is built today, but it is the "five setups" the owner wants removed.
- **Bundle the existing community servers.** Two of them offer tools that
  write. We would be distributing other people's code under our name.

Everything is read-only, by construction: the server asks each platform for
reading permission only and has no tool that writes.

## The user's journey

1. Lands on `/automation`. Sees the address and two buttons.
2. Adds the address in Claude or ChatGPT. The six method tools work at once,
   with no sign-in.
3. Asks something that needs their data. The assistant gives a link to our
   connections page.
4. Signs in with Google, ticks which GA4 properties and AdMob account to
   share. Optionally pastes a read-only RevenueCat key.
5. Returns to the assistant and asks. Each answer names its source and dates.
6. For Google Ads, the connections page gives one command to run on their own
   computer.
7. Can remove any connection on the same page, or in their Google account.

## The Automation page

Design: canvas "E2E Apps Automation page with MCP" (private), three boards:
desktop, phone, and the three connect screens.

| # | Section | What it does |
| --- | --- | --- |
| 1 | Header | What it is in one line; the address with a copy button; Add to Claude, Add to ChatGPT; a sample question and answer |
| 2 | Three steps | Add the address, connect your accounts, ask |
| 3 | One connection | The connections panel as the user will see it |
| 4 | Ask a business question | The four saved questions |
| 5 | What's inside | Method tools (no sign-in) beside account data (with sign-in) |
| 6 | Security | Read-only, encrypted access, figures not kept, leave any time |
| 7 | Platforms | What connects today and what is next |
| 8 | Done for you | The setup service |
| 9 | Common questions | Five, with FAQ structured data |

Rules for building it:

- **The page never claims what is not live.** Each platform's status and each
  button comes from one data file. Until a lane is live its row reads
  "Coming", not "Available".
- Rows of equal cards are swipe rows on a phone, as on the rest of the site.
- The existing demonstration (`Investigation.astro`) is kept, under section 4.
- Every promise in section 6 must be true in the code before it is published.

## Phases

| # | Phase | Done looks like | Gate | Status |
| --- | --- | --- | --- | --- |
| 1 | Deploy the method tools | Live at `mcp.e2eapp.com`; `scripts/smoke.mjs` passes against it; added to Claude by address and every tool called; CPU time per call measured | Owner's go-ahead | **Delivered 28 Nov**, except: not yet added to an assistant, CPU time not read |
| 2 | Trust pages and public code | `/mcp/privacy` and `/mcp/terms` on the site; the code repository public | Owner creates the repository | Pages built 28 Nov; repository not public |
| 3 | Automation page, first version | The page as designed, with account connection marked "Coming" | Owner signs off the design and wording | **Built 28 Nov** on a branch; awaits merge and wording sign-off |
| 4 | Ask Google | A written question to the Ads API compliance team about our use; brand verification started for the Cloud project | Owner sends it from the company's Google account | Not started |
| 5 | Sign-in on our server | Users can sign in and manage connections; access stored encrypted; tested with test users | Owner approves one more package and a storage binding | Not started |
| 6 | GA4 and AdMob tools | Read tools over the user's own properties, with the traps handled; Google verification submitted and passed | Phase 5; Google's review | Not started |
| 7 | RevenueCat | A read-only key first; RevenueCat's own sign-in if they register us | Phase 5 | Not started |
| 8 | Google Ads connector | An open-source connector the user runs; one command; reads only | Phase 4's answer decides whether a hosted version is ever built | Not started |
| 9 | Listings | Submitted to Claude and ChatGPT; a Gemini extension in the repository | Phases 5 to 7 live; owner does the sign-ups | Not started |
| 10 | More platforms | Meta, TikTok, Google Play, App Store Connect, one at a time | Each tested against real accounts first | Not started |

### Phase 1: deploy (the server is already built)

1. Create the Worker route and a proxied DNS record for `mcp.e2eapp.com`.
2. Before the first deploy: make sure request bodies are not logged; set the
   web origins allowed to call the server; add a per-address rate limit.
3. Deploy. Run `node scripts/smoke.mjs https://mcp.e2eapp.com/mcp`.
4. Add it to Claude as a custom connector and call each tool once. Add it to
   ChatGPT if the owner's plan allows.
5. Read CPU time per call from Cloudflare. The free plan allows 10 ms.

### Phase 5: sign-in on our server

- Cloudflare's OAuth provider package makes the Worker the sign-in authority
  for the assistant and hands the user to Google. It keeps grants in a KV
  store, hashes tokens and encrypts what it holds for each user. This is one
  new package and one storage binding: ask the owner first.
- The Google client secret is a Worker secret, never a plain variable.
- Assistants' callback addresses are allow-listed exactly.
- A connections page: connect, choose properties, disconnect. Disconnect
  deletes the stored access and revokes it at Google.

### Phase 6: what the benchmark already taught

From the read-only benchmark of 28 November (results kept privately):

- AdMob: total ad revenue comes from the mediation report. The network report
  covers the AdMob network only.
- GA4: ask with an explicit row limit; the default stops at 10,000 rows
  without saying so. State the property's time zone and currency.
- Recent days still change. Say so when a window ends less than four days ago.

### Phase 9: what each listing asks for

| | Claude directory | ChatGPT |
| --- | --- | --- |
| Sign-in | OAuth 2.0 with PKCE | OAuth 2.1 with PKCE |
| Every tool | A title and a read-only or destructive mark (done) | Its security scheme declared |
| Pages | Documentation, privacy policy, support contact, icon | Website, support, privacy, terms |
| For the reviewer | Test access by email if asked | A test account that needs no second factor; five positive and three negative test cases; a video |
| Who submits | Any paid Claude plan | A verified organisation |

A listing is for being found. Anyone can add the server by its address from
phase 1 onwards.

### What phases 1 to 3 delivered

- The server runs in the Cloudflare account that holds the site's domain,
  the owner's choice, since only that account can create `mcp.e2eapp.com`.
- Before going live it gained: a list of sites allowed to call it from a
  browser, a 64 KB limit on a request, and a limit of 600 requests a minute
  per address (high on purpose: assistants share addresses). It logs nothing
  a caller sends.
- `src/data/automation.ts` holds one switch for the server and one for
  account connection. The page is published with the server "live" and
  accounts "coming": the address, Copy and the two Add buttons show; every
  platform row reads "Coming" or "Next"; the connections panel is labelled
  "Preview". A test fails the build if a platform is marked available while
  accounts are "coming".
- The heading "Three steps, about five minutes" from the design became "Three
  steps to start": the five minutes was never measured.

## Decisions that are the owner's

1. Two lanes as above, or wait for Google's answer before building any
   account access.
2. Whether "Free to use" on the page is right for the first version.
3. Which Google account owns the Cloud project and the verification.
4. Whether the code repository is public before or after the rules are read.
5. The wording of the page, and of the privacy and terms pages.

## Verification

Phase 1, run 28 November 2026 against `https://mcp.e2eapp.com/mcp`: all 27
checks in `scripts/smoke.mjs` pass (every tool listed and called, both
protocol forms, a browser request from an unlisted site refused, from the
assistants' sites accepted, an oversized request refused). Locally, 700 quick
requests gave 600 answers and 100 refusals.

Phase 3: the site builds; 199 tests pass and 1 is skipped by design (it
applies only when the server is marked "coming"); the contrast check passes in
both themes; the page was looked at in screenshots at 1440px in both themes
and at 390px.

Each later phase's check is in its "Done looks like" column. Also true today:
the server passes 22 checks run locally; the tools pass 20 tests; the
read-only guard used in the benchmark is tested against a recording server.

## Stated limits

- The design shows the finished state. The published page shows account
  connection as "Coming".
- The live server has not yet been added to Claude or ChatGPT by a person,
  and its CPU time per call has not been read.
- The rule sets it serves were distilled from the owner's material and have
  not been read line by line by him.
- Google's review times are Google's estimates. The 100-user cap applies
  until verification passes.
- Whether the GA4 and AdMob permissions need the lighter or the heavier
  review is not known until the Cloud Console shows it. The heavier one
  includes a yearly security assessment.
- Whether Claude's directory will list a server that reads other companies'
  platforms is not known. Adding by address does not depend on it.
- Which ChatGPT plans can add a custom server may have changed; re-read
  before the page names them.
- Hosting stays on the free plan only while calls stay under its limits; KV
  storage has its own free allowance. Neither is measured yet.

## Sources

- Google Ads developer policies: https://support.google.com/adspolicy/answer/6169371
- Google Ads announcement, 31 August 2026: https://developers.google.com/ads/blog/posts/2026/08/making-google-ads-more-secure-with
- Google Ads access levels: https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- Google OAuth verification: https://support.google.com/cloud/answer/13463817 and https://support.google.com/cloud/answer/15549945
- AdMob API quotas: https://developers.google.com/admob/api/quotas
- GA4 Data API quotas: https://developers.google.com/analytics/devguides/reporting/data/v1/quotas
- RevenueCat sign-in for third parties: https://www.revenuecat.com/docs/projects/oauth-setup
- Claude connector submission: https://claude.com/docs/connectors/building/submission
- Claude custom connectors: https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp
- ChatGPT app submission: https://developers.openai.com/apps-sdk/deploy/submission
- ChatGPT custom servers: https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta
- Cloudflare MCP authorization: https://developers.cloudflare.com/agents/model-context-protocol/authorization/

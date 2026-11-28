# E2E Apps MCP: implementation plan

**Status: in progress. Phases 0 and 1 delivered 28 November 2026; phase 2 part-built the same day (four of the knowledge tools, awaiting the owner's read). Phase 3 is gated on the owner's answer about packages; phase 4 on his go-ahead to deploy.**

## Context

The Automation page sells one thing: a growth stack (ad platforms, analytics,
subscriptions, stores) connected to Claude or ChatGPT, so a question asked in
plain words gets an answer with the source figures attached. The owner wants
E2E Apps to have its own MCP server that anyone can add to an assistant.

Official or community servers already exist for the platforms the owner uses
(Google Ads, GA4, RevenueCat, AdMob, Google Play). Rebuilding them adds
nothing. What only E2E Apps has is its method: the payback model, the audit
checks and what audits keep finding.

## Approach, and why it beat the alternatives

The server holds **method tools only**. It signs in to nothing, holds no keys,
stores nothing and makes no outbound request. The assistant is the hub: it
reads spend from the Google Ads server and renewals from the RevenueCat server,
then passes those numbers to our `payback_calculate`.

| Option | What it means | Verdict |
| --- | --- | --- |
| Method tools beside the platform servers | Our server computes; the assistant fetches | **Chosen.** Public, free to host, no client credentials at risk |
| Adapters the client runs | Code for platforms with no official server, run with the client's own keys | Later, in the stack kit |
| One gateway for every platform | Our server calls every platform API and stores every client's tokens | Rejected for the public server. It needs sign-in, token storage and an app review per platform, and makes us responsible for other companies' ad accounts. Only as a paid managed setup |

MCP servers do not call each other. "Integrating" a platform always means our
code calling that platform's API with a credential, which is exactly what the
chosen option avoids.

## How it works

```
                 Claude / ChatGPT / Gemini
     ┌──────────┬──────────┴─────┬───────────────┐
 Google Ads    GA4          RevenueCat      E2E Apps MCP
 (their data)  (their data) (their data)    (method, no data)
```

- **Code:** a separate repository, `e2e-apps-mcp`. Tools are pure functions in
  `src/tools/`, one file each, listed in `src/tools/index.ts`. The server file
  only wraps that list, so tools are tested without a server.
- **Protocol:** MCP revision 2026-07-28 (read 28 November 2026). That revision
  is stateless: no `initialize` handshake and no session id; every call is one
  HTTP POST. Servers must implement `server/discover` and validate `Origin`.
- **Host:** a Cloudflare Worker at `mcp.e2eapp.com`. Cloudflare documents a
  stateless handler (`createMcpHandler`) that needs no Durable Object and, by
  default, still answers clients on the earlier revisions.
- **Data:** generated from the site's own published data by
  `scripts/sync-from-site.mjs`. The site stays the source of truth.

## Phases

| # | Phase | Done looks like | Gate | Status |
| --- | --- | --- | --- | --- |
| 0 | Research | Current spec revision, hosting route and library read from the primary pages, not from memory | none | **Delivered 28 Nov** |
| 1 | Core tools, no server | `payback_calculate` and `common_faults` with tests; no packages | none | **Delivered 28 Nov** |
| 2 | Knowledge into tools | Rule tools from the owner's knowledge, three reviewers that take the user's own setup, and four saved prompts | Owner reads every distilled file before the repository is published | **Part-built 28 Nov**: `audit_checklist`, `ios_google_ads_measurement`, `google_ads_scaling_rules`, `ad_monetization_checks`. Reviewers and prompts not started |
| 3 | The server | Worker file wrapping the tool list; called locally with an MCP inspector; every tool answers | **Owner approves the packages** (below) | Blocked on owner |
| 4 | Deploy | Live at `mcp.e2eapp.com`; added to Claude by address and each tool called once; CPU time per call measured | **Owner approves the DNS record and the deploy** | Not started |
| 5 | Site | Automation card changes from "Coming" to the address; short privacy and terms pages for the server | Phase 4 live | Not started |
| 6 | Stack kit | Example configs for the official servers, a setup guide per platform, the saved prompts as files, a status table | none | Not started |
| 7 | Listings | Submitted to the Claude directory and ChatGPT; a Gemini CLI extension manifest in the repo | Owner does the sign-ups and accepts each vendor's terms | Not started |

### Phase 0: what the research found

- The protocol changed on 28 July 2026. A server written from older knowledge
  (handshake, session header, GET stream) would be a legacy server on day one.
- Cloudflare's handler takes a function that builds a fresh server per
  request. No Durable Object, session or WebSocket.
- `tools/list` results now need `ttlMs` and `cacheScope`; a library handles
  that, hand-written code would have to track it.

### Phase 1: what was built

- `payback_calculate`: the model behind `/payback-calculator`, kept expression
  for expression. Inputs for a subscription app or an ad-monetised app; omitted
  inputs use the calculator's example scenario. Returns the payback day,
  revenue and surplus per install at the horizon, the assumptions, and, on
  request, the daily series. Bad inputs return a list of issues, never `NaN`.
- `common_faults`: the nine published faults, most common first, each with
  what it does to the numbers and the service that fixes it. How often is in
  the page's own words. No count is published.

### Phase 2: where the knowledge comes from

| Source | What it holds | State |
| --- | --- | --- |
| The site's own data | Findings, services, mistakes and fixes per service page | In the repo |
| Earlier account archive | Audit, tracking-plan and iOS work up to 2 September 2026 | Already on the owner's machine, searchable |
| Newer account export | Work after 2 September | Owner must download it; the links only open when signed in to that account |
| The working folder for two apps | Measurement traps, anomaly rules, subscription rules, event-audit gap taxonomy | On the owner's machine |

Rules for this phase:

1. **Distil, do not copy.** Output is generic rules, checklists and templates.
2. **Own work only.** The working folder also holds a licensed prompt library,
   rules from named consultants and notes from a newsletter. None of that goes
   into a public tool.
3. **Anonymous by construction.** No client, app, bundle id, account id or
   revenue figure. A script scans the output for known names and fails on a
   match.
4. **Private source, public result.** Source material stays in a folder
   outside every repository.

### Phase 2: what was built on 28 November

| Tool | Built from | Size |
| --- | --- | --- |
| `audit_checklist` | The mistakes and fixes published on the five service pages | 5 areas, 37 checks |
| `ios_google_ads_measurement` | The owner's earlier work on ODM, ICM, several MMPs together, SDK start order, web-to-app, the tracking plan and server-side renewals | 61 rules in 9 topics |
| `google_ads_scaling_rules` | Advice the owner received on scaling Google Ads app campaigns, paraphrased | 57 rules in 8 topics |
| `ad_monetization_checks` | An ad-monetisation audit method the owner received and replicated, paraphrased | 73 rules in 13 topics |

How a rule set is made: a private distilled file holds each rule with why, how
to check it, a confidence mark and a pointer to where it came from.
`scripts/build-knowledge.mjs` publishes only the rules marked "stated", drops
the pointer, and fails if private wording or a listed name is left in. Rules
that were someone's reading without a source behind it, and everything filed
as uncertain or conflicting, stay private: 40 rules across the three sets.

The owner decided on 28 November that advice from his two consultants may be
used. It is paraphrased as method; no person, app or account figure is in it.

Still to do in this phase:

- The owner reads the three distilled files. Nothing is published before that.
- A names list beside the distilled files, so the build can scan for clients
  and apps by name.
- SKAN and AdAttributionKit have too little material for a rule topic yet.
- The three reviewers (`skan_schema_review`, `att_timing_review`,
  `tracking_plan_review`) and the saved prompts.

### Phase 3: the packages question

The owner's rule is no new package without asking. Two ways to write the
server:

| | Packages | Upkeep |
| --- | --- | --- |
| Cloudflare's handler with the official MCP library | `agents`, `@modelcontextprotocol/server`, `zod`; `wrangler` to deploy | The library tracks protocol changes |
| Hand-written request handling | none; `wrangler` to deploy | We track every protocol change ourselves |

Recommendation: the library. The protocol changed four months ago and will
change again; other people's assistants must be able to trust this server. The
packages live in the MCP repository only. The site stays at zero.

## Verification

- Phases 1 and 2, run 28 November 2026: 18 tests pass. Besides the items below: every rule tool returns its topics with no filter and its rules by topic, and no published rule carries a source pointer, a person, a dollar figure or a file path.
  - Subscription example pays back on day 277; ad example on day 122. Both are
    the figures the site publishes.
  - 400 random scenarios per model give the same payback day, revenue, surplus
    and revenue-over-spend as the site's model.
  - No tool result contains an audit count.
  - The source makes no outbound request and reads no environment variable.
- Each later phase lists its own check in the table above.

## Stated limits

- Nothing is hosted. There is no address to add to an assistant yet.
- The three reviewers do not exist yet; the Automation page says "Coming".
- The iOS rules are a snapshot of 2026 vendor behaviour (SDK versions, beta
  programmes). Each answer says so; the rules need a re-read against current
  vendor documentation before release and on a schedule after it.
- Hosting cost is expected to be nil on the Workers free plan (100,000
  requests a day, 10 ms of CPU per request, read from Cloudflare's pricing
  page on 28 November 2026). That is an expectation until phase 4 measures it.
- Whether Meta, TikTok, Google Play and App Store Connect have official
  servers has not been checked. Phase 6 checks it.
- Paid tiers are not part of these phases.

## Critical files

| File | Role |
| --- | --- |
| `e2e-apps-mcp/src/tools/index.ts` | The tool list the server exposes |
| `e2e-apps-mcp/src/tools/payback.ts` | The payback model |
| `e2e-apps-mcp/scripts/sync-from-site.mjs` | Regenerates tool data from this site |
| `e2e-apps-mcp/test/tools.test.ts` | Golden figures and parity with the site |
| `src/scripts/calc-model.ts`, `src/scripts/payback-model.ts` (this repo) | Source of truth for the model. Do not edit |
| `src/data/findings.ts` (this repo) | Source of truth for the faults |
| `src/data/automation.ts` (this repo) | `OFFER[1].soon` controls the "Coming" tag |

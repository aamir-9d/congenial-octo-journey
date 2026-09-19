/**
 * The automation offering.
 *
 * One source for the homepage section and the /automation page, for the same
 * reason the FAQ and the case study have one: a capability claim that appears
 * twice in two wordings eventually disagrees with itself, and this is the part
 * of the site most likely to be read by someone deciding whether to hand over
 * account access.
 *
 * Every boundary below was checked against the providers' own documentation on
 * 19 September 2026 and is stated as a limit, not a roadmap. Two of them matter
 * commercially:
 *
 *   The official Google Ads MCP server is READ-ONLY. It cannot change a bid,
 *   pause a campaign, or create an asset. Anything that writes needs a
 *   separately authorised API path.
 *
 *   There is no official Google-maintained AdMob MCP server. Community ones
 *   exist and have not been evaluated here, so the honest description is an
 *   audited adapter over the documented REST API.
 *
 * Nothing on this page may describe an unattended service. An MCP connection in
 * a chat is not a scheduler: that needs job execution, retries, deduplication,
 * source snapshots and failure reporting, none of which exists yet.
 */

export interface Platform {
  name: string;
  /** What can be done today, through a route that has been verified to exist. */
  scope: string;
  /** The limit, stated plainly. This is the column that protects the client. */
  boundary: string;
}

export const PLATFORMS: Platform[] = [
  {
    name: 'Google Ads',
    scope:
      'Account discovery, campaign and asset reporting, budget and status inspection, and GAQL queries, through the official MCP server.',
    boundary:
      'Read-only. It cannot change bids, pause campaigns or create assets — those need a separately authorised API path with its own approval record.',
  },
  {
    name: 'AdMob',
    scope:
      'Apps, ad units and mediation groups, plus network and mediation reporting — impressions, eCPM, match rate and estimated earnings by country, app and ad unit.',
    boundary:
      'Through an audited adapter over the documented REST API. There is no official Google-maintained MCP server for AdMob, and each management operation is validated individually before it is offered.',
  },
  {
    name: 'RevenueCat',
    scope:
      'Projects, products, offerings and subscription analytics through the official hosted MCP server — trials, renewals, refunds and billing issues.',
    boundary:
      'It also exposes configuration changes. Only the tools a given engagement needs are enabled, scoped to named projects.',
  },
];

/** The five stages of one investigation, each named by what it produces. */
export const STAGES = [
  {
    n: '01',
    title: 'Connect',
    body: 'Named accounts only, with access you grant and can revoke. Restrictions are enforced in the tools, not in an instruction.',
  },
  {
    n: '02',
    title: 'Validate',
    body: 'Dates, currencies, account mappings and data freshness are checked before a single number is quoted.',
  },
  {
    n: '03',
    title: 'Explain',
    body: 'A written finding with the source figures attached — and the unknowns named, rather than smoothed over.',
  },
  {
    n: '04',
    title: 'Propose',
    body: 'Any supported change is presented for approval. Nothing touches an account without a decision behind it.',
  },
  {
    n: '05',
    title: 'Record',
    body: 'What was changed, by whom, and what happened afterwards. The part that makes the next investigation faster.',
  },
] as const;

/** Worked examples. Deliberately questions, not dashboards. */
export const EXAMPLES = [
  {
    q: 'What changed in spend, ad earnings and subscription revenue last week?',
    a: 'One brief across all three sources, with the periods and currencies reconciled and the joins that do not exist called out.',
  },
  {
    q: 'Why did estimated earnings drop on Tuesday?',
    a: 'Broken down through impressions, eCPM, match rate, country, app and ad unit until the change has a named cause.',
  },
  {
    q: 'Which campaigns moved after the paywall change?',
    a: 'Campaign reporting beside subscription events, with an explicit statement of what attribution can and cannot support.',
  },
] as const;

/**
 * The arithmetic trap, stated on the page rather than only in a document.
 *
 * It is the most common way a cross-source report is wrong, and saying it out
 * loud is also the argument for the service.
 */
export const CAVEAT =
  'Google Ads conversion value often already represents revenue that also appears in RevenueCat or in ad earnings. Summing the dashboards double-counts it. And a shared date or country is not an attribution key: without impression-level revenue or an MMP join, the honest output is an aggregate comparison and a stated limitation, not a ROAS figure.';

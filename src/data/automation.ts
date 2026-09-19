/**
 * The automation offering.
 *
 * One source for the /automation page and the homepage section. Revision 2 of
 * the brief expanded it to four sources and three assistants, and — more
 * importantly — required that every number a finding states can be derived from
 * the data the chart actually shows.
 *
 * ── The accuracy rule, and why it needed its own rule ─────────────────────
 *
 * The first build failed this on all three states. The spend chart drew one
 * period while its finding claimed a week-on-week delta; the earnings chart
 * drew daily revenue while its finding explained the drop with impressions and
 * eCPM; the subscriptions chart drew renewals while its finding asserted that
 * trials were flat. All three read plausibly and none of them was checkable,
 * which on a page arguing for measurement rigour is the worst possible defect.
 *
 * So: every figure quoted in a `finding` is computed from that example's own
 * `chart` data, and `tests/investigation.test.ts` recomputes them. Anything the
 * data cannot support belongs in `next` as a check to run, not in a finding as
 * a conclusion.
 *
 * ── The data is invented ─────────────────────────────────────────────────
 *
 * Labelled "Sample data" on every state. Not a client's, not redacted, not
 * measured. Internally consistent so the demonstration does not contradict
 * itself, and illustrative all the same.
 *
 * ── Capability limits ────────────────────────────────────────────────────
 *
 * Kept beside each example rather than buried, per the brief. The expensive
 * ones stay stated: the official Google Ads MCP server is read-only, the
 * official Google Analytics MCP server serves reporting reads and does not edit
 * Analytics configuration, and there is no official Google-maintained AdMob MCP
 * server.
 */

/** Four connected sources. GA4 covers the behaviour gap between the other three. */
export const SOURCES = [
  { name: 'Google Ads', note: 'Campaigns · spend' },
  { name: 'GA4', note: 'Events · funnels' },
  { name: 'AdMob', note: 'Impressions · earnings' },
  { name: 'RevenueCat', note: 'Trials · renewals' },
] as const;

/**
 * Three assistant options, presented equally.
 *
 * These are compatibility labels, not a live switch — nothing in the
 * demonstration changes when a visitor reads a different name, and pretending
 * otherwise would be inventing provider output. The setup genuinely differs per
 * provider, which is why each carries its own route rather than one shared
 * sentence.
 */
export const ASSISTANTS = [
  { name: 'Claude', route: 'A supported MCP client or API integration.' },
  { name: 'ChatGPT', route: 'An MCP app, or GPT models through the Responses API.' },
  { name: 'Gemini', route: 'The Gemini CLI, or the Gemini API with a confirmed transport.' },
] as const;

export type ChartKind = 'paired' | 'funnel' | 'trend' | 'periods';

export interface ChartPoint {
  label: string;
  /** Current value. For `paired`, the later of the two periods. */
  v: number;
  /** Earlier period. `paired` only. */
  prev?: number;
}

export interface Chart {
  kind: ChartKind;
  /** What is being counted, e.g. "Spend" or "Users". */
  measure: string;
  caption: string;
  prefix?: string;
  points: ChartPoint[];
  /** Index the finding is about. Drawn in amber. */
  focus: number;
  /** For `trend`: where the level shifts, so the two averages are visible. */
  splitAfter?: number;
}

export interface ExampleState {
  id: 'spend' | 'behaviour' | 'earnings' | 'subs';
  tab: string;
  question: string;
  source: string;
  period: string;
  chart: Chart;
  /** Both must be derivable from `chart`. Tested. */
  findings: [string, string];
  /** A check to run. This is where anything the data cannot show belongs. */
  next: string;
  /** The measurement basis — what the numbers are, so they can be argued with. */
  basis: string;
  limit: string;
}

export const EXAMPLES: ExampleState[] = [
  {
    id: 'spend',
    tab: 'Spend',
    question: 'Which campaigns spent more this week?',
    source: 'Google Ads',
    period: 'Last 7 days vs the 7 before',
    chart: {
      kind: 'paired',
      measure: 'Spend',
      caption: 'Spend by campaign, previous week and this week',
      prefix: '$',
      points: [
        { label: 'US · Search', prev: 3980, v: 4120 },
        { label: 'US · UAC', prev: 6720, v: 9860 },
        { label: 'DE · UAC', prev: 2310, v: 2240 },
        { label: 'BR · UAC', prev: 1900, v: 1980 },
        { label: 'IN · UAC', prev: 1520, v: 1410 },
      ],
      focus: 1,
    },
    findings: [
      'US · UAC rose $3,140, from $6,720 to $9,860 — nearly all of the $3,180 net increase across the five campaigns.',
      'DE and IN each spent less than the week before, by $70 and $110, so the rise is concentrated rather than portfolio-wide.',
    ],
    next: 'Pull installs and cost per install for US · UAC. Spend alone cannot say whether this bought more volume or a worse auction.',
    basis: 'Campaign-level cost, two consecutive 7-day windows, account currency.',
    limit:
      'Reporting only. The official Google Ads MCP server is read-only — a budget change is a separate authorised step.',
  },
  {
    id: 'behaviour',
    tab: 'User behavior',
    question: 'Where are users dropping out of onboarding?',
    source: 'GA4',
    period: 'Last 28 days',
    chart: {
      kind: 'funnel',
      measure: 'Users',
      caption: 'Onboarding funnel, users reaching each step',
      points: [
        { label: 'app_open', v: 12400 },
        { label: 'onboarding_start', v: 9920 },
        { label: 'permission_granted', v: 6150 },
        { label: 'profile_created', v: 5780 },
        { label: 'first_action', v: 5510 },
      ],
      focus: 2,
    },
    findings: [
      'The permission step loses the most: 3,770 of the 9,920 who start onboarding never reach it — 38%.',
      'The two steps after it hold at 94% and 95%, so once permission is granted the rest of the funnel is not the problem.',
    ],
    next: 'Look at what the permission prompt says and when it fires. The counts locate the step; they do not explain the refusal.',
    basis:
      'A GA4 funnel exploration over five ordered events, one row per user, 28-day window, users counted once at their furthest step.',
    limit:
      'The official Google Analytics MCP server serves reporting reads. It does not edit Analytics configuration, so the events have to exist before they can be read.',
  },
  {
    id: 'earnings',
    tab: 'Ad earnings',
    question: 'What moved ad revenue?',
    source: 'AdMob',
    period: 'Last 7 days',
    chart: {
      kind: 'trend',
      measure: 'Estimated earnings',
      caption: 'Estimated earnings per day',
      prefix: '$',
      points: [
        { label: 'Mon', v: 1840 },
        { label: 'Tue', v: 1795 },
        { label: 'Wed', v: 1810 },
        { label: 'Thu', v: 1402 },
        { label: 'Fri', v: 1388 },
        { label: 'Sat', v: 1421 },
        { label: 'Sun', v: 1396 },
      ],
      focus: 3,
      splitAfter: 2,
    },
    findings: [
      'Earnings stepped down on Thursday: $1,815 a day on average Monday to Wednesday, $1,402 from Thursday on — a 23% fall.',
      'It has held at the lower level for four consecutive days, so this is a level change rather than one bad day.',
    ],
    next: 'Break the four days down by country and ad unit, and pull impressions alongside eCPM — the daily total cannot separate a price change from a fill change.',
    basis: 'Estimated earnings by day, publisher account total, account currency.',
    limit:
      'Through an audited adapter over the documented REST API. There is no official Google-maintained AdMob MCP server.',
  },
  {
    id: 'subs',
    tab: 'Subscriptions',
    question: 'How are renewals changing?',
    source: 'RevenueCat',
    period: 'Four consecutive weeks',
    chart: {
      kind: 'periods',
      measure: 'Renewals',
      caption: 'Renewals per week',
      points: [
        { label: 'Week 1', v: 1265 },
        { label: 'Week 2', v: 1298 },
        { label: 'Week 3', v: 1184 },
        { label: 'Week 4', v: 1042 },
      ],
      focus: 3,
    },
    findings: [
      'Renewals fell 12% week on week, 1,184 to 1,042, and are 17.6% below week one.',
      'The fall runs across the last two weeks rather than a single one — week three was already down 8.8% on week two.',
    ],
    next: 'Separate billing-retry and grace-period states from real cancellations before reading any of this as churn.',
    basis: 'Renewal transactions per calendar week, one project, four consecutive weeks.',
    limit:
      'Subscription events are per project. Tying them to a campaign needs an MMP or impression-level join that may not exist.',
  },
];

/** Connect → Investigate → Review. */
export const STEPS = [
  {
    n: '01',
    title: 'Connect',
    body: 'Read access to the accounts you name, revocable at any time.',
  },
  {
    n: '02',
    title: 'Investigate',
    body: 'Ask a question. Get an answer with its source figures and its unknowns.',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Anything that would change an account is written up for your decision.',
  },
] as const;

/** Four outcomes, one per source. */
export const OUTCOMES = [
  { title: 'Spend', body: 'What moved across campaigns and markets, without three exports first.' },
  { title: 'User behavior', body: 'Which onboarding step loses people, with the event basis stated.' },
  { title: 'Ad earnings', body: 'A revenue change traced to the day, country and ad unit behind it.' },
  { title: 'Subscriptions', body: 'A cancellation told apart from a failed payment, before either becomes churn.' },
] as const;

export interface Disclosure {
  label: string;
  body: string[];
}

export const DISCLOSURES: Disclosure[] = [
  {
    label: 'Supported connections',
    body: [
      'Google Ads connects through the official MCP server, which is read-only: account discovery, campaign and asset reporting, budget and status inspection, and GAQL queries. It cannot change bids, pause campaigns or create assets.',
      'GA4 connects through the official Google Analytics MCP server, which serves reporting requests. It does not edit Analytics configuration, so events and funnels must already be defined in the property.',
      'AdMob connects through an audited adapter over the documented REST API — apps, ad units, mediation groups, and network and mediation reporting. There is no official Google-maintained MCP server for AdMob, and each operation is validated before it is offered.',
      'RevenueCat connects through its official hosted MCP server: projects, products, offerings and subscription analytics. It also exposes configuration changes, so only the tools an engagement needs are enabled, scoped to named projects.',
      'Assistant side: Claude through a supported MCP client or API integration; ChatGPT through an MCP app or GPT models via the Responses API; Gemini through the Gemini CLI or the Gemini API with a confirmed transport. These are not the same setup, and we scope whichever you already use rather than assuming one process works everywhere.',
    ],
  },
  {
    label: 'Access and approvals',
    body: [
      'Access is granted to named accounts — your Google Ads customer IDs, your GA4 properties, your AdMob publisher account, your RevenueCat projects — and can be withdrawn at any time.',
      'Credentials are held by us as the operator. There is no self-serve connection: this is a consulting engagement, and a connect button would promise something nothing behind it can keep.',
      'Restrictions are enforced in the tools and the backend authorisation, not by instructing a model to stay inside them. A prompt is not an access boundary.',
      'Anything that writes to an account runs through a separately authorised path with its own approval record, never as a side effect of asking a question. Scheduled reporting is kept separate from it, and an assistant connection is not an unattended service — that needs job execution, retries, deduplication, source snapshots and failure reporting.',
    ],
  },
  {
    label: 'Data and reporting definitions',
    body: [
      'Before any figure is quoted, the reporting timezone, currency, account scope and data freshness are checked, and each app is mapped explicitly to its Google Ads customer, GA4 property, AdMob app and RevenueCat project.',
      'Cross-source comparison needs compatible dates, currencies, account scope and metric definitions. These four platforms do not reconcile by default, and where they cannot be joined honestly the report says so.',
      'Dashboards are not summed. Google Ads conversion value frequently already represents revenue that also appears in RevenueCat or in ad earnings, so adding them double-counts it.',
      'A shared date or country is not an attribution key. Campaign and cohort profitability needs an MMP, BigQuery or impression-level revenue with a legitimate join. Without one, the output is an aggregate comparison and a stated limitation rather than a ROAS figure.',
      'An investigation can end without a definite cause. When the data does not support one, that is what the write-up says.',
    ],
  },
];

/** The homepage section. Copy lives here so both surfaces cannot drift. */
export const TEASER = {
  eyebrow: 'AI reporting & automation',
  heading: 'Your growth stack. Your choice of AI.',
  body: 'Bring Google Ads, GA4, AdMob and RevenueCat into one reporting workflow. Investigate spend, user behavior and revenue with Claude, ChatGPT or Gemini.',
  primary: 'Explore automation',
  secondary: 'Discuss your setup',
  note: 'Connections are configured around your accounts and reporting needs. Reporting and investigation first — anything that would change an account is written up for your decision.',
} as const;

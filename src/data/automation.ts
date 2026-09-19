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
  /** Selector label. */
  tab: string;
  /** The single source this example draws on. */
  source: string;
  question: string;
  period: string;
  chart: Chart;
  /** The headline movement, set large beside the chart. Derivable. Tested. */
  change: { value: string; note: string };
  /** One concise finding, per the approved layout. Derivable. Tested. */
  finding: string;
  /** A check to run. Anything the data cannot show belongs here, not above. */
  next: string;
  /** Measurement basis and qualifications, behind "View method". */
  method: string[];
  limit: string;
}

export const EXAMPLES: ExampleState[] = [
  {
    id: 'spend',
    tab: 'Ad spend',
    source: 'Google Ads',
    question: 'Where did the extra ad spend go?',
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
    change: { value: '+$3,140', note: 'in this campaign' },
    finding: 'US · UAC rose from $6,720 to $9,860 — an increase of $3,140 in one campaign.',
    next: 'Check installs and cost per install before increasing the budget.',
    method: [
      'Campaign-level cost, two consecutive 7-day windows, account currency.',
      'Across all five campaigns the net increase was $3,180, so this one accounts for nearly all of it.',
      'DE and IN each spent less than the week before, by $70 and $110, so the increase is concentrated rather than portfolio-wide.',
      'Spend alone cannot say whether this bought more volume or a worse auction.',
    ],
    limit:
      'Reporting only. The official Google Ads MCP server is read-only — a budget change is a separate authorised step.',
  },
  {
    id: 'behaviour',
    tab: 'User behavior',
    source: 'GA4',
    question: 'Where are users dropping out of onboarding?',
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
    change: { value: '3,770 lost', note: 'at the permission step, 38%' },
    finding:
      'The permission step loses the most: 3,770 of the 9,920 who start onboarding never reach it.',
    next: 'Read what the permission prompt says, and when in the session it fires.',
    method: [
      'A GA4 funnel exploration over five ordered events, one row per user, 28-day window, each user counted once at their furthest step.',
      'The two steps after it hold at 94% and 95%, so once permission is granted the rest of the funnel is not the problem.',
      'The counts locate the step. They do not explain the refusal.',
    ],
    limit:
      'The official Google Analytics MCP server serves reporting reads. It does not edit Analytics configuration, so the events have to exist before they can be read.',
  },
  {
    id: 'earnings',
    tab: 'Ad earnings',
    source: 'AdMob',
    question: 'What moved ad revenue?',
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
    change: { value: '\u2212$413 / day', note: 'a 23% fall' },
    finding:
      'Earnings stepped down on Thursday: $1,815 a day Monday to Wednesday, $1,402 from Thursday on.',
    next: 'Break the four days down by country and ad unit, with impressions beside eCPM.',
    method: [
      'Estimated earnings by day, publisher account total, account currency.',
      'It has held at the lower level for four consecutive days, so this reads as a level change rather than one bad day.',
      'A daily total cannot separate a price change from a fill change.',
    ],
    limit:
      'Through an audited adapter over the documented REST API. There is no official Google-maintained AdMob MCP server.',
  },
  {
    id: 'subs',
    tab: 'Subscriptions',
    source: 'RevenueCat',
    question: 'How are renewals changing?',
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
    change: { value: '\u2212142 renewals', note: 'week on week, \u221212%' },
    finding: 'Renewals fell from 1,184 to 1,042 week on week, and are 17.6% below week one.',
    next: 'Separate billing-retry and grace-period states from real cancellations before reading this as churn.',
    method: [
      'Renewal transactions per calendar week, one project, four consecutive weeks.',
      'The fall runs across the last two weeks rather than a single one — week three was already down 8.8% on week two.',
    ],
    limit:
      'Subscription events are per project. Tying them to a campaign needs an MMP or impression-level join that may not exist.',
  },
];

/** Connect → Investigate → Review. */
export const STEPS = [
  {
    n: '01',
    title: 'Connect',
    body: 'Choose your reporting sources.',
  },
  {
    n: '02',
    title: 'Investigate',
    body: 'Ask a business question.',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Agree on the next action.',
  },
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
/** The homepage section, from homepage-automation-charcoal.png. */
export const TEASER = {
  eyebrow: 'AI reporting & automation',
  heading: ['Your numbers.', 'A clearer picture.'],
  body: 'Ask about spend, user behavior and revenue. Get an answer with the source figures attached.',
  support: 'Use Claude, ChatGPT or Gemini.',
  primary: 'Explore automation',
  sourcesLabel: 'Connected sources',
  note: 'Configured for your reporting needs.',
} as const;

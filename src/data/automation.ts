/**
 * The automation offering.
 *
 * One source for the /automation page and the homepage teaser. The previous
 * version of this file was a prose service description; the 19 September visual
 * audit found the page had 621 words, zero explanatory imagery and almost
 * 5,000px of mobile scrolling, so it is now built around three example states
 * that a visitor can switch between and actually look at.
 *
 * ── On the sample data ────────────────────────────────────────────────────
 *
 * Every figure in EXAMPLES is INVENTED and labelled as such on the page. It is
 * not a client's data, not a redacted capture, and not a measurement. It exists
 * to show the shape of an answer — a question, a series, a sourced finding and
 * a next check.
 *
 * The numbers are internally consistent within each state (the series sums and
 * the deltas agree with the findings) because a demonstration that contradicts
 * itself is worse than no demonstration. They are still illustrative.
 *
 * ── On the capability limits ─────────────────────────────────────────────
 *
 * The audit's instruction was to keep the decision-relevant qualification
 * *beside* the example and move the full technical explanation into labelled
 * disclosures — not to hide it. So each state carries its own one-line `limit`,
 * and DISCLOSURES carries the long form. Two limits are commercially expensive
 * and are stated anyway:
 *
 *   The official Google Ads MCP server is READ-ONLY. It cannot change a bid,
 *   pause a campaign or create an asset.
 *
 *   There is no official Google-maintained AdMob MCP server, so that connection
 *   is an audited adapter over the documented REST API.
 *
 * The audit also flagged two overclaims in the previous copy, both fixed here:
 * "until the change has a named cause" (an investigation may be inconclusive)
 * and "the arithmetic nobody checks" (an unsupported absolute).
 */

export interface Series {
  label: string;
  /** Bars, in order. `v` is plotted; `note` labels the axis. */
  points: { note: string; v: number }[];
  /** Index of the bar the finding is about, highlighted in amber. */
  focus: number;
  /** Unit suffix for the readout, e.g. "$" or "%". */
  unit: string;
  prefix?: string;
}

export interface ExampleState {
  id: 'spend' | 'earnings' | 'subs';
  /** Selector label. Short — it sits in a row of three at 390px. */
  tab: string;
  /** The question a person actually asks. */
  question: string;
  /** Which connected sources this answer draws on. */
  sources: string[];
  period: string;
  chart: Series;
  /** Two brief findings. The first is the answer, the second qualifies it. */
  findings: [string, string];
  /** What a person would do next. Never an automated action. */
  next: string;
  /** The decision-relevant limit, kept beside the example rather than buried. */
  limit: string;
}

export const EXAMPLES: ExampleState[] = [
  {
    id: 'spend',
    tab: 'Spend changes',
    question: 'Which campaigns spent more this week?',
    sources: ['Google Ads'],
    period: 'Last 7 days vs the 7 before',
    chart: {
      label: 'Spend by campaign, week on week',
      unit: '',
      prefix: '$',
      points: [
        { note: 'US · Search', v: 4120 },
        { note: 'US · UAC', v: 9860 },
        { note: 'DE · UAC', v: 2240 },
        { note: 'BR · UAC', v: 1980 },
        { note: 'IN · UAC', v: 1410 },
      ],
      focus: 1,
    },
    findings: [
      'US · UAC took $3,140 more than the week before — 71% of the total increase.',
      'Its cost per install moved with it, so this is more volume rather than a cheaper auction.',
    ],
    next: 'Check whether the extra installs held their day-7 retention before treating the increase as scale.',
    limit:
      'Reporting only. Changing a budget or pausing a campaign is a separate authorised step, never an automatic one.',
  },
  {
    id: 'earnings',
    tab: 'Ad earnings',
    question: 'Why did estimated ad earnings fall?',
    sources: ['AdMob'],
    period: 'Last 7 days',
    chart: {
      label: 'Estimated earnings per day',
      unit: '',
      prefix: '$',
      points: [
        { note: 'Mon', v: 1840 },
        { note: 'Tue', v: 1795 },
        { note: 'Wed', v: 1810 },
        { note: 'Thu', v: 1402 },
        { note: 'Fri', v: 1388 },
        { note: 'Sat', v: 1421 },
        { note: 'Sun', v: 1396 },
      ],
      focus: 3,
    },
    findings: [
      'Impressions held steady. A lower eCPM in two markets accounts for most of the drop from Thursday.',
      'Match rate did not move, so this reads as pricing rather than fill.',
    ],
    next: 'Review the country and ad-unit breakdown for those two markets before changing floors.',
    limit:
      'AdMob reports estimated earnings and impression RPM. They do not on their own establish per-campaign profitability.',
  },
  {
    id: 'subs',
    tab: 'Subscriptions',
    question: 'What changed in renewals and refunds?',
    sources: ['RevenueCat'],
    period: 'Last 4 weeks',
    chart: {
      label: 'Renewals per week',
      unit: '',
      prefix: '',
      points: [
        { note: 'W1', v: 1265 },
        { note: 'W2', v: 1298 },
        { note: 'W3', v: 1184 },
        { note: 'W4', v: 1042 },
      ],
      focus: 3,
    },
    findings: [
      'Renewals fell 12% in week four while new trials were flat.',
      'Billing-issue volume rose over the same period, so some of this may be involuntary rather than cancellation.',
    ],
    next: 'Separate grace-period and billing-retry states from true cancellations before reading it as churn.',
    limit:
      'Subscription events are per project. Tying them to a campaign needs an MMP or impression-level join that may not exist.',
  },
];

/** The three connected sources, as the diagram labels them. */
export const SOURCES = [
  { name: 'Google Ads', note: 'Campaigns, spend, conversions' },
  { name: 'AdMob', note: 'Impressions, eCPM, earnings' },
  { name: 'RevenueCat', note: 'Trials, renewals, refunds' },
] as const;

/** Connect → Investigate → Review. Three steps, replacing five paragraphs. */
export const STEPS = [
  {
    n: '01',
    title: 'Connect',
    body: 'Read access to the accounts you name, granted by you and revocable at any time.',
  },
  {
    n: '02',
    title: 'Investigate',
    body: 'You ask a question. You get an explanation with the source figures attached, and the unknowns named.',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Anything that would change an account is written up for your decision. Nothing runs unattended.',
  },
] as const;

/** Three practical outcomes, one sentence each. */
export const OUTCOMES = [
  {
    title: 'Review spend',
    body: 'See what moved across campaigns and markets without exporting three reports first.',
  },
  {
    title: 'Investigate ad earnings',
    body: 'Trace a drop through impressions, eCPM and match rate to the app and country behind it.',
  },
  {
    title: 'Understand subscription changes',
    body: 'Tell a cancellation apart from a failed payment before either becomes a churn number.',
  },
] as const;

export interface Disclosure {
  label: string;
  body: string[];
}

/**
 * The full technical detail, in labelled disclosures rather than in the flow.
 * Nothing here contradicts or softens a limit stated beside an example.
 */
export const DISCLOSURES: Disclosure[] = [
  {
    label: 'Supported actions',
    body: [
      'Google Ads connects through the official MCP server, which is read-only: account discovery, campaign and asset reporting, budget and status inspection, and GAQL queries. It cannot change bids, pause campaigns or create assets.',
      'AdMob connects through an audited adapter over the documented REST API — apps, ad units, mediation groups, and network and mediation reporting. There is no official Google-maintained MCP server for AdMob, and each management operation is validated individually before it is offered.',
      'RevenueCat connects through its official hosted MCP server: projects, products, offerings and subscription analytics. It also exposes configuration changes, so only the tools a given engagement needs are enabled, scoped to named projects.',
      'Anything that writes to an account runs through a separately authorised path with its own approval record. It is never a side effect of asking a question.',
    ],
  },
  {
    label: 'Access and control',
    body: [
      'Access is granted to named accounts — your Google Ads customer IDs, your AdMob publisher account, your RevenueCat projects — and can be withdrawn at any time.',
      'Credentials are held by us as the operator. There is no self-serve connection here, because this is a consulting engagement rather than a portal, and a connect button would promise something nothing behind it can keep.',
      'Restrictions are enforced in the tools and the backend authorisation, not by instructing a model to stay inside them. A prompt is not an access boundary.',
      'Scheduled reporting is kept separate from anything that changes an account, and an MCP connection in a chat is not an unattended service — that needs job execution, retries, deduplication, source snapshots and failure reporting.',
    ],
  },
  {
    label: 'How we reconcile the numbers',
    body: [
      'Before any figure is quoted, the reporting timezone, currency, account mapping and data freshness are checked, and each app is mapped explicitly to its Google Ads customer, AdMob app and RevenueCat project.',
      'Dashboards are not summed. Google Ads conversion value frequently already represents revenue that also appears in RevenueCat or in ad earnings, so adding them double-counts it.',
      'A shared date or country is not an attribution key. Campaign and cohort profitability needs an MMP, Firebase/BigQuery or impression-level revenue with a legitimate join. Where those are absent, the output is an aggregate comparison and a stated limitation rather than a ROAS figure.',
      'Calendar-period revenue from existing subscribers is not the return on newly acquired users, and is not reported as though it were.',
      'An investigation can end without a definite cause. When the data does not support one, that is what the write-up says.',
    ],
  },
];

/** The homepage teaser, kept here so both surfaces cannot drift apart. */
export const TEASER = {
  heading: 'Your growth stack. One conversation.',
  body: 'Ask what changed across ad spend, ad earnings and subscriptions, and get one explanation with the source figures attached — instead of three exports and a spreadsheet.',
  question: 'Why did ad earnings fall last week?',
  finding: 'Impressions held steady. A lower eCPM in two markets explains most of it.',
  link: 'Explore automation',
  limit: 'Reporting and investigation. Account changes are written up for your decision.',
} as const;

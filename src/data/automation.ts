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

/**
 * The E2E Apps MCP: what is open, and what is not.
 *
 * THE ONE SWITCH. Everything /automation says about the server being usable
 * reads these two flags, so the page cannot claim more than is true:
 *
 *   status    'coming' until the server answers at `address`. While it is
 *             'coming' the header shows the address marked "Opening soon" with
 *             no Copy button and no "Add to…" buttons, and the steps and
 *             answers are written in the future tense.
 *   accounts  'coming' until a visitor can sign in and connect a platform.
 *             While it is 'coming' the connections panel is labelled "Preview"
 *             and shows no row as connected, and every promise about account
 *             access sits under "When account connection opens".
 *
 * Change a flag to 'live' only on the day it is true. Accounts cannot be live
 * before the server is, so `ACCOUNTS_OPEN` needs both.
 */
export const MCP = {
  status: 'coming' as 'coming' | 'live',
  address: 'https://mcp.e2eapp.com/mcp',
  accounts: 'coming' as 'coming' | 'live',
};

export const SERVER_OPEN = MCP.status === 'live';
export const ACCOUNTS_OPEN = SERVER_OPEN && MCP.accounts === 'live';

/** The address without its scheme, as the step card and the panel print it. */
export const MCP_HOST = MCP.address.replace(/^https?:\/\//, '');

/** The date both /mcp/privacy and /mcp/terms print. */
export const MCP_LEGAL_UPDATED = '28 November 2026';

/** The page header. `soon` is the mark on the address while it is not open. */
export const HEADER = {
  label: 'AI reporting & automation · the E2E Apps MCP',
  title: "Your app's growth data, inside Claude and ChatGPT",
  lead: ACCOUNTS_OPEN
    ? 'Add one address. Sign in once. Then ask about ad revenue, user behaviour, subscriptions and spend in plain words, and get the answer with the source figures attached.'
    : SERVER_OPEN
      ? 'Add one address to use our payback calculator, checklists and rule sets from inside your assistant. Signing in to read your own ad revenue, user behaviour, subscriptions and spend is being built and is not open yet.'
      : 'The E2E Apps MCP is one address you will add to Claude or ChatGPT. Sign in once, then ask about ad revenue, user behaviour, subscriptions and spend in plain words, and get the answer with the source figures attached. It is not open yet.',
  soon: 'Opening soon',
  note: SERVER_OPEN
    ? 'Free to use. Read-only. The calculator and checklists work before you connect anything.'
    : 'The server is being opened. Ask, and we will tell you when you can add it. It will be free to use and read-only.',
} as const;

export type PlatformStatus = 'available' | 'coming' | 'next';

export const STATUS_LABEL: Record<PlatformStatus, string> = {
  available: 'Available',
  coming: 'Coming',
  next: 'Next',
};

export interface Platform {
  name: string;
  /** How a visitor connects it. */
  how: string;
  /** 'available' only after it has been tested against real accounts. */
  status: PlatformStatus;
  /** What the server reads from it. Only the first four have this. */
  reads?: string;
}

/**
 * Every platform, once. The status table, the connections panel and the
 * "Your numbers" list are all written from this array.
 *
 * A row becomes 'available' by hand, one at a time, and never while
 * `MCP.accounts` is 'coming' (tests/automation-mcp.test.ts fails the build).
 */
export const PLATFORMS: Platform[] = [
  {
    name: 'Google Ads',
    how: 'Connector on your computer',
    status: 'coming',
    reads: 'Spend, installs and cost per install by campaign and country',
  },
  { name: 'GA4', how: 'Google sign-in', status: 'coming', reads: 'Events, funnels, active users and ad revenue' },
  {
    name: 'AdMob',
    how: 'Google sign-in',
    status: 'coming',
    reads: 'Earnings by network, format and country, every network counted',
  },
  { name: 'RevenueCat', how: 'Read-only key', status: 'coming', reads: 'Trials, conversions, renewals and revenue' },
  { name: 'Meta Ads', how: 'Meta sign-in', status: 'next' },
  { name: 'TikTok Ads', how: 'TikTok sign-in', status: 'next' },
  { name: 'Google Play', how: 'Google sign-in', status: 'next' },
  { name: 'App Store Connect', how: 'Your API key', status: 'next' },
];

/**
 * The connections panel in "Every platform through one connection": a drawing
 * of the page a visitor will connect on. Each row names the platforms it
 * stands for, and takes its status from them, so the drawing cannot show a
 * platform as further along than the table does.
 *
 * `action` and `sample` are what the finished page shows for a platform that
 * is 'available'. Neither is rendered before that.
 */
export const PANEL = [
  {
    title: 'Google',
    platforms: ['GA4', 'AdMob'],
    note: 'GA4 · AdMob · one Google sign-in',
    sample: 'GA4 · AdMob · 2 properties and 1 AdMob account shared',
    action: 'Connected · read-only',
    connected: true,
  },
  {
    title: 'RevenueCat',
    platforms: ['RevenueCat'],
    note: 'Trials, renewals, revenue · paste a read-only key',
    action: 'Connect',
  },
  {
    title: 'Google Ads',
    platforms: ['Google Ads'],
    note: "Runs on your computer, as Google's rules ask · one command",
    action: 'Set up',
  },
  { title: 'Meta Ads · TikTok Ads', platforms: ['Meta Ads', 'TikTok Ads'], note: 'Spend and results by campaign' },
  {
    title: 'Google Play · App Store Connect',
    platforms: ['Google Play', 'App Store Connect'],
    note: 'Store performance and reviews',
  },
] as const;

/** A panel row is as far along as the least ready platform it stands for. */
export function panelStatus(platforms: readonly string[]): PlatformStatus {
  const all = platforms.map((n) => PLATFORMS.find((p) => p.name === n)?.status ?? 'next');
  if (!ACCOUNTS_OPEN) return all.includes('next') ? 'next' : 'coming';
  return all.includes('next') ? 'next' : all.includes('coming') ? 'coming' : 'available';
}

/** What the sign-in asks of a visitor. Future tense until accounts open. */
export const PROMISES = ACCOUNTS_OPEN
  ? [
      "You sign in on Google's own page. We never see your password.",
      'We ask for reading permission only.',
      'Disconnect any platform with one click.',
    ]
  : [
      "You will sign in on Google's own page. We never see your password.",
      'We will ask for reading permission only.',
      'You will be able to disconnect any platform with one click.',
    ];

/**
 * The six method tools. These are built: they need no account and no sign-in,
 * and they are what the server offers on the day it opens.
 */
export const TOOLS = [
  { name: 'Payback calculator', does: 'The day an install earns back its cost' },
  { name: 'Attribution audit checklist', does: 'What an audit checks, area by area' },
  { name: 'Common faults', does: 'What audits keep finding, most common first' },
  { name: 'iOS measurement for Google Ads', does: 'ODM, ICM, several MMPs, where each SDK starts' },
  { name: 'Google Ads scaling rules', does: 'When to scale, hold or cut' },
  { name: 'Ad monetisation checks', does: 'Where to look when ad revenue moves' },
] as const;

/**
 * Security.
 *
 * `built` is true of the method-tools server as it stands, with or without
 * accounts. `accounts` is what account connection adds; until it opens those
 * four are promises, written in the future tense and shown under their own
 * sub-heading.
 */
export const SECURITY = {
  built: [
    { title: 'It signs in to nothing', body: 'The server holds no account and no key, and using it needs no sign-in.' },
    {
      title: 'It stores nothing',
      body: 'What your assistant sends is used to work out the answer. We do not keep it or write it to logs.',
    },
    {
      title: 'No tool that writes',
      body: 'Six tools, every one read-only. None can edit a campaign, a budget, a product or a setting.',
    },
    { title: 'No outbound requests', body: 'It calls no other service while it answers.' },
  ],
  accounts: [
    {
      title: 'Read-only access',
      body: ACCOUNTS_OPEN
        ? 'We ask each platform for permission to read reports, and nothing more.'
        : 'We will ask each platform for permission to read reports, and nothing more.',
    },
    {
      title: 'Encrypted access keys',
      body: ACCOUNTS_OPEN
        ? 'The access a platform gives us is stored encrypted and used only to answer your questions.'
        : 'The access a platform gives us will be stored encrypted and used only to answer your questions.',
    },
    {
      title: 'Your figures are not kept',
      body: ACCOUNTS_OPEN
        ? 'Reports pass through to your assistant. We do not store them or write them to logs.'
        : 'Reports will pass through to your assistant. We will not store them or write them to logs.',
    },
    {
      title: 'Leave any time',
      body: ACCOUNTS_OPEN
        ? 'Disconnect on our page or in your Google account. Access ends at once and is deleted.'
        : 'You will be able to disconnect on our page or in your Google account. Access will end at once and be deleted.',
    },
  ],
} as const;

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

/**
 * How to start: add the address, connect your accounts, ask.
 *
 * Steps one and three follow the server; step two follows account connection
 * and carries the "Coming" mark until that opens.
 */
export const STEPS = [
  {
    n: '01',
    title: 'Add the address',
    body: SERVER_OPEN
      ? 'In Claude or ChatGPT, open Connectors, choose Add custom connector and paste our address.'
      : 'When it opens, you add our address in Claude or ChatGPT: open Connectors, choose Add custom connector and paste it.',
    foot: SERVER_OPEN ? MCP_HOST : HEADER.soon,
    coming: false,
  },
  {
    n: '02',
    title: 'Connect your accounts',
    body: ACCOUNTS_OPEN
      ? 'One Google sign-in covers GA4 and AdMob. Add RevenueCat with a read-only key. Google Ads connects from your own computer, with one command.'
      : 'When account connection opens, one Google sign-in will cover GA4 and AdMob, RevenueCat will take a read-only key, and Google Ads will connect from your own computer, with one command.',
    foot: SERVER_OPEN
      ? 'Optional. Skip it and the free tools still work.'
      : 'Optional. The free tools will work without it.',
    coming: !ACCOUNTS_OPEN,
  },
  {
    n: '03',
    title: 'Ask',
    body: SERVER_OPEN
      ? 'Type a question, or start from a saved one: weekly review, why spend changed, where the funnel drops, are renewals arriving.'
      : 'Then you type a question, or start from a saved one: weekly review, why spend changed, where the funnel drops, are renewals arriving.',
    foot: 'Every answer names its source and dates.',
    coming: false,
  },
] as const;

/**
 * Common questions. The visible list and the FAQPage structured data are both
 * written from this array, so they cannot disagree.
 */
export const FAQS: { q: string; a: string }[] = [
  ...(SERVER_OPEN
    ? []
    : [
        {
          q: 'When does it open?',
          a: 'The server is built and is being opened now. Send a note through the contact form and we will tell you when you can add it.',
        },
      ]),
  {
    q: 'Can it change my campaigns or my app?',
    a: ACCOUNTS_OPEN
      ? 'No. It has no tool that writes, and it asks each platform for reading permission only.'
      : 'No. It has no tool that writes. When account connection opens, it will ask each platform for reading permission only.',
  },
  {
    q: 'Do I have to connect my accounts?',
    a: ACCOUNTS_OPEN
      ? 'No. The calculator, the checklists and the rule sets work without it. You type your own figures.'
      : SERVER_OPEN
        ? 'No. The calculator, the checklists and the rule sets work without it: you type your own figures. Account connection is not open yet.'
        : 'No. The calculator, the checklists and the rule sets are built to work without it: you type your own figures. Account connection is not open yet.',
  },
  {
    q: 'Which assistants does it work with?',
    a: SERVER_OPEN
      ? 'Claude on every plan, and ChatGPT on the plans that allow custom connectors. Other assistants that support MCP work too.'
      : 'It is built for Claude, and for ChatGPT on the plans that allow custom connectors. Other assistants that support MCP should work too.',
  },
  {
    q: 'Who pays for the AI?',
    a: SERVER_OPEN
      ? 'Your own Claude or ChatGPT plan. Our server only answers the questions your assistant sends it.'
      : 'Your own Claude or ChatGPT plan. Our server will only answer the questions your assistant sends it.',
  },
  {
    q: 'How do I disconnect?',
    a: ACCOUNTS_OPEN
      ? 'On the connections page, or in your Google account under third-party access. Either one ends our access.'
      : 'Until account connection opens there is nothing to disconnect: the server signs in to nothing. After that, on the connections page or in your Google account under third-party access. Either one will end our access.',
  },
];

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
      'Today a connection is set up with us, as part of an engagement, and credentials are held by us as the operator. Self-serve account connection through the E2E Apps MCP is being built and is not open yet; this page marks it "Coming" until it is.',
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
  body: 'Your ad platforms, analytics and subscription data, connected to Claude or ChatGPT. Ask in plain words and get an answer with the source figures attached.',
  support: 'Use Claude, ChatGPT or Gemini.',
  primary: 'Explore automation',
  sourcesLabel: 'Connected sources',
  note: 'Configured for your reporting needs.',
} as const;

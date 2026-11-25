/**
 * The specialist service pages: one entry per page under /services/.
 *
 * Text and structured data both come from here, so the FAQ markup cannot
 * describe a question the page does not show.
 *
 * Every page states a mistake once. Topic owners, to keep the pages from
 * repeating each other: launch order is /att-consent-timing, behaviour events
 * are /event-tracking-plan, money events are /subscription-revenue-tracking.
 *
 * Copy may carry one inline marker, [text](url). FAQ answers carry none.
 */

export interface Mistake {
  wrong: string;
  shows: string;
  fix: string;
}

export interface Block {
  title: string;
  text?: string;
  list?: string[];
  ordered?: boolean;
  table?: { head: string[]; rows: string[][] };
  note?: string;
  wide?: boolean;
}

export type Visual =
  | { kind: 'windows' }
  | { kind: 'order' }
  | { kind: 'chain'; steps: [string, string][] }
  | { kind: 'spec'; name: string; fields: [string, string][] }
  | { kind: 'table'; head: string[]; rows: string[][] };

export interface Service {
  slug: string;
  name: string;
  summary: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  visualTitle: string;
  visualLead?: string;
  visual: Visual;
  visualNote?: string;
  showsLabel: string;
  mistakes: Mistake[];
  blocks: Block[];
  faqs: { q: string; a: string }[];
  ask: string;
  related: string[];
  post?: { href: string; label: string };
}

/** The date shown on the pages. Change it when the advice changes. */
export const UPDATED = { iso: '2026-11-25', label: '25 November 2026' };

const APPLE = 'https://developer.apple.com/documentation';

export const SERVICES: Service[] = [
  {
    slug: 'mobile-attribution-audit',
    name: 'Mobile attribution audit',
    summary: 'A full review from the ad to the renewal, with a written fix for each finding.',
    title: 'Mobile Attribution Audit for Subscription Apps — E2E Apps',
    description:
      'An independent audit of your AppsFlyer, Adjust or Singular setup: what is wrong, how it shows up, and a written fix for each finding.',
    eyebrow: 'ATTRIBUTION AUDIT',
    h1: 'Mobile attribution audit for subscription apps',
    lead: 'A mobile attribution audit checks whether your MMP, ad accounts, app code and subscription platform agree about where users and revenue come from. I review AppsFlyer, Adjust and Singular setups, rank what is wrong by impact, and give your developers a written fix for each item.',
    visualTitle: 'I follow one user from the ad to the renewal.',
    visual: {
      kind: 'chain',
      steps: [
        ['Ad', 'Partner connection, windows and cost'],
        ['Install', 'SDK start, consent, links and SKAN'],
        ['Behaviour', 'Events, triggers and values'],
        ['Payment', 'Trial, purchase and currency'],
        ['Renewal', 'Server events, refunds and reports'],
      ],
    },
    showsLabel: 'How it shows up',
    mistakes: [
      { wrong: 'The SDK starts before consent is answered', shows: 'iOS installs arrive without an advertising ID', fix: 'Set the launch order and wait time, then test each answer' },
      { wrong: 'SKAN only measures revenue', shows: 'Trial apps send empty or low values', fix: 'Map early signals that happen inside the first window' },
      { wrong: 'Ad platforms receive the wrong events', shows: 'Campaigns optimise for a weak signal', fix: 'Map the events that match the campaign goal' },
      { wrong: 'Revenue has no value or currency', shows: 'Conversions count but ROAS is zero', fix: 'Send both fields in the right format' },
      { wrong: 'Re-engagement has no inactivity rule', shows: 'Active users are credited to retargeting', fix: 'Set the window to match how often people use the app' },
      { wrong: 'Web visits lose their campaign', shows: 'Web-driven installs look organic', fix: 'Carry click data through the store link' },
      { wrong: 'Uninstall measurement is off', shows: 'No view of early loss by channel', fix: 'Complete the push setup and monitor by source' },
      { wrong: 'Settings differ between iOS and Android', shows: 'Platforms cannot be compared', fix: 'Document a reason for every difference' },
    ],
    blocks: [
      {
        title: 'Signs you need an audit',
        list: [
          'Google Ads, Meta, the MMP and RevenueCat report different revenue.',
          'Organic installs rise when paid spend rises.',
          'Trials appear in the MMP but renewals do not.',
          'iOS campaigns have little or no conversion data.',
          'Nobody knows why a setting was chosen.',
        ],
      },
      {
        title: 'What I check',
        list: [
          'SDK version, start-up and user identity',
          'Attribution windows, view-through and reattribution',
          'SKAN and AdAttributionKit',
          'Each ad partner connection and postback',
          'Event names, triggers and values',
          'Trials, purchases, renewals and refunds',
          'Web-to-app links and deep links',
          'Privacy and consent settings',
          'GA4, Firebase and cost data',
        ],
      },
      {
        title: 'What you receive',
        text: 'A ranked list. Each finding has the issue, why it matters, the fix, the owner and a way to verify it. Developer items include exact instructions.',
        wide: true,
      },
    ],
    faqs: [
      { q: 'How long does it take?', a: 'Typically two weeks.' },
      { q: 'Do you need our source code?', a: 'No. Read access helps and shortens the audit, but dashboard access covers most of it.' },
      { q: 'Which platforms do you audit?', a: 'AppsFlyer, Adjust and Singular.' },
      { q: 'Do you implement the fixes?', a: 'Yes, if you want. Settings can be changed with you, and code changes arrive as a written specification.' },
      { q: 'What if you find nothing wrong?', a: 'The report says so and the audit ends there.' },
    ],
    ask: "Send me your MMP setup. I'll tell you what's broken in it.",
    related: ['skan-adattributionkit-setup', 'event-tracking-plan', 'subscription-revenue-tracking'],
  },
  {
    slug: 'skan-adattributionkit-setup',
    name: 'SKAN & AdAttributionKit setup',
    summary: 'Conversion values, windows and postbacks.',
    title: 'SKAN & AdAttributionKit Setup for iOS Apps — E2E Apps',
    description:
      'SKAdNetwork and AdAttributionKit conversion value setup for subscription apps: the three windows, common schema mistakes and how to fix them.',
    eyebrow: 'IOS MEASUREMENT',
    h1: 'SKAN & AdAttributionKit setup for iOS apps',
    lead: 'A SKAN setup decides which user actions Apple reports to your ad networks after an install. For a subscription app, the hard part is choosing early actions that predict a payment which often happens after the first window closes.',
    visualTitle: 'Apple gives you 35 days. The first renewal can land on day 37.',
    visual: { kind: 'windows' },
    visualNote: `The delay starts when the window ends, or earlier if the app locks it. Source: [Apple](${APPLE}/storekit/receiving-postbacks-in-multiple-conversion-windows).`,
    showsLabel: 'Why it hurts',
    mistakes: [
      { wrong: 'Window 1 only holds revenue', shows: 'A three-day trial has not charged by day 2', fix: 'Add onboarding, paywall and trial signals' },
      { wrong: 'Many values are never used', shows: 'Space is wasted on actions that do not happen', fix: 'Rebuild from your real price points and funnel' },
      { wrong: 'Windows 2 and 3 copy window 1', shows: 'Later payment is not captured', fix: 'Use window 2 for trial conversion and window 3 for retention or repeat payment' },
      { wrong: 'Schemas differ between SKAN versions', shows: 'The same value means two things', fix: 'Keep one documented mapping' },
      { wrong: 'Two tools update the value', shows: 'One overwrites the other', fix: 'Give one SDK ownership' },
      { wrong: 'The network connection fails silently', shows: 'Dashboards stay empty', fix: 'Check permissions and monitor status' },
      { wrong: 'The app never updates the value', shows: 'Windows do not begin as planned', fix: `Update at first launch, as [Apple recommends](${APPLE}/adattributionkit/configuring-an-advertised-app) for AdAttributionKit` },
    ],
    blocks: [
      {
        title: 'Do you need SKAdNetworkItems?',
        text: `Apple describes this key for [apps that display ads](${APPLE}/bundleresources/information-property-list/skadnetworkitems). An app that only advertises itself does not need it for its own installs to be attributed.`,
      },
      {
        title: 'How the two frameworks fit together',
        text: `Only one impression can win a conversion across both. Apple says SKAdNetwork mirrors its conversion value updates into [AdAttributionKit](${APPLE}/adattributionkit/adattributionkit-skadnetwork-interoperability).`,
      },
      {
        title: 'Example: a made-up fitness app',
        text: 'Three-day trial. An illustration, not a client.',
        table: {
          head: ['Window', 'Low', 'Medium', 'High'],
          rows: [
            ['1 (coarse)', 'Opened app', 'Finished onboarding', 'Started trial'],
            ['2', 'Active', 'Trial still running or ended', 'Paid'],
            ['3', 'Active', 'Paid once', 'Paid again, if within 35 days'],
          ],
        },
        wide: true,
      },
    ],
    faqs: [
      { q: 'Why are my conversion values null?', a: 'The install may be in a low data tier, the app may not have updated the value, or the ad network may not have received it.' },
      { q: 'Should I lock a window?', a: 'Locking brings the postback sooner but ignores later updates in that window.' },
      { q: 'Are fine values sent in every postback?', a: 'No. They are available only in the first.' },
      { q: 'Should my MMP set the values?', a: 'One owner should. If it is the MMP, no other SDK should update them.' },
      { q: 'Can I receive copies of postbacks?', a: 'Yes. Apple provides an optional key for SKAN copies, and a separate one for AdAttributionKit.' },
    ],
    ask: "Send me your SKAN setup. I'll tell you what it can't see.",
    related: ['att-consent-timing', 'subscription-revenue-tracking', 'mobile-attribution-audit'],
    post: { href: '/blog/leveraging-skan-for-ios', label: 'Leveraging SKAN for iOS' },
  },
  {
    slug: 'att-consent-timing',
    name: 'ATT & consent timing',
    summary: 'Prompt order, waiting time and testing.',
    title: 'ATT Prompt & Consent Timing Fix for iOS — E2E Apps',
    description:
      'Why iOS installs lose the advertising identifier when an MMP SDK starts before the ATT prompt is answered, and how to fix and test the order.',
    eyebrow: 'IOS PRIVACY',
    h1: 'ATT prompt & consent timing fix for iOS',
    lead: "If your MMP sends its first message before the user answers Apple's tracking prompt, that install can be recorded without the advertising identifier. The fix is to set the order of the prompt and the SDK, allow enough waiting time, and test every possible answer.",
    visualTitle: 'Same four steps. The order decides the result.',
    visual: { kind: 'order' },
    showsLabel: 'How it shows up',
    mistakes: [
      { wrong: 'SDK starts before the prompt, with no wait', shows: 'Consent is granted but the install has no identifier', fix: 'Set the wait before starting the SDK' },
      { wrong: 'Wait time is too short for the onboarding', shows: 'Slow users are recorded as undecided', fix: 'Match the wait to when the prompt appears' },
      { wrong: 'Prompt never appears in some flows', shows: 'High not-determined rate', fix: 'Test fresh installs, deep links and skipped onboarding' },
      { wrong: 'Prompt is requested while the app is inactive', shows: 'Prompt fails to show', fix: 'Request it when the app is active' },
      { wrong: 'Consent shows 100 percent', shows: 'Result looks too good', fix: 'Check that denials are being recorded' },
      { wrong: 'Subscription SDK keeps the old answer', shows: 'Revenue events lack the identifier', fix: 'Refresh identifiers after permission is granted' },
    ],
    blocks: [
      {
        title: 'The correct order with AppsFlyer',
        list: [
          'Set the developer key and app ID when the app launches.',
          'When the app becomes active, set the ATT wait.',
          'Call start. The wait must be set before it.',
          'Show the ATT prompt within the waiting time.',
          'After the answer, refresh device identifiers in RevenueCat if you use it.',
        ],
        ordered: true,
        note: 'AppsFlyer says 60 seconds should be enough [when the prompt appears at launch](https://dev.appsflyer.com/hc/docs/integrate-ios-sdk). RevenueCat documents [collecting identifiers again](https://www.revenuecat.com/docs/integrations/attribution/appsflyer) after permission.',
      },
      {
        title: 'How to test it',
        table: {
          head: ['Test', 'Expected result'],
          rows: [
            ['Fresh install, allow', 'Identifier present on the install'],
            ['Fresh install, deny', 'Install recorded, no identifier, status denied'],
            ['Ignore the prompt', 'Install recorded after the wait ends'],
            ['Open from a deep link', 'Same order as a normal launch'],
            ['Tracking off in iOS settings', 'No prompt, and the app continues'],
          ],
        },
      },
      {
        title: 'When should you ask?',
        text: 'Asking at launch is simple but gives users no context. Asking after onboarding adds context but needs a longer wait. Test the choice on your own users; consent varies by app and country.',
      },
      {
        title: 'What consent does not change',
        text: 'SKAN and AdAttributionKit do not require ATT permission. EEA consent and US privacy rules are separate from ATT and need their own settings.',
      },
    ],
    faqs: [
      { q: 'What does not determined mean?', a: 'The person has not given an answer, so the app may need to ask again.' },
      { q: 'Does delaying the SDK lose data?', a: 'The wait delays sending. A wait that is too long can miss users who leave early.' },
      { q: 'Does Android need this?', a: 'ATT is for Apple platforms. Android has its own advertising ID controls.' },
      { q: 'Can I prompt twice?', a: 'Once someone chooses, the system does not keep asking. They change it in Settings.' },
      { q: 'What consent rate is good?', a: 'There is no single target. Compare the same app by version, country and prompt position.' },
    ],
    ask: 'Find out what your app sends before the prompt is answered.',
    related: ['skan-adattributionkit-setup', 'subscription-revenue-tracking', 'mobile-attribution-audit'],
  },
  {
    slug: 'event-tracking-plan',
    name: 'Event tracking plan & mapping',
    summary: 'What to send, when and in what format.',
    title: 'Mobile App Event Tracking Plan & Mapping — E2E Apps',
    description:
      'Event tracking plans for AppsFlyer, Adjust, Firebase and GA4: names, triggers, parameters and ad partner mapping a developer can implement.',
    eyebrow: 'EVENT TRACKING',
    h1: 'Mobile app event tracking plan & mapping',
    lead: 'An event tracking plan tells developers exactly what to send, when to send it and in what format. It also tells marketers which events each ad platform should receive. I write plans for AppsFlyer, Adjust, Firebase and GA4 that a developer can implement without a meeting.',
    visualTitle: 'One event, with nothing left to guess.',
    visualLead: 'An example for a made-up app.',
    visual: {
      kind: 'spec',
      name: 'paywall_viewed',
      fields: [
        ['Trigger', 'The paywall is fully visible'],
        ['Fires', 'Once per paywall opening'],
        ['Parameter', 'paywall_source'],
        ['Type', 'Text, fixed list'],
        ['Allowed values', 'onboarding, settings, locked_feature'],
        ['Sent by', 'App'],
        ['Ad partners', 'None'],
        ['How to test', 'Open from each source and compare the log'],
      ],
    },
    showsLabel: 'How it shows up',
    mistakes: [
      { wrong: 'Only sign-up and purchase are tracked', shows: 'No view of where people leave', fix: 'Add onboarding, paywall and key feature steps' },
      { wrong: 'Triggers are vague', shows: 'iOS and Android fire at different moments', fix: 'Define the exact moment and what must be true' },
      { wrong: 'One action fires twice', shows: 'Conversion rates look too high', fix: 'Set a once-only rule and a duplicate check' },
      { wrong: 'Names change by platform', shows: 'Reports split one action in two', fix: 'Use one naming rule everywhere' },
      { wrong: 'Values have mixed formats', shows: 'Reports cannot group them', fix: 'Fix the type, unit and allowed values' },
      { wrong: 'Personal data is sent as an ID', shows: 'Privacy risk', fix: 'Use an internal ID with no personal data' },
      { wrong: 'Every event goes to every ad partner', shows: 'Platforms get noise', fix: 'Send only events with a purpose' },
      { wrong: 'Revenue events are mapped as custom', shows: 'Value bidding may not work as intended', fix: "Use the partner's matching standard event" },
    ],
    blocks: [
      {
        title: 'Choosing what ad partners receive',
        list: [
          'Start with the decision the platform must make.',
          'Choose an event close to value that happens often enough to learn from.',
          'Keep diagnostic events in analytics.',
          'Use standard names where a partner supports them.',
          'Record who owns each mapping.',
        ],
        ordered: true,
      },
      {
        title: 'From plan to live',
        list: ['Draft', 'Build', 'Staging', 'Checked', 'Live'],
        ordered: true,
        note: 'Each event is tested on both platforms before it is mapped to an ad partner. Purchase, trial and renewal values are covered in [subscription revenue tracking](/services/subscription-revenue-tracking).',
      },
    ],
    faqs: [
      { q: 'How many events do we need?', a: 'Enough to answer your decisions. An event nobody uses should be removed.' },
      { q: 'Standard or custom names?', a: 'Standard names where the meaning matches. Custom names for actions specific to your app.' },
      { q: 'App or server?', a: 'Use the server when it knows the truth, such as a completed renewal. Use the app for screens and taps.' },
      { q: 'Can you fix an existing plan?', a: 'Yes. I compare what is written, what is sent and what each partner receives.' },
      { q: 'Who implements it?', a: 'Your developers, from the written plan. I check the result.' },
    ],
    ask: "Send me your event list. I'll show you what it can't answer.",
    related: ['subscription-revenue-tracking', 'mobile-attribution-audit', 'skan-adattributionkit-setup'],
  },
  {
    slug: 'subscription-revenue-tracking',
    name: 'Subscription revenue tracking',
    summary: 'Trials, renewals and refunds, counted once.',
    title: 'Subscription Revenue Tracking for Apps — E2E Apps',
    description:
      'Why renewals, trials and refunds go missing between RevenueCat or Adapty and your MMP, and how to send each money event once with the right value.',
    eyebrow: 'SUBSCRIPTION REVENUE',
    h1: 'Subscription revenue tracking for apps',
    lead: 'Subscription revenue goes missing when a tracking setup only sees what happens while the app is open. Renewals, billing problems and refunds usually happen outside it. I connect RevenueCat or Adapty to your MMP so each money event is sent once, with the right value, from the right system.',
    visualTitle: 'Nine events. One sender for each.',
    visual: {
      kind: 'table',
      head: ['Event', 'Best sender', 'Revenue'],
      rows: [
        ['Paywall viewed', 'App', 'No'],
        ['Trial started', 'Subscription platform', 'No'],
        ['Trial converted', 'Subscription platform', 'Yes'],
        ['Direct purchase', 'Subscription platform', 'Yes'],
        ['Renewal', 'Subscription platform', 'Yes'],
        ['Billing issue', 'Subscription platform', 'No'],
        ['Cancellation', 'Subscription platform', 'No'],
        ['Expiry', 'Subscription platform', 'No'],
        ['Refund', 'Subscription platform', 'Negative, where supported'],
      ],
    },
    visualNote: 'Cancellation means a person turned off renewal. Their access usually continues until expiry. Track them separately.',
    showsLabel: 'How it shows up',
    mistakes: [
      { wrong: 'Renewals are tracked only in the app', shows: 'Long-term ROAS looks too low', fix: 'Send renewals from the subscription platform' },
      { wrong: 'App and server both send purchases', shows: 'Revenue is counted twice', fix: 'Remove client revenue tracking' },
      { wrong: 'The MMP user ID is missing', shows: 'Some server events are not delivered', fix: 'Set it after setup and before the first purchase' },
      { wrong: 'A trial start carries the full price', shows: 'ROAS looks too high', fix: 'Keep the trial separate from the charge' },
      { wrong: 'Value has no currency', shows: 'Revenue cannot be used correctly', fix: "Send both, in the MMP's format" },
      { wrong: 'Refunds are ignored', shows: 'Revenue stays too high', fix: 'Send or reconcile negative revenue' },
      { wrong: 'Test purchases reach live reports', shows: 'Revenue appears from nowhere', fix: 'Separate sandbox and production' },
      { wrong: 'Gross and net are mixed', shows: 'Systems never match', fix: 'Choose one for each report and label it' },
    ],
    blocks: [
      {
        title: 'How to check your setup',
        list: [
          'Choose one past day that has fully processed.',
          'List purchases and renewals in the subscription platform.',
          'Find the same transactions in the MMP.',
          'Compare count, then value, then currency.',
          'Trace missing users to their MMP ID.',
          'Check that nothing appears twice.',
        ],
        ordered: true,
      },
      {
        title: 'What RevenueCat says',
        text: 'Its [AppsFlyer guide](https://www.revenuecat.com/docs/integrations/attribution/appsflyer) says to remove client-side purchase tracking to avoid double counting. It also says some events may not be delivered if the AppsFlyer ID is missing.',
      },
    ],
    faqs: [
      { q: 'Why are renewals missing in AppsFlyer?', a: 'Common causes are a missing AppsFlyer ID, an inactive integration or an event that is not mapped.' },
      { q: 'Should a trial have revenue?', a: 'Not before money is charged. Some teams send a predicted value to ad platforms, but it should be labelled as predicted.' },
      { q: 'Will every system match exactly?', a: 'Usually not. Time zones, fees, currency and refunds differ. The goal is a known reason for each gap.' },
      { q: 'RevenueCat or Adapty?', a: 'Both can act as the sender. The right one depends on what you already use.' },
      { q: 'Do users need to open the app?', a: 'Not for renewals sent by the subscription platform. RevenueCat says it can send them without an app open.' },
    ],
    ask: 'Find the revenue your MMP never receives.',
    related: ['event-tracking-plan', 'skan-adattributionkit-setup', 'mobile-attribution-audit'],
    post: { href: '/blog/renewals-happen-while-your-app-is-closed', label: 'Renewals happen while your app is closed' },
  },
];

/** Which service a post's readers are likely to need. */
export const SERVICE_FOR_POST = new Map(
  SERVICES.flatMap((s) => (s.post ? [[s.post.href.replace('/blog/', ''), s] as const] : [])),
);

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Renders the one inline marker, [text](url). Root-relative links get the base. */
export const rich = (t: string, base = '') =>
  esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, url: string) =>
    url.startsWith('/')
      ? `<a class="link" href="${base}${url}">${text}</a>`
      : `<a class="link" href="${url}" target="_blank" rel="noopener">${text}</a>`,
  );

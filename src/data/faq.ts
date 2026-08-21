/**
 * FAQ content — the single source for both the rendered section and the
 * FAQPage JSON-LD.
 *
 * They read from one array on purpose: Google treats structured data that does
 * not match the visible text as a manual-action risk, and the reliable way to
 * keep the two identical is never to write them twice.
 *
 * Answers carry two inline markers, deliberately minimal:
 *   `code`  ->  <code>          *em*  ->  <em>
 * `toHtml` renders them; `toText` strips them for the JSON-LD, so the
 * structured text is the visible text with the markup removed.
 */

export interface FaqItem {
  q: string;
  a: string;
}

/** Working together — price, timeline, access, effort, risk. */
export const GROUP_A: FaqItem[] = [
  {
    q: 'How much does this cost?',
    a: "Two shapes. A fixed-price audit — a full review of the measurement stack, the gaps ranked by what each is costing, and a written remediation plan. Or a monthly retainer where the fixes get implemented and the campaigns get run. The audit is the usual starting point because it tells both of us whether the retainer is worth anyone's money. Exact figures on the call, once the size of the stack is clear.",
  },
  {
    q: 'How long before I see anything?',
    a: "The audit is typically two weeks. Most of what it finds is fixable in the following four to six — configuration and server-side work, not a rebuild. What takes longer is the thing the fixes reveal: a subscription cohort's real payback often lands somewhere around month nine, so the honest answer is that clean data arrives in weeks and the decisions it unlocks compound over quarters.",
  },
  {
    q: 'Do you need access to our source code?',
    a: "Read access to the repository helps and shortens the audit, but it isn't required. Dashboard access to the MMP, ad accounts, Firebase or GA4, and the subscription platform covers most of it. For the server-side work there's usually a short window where a developer is needed — a webhook endpoint or an SDK initialisation order change. Everything is scoped in writing before any credential changes hands.",
  },
  {
    q: 'How much work is this for my engineers?',
    a: 'Deliberately little. The audit needs nothing from them. Implementation typically needs a few hours across a sprint, and it arrives as a written specification with exact code, not a ticket saying "fix attribution." Writing that specification so a developer can implement it without a meeting is a large part of the job.',
  },
  {
    q: 'What if you find nothing wrong?',
    a: "Then that gets said plainly and the audit ends there. It has never happened on a live portfolio, but a report confirming the setup is sound is a legitimate outcome and worth what it costs — you stop wondering. What won't happen is a list of manufactured problems to justify a retainer.",
  },
  {
    q: 'We already have a UA team or an agency. Does this conflict?',
    a: 'No, and it usually works better with one. An in-house team owns the spending decisions; this work makes sure the numbers those decisions rest on are true. Agencies are often the ones who ask for it, because an agency judged on ROAS has a direct interest in the ROAS being measured correctly.',
  },
  {
    q: 'Who actually does the work?',
    a: 'The two people on this page. There is no account manager, no ticket queue, and no junior doing the implementation. Aamir owns measurement, attribution and the media. Faisal owns the server-side infrastructure — the webhook receivers, the relays, the pipelines that have to run unattended.',
  },
  {
    q: 'Can you show me results from other clients?',
    a: "Not yet as named case studies. The portfolio work behind the figures on this page was done under employment, and client data that isn't ours to publish won't be published — which is the same standard your data would get. On a call, anonymised examples, in detail. And this site's own measurement stack is live and built with exactly the tools that would be deployed for you; that dashboard can be screen-shared on the call.",
  },
];

/** Technical scope — the capability questions, and the long-tail search asset. */
export const GROUP_B: FaqItem[] = [
  {
    q: "Our numbers don't match across Google Ads, GA4, the MMP and RevenueCat. Can you reconcile them?",
    a: "This is the single most common reason people get in touch, and there's almost always a specific mechanical cause rather than a vague \"attribution is hard.\" A frequent one: auto-collected App Store events reach Google Ads without a value or currency attached, so a conversion rule that says *use the value from Firebase, otherwise use zero* silently applies zero to most conversions — a dashboard can report a few dozen dollars against conversions genuinely worth a thousand. Reconciliation starts by finding which of these is yours, not by averaging the four numbers.",
  },
  {
    q: 'Do you set up attribution from scratch, or only repair existing setups?',
    a: "Both. Greenfield is faster because there's nothing to unpick. Most work is repair — an SDK integrated correctly two years ago against rules that have since changed.",
  },
  {
    q: 'Which measurement platforms do you work with?',
    a: "AppsFlyer, Adjust, Singular and Branch, on both iOS and Android, including SDK upgrades and migrations between them. Depth matters more than the list: knowing that Adjust's First Session Delay is what resolves an ODM-versus-ATT initialisation conflict, or that a shared event token behaves differently in a multi-device app, is the part that saves weeks.",
  },
  {
    q: 'Do you build SKAdNetwork conversion value schemas?',
    a: "Yes — and the schema looks nothing alike between a subscription app and a game. A subscription app keys its fine values to funnel position: trial start, trial converted, first renewal. A game keys them to revenue buckets, because a small share of players produces most of the revenue and the schema's job is identifying a high-value player inside the postback window. Applying a subscription schema to a game wastes the signal completely, and it's a common mistake.",
  },
  {
    q: 'Is SKAdNetwork being replaced by AdAttributionKit?',
    a: 'Yes, and schemas are worth designing with the migration in view rather than rebuilding twice. Anything built now should map cleanly onto both.',
  },
  {
    q: 'Can you track behaviour from our website into the app?',
    a: "Yes — this is web-to-app attribution and it's the most commonly broken link in the chain. A visitor clicks a Google ad on your site, installs a few days later, subscribes a week after that. Without capturing `gclid`, `gbraid` and `wbraid` at the landing page, carrying them through the install, and posting the eventual subscription back through Offline Conversion Import, the ad platform never learns which click earned the money — and optimises toward the wrong audience with your budget.",
  },
  {
    q: 'Do you handle app-to-app attribution and deep linking?',
    a: 'Yes, including the case that breaks most often: deferred deep links that work for existing users and silently fail for first-time installers. That failure is usually structural — a malformed link where the destination sits as a sibling parameter instead of inside the deep link value, or intent filters carrying invalid schemes — not a bug in the SDK.',
  },
  {
    q: 'Can you get subscription renewals into our ad platforms?',
    a: "Yes. Renewals happen on Apple's and Google's servers while the app is closed, so no client-side SDK sees them. It takes a server-side path — App Store Server Notifications V2 and Play Real-time Developer Notifications into a backend that validates and forwards to your subscription platform, analytics and ad networks. Without it, every channel looks worse than it is, and the best cohorts get optimised away.",
  },
  {
    q: 'Do you write tracking plans and event taxonomies?',
    a: 'Yes, as a written specification a developer can implement without a meeting: event names, parameters, types, trigger conditions, and a QA matrix for verifying each one fires correctly in sandbox before release.',
  },
  {
    q: 'Do you run the campaigns, or only the measurement?',
    a: "Both, and that's the difference. Google Ads app and web-to-app campaigns, Apple Ads, Meta, TikTok, plus ASO and paywall work. Most measurement consultants hand over a clean dashboard and leave the spending to someone else. When the same person does both, the measurement gets built for how the money is actually deployed — and there's nobody to blame when the two don't reconcile.",
  },
  {
    q: 'Do you work on ad-monetised apps or only subscriptions?',
    a: "Both, and they need different models. A subscription app's LTV is a renewal-survival curve. An ad-monetised app's is ARPDAU multiplied by cumulative expected active days, fitted to a retention decay curve. Using the wrong engine produces a confident number that's wrong — which is worse than no number at all.",
  },
];

export const ALL_FAQ: FaqItem[] = [...GROUP_A, ...GROUP_B];

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Render the inline markers. Escaping runs first, so the copy stays inert. */
export function toHtml(answer: string): string {
  return escapeHtml(answer)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** The same text with the markers removed — what the JSON-LD carries. */
export function toText(answer: string): string {
  return answer.replace(/`([^`]+)`/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}

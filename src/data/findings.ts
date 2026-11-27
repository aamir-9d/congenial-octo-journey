/**
 * What ten mobile attribution audits found, shown on /mmp-audit-findings.
 *
 * Source: the owner's ten MMP audit workbooks (private, not in this repo),
 * read on 27 November 2026. Each workbook lists checks with a status of
 * "Looks Good", "Need Review" or "Need Fixes".
 *
 * How a count is made:
 *  - One audit counts once for a finding if it has at least one "Need Fixes"
 *    check in that area. "Need Review" does not count.
 *  - Only the MMP checks are used. The GA4 tab was the same template in every
 *    workbook, so it is left out.
 *  - A check copied word for word between workbooks is not counted, because
 *    some workbooks were started from another and kept its text.
 *  - Checks marked "not applicable after discussion" are not counted.
 *  - Every match was read by hand before it was counted.
 *
 * No app or client is named, here or on the page.
 */
export const AUDIT_COUNT = 10;

export interface Finding {
  key: string;
  /** Audits with at least one "Need Fixes" check in this area. */
  count: number;
  title: string;
  /** What it does to the numbers. */
  effect: string;
  /** Page that fixes it. */
  path: string;
  linkLabel: string;
}

export const FINDINGS: Finding[] = [
  {
    key: 'att',
    count: 10,
    title: 'ATT handled badly',
    effect:
      'The prompt appeared at first launch, or the MMP SDK started before the user answered, or the consent rate was implausible (near zero or 100%). Installs arrive without an advertising ID and iOS campaigns look weaker than they are.',
    path: '/services/att-consent-timing',
    linkLabel: 'ATT & consent timing',
  },
  {
    key: 'revenue',
    count: 9,
    title: 'Revenue or purchase events missing or wrong',
    effect:
      'Revenue not tracked, sent without the right value or currency, or the purchase event never reached the ad platforms. Campaigns optimise without the signal that matters most.',
    path: '/services/event-tracking-plan',
    linkLabel: 'Event tracking plan',
  },
  {
    key: 'skan',
    count: 6,
    title: 'SKAN conversion values or reporting not set up',
    effect:
      'Conversion values missing or unmapped, window 1 capacity unused, or the SKAN reporting connection off. iOS campaigns get little or no usable postback data.',
    path: '/services/skan-adattributionkit-setup',
    linkLabel: 'SKAN & AdAttributionKit setup',
  },
  {
    key: 'reengage',
    count: 6,
    title: 'Re-engagement attribution misconfigured',
    effect:
      'Re-engagement windows and inactivity rules not set for how the app is used, so retargeting takes credit for users who were already active, or gets none.',
    path: '/services/mobile-attribution-audit',
    linkLabel: 'Mobile attribution audit',
  },
  {
    key: 'postbacks',
    count: 6,
    title: 'Ad partner postbacks and integrations incomplete',
    effect:
      'In-app event postbacks off, partner connections set up the old way, or conversion goals missing in the ad platform. The networks cannot optimise towards the events you care about.',
    path: '/services/event-tracking-plan',
    linkLabel: 'Event tracking plan',
  },
  {
    key: 'uninstall',
    count: 5,
    title: 'Uninstall measurement off',
    effect: 'No view of which channels bring users who leave within days.',
    path: '/services/mobile-attribution-audit',
    linkLabel: 'Mobile attribution audit',
  },
  {
    key: 'viewthrough',
    count: 4,
    title: 'View-through attribution off or misconfigured',
    effect: 'Installs driven by video and display ads are credited elsewhere or to organic.',
    path: '/services/mobile-attribution-audit',
    linkLabel: 'Mobile attribution audit',
  },
  {
    key: 'web2app',
    count: 3,
    title: 'Web-to-app tracking missing',
    effect: 'Installs that start on the website lose their campaign and look organic.',
    path: '/services/mobile-attribution-audit',
    linkLabel: 'Mobile attribution audit',
  },
  {
    key: 'renewals',
    count: 2,
    title: 'Renewals not sent from the server',
    effect: 'Subscription revenue after the first charge never reaches the MMP, so long-term ROAS looks too low.',
    path: '/services/subscription-revenue-tracking',
    linkLabel: 'Subscription revenue tracking',
  },
];

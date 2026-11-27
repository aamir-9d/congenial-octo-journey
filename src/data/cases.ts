/**
 * Case studies, one entry per case, shown on /case-studies.
 *
 * Every figure here is copied from the full write-up it links to, and the full
 * write-up is the source. A case without publishable figures says so instead
 * of borrowing a number. Client names are never used.
 *
 * To add a case: write the full post first, then add its summary here.
 */
export interface CaseStudy {
  /** Blog post id the card links to. */
  post: string;
  title: string;
  market: string;
  /** What kind of app or business, without naming it. */
  client: string;
  /** The windows compared, stated as the post states them. */
  compared: string;
  services: string[];
  problem: string;
  change: string[];
  /** Headline results. Empty when the figures are not publishable. */
  results: { value: string; label: string }[];
  /** What the comparison cannot show. Always filled in. */
  limits: string;
  takeaway: string;
}

export const CASES: CaseStudy[] = [
  {
    post: 'the-dialog-between-the-trial-button-and-the-trial',
    title: 'A paywall dialog was hiding most trials',
    market: '25 countries',
    client: 'PDF scanner app, subscription',
    compared: '18 days before vs 9 days after, both windows aged until trials resolved',
    services: ['Funnel audit', 'Paywall'],
    problem:
      'Install to trial had sat at 0.6% for months. Tapping the trial button raised a system "are you sure?" alert instead of starting the trial, and no dashboard flagged it.',
    change: [
      'Removed the confirmation dialog',
      'Rebuilt the paywall around a free vs Pro comparison',
      'Replaced two plans with one weekly plan',
    ],
    results: [
      { value: '0.62% → 4.00%', label: 'Install to trial' },
      { value: '$92.95 → $20.91', label: 'Cost per payer' },
      { value: '7.0 → 31.8', label: 'Payers per day' },
    ],
    limits:
      'Spend and installs per day were flat across both windows. Three changes shipped together, so the comparison cannot say how much each contributed. Trial to paid fell from 26.5% to 18.5%.',
    takeaway: 'A defect in the highest-value step of the funnel can look like a stable baseline for months.',
  },
  {
    post: 'the-strategy-was-right-the-traffic-was-wrong',
    title: "A copied paywall failed on ads and on subscriptions",
    market: 'Global',
    client: 'Portfolio of fifty utility apps, ad-monetised',
    compared: 'Before and after a portfolio-wide paywall rollout',
    services: ['Monetisation', 'User acquisition'],
    problem:
      "A competitor's paywall was rolled out across fifty apps. It moved the splash interstitial behind the paywall, and that placement carried 70 to 80 per cent of the portfolio's ad revenue. The campaigns were also bidding for ad engagement, not for buyers.",
    change: [
      'Put the splash interstitial back for the existing campaigns',
      'Started a second set of campaigns optimised for in-app purchase',
      'Branched the first run on which campaign acquired the user',
    ],
    results: [],
    limits:
      'The revenue figures belong to the employer the work was done for and are not published. The write-up describes the mechanism, which is the part that transfers.',
    takeaway: 'A monetisation strategy only works with the acquisition strategy that feeds it.',
  },
];

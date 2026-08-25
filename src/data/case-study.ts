/**
 * The featured case study.
 *
 * One source for the homepage section and, in future, for anything else that
 * quotes these numbers. Every figure here is computed from the client's country
 * tables — 18 days before the change and 9 days after, both windows aged until
 * the trials in them had resolved — and each is stated per day, because the two
 * windows are different lengths and the totals are therefore not comparable.
 *
 * The derivations, so nothing here has to be taken on trust:
 *
 *   spend/day        11,712 / 18 = 650.67   →   5,981 / 9 = 664.56   (+2.1%)
 *   installs/day     77,094 / 18 = 4,283    →  38,638 / 9 = 4,293    (+0.2%)
 *   install→trial       476 / 77,094        →   1,544 / 38,638
 *   payers/day          126 / 18 = 7.0      →     286 / 9 = 31.8
 *   cost per payer   11,712 / 126 = 92.95   →   5,981 / 286 = 20.91
 *
 * `tests/case-study.test.ts` recomputes all of it from the raw totals below and
 * fails if a displayed figure and its arithmetic ever disagree — which is the
 * failure that matters here, because a marketing page quoting a number the
 * source data does not support is the exact thing this site sells against.
 */

/** The raw period totals every displayed figure is derived from. */
export const RAW = {
  before: { days: 18, cost: 11_712, installs: 77_094, trials: 476, paid: 126 },
  after: { days: 9, cost: 5_981, installs: 38_638, trials: 1_544, paid: 286 },
} as const;

export interface CaseFigure {
  label: string;
  /** Shorter form for phone width, where the label shares a row with its values. */
  labelShort?: string;
  before: string;
  after: string;
}

export const CASE_STUDY = {
  slug: 'the-dialog-between-the-trial-button-and-the-trial',

  headline: 'A dialog nobody had questioned, for four months.',

  lead: 'A PDF scanner app was buying 4,300 installs a day and converting 0.6% of them into a trial. The spend was fine. The measurement was fine. A system alert stood between the trial button and the trial.',

  kicker: 'PDF SCANNER · CLIENT WITHHELD',

  summary:
    'Tapping the trial button raised an alert asking the user whether they were sure they wanted to purchase. It had been live four to five months, and nothing flagged it — the button worked, the alert fired, the purchase sheet appeared behind it. The funnel was intact and almost nobody walked it.',

  changes: [
    {
      long: 'Removed the purchase confirmation dialog, so the trial button starts the trial',
      short: 'Removed the confirmation dialog',
    },
    {
      long: 'Rebuilt the paywall around a free-versus-Pro feature comparison',
      short: 'Rebuilt the paywall as a comparison',
    },
    {
      long: 'Collapsed monthly and annual into a single weekly plan at the old monthly price',
      short: 'One weekly plan, at the old monthly price',
    },
  ],

  /** Why the read is clean: the top of the funnel did not move. */
  control: 'Same daily spend ($651 → $665) and the same daily installs (4,283 → 4,293). The top of the funnel was held still.',

  figures: [
    { label: 'Install → trial', before: '0.62%', after: '4.00%' },
    { label: 'Payers per day', labelShort: 'Payers / day', before: '7.0', after: '31.8' },
    { label: 'Cost per trial', before: '$24.61', after: '$3.87' },
    { label: 'Cost per payer', before: '$92.95', after: '$20.91' },
    { label: 'Monthly recurring revenue', labelShort: 'MRR', before: '~$31k', after: '~$52k' },
  ] satisfies CaseFigure[],

  /* Stated on the card, not just in the article. A reader who takes only the
     figures away should still take away the caveat that qualifies them. */
  caveat:
    'Trial-to-paid fell 26.5% → 18.5%: a wider funnel admits weaker intent. Payers per day still went up 4.5×. Most of the MRR lift is billing frequency, not subscriber growth.',
} as const;

/**
 * The payback model's stated limits. Signed-off copy, moved here from
 * Payback.astro so the calculator and /payback-calculator print the same list.
 */
export const ASSUMPTIONS = [
  'Geometric per-cycle retention — a constant renewal rate every billing cycle.',
  'Constant ARPDAU across tenure.',
  'No seasonality in eCPM.',
  'No organic uplift from paid spend.',
  'No involuntary-churn recovery (failed payments never retried).',
  'Steady-state approximation — no cohort-size or price changes over the horizon.',
];

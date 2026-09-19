/**
 * The Payback Map's presentation layer over the existing calculator engine.
 *
 * ── Why this module exists ────────────────────────────────────────────────
 *
 * `calc-model.ts` is signed off and must not change: its six validated figures
 * are pinned by tests/calculator.test.ts and a drifting number on this site
 * would falsify the thing the site sells. But the engine has boundary
 * behaviour that is fine for the old hero chart and wrong for a tool that
 * invites people to type their own numbers in. Verified by running it:
 *
 *   retention 100%   paymentsBy(n) divides by zero -> NaN revenue, Infinity LTV
 *   D30 >= D1        the decay exponent clamps to 0.01 and the model silently
 *                    answers a question nobody asked, with a confident payback
 *   D1 or D30 = 0    log boundary -> exponent Infinity -> NaN revenue
 *   fees > 100%      negative revenue, no complaint
 *   ad payback       the search starts at day 1, so a cohort already in profit
 *                    on day 0 is reported as paying back on day 1
 *   no crossing      a finite search that runs out is reported as "never"
 *
 * So this module sits in front of the engine rather than inside it. It
 * validates first and refuses to draw a curve it cannot stand behind, and it
 * reads every revenue figure from the engine's own `trueRev` / `rev`. For any
 * input the engine already handles, the numbers here are the engine's numbers
 * unchanged — `tests/payback-model.test.ts` pins that against the same six
 * validated figures.
 *
 * ── On "never" ───────────────────────────────────────────────────────────
 *
 * A search that ends at day 3650 without a crossing has established that the
 * cohort does not pay back within ten years. It has not established "never",
 * and the difference matters on a page arguing that people should stop
 * accepting confident numbers from tools that cannot support them. Three
 * distinct outcomes, three distinct statements: inside the horizon, after the
 * horizon, or not within the range the model covers.
 */
import { subModel, adModel, cycleDays, type CalcState } from './calc-model.ts';

/** Ten years. Past this the model is not making a claim either way. */
export const SEARCH_MAX = 3650;

export interface Issue {
  /** The input to mark, or 'model' for something no single field owns. */
  field: string;
  message: string;
}

export type Crossing =
  | { kind: 'within'; day: number }
  | { kind: 'after-horizon'; day: number }
  | { kind: 'beyond-range' };

export interface Payback {
  issues: Issue[];
  /** True when the issues are bad enough that no curve should be drawn. */
  blocked: boolean;
  /** Cumulative net per install — revenue minus acquisition cost — day 0..H. */
  series: number[];
  crossing: Crossing;
  /** Acquisition cost per install, the thing being recovered. */
  cost: number;
  revenueAt: number;
  surplusAt: number;
  /** Revenue as a share of spend. Null when there is no spend to divide by. */
  roas: number | null;
}

const finite = (n: number) => typeof n === 'number' && Number.isFinite(n);

/**
 * Everything that would make the engine produce a number it cannot support.
 *
 * Checked before the engine runs, because several of these do not throw — they
 * return NaN or a quietly different model, which is worse.
 */
export function validate(s: CalcState): Issue[] {
  const issues: Issue[] = [];
  const range = (v: number, lo: number, hi: number) => finite(v) && v >= lo && v <= hi;

  if (s.mode === 'sub') {
    if (!range(s.cpi, 0, 1e6)) issues.push({ field: 'cpi', message: 'Cost per install must be $0 or more.' });
    if (!range(s.price, 0, 1e6)) issues.push({ field: 'price', message: 'Plan price must be $0 or more.' });
    if (!range(s.i2t, 0, 100)) issues.push({ field: 'i2t', message: 'Install → trial is a percentage between 0 and 100.' });
    if (!range(s.t2p, 0, 100)) issues.push({ field: 't2p', message: 'Trial → paid is a percentage between 0 and 100.' });
    if (!range(s.commission, 0, 100)) {
      issues.push({ field: 'commission', message: 'Store commission is a percentage between 0 and 100.' });
    }
    if (!range(s.refund, 0, 100)) {
      issues.push({ field: 'refund', message: 'Refund rate is a percentage between 0 and 100.' });
    }

    /* The expected-payment sum is (1 - r^n) / (1 - r). At r = 1 that is 0/0,
       and the value it stands for — revenue over an unbounded number of
       renewals — is genuinely infinite rather than merely unknown. Saying so
       is more useful than printing NaN. */
    if (!range(s.retention, 0, 99.9)) {
      issues.push({
        field: 'retention',
        message:
          s.retention >= 100
            ? 'At 100% renewal retention nobody ever cancels, so revenue per install has no limit and payback cannot be placed on a day. Try 99.9% or lower.'
            : 'Renewal retention is a percentage between 0 and 99.9.',
      });
    }
  } else {
    if (!range(s.adCpi, 0, 1e6)) issues.push({ field: 'adCpi', message: 'Cost per install must be $0 or more.' });
    if (!range(s.arpdau, 0, 1e6)) issues.push({ field: 'arpdau', message: 'ARPDAU must be $0 or more.' });

    if (!range(s.d1, 0.1, 100)) {
      issues.push({ field: 'd1', message: 'Day 1 retention is a percentage between 0.1 and 100.' });
    }
    if (!range(s.d30, 0.1, 100)) {
      issues.push({ field: 'd30', message: 'Day 30 retention is a percentage between 0.1 and 100.' });
    }
    /* Two anchors define a power curve only if the second is below the first.
       The engine clamps the exponent instead, which answers a different
       question without saying so. */
    if (range(s.d1, 0.1, 100) && range(s.d30, 0.1, 100) && s.d30 >= s.d1) {
      issues.push({
        field: 'd30',
        message:
          'Day 30 retention has to be below day 1. This model fits a declining curve through the two anchors; retention that holds or rises needs a different model.',
      });
    }
  }

  return issues;
}

/** Cumulative net per install at day `d`, straight from the engine. */
function netAt(s: CalcState, d: number): number {
  return s.mode === 'sub' ? subModel(s).trueRev(d) - s.cpi : adModel(s).rev(d) - s.adCpi;
}

export function computePayback(s: CalcState, horizon: number): Payback {
  const issues = validate(s);
  const cost = s.mode === 'sub' ? s.cpi : s.adCpi;

  if (issues.length > 0) {
    return {
      issues,
      blocked: true,
      series: [],
      crossing: { kind: 'beyond-range' },
      cost,
      revenueAt: NaN,
      surplusAt: NaN,
      roas: null,
    };
  }

  /* Build the models once. Both close over cached state, so calling their
     revenue functions repeatedly is cheap — and it keeps every figure here
     the engine's own rather than a reimplementation. */
  const m = s.mode === 'sub' ? subModel(s) : adModel(s);
  const revenue = s.mode === 'sub' ? (d: number) => (m as ReturnType<typeof subModel>).trueRev(d) : (d: number) => (m as ReturnType<typeof adModel>).rev(d);

  const series: number[] = [];
  for (let d = 0; d <= horizon; d++) series.push(revenue(d) - cost);

  /* From day 0, not day 1. A cohort whose day-0 revenue already covers a cheap
     install has paid back on day 0, and the engine's own loop starts at 1. */
  let crossing: Crossing = { kind: 'beyond-range' };
  for (let d = 0; d <= SEARCH_MAX; d++) {
    if (revenue(d) >= cost) {
      crossing = d <= horizon ? { kind: 'within', day: d } : { kind: 'after-horizon', day: d };
      break;
    }
  }

  const revenueAt = revenue(horizon);
  const surplusAt = revenueAt - cost;

  return {
    issues,
    blocked: false,
    series,
    crossing,
    cost,
    revenueAt,
    surplusAt,
    roas: cost > 0 ? revenueAt / cost : null,
  };
}

/* --- presentation -------------------------------------------------------- */

/** What the big number says. Never "never". */
export function crossingLabel(c: Crossing, horizon: number): string {
  if (c.kind === 'within') return `Day ${c.day}`;
  if (c.kind === 'after-horizon') return `Day ${c.day}`;
  return `Not by day ${horizon}`;
}

/** The sentence under it, which is where the qualification belongs. */
export function crossingNote(c: Crossing, horizon: number): string {
  if (c.kind === 'within') return 'Acquisition cost recovered under these assumptions.';
  if (c.kind === 'after-horizon') {
    return `Beyond the ${horizon}-day view. Switch to a longer horizon to see it.`;
  }
  return `No crossing within ${SEARCH_MAX} days — the model does not place one, rather than ruling one out.`;
}

/** The number of payment dates reached by `d`, for the subscription summary. */
export function paymentsBy(s: CalcState, d: number): number {
  return d < s.trialDays ? 0 : Math.floor((d - s.trialDays) / cycleDays(s)) + 1;
}

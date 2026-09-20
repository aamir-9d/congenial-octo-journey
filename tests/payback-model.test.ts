/**
 * The Payback Map's model layer.
 *
 * Two jobs, and the first matters more than the second.
 *
 * 1. PROVE THE ENGINE IS UNCHANGED. Every figure this layer reports for a
 *    valid scenario has to be the one `calc-model.ts` already produces. The
 *    six validated numbers are asserted here against the same literals
 *    tests/calculator.test.ts pins, so if this layer ever starts doing its own
 *    arithmetic instead of reading the engine's, both suites fail.
 *
 * 2. Pin the boundary behaviour this layer adds, each of which was verified
 *    against the live engine first rather than assumed from reading it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { INITIAL_STATE, subModel, adModel, type CalcState } from '../src/scripts/calc-model.ts';
import { computePayback, validate, crossingLabel, SEARCH_MAX } from '../src/scripts/payback-model.ts';

const S = (o: Partial<CalcState> = {}): CalcState => ({ ...INITIAL_STATE, ...o });

/**
 * Compare a computed figure to a recorded one.
 *
 * NOT strict equality, and the distinction matters. The ad model sums 365
 * terms of Math.pow(d, -b), and Math.pow is not required by IEEE-754 to be
 * correctly rounded — V8's result can differ by one unit in the last place
 * between platforms and versions. Asserting the exact double meant this suite
 * passed on the machine the literal was captured on and failed everywhere
 * else, which is what it did: 0.5921476457773432 on Windows/Node 24,
 * 0.5921476457773431 on Linux/Node 22.
 *
 * 1e-12 is eleven orders of magnitude tighter than anything displayed — the
 * page shows cents and one decimal place of a percentage — so this still
 * catches any real drift in the engine while surviving the last bit.
 *
 * Engine-to-engine comparisons inside one process stay strictly equal: there
 * the point is to prove this layer reads the engine rather than reimplementing
 * it, and any difference at all would be a reimplementation.
 */
const near = (actual: number, expected: number, what: string) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-12,
    `${what}: expected ~${expected}, got ${actual} (drift ${Math.abs(actual - expected)})`,
  );

/* --- 1. the engine's numbers, unchanged ---------------------------------- */

test('the subscription example still reports the validated figures', () => {
  const p = computePayback(S(), 365);

  assert.equal(p.blocked, false);
  assert.deepEqual(p.crossing, { kind: 'within', day: 277 }, 'breakeven day 277 moved');
  near(p.revenueAt, 1.3188269725306383, 'revenue per install');
  near(p.surplusAt, 0.11882697253063834, 'surplus per install');
  near(p.roas!, 1.0990224771088652, 'revenue/spend');
});

test('the 85% -> 90% renewal comparison still moves payback by exactly 90 days', () => {
  const base = computePayback(S(), 365);
  const better = computePayback(S({ retention: 90 }), 365);

  assert.equal(base.crossing.kind, 'within');
  assert.equal(better.crossing.kind, 'within');
  assert.equal((base.crossing as { day: number }).day, 277);
  assert.equal((better.crossing as { day: number }).day, 187);
  near(better.revenueAt, 1.6549265889078835, 'revenue per install at 90% renewal');
  near(better.roas!, 1.3791054907565696, 'revenue/spend at 90% renewal');
});

test('the ad example still reports the validated figures', () => {
  const p = computePayback(S({ mode: 'ad' }), 365);

  assert.deepEqual(p.crossing, { kind: 'within', day: 122 }, 'ad breakeven day 122 moved');
  near(p.revenueAt, 0.5921476457773432, 'ad revenue per install');
  near(p.surplusAt, 0.24214764577734327, 'ad surplus per install');
  near(p.roas!, 1.691850416506695, 'ad revenue/spend');
});

test('every point on the curve is the engine value minus acquisition cost', () => {
  // Not a reimplementation: the series has to BE the engine's revenue, shifted.
  const s = S();
  const eng = subModel(s);
  const p = computePayback(s, 365);

  for (const d of [0, 1, 6, 7, 8, 37, 100, 277, 364, 365]) {
    assert.equal(p.series[d], eng.trueRev(d) - s.cpi, `day ${d} diverges from the engine`);
  }

  const adState = S({ mode: 'ad' });
  const adEng = adModel(adState);
  const ap = computePayback(adState, 365);
  for (const d of [0, 1, 7, 122, 365]) {
    assert.equal(ap.series[d], adEng.rev(d) - adState.adCpi, `ad day ${d} diverges from the engine`);
  }
});

/* --- 2. the boundaries this layer adds ----------------------------------- */

test('100% renewal retention is refused, not rendered as NaN', () => {
  // The engine returns NaN revenue and Infinity LTV here — verified by running
  // it. A tool that invites people to type 100 must say why it cannot answer.
  const raw = subModel(S({ retention: 100 }));
  assert.ok(Number.isNaN(raw.trueRev(365)), 'the engine no longer returns NaN — revisit this layer');

  const p = computePayback(S({ retention: 100 }), 365);
  assert.equal(p.blocked, true);
  assert.equal(p.series.length, 0, 'a blocked scenario must not produce a curve');
  assert.match(p.issues.find((i) => i.field === 'retention')!.message, /no limit/);
});

test('retention at or above D1 is refused rather than silently flattened', () => {
  // The engine clamps the decay exponent to 0.01 and answers a different
  // question with a confident payback day. Verified: d1=6/d30=32 -> day 118.
  const raw = adModel(S({ mode: 'ad', d1: 6, d30: 32 }));
  assert.equal(raw.b, 0.01, 'the engine no longer clamps — revisit this layer');
  assert.equal(raw.be, 118);

  const p = computePayback(S({ mode: 'ad', d1: 6, d30: 32 }), 365);
  assert.equal(p.blocked, true);
  assert.match(p.issues.find((i) => i.field === 'd30')!.message, /below day 1/);
});

test('zero retention anchors are refused before they reach the log', () => {
  assert.ok(Number.isNaN(adModel(S({ mode: 'ad', d30: 0 })).rev(365)), 'engine behaviour changed');

  for (const bad of [{ d1: 0 }, { d30: 0 }]) {
    const p = computePayback(S({ mode: 'ad', ...bad }), 365);
    assert.equal(p.blocked, true, `${JSON.stringify(bad)} was not refused`);
  }
});

test('fees outside 0-100% are refused instead of producing negative revenue', () => {
  // Verified: commission 150 gives the engine revenue of -0.7757 with no complaint.
  assert.ok(subModel(S({ commission: 150 })).trueRev(365) < 0, 'engine behaviour changed');

  assert.equal(computePayback(S({ commission: 150 }), 365).blocked, true);
  assert.equal(computePayback(S({ refund: 150 }), 365).blocked, true);
});

test('payback is searched from day 0, so day-0 revenue counts', () => {
  // The engine's own loop starts at d = 1 and reports day 1 for a cohort that
  // is already whole on day 0. Verified: rev(0) = 0.045 against a 0.02 CPI.
  const s = S({ mode: 'ad', adCpi: 0.02 });
  assert.equal(adModel(s).be, 1, 'engine behaviour changed');
  assert.ok(adModel(s).rev(0) >= s.adCpi);

  assert.deepEqual(computePayback(s, 365).crossing, { kind: 'within', day: 0 });
});

test('a crossing beyond the horizon is distinguished from no crossing at all', () => {
  // Day 277 exists but sits outside a 90-day view. It is not "never".
  const beyond = computePayback(S(), 90);
  assert.deepEqual(beyond.crossing, { kind: 'after-horizon', day: 277 });
  assert.equal(crossingLabel(beyond.crossing, 90), 'Day 277');

  const none = computePayback(S({ mode: 'ad', adCpi: 999 }), 365);
  assert.equal(none.crossing.kind, 'beyond-range');
  assert.match(crossingLabel(none.crossing, 365), /Not by day 365/);
});

test('no outcome is ever labelled "never"', () => {
  for (const [state, h] of [
    [S({ mode: 'ad', adCpi: 999 }), 365],
    [S({ cpi: 9999 }), 365],
    [S(), 90],
  ] as const) {
    const p = computePayback(state, h);
    assert.doesNotMatch(
      crossingLabel(p.crossing, h).toLowerCase(),
      /never/,
      'a finite search that ran out is not proof that payback never happens',
    );
  }
});

test('the series is horizon-length and starts at day 0', () => {
  for (const h of [90, 180, 365]) {
    const p = computePayback(S(), h);
    assert.equal(p.series.length, h + 1, `horizon ${h} produced the wrong number of days`);
    assert.equal(p.series[0], subModel(S()).trueRev(0) - INITIAL_STATE.cpi);
  }
});

test('zero acquisition cost has a defined answer rather than a division', () => {
  const p = computePayback(S({ cpi: 0 }), 365);
  assert.equal(p.blocked, false);
  assert.deepEqual(p.crossing, { kind: 'within', day: 0 }, 'nothing to recover means recovered at day 0');
  assert.equal(p.roas, null, 'revenue/spend is undefined against zero spend, not Infinity');
});

test('validate names the field it is complaining about', () => {
  const issues = validate(S({ mode: 'ad', d1: 0, d30: 0 }));
  assert.ok(issues.length > 0);
  for (const i of issues) {
    assert.ok(i.field && i.message, 'every issue needs a field to mark and something to say');
  }
});

test('the search ceiling is stated, not hidden', () => {
  assert.equal(SEARCH_MAX, 3650);
});

/**
 * Golden-value regression tests for the payback model.
 *
 * These figures were validated separately from the design and must not drift.
 * They are transcribed from the brief's acceptance list and independently
 * reproduce from the original `class Component extends DCLogic`.
 *
 * Zero dependencies: node:test and node:assert are built in, and Node strips
 * the TypeScript annotations natively. Run with `npm test`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { INITIAL_STATE, subModel, adModel, computeView, type CalcState } from '../src/scripts/calc-model.ts';

const withState = (patch: Partial<CalcState>): CalcState => ({ ...INITIAL_STATE, ...patch });

test('subscription defaults break even on day 277', () => {
  const sub = subModel(INITIAL_STATE);
  assert.equal(sub.beTrue, 277);
});

test('subscription defaults: cumulative $0.2306 at day 7, $0.4267 at day 37', () => {
  const sub = subModel(INITIAL_STATE);
  assert.equal(sub.trueRev(7).toFixed(4), '0.2306');
  assert.equal(sub.trueRev(37).toFixed(4), '0.4267');
});

test('ad-monetised defaults: decay exponent 0.492, D7 12.3%, breakeven day 122', () => {
  const ad = adModel(INITIAL_STATE);
  assert.equal(ad.b.toFixed(3), '0.492');
  assert.equal((ad.predD7 * 100).toFixed(1), '12.3');
  assert.equal(ad.be, 122);
});

test('with all three attribution-gap boxes unchecked, measured breakeven is never', () => {
  const sub = subModel(
    withState({ renewalCapture: false, skanMapped: false, webStitched: false }),
  );
  assert.equal(sub.beMeas, null);

  const view = computeView(
    withState({ renewalCapture: false, skanMapped: false, webStitched: false }),
  );
  assert.equal(view.tileDash, 'never');
});

test('with all three boxes checked, the two series coincide exactly', () => {
  const state = withState({ renewalCapture: true, skanMapped: true, webStitched: true });
  const sub = subModel(state);

  assert.equal(sub.signal, 1);
  for (let d = 0; d <= 365; d++) {
    assert.equal(sub.measRev(d), sub.trueRev(d), `series diverge at day ${d}`);
  }
  assert.equal(sub.beMeas, sub.beTrue);

  const view = computeView(state);
  assert.equal(view.measPath, view.truePath);
  assert.equal(view.tileDash, view.tileTrue);
});

test('supporting subscription readouts hold', () => {
  const view = computeView(INITIAL_STATE);
  assert.equal(view.i2pLabel, '2.80%');
  assert.equal(view.netPaymentLabel, '$8.24');
  assert.equal(view.ltvPayerLabel, '$54.91');
  assert.equal(view.ltvInstallLabel, '$1.54');
  assert.equal(view.tileTrue, 'day 277');
  assert.equal(view.breakevenLabel, 'Breakeven: day 277');
});

test('supporting ad-monetised readouts hold', () => {
  const view = computeView(withState({ mode: 'ad' }));
  assert.equal(view.bLabel, '0.492');
  assert.equal(view.predD7Label, '12.3%');
  assert.equal(view.activeD30Label, '4.12 days');
  assert.equal(view.tileTrue, 'day 122');
  // Ad mode has no dashboard series to compare against.
  assert.equal(view.tileDash, '—');
  assert.equal(view.tileInvisible, '—');
  assert.equal(view.gapOpacity, 0);
  assert.equal(view.measPath, '');
});

test('annual period pins the horizon to 365 regardless of the range buttons', () => {
  const view = computeView(withState({ period: 'annual', horizon: 90 }));
  assert.equal(view.horizon, 365);
  assert.equal(view.isAnnual, true);
  assert.equal(view.endTick, 'day 365');
});

test('a campaign that cannot pay back reports never rather than throwing', () => {
  // CPI at the top of its range against the cheapest weekly plan.
  const view = computeView(withState({ cpi: 8, price: 1.99, retention: 50 }));
  assert.equal(view.tileTrue, 'never');
  assert.equal(view.breakevenLabel, 'Never breaks even');
  assert.equal(view.crossOpacity, 0);
});

test('the accessible chart summary carries the breakeven day and the gap figure', () => {
  const view = computeView(INITIAL_STATE);
  assert.match(view.chartSummary, /breaking even on day 277/);
  assert.match(view.chartSummary, /breaks even never/);
  assert.match(view.chartSummary, /invisible to the dashboard is \$\d/);
});

test('the D7 cross-check flags a curve that is not a power law', () => {
  // Model predicts 12.3%; a real D7 of 30% is far outside the tolerance band.
  assert.equal(computeView(withState({ mode: 'ad', realD7: 30 })).d7Mismatch, true);
  assert.equal(computeView(withState({ mode: 'ad', realD7: 12.3 })).d7Mismatch, false);
  // The check only applies to the ad model.
  assert.equal(computeView(withState({ mode: 'sub', realD7: 30 })).d7Mismatch, false);
});

test('chart geometry stays finite across the full slider ranges', () => {
  const edges: Partial<CalcState>[] = [
    { i2t: 1, t2p: 10, price: 1.99, retention: 50, refund: 0, cpi: 0.2 },
    { i2t: 25, t2p: 60, price: 99.99, retention: 98, refund: 10, cpi: 8 },
    { period: 'weekly', trialDays: 3, commission: 30 },
    { period: 'annual', trialDays: 30, commission: 15 },
    { mode: 'ad', arpdau: 0.005, d1: 10, d30: 1, adCpi: 0.05 },
    { mode: 'ad', arpdau: 0.5, d1: 60, d30: 25, adCpi: 3 },
    // d1 === d30 drives log(1) === 0, which the max(0.01, …) floor catches.
    { mode: 'ad', d1: 25, d30: 25 },
    { chartPx: 280 },
    { chartPx: 2400 },
  ];

  for (const patch of edges) {
    const view = computeView(withState(patch));
    const label = JSON.stringify(patch);
    assert.ok(!/NaN|Infinity/.test(view.truePath), `truePath not finite for ${label}`);
    assert.ok(!/NaN|Infinity/.test(view.measPath), `measPath not finite for ${label}`);
    assert.ok(!/NaN|Infinity/.test(view.gapPath), `gapPath not finite for ${label}`);
    assert.ok(!/NaN/.test(view.vb), `viewBox not finite for ${label}`);
    assert.ok(!/NaN/.test(view.yMaxLabel + view.yMinLabel), `axis labels not finite for ${label}`);
    assert.ok(Number.isFinite(view.labels.be.top), `breakeven label not finite for ${label}`);
  }
});

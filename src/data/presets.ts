import { INITIAL_STATE, computeView, type CalcState } from '../scripts/calc-model.ts';

/**
 * Three cohorts, so the model can be read without touching a slider.
 *
 * New UI. `Typical` is the repo's own INITIAL_STATE verbatim — not a copy of
 * the numbers, the values themselves — so it necessarily reproduces breakeven
 * day 277. tests/calculator.test.ts pins that, and presets.test.ts pins the
 * other two against the same model rather than against hand-written figures.
 *
 * Touching any control moves the selection to an implicit fourth state, so a
 * preset is never lit against values it does not describe.
 */

export interface Preset {
  key: string;
  label: string;
  sub: string;
  /** Only the five fields the presets vary. Everything else stays as it is. */
  state: Pick<CalcState, 'i2t' | 't2p' | 'price' | 'retention' | 'cpi'>;
}

export const PRESETS: Preset[] = [
  {
    key: 'conservative',
    label: 'Conservative',
    sub: 'Low trial take-up, thin retention',
    state: { i2t: 5, t2p: 25, price: 7.99, retention: 78, cpi: 1.6 },
  },
  {
    key: 'typical',
    label: 'Typical',
    sub: 'The median subscription cohort',
    state: {
      i2t: INITIAL_STATE.i2t,
      t2p: INITIAL_STATE.t2p,
      price: INITIAL_STATE.price,
      retention: INITIAL_STATE.retention,
      cpi: INITIAL_STATE.cpi,
    },
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    sub: 'Strong funnel, cheap installs',
    state: { i2t: 12, t2p: 45, price: 12.99, retention: 90, cpi: 0.9 },
  },
];

/** The breakeven each preset produces, from the model rather than a table. */
export function presetBreakeven(p: Preset): string {
  const view = computeView({ ...INITIAL_STATE, ...p.state });
  return view.tileTrue;
}

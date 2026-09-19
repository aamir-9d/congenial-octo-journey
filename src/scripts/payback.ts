/**
 * The Payback Map's controller.
 *
 * ── Two states, not one ──────────────────────────────────────────────────
 *
 * Subscription and ad inputs are held separately, so switching model and
 * switching back returns the visitor's own numbers rather than the defaults.
 * They are different funnels; sharing a field would mean an edit to one
 * silently rewrote the other.
 *
 * ── Never write back over the field being typed in ───────────────────────
 *
 * `render()` refreshes every control from state. Doing that to the focused
 * element fights the caret: "1.2" becomes "1.20" mid-keystroke, or the cursor
 * jumps to the end. So the active element is skipped, and an empty field is
 * left empty rather than coerced to zero — a blank box is a person mid-edit,
 * not a measured value of nothing.
 *
 * ── Nothing here does arithmetic ─────────────────────────────────────────
 *
 * Every figure comes from `payback-model.ts`, which reads the signed-off
 * engine. This file formats and positions; when it wants a number it asks.
 */
import { INITIAL_STATE, adModel, computeView, type Period, type CalcState } from './calc-model.ts';
import { computePayback, crossingLabel, crossingNote, type Payback } from './payback-model.ts';
import { buildChart, BOX } from './payback-chart.ts';
import { PRESETS } from '../data/presets.ts';
import { track } from './analytics.ts';

/** The five fields the presets vary; everything else is left alone. */
const PRESET_FIELDS = ['i2t', 't2p', 'price', 'retention', 'cpi'] as const;

const NUM_FIELDS = [
  'cpi', 'i2t', 't2p', 'retention', 'price', 'trialDays', 'commission', 'refund',
  'adCpi', 'arpdau', 'd1', 'd30',
] as const;

/** The three coverage switches, which change only the simulated report. */
const TOGGLES = ['renewalCapture', 'skanMapped', 'webStitched'] as const;
type NumField = (typeof NUM_FIELDS)[number];

interface Pinned {
  state: CalcState;
  horizon: number;
  label: string;
}

export function initPayback(): void {
  const root = document.querySelector<HTMLElement>('[data-payback]');
  if (!root) return;

  /* --- state ----------------------------------------------------------- */

  const sub: CalcState = { ...INITIAL_STATE, mode: 'sub' };
  const ad: CalcState = { ...INITIAL_STATE, mode: 'ad' };
  let mode: 'sub' | 'ad' = 'sub';
  let horizon = 365;
  let pinned: Pinned | null = null;
  /** Fields the visitor has blanked, so render leaves them blank. */
  const blank = new Set<string>();

  const active = () => (mode === 'sub' ? sub : ad);

  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const $$ = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
  const bind = (name: string) => $<HTMLElement>(`[data-bind="${name}"]`);

  /* --- formatting ------------------------------------------------------ */

  const money = (v: number) => (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(2);
  const signedMoney = (v: number) => (v < 0 ? '−$' : '+$') + Math.abs(v).toFixed(2);
  const whole = (v: number) =>
    (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const signedWhole = (v: number) =>
    (v < 0 ? '−$' : '+$') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 });

  const periodWord = (s: CalcState) =>
    s.period === 'weekly' ? 'Weekly' : s.period === 'annual' ? 'Annual' : 'Monthly';

  /* --- which named scenario is showing --------------------------------- */

  const activePreset = (): string | null => {
    if (mode !== 'sub') return null;
    return PRESETS.find((p) => PRESET_FIELDS.every((k) => sub[k] === p.state[k]))?.key ?? null;
  };

  /* --- rendering ------------------------------------------------------- */

  function renderInputs(s: CalcState) {
    for (const f of NUM_FIELDS) {
      const input = $<HTMLInputElement>(`[data-input="${f}"]`);
      if (!input) continue;
      // Never fight the caret, and never refill a field the visitor emptied.
      if (input === document.activeElement || blank.has(f)) continue;
      input.value = String(s[f as keyof CalcState]);
    }

    const range = $<HTMLInputElement>('[data-range="cpi"]');
    const cpiKey = mode === 'sub' ? 'cpi' : 'adCpi';
    if (range && range !== document.activeElement) range.value = String(s[cpiKey]);

    const cpiNum = $<HTMLInputElement>('[data-input="cpi"]');
    if (cpiNum) cpiNum.dataset.input = cpiKey;

    const plan = $<HTMLElement>('[data-plan-summary]');
    if (plan) plan.textContent = `${periodWord(s)} plan · ${s.trialDays}-day trial`;

    const period = $<HTMLSelectElement>('[data-select="period"]');
    if (period && period !== document.activeElement) period.value = s.period;

    for (const key of TOGGLES) {
      const box = $<HTMLInputElement>(`[data-toggle="${key}"]`);
      if (box) box.checked = Boolean(s[key]);
    }

    /* An annual SKU is one charge at trial end and then nothing for a year,
       which is a different kind of bet than a monthly one. Say so when it is
       selected rather than leaving the staircase to imply it. */
    const annual = $<HTMLElement>('[data-annual-warn]');
    if (annual) annual.hidden = s.period !== 'annual';
  }

  function renderErrors(p: Payback) {
    const byField = new Map(p.issues.map((i) => [i.field, i.message]));
    for (const f of NUM_FIELDS) {
      const el = $<HTMLElement>(`[data-error="${f}"]`);
      const input = $<HTMLInputElement>(`[data-input="${f}"]`);
      const msg = byField.get(f);
      if (el) {
        el.textContent = msg ?? '';
        el.hidden = !msg;
      }
      if (input) {
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg && el?.id) input.setAttribute('aria-describedby', el.id);
      }
    }

    const panel = $<HTMLElement>('[data-invalid]');
    const list = $<HTMLElement>('[data-invalid-list]');
    const plot = $<HTMLElement>('[data-plot]');
    if (panel) panel.hidden = !p.blocked;
    if (plot) plot.hidden = p.blocked;
    if (list) {
      list.textContent = '';
      for (const i of p.issues) {
        const li = document.createElement('li');
        li.className = 'pm__invalid-item';
        li.textContent = i.message;
        list.appendChild(li);
      }
    }
  }

  function renderChart(p: Payback, s: CalcState) {
    const g = buildChart(p.series, mode === 'sub');
    const plotH = BOX.h - BOX.top - BOX.bottom;
    const yPx = (f: number) => BOX.top + f * plotH;
    const xPx = (f: number) => BOX.left + f * (BOX.w - BOX.right - BOX.left);

    $<SVGPathElement>('[data-curve]')?.setAttribute('d', g.path);

    const area = $<SVGPathElement>('[data-area]');
    if (area) area.setAttribute('d', p.surplusAt > 0 ? g.fill : '');

    const zero = $<SVGLineElement>('[data-zero]');
    if (zero) {
      zero.setAttribute('y1', String(yPx(g.zero)));
      zero.setAttribute('y2', String(yPx(g.zero)));
    }

    /* The marker only exists where the curve actually crosses inside the view.
       A crossing after the horizon, or none at all, must not leave a ring
       floating at the frame implying one. */
    const inView = p.crossing.kind === 'within';
    const marker = $<SVGCircleElement>('[data-marker]');
    const guide = $<SVGLineElement>('[data-guide]');
    const chip = $<HTMLElement>('[data-chip]');
    if (inView) {
      const d = p.crossing.day;
      const x = xPx(g.xOf(d));
      marker?.setAttribute('cx', String(x));
      marker?.setAttribute('cy', String(yPx(g.yOf(0))));
      guide?.setAttribute('x1', String(x));
      guide?.setAttribute('x2', String(x));
      if (chip) {
        chip.style.setProperty('--x', String(g.xOf(d)));
        chip.hidden = false;
        const day = chip.querySelector('[data-bind="chipDay"]');
        if (day) day.textContent = String(d);
      }
    }
    if (marker) marker.style.display = inView ? '' : 'none';
    if (guide) guide.style.display = inView ? '' : 'none';
    if (chip) chip.hidden = !inView;

    // y ticks
    const tick = (name: string, text: string, y: number) => {
      const el = $<HTMLElement>(`[data-tick="${name}"]`);
      if (!el) return;
      el.textContent = text;
      el.style.setProperty('--y', String(y));
    };
    tick('max', money(g.max), 0);
    tick('zero', '$0.00', g.zero);
    tick('min', money(g.min), 1);

    // x ticks, spaced for the horizon in view
    const xaxis = $<HTMLElement>('[data-xaxis]');
    if (xaxis) {
      const steps = horizon <= 90 ? [0, 30, 60, 90] : horizon <= 180 ? [0, 60, 120, 180] : [0, 90, 180, 365];
      xaxis.textContent = '';
      for (const [i, d] of steps.entries()) {
        const span = document.createElement('span');
        span.className = i > 0 && i < steps.length - 1 ? 'pm__tick pm__tick--mid' : 'pm__tick';
        span.style.setProperty('--x', String(g.xOf(Math.min(d, horizon))));
        span.textContent = `Day ${d}`;
        xaxis.appendChild(span);
      }
    }

    // the pinned baseline, on the same axes as the current curve
    const pinnedPath = $<SVGPathElement>('[data-pinned-path]');
    const legend = $<HTMLElement>('[data-legend]');
    if (pinned && pinnedPath) {
      const pp = computePayback(pinned.state, horizon);
      if (!pp.blocked) {
        /* One coordinate space covering both extents, so the comparison is
           read off a single axis. Concatenating the two series is only a way
           to hand buildChart the combined min and max — the drawing itself is
           done by rescale(), one curve at a time. */
        const both = buildChart(p.series.concat(pp.series), mode === 'sub');
        pinnedPath.setAttribute('d', rescale(pp.series, both, mode === 'sub'));
        pinnedPath.hidden = false;
        // redraw the current curve on the shared scale too
        $<SVGPathElement>('[data-curve]')?.setAttribute('d', rescale(p.series, both, mode === 'sub'));
        if (area) area.setAttribute('d', '');
        if (zero) {
          zero.setAttribute('y1', String(yPx(both.zero)));
          zero.setAttribute('y2', String(yPx(both.zero)));
        }
        tick('max', money(both.max), 0);
        tick('zero', '$0.00', both.zero);
        tick('min', money(both.min), 1);
        if (inView && marker) {
          marker.setAttribute('cy', String(yPx(both.yOf(0))));
        }
      }
    } else if (pinnedPath) {
      pinnedPath.hidden = true;
      pinnedPath.setAttribute('d', '');
    }
    if (legend) legend.hidden = !pinned;

    // the accessible summary, which carries the same facts as the picture
    const desc = $<SVGDescElement>('[data-chart-desc]');
    if (desc) {
      const where =
        p.crossing.kind === 'within'
          ? `passes the ${money(p.cost)} acquisition cost on day ${p.crossing.day}`
          : p.crossing.kind === 'after-horizon'
            ? `does not pass the ${money(p.cost)} acquisition cost within ${horizon} days; it would on day ${p.crossing.day}`
            : `does not pass the ${money(p.cost)} acquisition cost at any point in the modelled range`;
      desc.textContent = `Under these ${mode === 'sub' ? 'subscription' : 'ad revenue'} inputs, cumulative revenue per install ${where}, reaching ${money(p.revenueAt)} by day ${horizon}.`;
    }
  }

  /** Redraw a series inside another chart's scale, so two curves share axes. */
  function rescale(series: number[], g: ReturnType<typeof buildChart>, stepped: boolean): string {
    const H = series.length - 1;
    const plotH = BOX.h - BOX.top - BOX.bottom;
    const plotW = BOX.w - BOX.right - BOX.left;
    const px = (d: number) => BOX.left + (H === 0 ? 0 : d / H) * plotW;
    const py = (v: number) => BOX.top + g.yOf(v) * plotH;
    const n = (v: number) => Math.round(v * 10) / 10;
    let d = `M${n(px(0))} ${n(py(series[0]!))}`;
    for (let i = 1; i <= H; i++) {
      const x = n(px(i));
      if (stepped) d += ` L${x} ${n(py(series[i - 1]!))} L${x} ${n(py(series[i]!))}`;
      else d += ` L${x} ${n(py(series[i]!))}`;
    }
    return d;
  }

  function render() {
    const s = active();
    const p = computePayback(s, horizon);

    renderInputs(s);
    renderErrors(p);

    // model + preset chrome
    const periodSel = $<HTMLSelectElement>('[data-select="period"]');
  periodSel?.addEventListener('change', () => {
    active().period = periodSel.value as Period;
    render();
  });

  for (const key of TOGGLES) {
    const box = $<HTMLInputElement>(`[data-toggle="${key}"]`);
    box?.addEventListener('change', () => {
      (active() as unknown as Record<string, boolean>)[key] = box.checked;
      render();
    });
  }

  for (const b of $$<HTMLButtonElement>('[data-mode]')) {
      b.setAttribute('aria-checked', String(b.dataset.mode === mode));
    }
    for (const el of $$<HTMLElement>('[data-when]')) {
      el.hidden = el.dataset.when !== mode;
    }

    const preset = activePreset();
    for (const b of $$<HTMLButtonElement>('[data-preset]')) {
      const on = b.dataset.preset === preset;
      b.setAttribute('aria-pressed', String(on));
      const label = b.querySelector('[data-preset-label]');
      if (label) {
        const base = PRESETS.find((x) => x.key === b.dataset.preset)!.label;
        /* The middle slot shows "Custom" when the inputs match no named
           scenario, so nothing is lit against values it does not describe. */
        label.textContent = b.dataset.preset === 'typical' && preset === null ? 'Custom' : base;
      }
    }
    const scenarioLabel = $<HTMLElement>('[data-scenario-label]');
    if (scenarioLabel) {
      scenarioLabel.textContent =
        mode !== 'sub' ? 'Illustrative inputs' : preset ? 'Example scenario' : 'Custom scenario';
    }

    for (const b of $$<HTMLButtonElement>('[data-horizon]')) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.horizon) === horizon));
    }

    // results
    const set = (name: string, text: string) => {
      const el = bind(name);
      if (el) el.textContent = text;
    };

    if (p.blocked) {
      for (const n of ['crossing', 'roas', 'surplus', 'ledgerCost', 'ledgerRev', 'ledgerNet']) set(n, '—');
      set('crossingNote', 'Fix the inputs above and the map will redraw.');
    } else {
      set('crossing', crossingLabel(p.crossing, horizon));
      set('crossingNote', crossingNote(p.crossing, horizon));
      set('roas', p.roas === null ? '—' : (p.roas * 100).toFixed(1) + '%');
      set('surplus', signedMoney(p.surplusAt));
      set('surplusLabel', p.surplusAt < 0 ? 'Shortfall' : 'Surplus');
      set('ledgerCost', whole(p.cost * 1000));
      set('ledgerRev', whole(p.revenueAt * 1000));
      set('ledgerNet', signedWhole(p.surplusAt * 1000));
      renderChart(p, s);
    }

    for (const n of ['hLabelA', 'hLabelB', 'hLabelC']) set(n, String(horizon));

    /* These four are the export's own derived figures. They are read from
       computeView rather than recomputed here, so the signed-off sentences
       around them keep showing the engine's numbers. */
    if (!p.blocked) {
      const v = computeView(s);
      set('lifeRoas', v.lifeRoas);
      set('adHorizonRoas', v.adHorizonRoas);
      set('hLabelD', String(horizon));
      if (mode === 'ad') {
        set('predD7', (adModel(s).predD7 * 100).toFixed(1) + '%');
        set('bLabel', v.bLabel);
        set('activeD30', v.activeD30Label);
      }
    }

    // comparison caption
    const note = $<HTMLElement>('[data-bind="ledgerNote"]');
    if (note) {
      if (pinned && !p.blocked) {
        const pp = computePayback(pinned.state, horizon);
        if (pp.crossing.kind !== 'beyond-range' && p.crossing.kind !== 'beyond-range') {
          const delta = pp.crossing.day - p.crossing.day;
          note.textContent =
            delta === 0
              ? 'Payback lands on the same day in this what-if scenario.'
              : `Payback moves ${Math.abs(delta)} days ${delta > 0 ? 'earlier' : 'later'} in this what-if scenario.`;
        } else {
          note.textContent = 'The two scenarios do not both place a payback day in this range.';
        }
      } else {
        note.textContent = 'Illustrative cohort; values scale from the per-install model.';
      }
    }

    const legendNow = $<HTMLElement>('[data-legend-now]');
    const legendPin = $<HTMLElement>('[data-legend-pin]');
    if (pinned && legendNow && legendPin) {
      legendNow.textContent = describe(active());
      legendPin.textContent = `Pinned: ${pinned.label}`;
    }

    const clear = $<HTMLButtonElement>('[data-clear]');
    if (clear) clear.hidden = !pinned;
    const pinBtn = $<HTMLButtonElement>('[data-pin]');
    if (pinBtn) pinBtn.disabled = p.blocked;

    // "Changed: renewal retention only." under the inputs
    const changed = $<HTMLElement>('[data-foot-note]');
    if (changed && pinned) changed.textContent = changedSummary(pinned.state, active());
  }

  /** A short name for what is on screen, for the legend. */
  function describe(s: CalcState): string {
    return s.mode === 'sub' ? `${s.retention}% retention` : `D1 ${s.d1}% · D30 ${s.d30}%`;
  }

  const FIELD_NAMES: Record<string, string> = {
    cpi: 'cost per install', adCpi: 'cost per install', i2t: 'install → trial',
    t2p: 'trial → paid', retention: 'renewal retention', price: 'plan price',
    arpdau: 'revenue per active user', d1: 'day 1 retention', d30: 'day 30 retention',
  };

  function changedSummary(a: CalcState, b: CalcState): string {
    const diff = NUM_FIELDS.filter((f) => a[f as keyof CalcState] !== b[f as keyof CalcState]);
    if (diff.length === 0) return 'Nothing changed since the pin.';
    if (diff.length === 1) return `Changed: ${FIELD_NAMES[diff[0]!]} only.`;
    return `Changed: ${diff.map((f) => FIELD_NAMES[f]).join(', ')}.`;
  }

  /* --- input wiring ---------------------------------------------------- */

  const commit = (field: string, raw: string) => {
    const s = active();
    const key = field === 'cpi' && mode === 'ad' ? 'adCpi' : field;
    if (raw.trim() === '') {
      blank.add(field);
      render();
      return;
    }
    blank.delete(field);
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    (s as unknown as Record<string, number>)[key] = v;
    render();
  };

  for (const input of $$<HTMLInputElement>('[data-input]')) {
    input.addEventListener('input', () => commit(input.dataset.input!, input.value));
    input.addEventListener('blur', () => {
      blank.delete(input.dataset.input!);
      render();
    });
  }

  for (const range of $$<HTMLInputElement>('[data-range]')) {
    range.addEventListener('input', () => {
      const key = mode === 'sub' ? 'cpi' : 'adCpi';
      (active() as unknown as Record<string, number>)[key] = Number(range.value);
      blank.delete('cpi');
      render();
    });
  }

  for (const b of $$<HTMLButtonElement>('[data-mode]')) {
    b.addEventListener('click', () => {
      const next = b.dataset.mode as 'sub' | 'ad';
      if (next === mode) return;
      mode = next;
      /* A pinned subscription cohort and a live ad cohort are not comparable,
         so the comparison is cleared and said to be cleared rather than
         silently drawn against the wrong thing. */
      if (pinned && pinned.state.mode !== mode) {
        pinned = null;
        announce('Model changed, so the pinned comparison was cleared.');
      }
      blank.clear();
      render();
      track('calc_mode_switch', { mode });
    });
  }

  for (const b of $$<HTMLButtonElement>('[data-horizon]')) {
    b.addEventListener('click', () => {
      horizon = Number(b.dataset.horizon);
      render();
    });
  }

  for (const b of $$<HTMLButtonElement>('[data-preset]')) {
    b.addEventListener('click', () => {
      const p = PRESETS.find((x) => x.key === b.dataset.preset);
      if (!p) return;
      // A preset sets every field it owns, so no value survives from another.
      Object.assign(sub, p.state);
      blank.clear();
      render();
    });
  }

  $<HTMLButtonElement>('[data-pin]')?.addEventListener('click', () => {
    pinned = { state: { ...active() }, horizon, label: describe(active()) };
    render();
    announce('Scenario pinned. Change an input to compare.');
  });

  $<HTMLButtonElement>('[data-clear]')?.addEventListener('click', () => {
    pinned = null;
    render();
    announce('Comparison cleared.');
  });

  $<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
    Object.assign(sub, INITIAL_STATE, { mode: 'sub' });
    Object.assign(ad, INITIAL_STATE, { mode: 'ad' });
    mode = 'sub';
    horizon = 365;
    pinned = null;
    blank.clear();
    render();
    announce('Example scenario restored.');
  });

  /** One polite live region, so state changes reach a screen reader. */
  let live = root.querySelector<HTMLElement>('[data-live]');
  if (!live) {
    live = document.createElement('p');
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.dataset.live = '';
    root.appendChild(live);
  }
  const announce = (msg: string) => {
    if (live) live.textContent = msg;
  };

  render();
}

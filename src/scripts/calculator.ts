/**
 * DOM layer for the payback model.
 *
 * Replaces the export's React re-render with a resolve-once binding map and a
 * single `render(view)` pass. The maths itself is untouched — see calc-model.ts.
 */
import { INITIAL_STATE, computeView, type CalcState, type CalcView } from './calc-model';
import { track, debounce } from './analytics';

type Bindable = keyof CalcView;

/**
 * Calculator telemetry.
 *
 * This is lead intelligence, not vanity. Someone who sets CPI to $4 against a
 * $99 annual plan is a very different prospect from someone at $0.30 weekly,
 * and the settings they land on say more than any form field.
 *
 * Slider events are debounced 800ms so a drag is one event at the value the
 * user settled on, not eighty describing the journey.
 */
const DEBOUNCE_MS = 800;

export function initCalculator(): void {
  /* Back to `.calc`.
     The hero summary card and mini chart were siblings of the calculator, which
     is why the binding root had to widen to `#top` — bound narrowly they were
     server-rendered with the defaults and then frozen. The Bento hero has
     neither, so every `data-bind` is a descendant of the card again and the
     narrow root is correct. tests/styles.test.ts asserts that stays true. */
  const root = document.querySelector<HTMLElement>('.calc');
  const wrap = document.getElementById('chart-wrap');
  if (!root || !wrap) return;

  const state: CalcState = { ...INITIAL_STATE };

  /* --- resolve every binding once ---------------------------------------- */

  const textNodes = new Map<string, HTMLElement[]>();
  root.querySelectorAll<HTMLElement>('[data-bind]').forEach((el) => {
    const key = el.dataset.bind!;
    const list = textNodes.get(key);
    if (list) list.push(el);
    else textNodes.set(key, [el]);
  });

  const conditionals = new Map<string, HTMLElement[]>();
  root.querySelectorAll<HTMLElement>('[data-when]').forEach((el) => {
    const key = el.dataset.when!;
    const list = conditionals.get(key);
    if (list) list.push(el);
    else conditionals.set(key, [el]);
  });

  const sliders = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-slider]'));
  const toggles = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-toggle]'));
  const numbers = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-number]'));
  const setters = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-set]'));

  const svg = document.getElementById('chart-svg') as SVGSVGElement | null;
  const el = <T extends Element>(id: string) => document.getElementById(id) as unknown as T | null;

  const refs = {
    axY: el<SVGLineElement>('ax-y'),
    axX: el<SVGLineElement>('ax-x'),
    gap: el<SVGPathElement>('p-gap'),
    zeroLine: el<SVGLineElement>('zero-line'),
    day7Line: el<SVGLineElement>('day7-line'),
    meas: el<SVGPathElement>('p-meas'),
    truePath: el<SVGPathElement>('p-true'),
    zeroText: el<SVGTextElement>('zero-text'),
    crossMark: el<SVGGElement>('cross-mark'),

    crossLine: el<SVGLineElement>('cross-line'),
    crossDot: el<SVGCircleElement>('cross-dot'),
    lblBe: el<HTMLElement>('lbl-be'),
  };

  /* --- render ------------------------------------------------------------ */

  const px = (n: number) => `${n}px`;

  function render(): void {
    const v = computeView(state);

    for (const [key, els] of textNodes) {
      const value = v[key as Bindable];
      const text = String(value);
      for (const node of els) {
        if (node.textContent !== text) node.textContent = text;
      }
    }

    for (const [key, els] of conditionals) {
      const on = Boolean(v[key as Bindable]);
      for (const node of els) node.hidden = !on;
    }

    /* Controls. Never write back to the element the user is currently
       operating — doing so fights a slider mid-drag and moves the caret in the
       number field. `aria-valuetext` is the exception: it has to update on the
       focused slider, because that is the whole point of it. */
    const active = document.activeElement;
    for (const s of sliders) {
      // Without this a screen reader announces "8" where the page shows
      // "8.0%", and "1.2" where it shows "$1.20". The visible readout and the
      // announced one are the same string.
      const readout = s.dataset.readout;
      if (readout) {
        const text = String(v[readout as Bindable]);
        if (s.getAttribute('aria-valuetext') !== text) s.setAttribute('aria-valuetext', text);
      }

      if (s === active) continue;
      const next = String(state[s.dataset.slider as keyof CalcState]);
      if (s.value !== next) s.value = next;
    }
    for (const t of toggles) {
      t.checked = Boolean(state[t.dataset.toggle as keyof CalcState]);
    }
    for (const n of numbers) {
      if (n === active) continue;
      const next = String(state[n.dataset.number as keyof CalcState]);
      if (n.value !== next) n.value = next;
    }
    for (const b of setters) {
      const current = state[b.dataset.set as keyof CalcState];
      b.setAttribute('aria-pressed', String(String(current) === b.dataset.value));
    }

    /* Chart geometry. */
    if (svg) svg.setAttribute('viewBox', v.vb);

    refs.axY?.setAttribute('x1', String(v.axLeft));
    refs.axY?.setAttribute('y1', String(v.plotTop));
    refs.axY?.setAttribute('x2', String(v.axLeft));
    refs.axY?.setAttribute('y2', v.axBottom);

    refs.axX?.setAttribute('x1', String(v.axLeft));
    refs.axX?.setAttribute('y1', v.axBottom);
    refs.axX?.setAttribute('x2', v.axRight);
    refs.axX?.setAttribute('y2', v.axBottom);

    refs.gap?.setAttribute('d', v.gapPath);
    refs.gap?.setAttribute('opacity', String(v.gapOpacity));

    refs.zeroLine?.setAttribute('x1', String(v.axLeft));
    refs.zeroLine?.setAttribute('y1', v.zeroY);
    refs.zeroLine?.setAttribute('x2', v.axRight);
    refs.zeroLine?.setAttribute('y2', v.zeroY);

    refs.zeroText?.setAttribute('x', String(v.zeroTextX));
    refs.zeroText?.setAttribute('y', v.zeroTextY);

    refs.day7Line?.setAttribute('x1', v.day7X);
    refs.day7Line?.setAttribute('y1', String(v.plotTop));
    refs.day7Line?.setAttribute('x2', v.day7X);
    refs.day7Line?.setAttribute('y2', v.axBottom);

    refs.meas?.setAttribute('d', v.measPath);
    refs.truePath?.setAttribute('d', v.truePath);

    refs.crossMark?.setAttribute('opacity', String(v.crossOpacity));
    refs.crossLine?.setAttribute('x1', v.crossX);
    refs.crossLine?.setAttribute('y1', v.crossMarkTop);
    refs.crossLine?.setAttribute('x2', v.crossX);
    refs.crossLine?.setAttribute('y2', v.zeroY);
    refs.crossDot?.setAttribute('cx', v.crossX);
    refs.crossDot?.setAttribute('cy', v.zeroY);

    /* Label positions, as custom properties the stylesheet consumes. */
    const L = v.labels;
    const s = wrap!.style;
    s.setProperty('--y-lbl-w', px(L.yLabelWidth));
    s.setProperty('--lbl-zero-top', px(L.zero.top));
    s.setProperty('--lbl-ymax-top', px(L.yMax.top));
    s.setProperty('--lbl-ymin-top', px(L.yMin.top));
    s.setProperty('--lbl-t-top', px(L.t0.top));
    s.setProperty('--lbl-t0-left', px(L.t0.left!));
    s.setProperty('--lbl-tmid-left', px(L.tMid.left!));
    s.setProperty('--lbl-tend-left', px(L.tEnd.left!));
    s.setProperty('--lbl-day7-left', px(L.day7.left!));
    s.setProperty('--lbl-day7-top', px(L.day7.top));
    s.setProperty('--lbl-be-top', px(L.be.top));
    s.setProperty('--lbl-be-left', px(L.be.left!));
    s.setProperty('--lbl-be-opacity', String(L.be.opacity));
    refs.lblBe?.classList.toggle('is-flipped', Boolean(L.be.flip));
  }

  /* --- telemetry ---------------------------------------------------------- */

  /** The settings that describe the prospect, reported alongside the outcome. */
  const shape = () => {
    const v = computeView(state);
    return {
      calc_mode: state.mode,
      breakeven_day: v.breakevenDay ?? 'never',
      cpi: state.mode === 'sub' ? state.cpi : state.adCpi,
      price: state.price,
      billing_period: state.period,
      ltv_per_install: Number(v.ltvPerInstall.toFixed(4)),
    };
  };

  const reportBreakeven = debounce(() => track('calc_breakeven_computed', shape()), DEBOUNCE_MS);

  const reportSlider = debounce((name: string, value: number) => {
    track('calc_slider_change', { slider_name: name, slider_value: value, calc_mode: state.mode });
  }, DEBOUNCE_MS);

  /* --- events ------------------------------------------------------------ */

  const num = (raw: string) => parseFloat(raw);

  for (const slider of sliders) {
    const key = slider.dataset.slider as keyof CalcState;
    const onMove = () => {
      (state[key] as number) = num(slider.value);
      render();
      reportSlider(key, num(slider.value));
      reportBreakeven();
    };
    slider.addEventListener('input', onMove);
    slider.addEventListener('change', onMove);
  }

  for (const toggle of toggles) {
    const key = toggle.dataset.toggle as keyof CalcState;
    toggle.addEventListener('change', () => {
      (state[key] as boolean) = toggle.checked;
      render();
      track('calc_gap_toggle', { gap_name: key, gap_enabled: toggle.checked });
      reportBreakeven();
    });
  }

  for (const field of numbers) {
    const key = field.dataset.number as keyof CalcState;
    const onType = () => {
      // `|| 0` matches the export: a cleared field reads as zero, not NaN.
      (state[key] as number) = num(field.value) || 0;
      render();
      reportSlider(key, num(field.value) || 0);
    };
    field.addEventListener('input', onType);
    field.addEventListener('change', onType);
  }

  for (const button of setters) {
    const key = button.dataset.set as keyof CalcState;
    const raw = button.dataset.value!;
    button.addEventListener('click', () => {
      const parsed = Number(raw);
      const previous = state[key];
      (state[key] as string | number) = Number.isNaN(parsed) ? raw : parsed;
      // Picking the annual SKU pins the horizon to a full year, as in the export.
      if (key === 'period' && raw === 'annual') state.horizon = 365;
      render();

      if (key === 'mode' && previous !== state.mode) {
        track('calc_mode_switch', { calc_mode: state.mode });
      }
      reportBreakeven();
    });
  }

  const assumpToggle = document.getElementById('assump-toggle');
  assumpToggle?.addEventListener('click', () => {
    state.assumpOpen = !state.assumpOpen;
    assumpToggle.setAttribute('aria-expanded', String(state.assumpOpen));
    render();
  });

  /* The export re-measured #chart-wrap on window resize and re-rendered when
     the width moved more than 4px. ResizeObserver reports the same number
     without the window listener, and also catches the card changing width
     without the viewport doing so. */
  const measure = () => {
    const next = Math.round(wrap.clientWidth);
    if (next && Math.abs(next - state.chartPx) > 4) {
      state.chartPx = next;
      return true;
    }
    return false;
  };

  measure();
  render();

  if (typeof ResizeObserver !== 'undefined') {
    // Skip the observer's synchronous first callback; the initial render above
    // has already measured.
    let primed = false;
    new ResizeObserver(() => {
      if (!primed) {
        primed = true;
        return;
      }
      if (measure()) render();
    }).observe(wrap);
  } else {
    window.addEventListener('resize', () => {
      if (measure()) render();
    });
  }
}

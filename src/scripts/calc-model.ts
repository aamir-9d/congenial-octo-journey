/**
 * Payback model — the maths behind the hero chart.
 *
 * Ported verbatim from `class Component extends DCLogic` in the Claude Design
 * export (E2E Apps Homepage.dc.html:706). Every expression here is character-
 * for-character the original. The figures were validated separately and must
 * not drift: tests/calculator.test.js asserts them.
 *
 * If the maths looks wrong to you, it is still what was signed off. Flag it,
 * do not fix it.
 *
 * No DOM access in this file — that lives in calculator.ts — so the model can
 * be exercised directly by `node --test`.
 */

export type Mode = 'sub' | 'ad';
export type Period = 'weekly' | 'monthly' | 'annual';

export interface CalcState {
  mode: Mode;
  horizon: number;
  assumpOpen: boolean;
  i2t: number;
  t2p: number;
  price: number;
  period: Period;
  trialDays: number;
  retention: number;
  commission: number;
  refund: number;
  cpi: number;
  arpdau: number;
  d1: number;
  d30: number;
  adCpi: number;
  realD7: number;
  renewalCapture: boolean;
  skanMapped: boolean;
  webStitched: boolean;
  skanNull: number;
  webLoss: number;
  chartPx: number;
}

/** The export's initial state, minus the keys the port handles in CSS/markup. */
export const INITIAL_STATE: CalcState = {
  mode: 'sub',
  horizon: 365,
  assumpOpen: false,
  i2t: 8,
  t2p: 35,
  price: 9.99,
  period: 'monthly',
  trialDays: 7,
  retention: 85,
  commission: 15,
  refund: 3,
  cpi: 1.2,
  arpdau: 0.045,
  d1: 32,
  d30: 6,
  adCpi: 0.35,
  realD7: 12.3,
  renewalCapture: false,
  skanMapped: false,
  webStitched: false,
  skanNull: 35,
  webLoss: 20,
  chartPx: 1120,
};

export function cycleDays(s: CalcState): number {
  const p = s.period;
  return p === 'weekly' ? 7 : p === 'annual' ? 365 : 30;
}

export interface SubModel {
  i2p: number;
  netPayment: number;
  cd: number;
  cycles: (d: number) => number;
  paymentsBy: (n: number) => number;
  trueRev: (d: number) => number;
  measRev: (d: number) => number;
  signal: number;
  ltvPayer: number;
  ltvInstall: number;
  cpi: number;
  beTrue: number | null;
  beMeas: number | null;
}

export function subModel(s: CalcState): SubModel {
  const r = s.retention / 100;
  const cd = cycleDays(s);
  const i2p = (s.i2t / 100) * (s.t2p / 100);
  const netPayment = s.price * (1 - s.commission / 100) * (1 - s.refund / 100);
  const cycles = (d: number) => (d < s.trialDays ? 0 : Math.floor((d - s.trialDays) / cd) + 1);
  const paymentsBy = (n: number) => (n === 0 ? 0 : (1 - Math.pow(r, n)) / (1 - r));
  const signal = (s.skanMapped ? 1 : 1 - s.skanNull / 100) * (s.webStitched ? 1 : 1 - s.webLoss / 100);
  const trueRev = (d: number) => i2p * netPayment * paymentsBy(cycles(d));
  const measRev = (d: number) =>
    i2p * netPayment * (s.renewalCapture ? paymentsBy(cycles(d)) : Math.min(1, cycles(d))) * signal;
  const ltvPayer = netPayment / (1 - r);
  const beDay = (fn: (d: number) => number): number | null => {
    for (let n = 1; n <= 900; n++) {
      const d = s.trialDays + (n - 1) * cd;
      if (fn(d) >= s.cpi) return d;
    }
    return null;
  };
  return {
    i2p,
    netPayment,
    cd,
    cycles,
    paymentsBy,
    trueRev,
    measRev,
    signal,
    ltvPayer,
    ltvInstall: i2p * ltvPayer,
    cpi: s.cpi,
    beTrue: beDay(trueRev),
    beMeas: beDay(measRev),
  };
}

export interface AdModel {
  a: number;
  b: number;
  ret: (d: number) => number;
  activeDays: (D: number) => number;
  rev: (D: number) => number;
  be: number | null;
  cpi: number;
  predD7: number;
}

export function adModel(s: CalcState): AdModel {
  const a = s.d1 / 100;
  const b = Math.max(0.01, Math.log(s.d1 / 100 / (s.d30 / 100)) / Math.log(30));
  const ret = (d: number) => a * Math.pow(d, -b);
  const cache: number[] = [1];
  const activeDays = (D: number) => {
    const n = Math.max(0, Math.round(D));
    for (let d = cache.length; d <= n; d++) cache[d] = cache[d - 1]! + ret(d);
    return cache[n]!;
  };
  const rev = (D: number) => s.arpdau * activeDays(D);
  let be: number | null = null;
  for (let d = 1; d <= 3650; d++) {
    if (rev(d) >= s.adCpi) {
      be = d;
      break;
    }
  }
  return { a, b, ret, activeDays, rev, be, cpi: s.adCpi, predD7: ret(7) };
}

/* --- Formatters, verbatim from renderVals -------------------------------- */

/** Note the U+2212 minus sign, not a hyphen. It is inside the latin subset. */
const money = (v: number) => (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(2);
const pct = (v: number) => v.toFixed(1) + '%';
const dayLabel = (d: number | null) => (d === null ? 'never' : 'day ' + d);
const roas = (v: number) => v.toFixed(2) + '×';

/** Absolute-positioned chart label geometry, in px within the chart wrapper. */
export interface LabelBox {
  top: number;
  left?: number;
  width?: number;
  /** Flip the breakeven label to the left of its marker when it runs off the right. */
  flip?: boolean;
}

export interface CalcView {
  isSub: boolean;
  isAd: boolean;
  isAnnual: boolean;
  horizon: number;
  assumpOpen: boolean;
  assumpIcon: string;

  /* chart geometry */
  vb: string;
  axLeft: number;
  axRight: string;
  axBottom: string;
  plotTop: number;
  truePath: string;
  measPath: string;
  gapPath: string;
  gapOpacity: number;
  zeroY: string;
  zeroTextX: number;
  zeroTextY: string;
  day7X: string;
  crossX: string;
  crossOpacity: number;
  crossMarkTop: string;

  /* label positions */
  labels: {
    yLabelWidth: number;
    zero: LabelBox;
    yMax: LabelBox;
    yMin: LabelBox;
    t0: LabelBox;
    tMid: LabelBox;
    tEnd: LabelBox;
    day7: LabelBox;
    be: LabelBox & { opacity: number };
  };

  /* text */
  breakevenLabel: string;
  midTick: string;
  endTick: string;
  yMaxLabel: string;
  yMinLabel: string;
  day7Label: string;
  tileTrue: string;
  tileDash: string;
  tileInvisible: string;
  tileRoas: string;
  roasTileLabel: string;
  modeLabel: string;
  cpiActiveLabel: string;
  ltvActiveLabel: string;
  lifeRoas: string;
  adHorizonRoas: string;
  chartSummary: string;

  /* subscription readouts */
  i2tLabel: string;
  t2pLabel: string;
  priceLabel: string;
  retLabel: string;
  refundLabel: string;
  cpiLabel: string;
  i2pLabel: string;
  netPaymentLabel: string;
  ltvPayerLabel: string;
  ltvInstallLabel: string;
  skanNullLabel: string;
  webLossLabel: string;

  /* ad-monetised readouts */
  arpdauLabel: string;
  d1Label: string;
  d30Label: string;
  adCpiLabel: string;
  bLabel: string;
  predD7Label: string;
  activeD30Label: string;
  d7Mismatch: boolean;

  /* Compact copy of the same curves for the hero, at a fixed viewBox so it
     needs no measurement — the SVG scales to whatever width it is given. */
  mini: {
    vb: string;
    truePath: string;
    measPath: string;
    gapPath: string;
    gapOpacity: number;
    zeroY: string;
    crossX: string;
    crossOpacity: number;
  };

  /* raw values, for the analytics layer */
  breakevenDay: number | null;
  activeCpi: number;
  ltvPerInstall: number;
}

/** Fixed drawing box for the hero chart. Scales via viewBox, never measured. */
const MINI = { w: 340, h: 150, left: 6, right: 6, top: 12, bottom: 12 };

/**
 * The export's `renderVals`, minus the event handlers and the accordion/filter
 * bookkeeping the port handles in markup. Every computation is unchanged.
 */
export function computeView(s: CalcState): CalcView {
  const isSub = s.mode === 'sub';
  const sub = subModel(s);
  const ad = adModel(s);
  const H = isSub && s.period === 'annual' ? 365 : s.horizon;
  const VW = Math.max(280, s.chartPx);
  const VH = Math.max(300, Math.min(420, VW * 0.36));
  const compact = VW < 520;
  const X0 = compact ? 52 : 76;
  const X1 = VW - 16;
  const Y0 = 30;
  const Y1 = VH - 70;
  const cpi = isSub ? sub.cpi : ad.cpi;
  const trueFn = isSub ? sub.trueRev : ad.rev;

  const xs: number[] = [];
  for (let d = 0; d <= H; d++) xs.push(d);
  const tv = xs.map((d) => trueFn(d) - cpi);
  const mv = isSub ? xs.map((d) => sub.measRev(d) - cpi) : [];

  const all = tv.concat(mv, [0, -cpi]);
  const rawMin = Math.min.apply(null, all);
  const rawMax = Math.max.apply(null, all);
  const pad = Math.max((rawMax - rawMin) * 0.12, 0.05);
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const sx = (d: number) => X0 + (d / H) * (X1 - X0);
  const sy = (v: number) => Y1 - ((v - yMin) / (yMax - yMin)) * (Y1 - Y0);

  const stepPath = (vals: number[]) => {
    let p = 'M' + sx(0).toFixed(1) + ' ' + sy(vals[0]!).toFixed(1);
    for (let i = 1; i < xs.length; i++) {
      const x = sx(xs[i]!).toFixed(1);
      p += ' L' + x + ' ' + sy(vals[i - 1]!).toFixed(1) + ' L' + x + ' ' + sy(vals[i]!).toFixed(1);
    }
    return p;
  };
  const smoothPath = (vals: number[]) =>
    xs.map((d, i) => (i ? 'L' : 'M') + sx(d).toFixed(1) + ' ' + sy(vals[i]!).toFixed(1)).join(' ');

  const truePath = isSub ? stepPath(tv) : smoothPath(tv);
  let measPath = '';
  let gapPath = '';
  if (isSub) {
    measPath = stepPath(mv);
    let g = truePath;
    for (let i = xs.length - 1; i >= 0; i--) {
      const x = sx(xs[i]!).toFixed(1);
      g += ' L' + x + ' ' + sy(mv[i]!).toFixed(1);
      if (i > 0) g += ' L' + x + ' ' + sy(mv[i - 1]!).toFixed(1);
    }
    gapPath = g + ' Z';
  }

  const zeroY = sy(0);
  const be = isSub ? sub.beTrue : ad.be;
  const beX = be === null ? X1 : sx(Math.min(be, H));
  const gapAtH = isSub ? sub.trueRev(H) - sub.measRev(H) : 0;
  const predD7 = ad.predD7 * 100;
  const beVisible = be !== null && be <= H;

  /* --- the same curves again, in the hero's fixed box ---------------------
     Same series, same y-domain, so the shape the hero teases is the shape the
     calculator draws. Only the scale differs. */
  const mx = (d: number) => MINI.left + (d / H) * (MINI.w - MINI.left - MINI.right);
  const my = (v: number) =>
    MINI.h - MINI.bottom - ((v - yMin) / (yMax - yMin)) * (MINI.h - MINI.top - MINI.bottom);

  const miniStep = (vals: number[]) => {
    let p = 'M' + mx(0).toFixed(1) + ' ' + my(vals[0]!).toFixed(1);
    for (let i = 1; i < xs.length; i++) {
      const x = mx(xs[i]!).toFixed(1);
      p += ' L' + x + ' ' + my(vals[i - 1]!).toFixed(1) + ' L' + x + ' ' + my(vals[i]!).toFixed(1);
    }
    return p;
  };
  const miniSmooth = (vals: number[]) =>
    xs.map((d, i) => (i ? 'L' : 'M') + mx(d).toFixed(1) + ' ' + my(vals[i]!).toFixed(1)).join(' ');

  const miniTrue = isSub ? miniStep(tv) : miniSmooth(tv);
  let miniMeas = '';
  let miniGap = '';
  if (isSub) {
    miniMeas = miniStep(mv);
    let g = miniTrue;
    for (let i = xs.length - 1; i >= 0; i--) {
      const x = mx(xs[i]!).toFixed(1);
      g += ' L' + x + ' ' + my(mv[i]!).toFixed(1);
      if (i > 0) g += ' L' + x + ' ' + my(mv[i - 1]!).toFixed(1);
    }
    miniGap = g + ' Z';
  }

  return {
    isSub,
    isAd: !isSub,
    isAnnual: isSub && s.period === 'annual',
    horizon: H,
    assumpOpen: s.assumpOpen,
    // U+2212 minus, matching the export.
    assumpIcon: s.assumpOpen ? '−' : '+',

    vb: '0 0 ' + VW.toFixed(0) + ' ' + VH.toFixed(0),
    axLeft: X0,
    axRight: X1.toFixed(1),
    axBottom: Y1.toFixed(1),
    plotTop: Y0,
    truePath,
    measPath,
    gapPath,
    gapOpacity: isSub ? 0.2 : 0,
    zeroY: zeroY.toFixed(1),
    zeroTextX: X0 - 8,
    zeroTextY: (zeroY + 4).toFixed(1),
    day7X: sx(Math.min(7, H)).toFixed(1),
    crossX: beX.toFixed(1),
    crossOpacity: beVisible ? 1 : 0,
    crossMarkTop: Math.max(Y0, zeroY - 56).toFixed(1),

    labels: {
      yLabelWidth: X0 - 8,
      zero: { top: zeroY - 6 },
      yMax: { top: Y0 - 2 },
      yMin: { top: Y1 - 6 },
      t0: { top: Y1 + 12, left: X0 },
      tMid: { top: Y1 + 12, left: (X0 + X1) / 2 },
      tEnd: { top: Y1 + 12, left: X1 },
      day7: { top: Y0 + 2, left: sx(Math.min(7, H)) + 6 },
      be: {
        top: Math.max(Y0, zeroY - 74),
        left: beX,
        flip: beX > VW * 0.55,
        opacity: beVisible ? 1 : 0,
      },
    },

    breakevenLabel: be === null ? 'Never breaks even' : 'Breakeven: day ' + be,
    midTick: 'day ' + Math.round(H / 2),
    endTick: 'day ' + H,
    yMaxLabel: money(yMax),
    yMinLabel: money(yMin),
    day7Label: compact ? 'day 7' : 'Where most teams stop looking',
    tileTrue: dayLabel(be),
    tileDash: isSub ? dayLabel(sub.beMeas) : '—',
    tileInvisible: isSub ? '$' + (gapAtH * 1000).toFixed(0) : '—',
    tileRoas: isSub
      ? roas(sub.measRev(30) / cpi) + ' → ' + roas(sub.trueRev(30) / cpi)
      : roas(ad.rev(30) / cpi),
    roasTileLabel: isSub ? 'ROAS AT D30 · MEASURED → TRUE' : 'ROAS AT D30',
    modeLabel: isSub ? 'Subscription' : 'Ad-monetised',
    cpiActiveLabel: '$' + cpi.toFixed(2),
    ltvActiveLabel: isSub ? '$' + sub.ltvInstall.toFixed(2) : '$' + ad.rev(H).toFixed(2),
    lifeRoas: roas(sub.ltvInstall / sub.cpi),
    adHorizonRoas: roas(ad.rev(H) / ad.cpi),

    i2tLabel: pct(s.i2t),
    t2pLabel: pct(s.t2p),
    priceLabel: '$' + s.price.toFixed(2),
    retLabel: pct(s.retention),
    refundLabel: pct(s.refund),
    cpiLabel: '$' + s.cpi.toFixed(2),
    i2pLabel: (sub.i2p * 100).toFixed(2) + '%',
    netPaymentLabel: '$' + sub.netPayment.toFixed(2),
    ltvPayerLabel: '$' + sub.ltvPayer.toFixed(2),
    ltvInstallLabel: '$' + sub.ltvInstall.toFixed(2),
    skanNullLabel: s.skanNull.toFixed(0) + '%',
    webLossLabel: s.webLoss.toFixed(0) + '%',

    arpdauLabel: '$' + s.arpdau.toFixed(3),
    d1Label: s.d1.toFixed(0) + '%',
    d30Label: s.d30.toFixed(0) + '%',
    adCpiLabel: '$' + s.adCpi.toFixed(2),
    bLabel: ad.b.toFixed(3),
    predD7Label: predD7.toFixed(1) + '%',
    activeD30Label: ad.activeDays(30).toFixed(2) + ' days',
    d7Mismatch: !isSub && Math.abs(s.realD7 - predD7) > Math.max(2, predD7 * 0.25),

    chartSummary: isSub
      ? 'Subscription model. ' +
        (sub.i2p * 100).toFixed(2) +
        '% of installs become payers at ' +
        money(sub.netPayment) +
        ' net per payment, so lifetime value is ' +
        money(sub.ltvInstall) +
        ' per install against ' +
        money(sub.cpi) +
        ' cost per install. True cumulative net per install is ' +
        money(sub.trueRev(H) - sub.cpi) +
        ' by day ' +
        H +
        ', breaking even ' +
        (be === null ? 'never' : 'on day ' + be) +
        '. What the dashboard measures reaches ' +
        money(sub.measRev(H) - sub.cpi) +
        ' and breaks even ' +
        (sub.beMeas === null ? 'never' : 'on day ' + sub.beMeas) +
        '. The gap invisible to the dashboard is ' +
        money(gapAtH * 1000) +
        ' per thousand installs.'
      : 'Ad-monetised model. Fitted decay exponent b is ' +
        ad.b.toFixed(3) +
        ' from D1 ' +
        s.d1 +
        '% and D30 ' +
        s.d30 +
        '%, predicting D7 of ' +
        predD7.toFixed(1) +
        '% and ' +
        ad.activeDays(30).toFixed(2) +
        ' cumulative active days by day 30. At ' +
        money(s.arpdau) +
        ' ARPDAU an install returns ' +
        money(ad.rev(H)) +
        ' by day ' +
        H +
        ' against ' +
        money(ad.cpi) +
        ' cost per install, breaking even ' +
        (ad.be === null ? 'never' : 'on day ' + ad.be) +
        '.',

    mini: {
      vb: `0 0 ${MINI.w} ${MINI.h}`,
      truePath: miniTrue,
      measPath: miniMeas,
      gapPath: miniGap,
      gapOpacity: isSub ? 0.22 : 0,
      zeroY: my(0).toFixed(1),
      crossX: (be === null ? MINI.w - MINI.right : mx(Math.min(be, H))).toFixed(1),
      crossOpacity: beVisible ? 1 : 0,
    },

    breakevenDay: be,
    activeCpi: cpi,
    ltvPerInstall: isSub ? sub.ltvInstall : ad.rev(H),
  };
}

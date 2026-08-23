/**
 * The dying retention curve on the first bento card.
 *
 * `a · d^-b` fitted through D1 = 0.32 and D30 = 0.03 — the same two figures the
 * card's own code line quotes, so the picture and the caption agree.
 *
 * Drawn once at a fixed 300x96 box, so it needs no measurement and no resize
 * handling. This is decorative geometry, not the payback model: nothing here
 * feeds calc-model.ts, and calc-model.ts feeds nothing here.
 */

const W = 300;
const H = 96;
const A = 0.32; // D1
const D30 = 0.03;
const B = Math.log(A / D30) / Math.log(30);

const fx = (d: number) => 2 + ((d - 1) / 59) * (W - 4);
const fy = (v: number) => H - 10 - (v / A) * (H - 26);

export interface DecayCurve {
  /** The retention line itself. */
  line: string;
  /** The same line closed to the baseline, for the tinted fill. */
  area: string;
  /** Where the dashed payback marker sits, at day 45. */
  payX: string;
  /** Label anchor, offset left so the text sits before the marker. */
  payLabelX: string;
  viewBox: string;
  height: number;
}

export function decayCurve(): DecayCurve {
  const points: [number, number][] = [];
  for (let d = 1; d <= 60; d++) points.push([d, A * Math.pow(d, -B)]);

  let line = `M${fx(1).toFixed(1)} ${fy(points[0]![1]).toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    line += ` L${fx(points[i]![0]).toFixed(1)} ${fy(points[i]![1]).toFixed(1)}`;
  }

  const base = (H - 10).toFixed(1);
  const area = `${line} L${fx(60).toFixed(1)} ${base} L${fx(1).toFixed(1)} ${base} Z`;

  return {
    line,
    area,
    payX: fx(45).toFixed(1),
    payLabelX: (fx(45) - 96).toFixed(1),
    viewBox: `0 0 ${W} ${H}`,
    height: H,
  };
}

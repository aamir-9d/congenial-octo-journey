/**
 * Chart geometry for the Payback Map.
 *
 * Pure, and imported by both the Astro component and the browser controller,
 * so the server's first paint and the client's first re-render are the same
 * drawing rather than two implementations that agree at one horizon.
 *
 * ── Axis labels are not in here ──────────────────────────────────────────
 *
 * This returns positions as fractions of the plot box, never `<text>`. SVG
 * text scales with the viewBox: an 11px label in a 920-wide box renders at
 * about 7px once the box is 390 wide on a phone, which is how the automation
 * charts shipped unreadable. The component places labels as HTML positioned
 * from these fractions, where a font size means what it says.
 *
 * ── The curve shape is the model's, not a smoothing choice ───────────────
 *
 * Subscription revenue arrives on payment dates, so its curve is a staircase
 * and is drawn as one: a horizontal run to the payment day, then a vertical
 * step. Interpolating between payments would draw revenue accruing on days no
 * money moved. Ad revenue accrues daily and is drawn as a polyline.
 */

/** The drawing box. Scales via viewBox; never measured from the DOM. */
/* left and right are 0 so a fraction of the plot is a fraction of the SVG:
   the HTML axis labels are positioned from those same fractions, and any inset
   here would slide every tick away from the point it labels. The marker is
   allowed to overhang via `overflow: visible`. */
export const BOX = { w: 920, h: 300, top: 16, right: 0, bottom: 12, left: 0 } as const;

export interface ChartGeometry {
  /** The curve itself. */
  path: string;
  /** The same curve closed down to the zero line, for the positive-region fill. */
  fill: string;
  /** Fraction 0..1 across the plot for a given day. */
  xOf: (day: number) => number;
  /** Fraction 0..1 down the plot for a given value. */
  yOf: (value: number) => number;
  /** Where $0.00 sits, as a fraction down the plot. */
  zero: number;
  min: number;
  max: number;
}

const X0 = BOX.left;
const X1 = BOX.w - BOX.right;
const Y0 = BOX.top;
const Y1 = BOX.h - BOX.bottom;

/**
 * @param series cumulative net per install, indexed by day from 0
 * @param stepped true for subscription billing, false for daily ad revenue
 */
export function buildChart(series: number[], stepped: boolean): ChartGeometry {
  const H = series.length - 1;

  let lo = Math.min(...series);
  let hi = Math.max(...series);

  /* Zero must be on the chart — it is the line the whole section is about —
     and a flat series still needs a box with height. */
  lo = Math.min(lo, 0);
  hi = Math.max(hi, 0);
  if (hi - lo < 1e-9) hi = lo + 1;

  // A little headroom so the curve never runs along the frame.
  const pad = (hi - lo) * 0.08;
  const min = lo - pad;
  const max = hi + pad;

  const fx = (day: number) => (H === 0 ? 0 : day / H);
  const fy = (v: number) => (max - v) / (max - min);

  const px = (day: number) => X0 + fx(day) * (X1 - X0);
  const py = (v: number) => Y0 + fy(v) * (Y1 - Y0);

  const n = (v: number) => Math.round(v * 10) / 10;

  let path = `M${n(px(0))} ${n(py(series[0]!))}`;
  for (let d = 1; d <= H; d++) {
    const x = n(px(d));
    if (stepped) {
      // Across at the old value, then up. Money moves on payment days only.
      path += ` L${x} ${n(py(series[d - 1]!))} L${x} ${n(py(series[d]!))}`;
    } else {
      path += ` L${x} ${n(py(series[d]!))}`;
    }
  }

  /* Only the part above zero is shaded. Closing the whole curve down to the
     zero line would wash the negative region in the same colour as the
     surplus, which says the opposite of what the section is for: those are the
     days the money has not come back yet. So the fill starts where the series
     first reaches zero and runs from there. */
  const zeroY = n(py(0));
  let fill = '';
  const firstUp = series.findIndex((v) => v >= 0);
  if (firstUp !== -1) {
    fill = `M${n(px(firstUp))} ${zeroY}`;
    for (let d = firstUp; d <= H; d++) {
      const x = n(px(d));
      if (stepped && d > firstUp) {
        fill += ` L${x} ${n(py(series[d - 1]!))} L${x} ${n(py(series[d]!))}`;
      } else {
        fill += ` L${x} ${n(py(series[d]!))}`;
      }
    }
    fill += ` L${n(px(H))} ${zeroY} Z`;
  }

  return { path, fill, xOf: fx, yOf: fy, zero: fy(0), min, max };
}

/**
 * The E2E Apps mark — direction 1f, "App tile".
 *
 * A rounded app-store tile with "E2E" drawn inside it. The lettering is
 * geometry, not type: nothing here depends on a font loading, so the mark is
 * identical whether or not Be Vietnam Pro has arrived, and it scales as pure
 * vector to a favicon.
 *
 * The path data is not hand-drawn. It is the exact output of the `tile()`,
 * `word()` and `glyphE()` functions in
 * `design/E2E Apps - Logo directions.dc.html`, evaluated once and recorded
 * here. `tests/logo.test.ts` re-evaluates those functions against this file and
 * fails if they ever disagree, so the shipped mark cannot drift from the
 * approved one.
 *
 * Two forms, because the design specifies a reduction:
 *
 *   FULL   at 25px and above — the tile carries the three-glyph "E2E".
 *   COMPACT at 24px and below — the tile radius tightens, the stroke thickens,
 *           and the wordmark drops to a single E. Three glyphs cannot hold a
 *           100-unit box down to 16px; the tile silhouette can.
 */

export interface LogoForm {
  /** Corner radius on the 92-unit tile. */
  rx: number;
  /** Stroke width used when the tile is drawn as an outline. */
  strokeWidth: number;
  /** Stroke width of the lettering inside the tile. */
  glyphStroke: number;
  /** The lettering, as stroked paths on the same 100x100 box. */
  paths: string[];
}

/** 25px and above. */
export const FULL: LogoForm = {
  rx: 23,
  strokeWidth: 8,
  glyphStroke: 6.4,
  paths: [
    'M24.2 33 V67 M21 36.2 H36.08 M21 50 H32.7624 M21 63.8 H36.08',
    'M42.46 43.2 C42.46 33 57.54 33 57.54 43.88 C57.54 52.040000000000006 42.46 61.56 42.46 63.8 H57.54',
    'M67.12 33 V67 M63.92 36.2 H79 M63.92 50 H75.6824 M63.92 63.8 H79',
  ],
};

/** 24px and below. */
export const COMPACT: LogoForm = {
  rx: 20,
  strokeWidth: 8,
  glyphStroke: 12,
  paths: ['M43 27 V73 M37 33 H63 M37 50 H57.28 M37 67 H63'],
};

/** The threshold the design states for dropping to the single-glyph form. */
export const COMPACT_AT_OR_BELOW = 24;

/**
 * Colour treatments.
 *
 * `filled` is the default: an amber tile with ink lettering. `outline` is for
 * the case the design calls out — when foreground and accent are the same
 * colour, a filled tile would hide its own wordmark, so it draws as an outline
 * instead. That is what the on-accent cell of the logo sheet uses, and it is
 * also the right treatment anywhere the mark sits on amber.
 */
export type LogoTreatment = 'filled' | 'outline' | 'mono';

/** Build the SVG markup for one mark. Used by the component and the icon build. */
export function markup(size: number, treatment: LogoTreatment = 'filled'): string {
  const form = size <= COMPACT_AT_OR_BELOW ? COMPACT : FULL;

  // `filled` is the brand default. `outline` keeps the tile as a ring so the
  // lettering stays legible on a filled accent ground. `mono` is the one-bit
  // form: everything inherits currentColor, for print, fax and single-colour use.
  const tileFill = treatment === 'filled' ? '#E39A1F' : 'none';
  const tileStroke = treatment === 'filled' ? 'none' : 'currentColor';
  const ink = treatment === 'filled' ? '#101725' : 'currentColor';

  const tile =
    `<rect x="4" y="4" width="92" height="92" rx="${form.rx}" fill="${tileFill}"` +
    (tileStroke === 'none' ? '' : ` stroke="${tileStroke}" stroke-width="${form.strokeWidth}"`) +
    '/>';

  const glyphs = form.paths
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${form.glyphStroke}" stroke-linecap="butt" stroke-linejoin="round"/>`,
    )
    .join('');

  return tile + glyphs;
}

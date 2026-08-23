/**
 * dataLayer helpers.
 *
 * One place that knows how to push an event, so every call site is consistent
 * and every event name is greppable. GA4 reads these through GTM; Google Ads
 * conversions are triggered from the same events.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type EventName =
  // Calculator — real lead intelligence, not vanity. Someone at $4 CPI on a
  // $99 annual plan is a very different lead from someone at $0.30 weekly.
  | 'calc_mode_switch'
  | 'calc_slider_change'
  | 'calc_gap_toggle'
  | 'calc_breakeven_computed'
  | 'calc_preset_select'
  // Engagement
  | 'scroll_depth'
  | 'section_view'
  | 'product_overview_open'
  // Conversions
  | 'generate_lead'
  | 'booking_complete'
  | 'form_error';

export function track(event: EventName, params: Record<string, unknown> = {}): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/**
 * SHA-256 hex of a normalised value, for enhanced conversions.
 *
 * Google, Meta and LinkedIn all expect the same normalisation — trim,
 * lowercase, then hash — so the same digest satisfies all three. Hashing here
 * rather than handing the tag a plain email means the raw address never enters
 * the dataLayer, where any other tag on the page could read it.
 *
 * Returns null on http:// origins, where SubtleCrypto is unavailable. The
 * Worker hashes server-side regardless, so the conversion still lands.
 */
export async function hashForMatching(value: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Trailing debounce.
 *
 * Used on the sliders so dragging one from 0.20 to 4.00 lands as a single
 * `calc_slider_change` at the value the user settled on, rather than eighty
 * events describing the journey.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

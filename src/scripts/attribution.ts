/**
 * Click-ID capture.
 *
 * Reads the ad-platform click identifiers off the landing URL and keeps them in
 * a first-party cookie for 90 days, so a form submitted three weeks after the
 * click still carries the click that earned it. Every submission — form and
 * booking alike — attaches this payload.
 *
 * This is the exact mechanic the page sells under "Web-to-App Attribution".
 * Running it on ourselves is the point.
 *
 * Deliberately not gated on consent: the identifiers are first-party, written
 * to our own cookie, and used only to attribute a conversion the visitor
 * initiates by submitting a form. Nothing is transmitted anywhere until they
 * submit. Tag firing *is* gated — see consent.ts.
 */

const COOKIE = 'e2e_attr';
const MAX_AGE_DAYS = 90;

/** Every click ID the ad platforms we buy on hand back. */
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'li_fat_id', 'ttclid'] as const;
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type Attribution = Partial<Record<(typeof CLICK_IDS)[number], string>> &
  Partial<Record<(typeof UTMS)[number], string>> & {
    first_seen?: string;
    landing_page?: string;
    referrer?: string;
  };

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]!) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function getAttribution(): Attribution {
  const raw = readCookie(COOKIE);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Attribution) : {};
  } catch {
    // A malformed cookie is worth nothing; start clean rather than throwing on
    // every page load.
    return {};
  }
}

/**
 * Merge whatever is on this URL into the stored attribution.
 *
 * A fresh click ID overwrites the stored one — the most recent click is the
 * one that gets the credit. First-touch context (when we first saw them, where
 * they landed, who referred them) is written once and then left alone.
 */
export function captureAttribution(): Attribution {
  const params = new URLSearchParams(location.search);
  const stored = getAttribution();
  const next: Attribution = { ...stored };
  let changed = false;

  for (const key of [...CLICK_IDS, ...UTMS]) {
    const value = params.get(key);
    if (value && value !== next[key]) {
      next[key] = value.slice(0, 512);
      changed = true;
    }
  }

  if (!next.first_seen) {
    next.first_seen = new Date().toISOString();
    next.landing_page = location.pathname + location.search;
    // Only an external referrer tells us anything.
    const ref = document.referrer;
    next.referrer = ref && !ref.startsWith(location.origin) ? ref.slice(0, 512) : '';
    changed = true;
  }

  if (changed) writeCookie(COOKIE, JSON.stringify(next), MAX_AGE_DAYS);
  return next;
}

/** True when at least one paid click identifier is on record. */
export function hasPaidClick(attr: Attribution = getAttribution()): boolean {
  return CLICK_IDS.some((k) => Boolean(attr[k]));
}

/**
 * Consent Mode v2 and the banner that drives it.
 *
 * Everything defaults to denied. GTM loads regardless — that is how Consent
 * Mode is meant to work — but until consent is granted, tags either hold their
 * hits or send cookieless pings. Nothing writes an analytics or advertising
 * cookie before the visitor decides.
 *
 * The defaults are set in an inline head script (see Analytics.astro), before
 * the GTM snippet, because a default that arrives after the container has
 * already fired is a default that did nothing.
 */

const COOKIE = 'e2e_consent';
const MAX_AGE_DAYS = 180;

export type ConsentDecision = 'granted' | 'denied';

export interface ConsentState {
  analytics_storage: ConsentDecision;
  ad_storage: ConsentDecision;
  ad_user_data: ConsentDecision;
  ad_personalization: ConsentDecision;
}

export const DENIED: ConsentState = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

export const GRANTED: ConsentState = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]!) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 24 * 60 * 60}; Path=/; SameSite=Lax${secure}`;
}

export function storedConsent(): ConsentState | null {
  const raw = readCookie(COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed?.analytics_storage !== 'granted' && parsed?.analytics_storage !== 'denied') {
      return null;
    }
    return { ...DENIED, ...parsed };
  } catch {
    return null;
  }
}

/** True once the visitor has allowed analytics storage. */
export function hasAnalyticsConsent(): boolean {
  return storedConsent()?.analytics_storage === 'granted';
}

function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function applyConsent(state: ConsentState, persist: boolean): void {
  gtag('consent', 'update', state);
  window.dataLayer?.push({
    event: 'consent_update',
    consent_analytics: state.analytics_storage,
    consent_ads: state.ad_storage,
  });
  if (persist) writeCookie(COOKIE, JSON.stringify(state), MAX_AGE_DAYS);
}

export function initConsent(): void {
  const banner = document.getElementById('consent-banner');

  // A stored decision replays on every page load so the container knows about
  // it before anything else fires.
  const stored = storedConsent();
  if (stored) {
    applyConsent(stored, false);
    banner?.remove();
    return;
  }

  if (!banner) return;
  banner.hidden = false;

  const decide = (state: ConsentState) => {
    applyConsent(state, true);
    banner.hidden = true;
    banner.remove();
  };

  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => decide(GRANTED));
  banner.querySelector('[data-consent="reject"]')?.addEventListener('click', () => decide(DENIED));
}

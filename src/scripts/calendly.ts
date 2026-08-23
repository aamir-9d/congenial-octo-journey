/**
 * Inline Calendly, loaded on approach.
 *
 * The widget script is ~90KB and opens its own connections. Fetching it at
 * first paint would cost the mobile Lighthouse budget for a section most
 * visitors scroll past, so nothing loads until the embed is within a viewport
 * of the fold.
 *
 * Inline rather than popup: popups get blocked, and a blocked popup is a lost
 * conversion.
 */
import { track } from './analytics';
import { getAttribution } from './attribution';

const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget(opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, string>;
      }): void;
    };
  }
}

function loadOnce(): Promise<void> {
  if (window.Calendly) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = WIDGET_CSS;
      document.head.appendChild(css);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('calendly script failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('calendly script failed'));
    document.head.appendChild(script);
  });
}

/**
 * Calendly forwards UTM parameters into the booking record, so the click that
 * produced a meeting is visible in Calendly itself as well as in GA4.
 */
function utmFromAttribution(): Record<string, string> {
  const attr = getAttribution();
  const utm: Record<string, string> = {};
  if (attr.utm_source) utm.utm_source = attr.utm_source;
  if (attr.utm_medium) utm.utm_medium = attr.utm_medium;
  if (attr.utm_campaign) utm.utm_campaign = attr.utm_campaign;
  if (attr.utm_term) utm.utm_term = attr.utm_term;
  if (attr.utm_content) utm.utm_content = attr.utm_content;
  // No UTMs but a paid click ID still tells us the channel.
  if (!utm.utm_source && attr.gclid) utm.utm_source = 'google';
  if (!utm.utm_source && attr.li_fat_id) utm.utm_source = 'linkedin';
  return utm;
}

function listenForBooking(): void {
  window.addEventListener('message', (e: MessageEvent) => {
    if (typeof e.origin !== 'string' || !e.origin.endsWith('calendly.com')) return;
    const data = e.data as { event?: string } | null;
    if (!data || typeof data.event !== 'string') return;

    if (data.event === 'calendly.event_scheduled') {
      const attr = getAttribution();
      track('booking_complete', {
        method: 'calendly',
        gclid: attr.gclid ?? '',
        gbraid: attr.gbraid ?? '',
        wbraid: attr.wbraid ?? '',
        li_fat_id: attr.li_fat_id ?? '',
        utm_source: attr.utm_source ?? '',
        utm_campaign: attr.utm_campaign ?? '',
      });
    }
  });
}

export function initCalendly(): void {
  const host = document.getElementById('calendly-embed');
  const url = host?.dataset.calendlyUrl;
  if (!host || !url) return;

  listenForBooking();

  const mount = () => {
    loadOnce()
      .then(() => {
        window.Calendly?.initInlineWidget({
          url,
          parentElement: host,
          prefill: {},
          utm: utmFromAttribution(),
        });
      })
      .catch(() => {
        // If the widget cannot load, leave a link rather than an empty box.
        host.innerHTML =
          '<p style="padding:var(--s8)"><a class="link" target="_blank" rel="noopener" href="' +
          url.replace(/"/g, '&quot;') +
          '">Open the booking calendar</a></p>';
      });
  };

  if (typeof IntersectionObserver === 'undefined') {
    window.addEventListener('load', mount, { once: true });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        mount();
      }
    },
    { rootMargin: '100% 0px' },
  );
  io.observe(host);
}

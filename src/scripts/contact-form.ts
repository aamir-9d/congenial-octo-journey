/**
 * Contact form: client validation, spam gates, submit, conversion event.
 *
 * The client checks exist to give fast feedback, not to protect anything — the
 * Worker revalidates every field and reapplies both spam gates, because a
 * client check is a suggestion.
 *
 * Copy in the site's voice: plain, specific, no exclamation marks.
 */
import { track, hashForMatching } from './analytics';
import { getAttribution } from './attribution';

/** Bots fill forms faster than people read them. */
const MIN_FILL_MS = 3000;

interface FieldRule {
  required: boolean;
  message: string;
  test?: (value: string) => boolean;
}

const RULES: Record<string, FieldRule> = {
  name: { required: true, message: 'We need something to call you.' },
  email: {
    required: true,
    message: "That doesn't look like an email address.",
    // Deliberately loose. Anything stricter rejects real addresses, and the
    // only real test of an address is whether mail to it arrives.
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  },
  appUrl: {
    required: false,
    message: 'Needs to start with http:// or https://',
    test: (v) => v === '' || /^https?:\/\/\S+$/.test(v),
  },
  spend: { required: true, message: 'Pick the closest band.' },
  message: {
    required: true,
    message: 'A sentence or two is enough.',
    test: (v) => v.trim().length >= 10,
  },
};

export function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  const endpoint = form.dataset.endpoint ?? '';
  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]');
  const renderedAt = Date.now();

  const errorFor = (field: string) =>
    form.querySelector<HTMLElement>(`[data-error="${field}"]`);

  function setError(field: string, message: string | null): void {
    const slot = errorFor(field);
    const input = form!.elements.namedItem(field) as HTMLElement | null;
    if (slot) {
      slot.textContent = message ?? '';
      slot.hidden = !message;
    }
    input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate(): string[] {
    const failed: string[] = [];
    for (const [field, rule] of Object.entries(RULES)) {
      const input = form!.elements.namedItem(field) as HTMLInputElement | null;
      if (!input) continue;
      const value = input.value.trim();

      let message: string | null = null;
      if (rule.required && !value) message = rule.message;
      else if (value && rule.test && !rule.test(value)) message = rule.message;

      setError(field, message);
      if (message) failed.push(field);
    }
    return failed;
  }

  function say(message: string, tone: 'ok' | 'error'): void {
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
    status.hidden = false;
  }

  // Clear a field's error as soon as the visitor starts fixing it.
  for (const field of Object.keys(RULES)) {
    const input = form.elements.namedItem(field) as HTMLElement | null;
    input?.addEventListener('input', () => setError(field, null), { once: false });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const failed = validate();
    if (failed.length) {
      say('Some of that needs another look.', 'error');
      const first = form.elements.namedItem(failed[0]!) as HTMLElement | null;
      first?.focus();
      track('form_error', { form_name: 'contact', error_fields: failed.join(',') });
      return;
    }

    if (!endpoint) {
      // Nothing configured yet — say so rather than pretending it sent.
      say(
        "The form isn't wired up on this build. Email hello@e2eapps.com and it reaches the same inbox.",
        'error',
      );
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      appUrl: String(data.get('appUrl') ?? '').trim(),
      spend: String(data.get('spend') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      // Spam gates. The Worker checks both again.
      company_website: String(data.get('company_website') ?? ''),
      elapsedMs: Date.now() - renderedAt,
      // Every click identifier we have on this visitor.
      attribution: getAttribution(),
      page: location.pathname + location.search,
    };

    if (payload.elapsedMs < MIN_FILL_MS) {
      say('That submitted a little fast. Give it a moment and try again.', 'error');
      return;
    }

    submit?.setAttribute('disabled', '');
    say('Sending.', 'ok');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`endpoint returned ${res.status}`);

      // The Worker mints one event id per submission and uses it for its own
      // CAPI calls. Reusing it here is what lets the platforms dedupe the
      // browser conversion against the server one.
      const result = (await res.json().catch(() => null)) as { eventId?: string } | null;

      form.reset();
      say(
        "Got it. I read these myself and reply within a working day — usually with a question or two before the call.",
        'ok',
      );

      const attr = payload.attribution;
      // Enhanced conversions: the hash, never the address itself.
      const hashedEmail = await hashForMatching(payload.email);

      track('generate_lead', {
        form_name: 'contact',
        monthly_spend: payload.spend,
        has_app_url: payload.appUrl !== '',
        gclid: attr.gclid ?? '',
        gbraid: attr.gbraid ?? '',
        wbraid: attr.wbraid ?? '',
        li_fat_id: attr.li_fat_id ?? '',
        utm_source: attr.utm_source ?? '',
        utm_campaign: attr.utm_campaign ?? '',
        // Deduplicates the browser conversion against the Worker's CAPI copy,
        // so one lead is counted once.
        event_id: result?.eventId ?? '',
        enhanced_conversion_data: hashedEmail ? { sha256_email_address: hashedEmail } : undefined,
      });
    } catch {
      say(
        "That didn't send — something between here and the server. Email hello@e2eapps.com and it reaches the same inbox.",
        'error',
      );
      track('form_error', { form_name: 'contact', error_fields: 'transport' });
    } finally {
      submit?.removeAttribute('disabled');
    }
  });
}

/**
 * Form endpoint for the E2E Apps site.
 *
 * GitHub Pages is static and cannot run this, so it lives on Cloudflare
 * Workers (free tier) and the static form posts to it cross-origin. That is
 * the only reason this is a separate deployable.
 *
 * Responsibilities, in order:
 *   1. re-validate every field (a client check is a suggestion),
 *   2. reapply both spam gates,
 *   3. send the email via Resend,
 *   4. fan out the conversion to Meta CAPI, LinkedIn CAPI and GA4 —
 *      server-side, so an ad blocker cannot lose the conversion.
 *
 * Steps 1–3 decide the response. Step 4 runs after the reply is sent and can
 * never turn a delivered email into a visible error.
 *
 * Deploy:  cd worker && npx wrangler deploy
 * Secrets: npx wrangler secret put RESEND_API_KEY   (and the rest)
 */

const MIN_FILL_MS = 3000;
const MAX_BODY_BYTES = 64 * 1024;

/** Only these origins may post here. */
const ALLOWED_ORIGINS = [
  'https://e2eapps.com',
  'https://www.e2eapps.com',
  'https://aamir-9d.github.io',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/* --- validation ----------------------------------------------------------- */

const SPEND_BANDS = new Set([
  'Not spending yet',
  'Under $10k / month',
  '$10k – $50k / month',
  '$50k – $250k / month',
  'Over $250k / month',
]);

function validate(body) {
  const errors = [];
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const appUrl = str(body.appUrl, 400);
  const spend = str(body.spend, 60);
  const message = str(body.message, 4000);

  if (!name) errors.push('name');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('email');
  if (appUrl && !/^https?:\/\/\S+$/.test(appUrl)) errors.push('appUrl');
  if (!spend || !SPEND_BANDS.has(spend)) errors.push('spend');
  if (message.length < 10) errors.push('message');

  return { errors, clean: { name, email, appUrl, spend, message } };
}

/** Both gates, reapplied. The honeypot must be empty and the fill must be human-slow. */
function looksAutomated(body) {
  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') return true;
  const elapsed = Number(body.elapsedMs);
  return !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;
}

/* --- hashing -------------------------------------------------------------- */

/** Lowercase, trim, SHA-256, hex. The normalisation every CAPI expects. */
async function sha256(value) {
  const data = new TextEncoder().encode(String(value).trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* --- email ---------------------------------------------------------------- */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function sendEmail(env, clean, attribution, meta) {
  const clicks = Object.entries(attribution)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${esc(v)}</td></tr>`)
    .join('');

  const html = `
<h2>${esc(clean.name)} — ${esc(clean.spend)}</h2>
<p><strong>Email:</strong> <a href="mailto:${esc(clean.email)}">${esc(clean.email)}</a><br>
<strong>App:</strong> ${clean.appUrl ? `<a href="${esc(clean.appUrl)}">${esc(clean.appUrl)}</a>` : '—'}</p>
<h3>Message</h3>
<p style="white-space:pre-wrap">${esc(clean.message)}</p>
<h3>Attribution</h3>
<table cellpadding="4" style="border-collapse:collapse">${clicks || '<tr><td colspan="2">No click identifiers — direct or organic.</td></tr>'}</table>
<p style="color:#5C6779;font-size:12px">Page ${esc(meta.page)} · ${esc(meta.country)} · ${esc(meta.receivedAt)}</p>
`.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'forms@e2eapps.com',
      to: [env.RESEND_TO || 'hello@e2eapps.com'],
      reply_to: clean.email,
      subject: `${clean.name} — ${clean.spend}`,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

/* --- conversion fan-out --------------------------------------------------- */

async function sendMetaCapi(env, clean, attribution, meta) {
  if (!env.META_CAPI_TOKEN || !env.META_PIXEL_ID) return;

  const userData = { em: [await sha256(clean.email)], client_ip_address: meta.ip, client_user_agent: meta.ua };
  if (attribution.fbclid) {
    // Meta's required fbc format: fb.<subdomain-index>.<click-time-ms>.<fbclid>
    userData.fbc = `fb.1.${Date.now()}.${attribution.fbclid}`;
  }

  await fetch(`https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: meta.eventId, // dedupes against any browser pixel
          event_source_url: meta.pageUrl,
          action_source: 'website',
          user_data: userData,
        },
      ],
      access_token: env.META_CAPI_TOKEN,
    }),
  });
}

async function sendLinkedInCapi(env, clean, meta) {
  if (!env.LINKEDIN_CAPI_TOKEN || !env.LINKEDIN_CONVERSION_ID) return;

  await fetch('https://api.linkedin.com/rest/conversionEvents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_CAPI_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202411',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      conversion: `urn:lla:llaPartnerConversion:${env.LINKEDIN_CONVERSION_ID}`,
      conversionHappenedAt: Date.now(),
      user: {
        userIds: [{ idType: 'SHA256_EMAIL', idValue: await sha256(clean.email) }],
        userInfo: { firstName: clean.name.split(' ')[0] || '', lastName: clean.name.split(' ').slice(1).join(' ') || '' },
      },
    }),
  });
}

async function sendGa4(env, clean, attribution, meta) {
  if (!env.GA4_API_SECRET || !env.GA4_MEASUREMENT_ID) return;

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: meta.eventId,
        events: [
          {
            name: 'generate_lead',
            params: {
              form_name: 'contact',
              monthly_spend: clean.spend,
              gclid: attribution.gclid || '',
              utm_source: attribution.utm_source || '',
              utm_campaign: attribution.utm_campaign || '',
              engagement_time_msec: 1,
            },
          },
        ],
      }),
    },
  );
}

/**
 * Fire and forget, in parallel, after the response has gone out. A CAPI being
 * down must never make a delivered email look like a failure to the visitor.
 */
async function fanOut(env, clean, attribution, meta) {
  const results = await Promise.allSettled([
    sendMetaCapi(env, clean, attribution, meta),
    sendLinkedInCapi(env, clean, meta),
    sendGa4(env, clean, attribution, meta),
  ]);
  for (const r of results) {
    if (r.status === 'rejected') console.error('conversion fan-out failed:', r.reason);
  }
}

/* --- handler -------------------------------------------------------------- */

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') ?? '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405, origin);
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return json({ ok: false, error: 'forbidden_origin' }, 403, origin);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'payload_too_large' }, 413, origin);
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400, origin);
    }

    // Spam gets a 200. Telling a bot why it failed just helps it try again,
    // and a real person can never reach this branch.
    if (looksAutomated(body)) {
      return json({ ok: true }, 200, origin);
    }

    const { errors, clean } = validate(body);
    if (errors.length) {
      return json({ ok: false, error: 'validation_failed', fields: errors }, 422, origin);
    }

    const attribution = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
    const meta = {
      ip: request.headers.get('CF-Connecting-IP') ?? '',
      ua: request.headers.get('User-Agent') ?? '',
      country: request.cf?.country ?? 'unknown',
      page: typeof body.page === 'string' ? body.page.slice(0, 300) : '/',
      pageUrl: `${ALLOWED_ORIGINS[0]}${typeof body.page === 'string' ? body.page : '/'}`,
      receivedAt: new Date().toISOString(),
      eventId: crypto.randomUUID(),
    };

    try {
      await sendEmail(env, clean, attribution, meta);
    } catch (err) {
      console.error('resend failed:', err);
      return json({ ok: false, error: 'send_failed' }, 502, origin);
    }

    ctx.waitUntil(fanOut(env, clean, attribution, meta));
    return json({ ok: true, eventId: meta.eventId }, 200, origin);
  },
};

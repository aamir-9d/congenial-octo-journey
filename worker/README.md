# Form endpoint

GitHub Pages is static and cannot run server code, so the contact form posts
here instead. One Worker, one route, free tier.

## Deploy

```sh
cd worker
npx wrangler deploy
```

Wrangler is run through `npx` on purpose — it stays out of the site's
`package.json` so the site keeps a zero-dependency build beyond Astro itself.

## Secrets

Never in `wrangler.toml`, never in the repo:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put META_CAPI_TOKEN        # optional
npx wrangler secret put LINKEDIN_CAPI_TOKEN    # optional
npx wrangler secret put GA4_API_SECRET         # optional
```

Only `RESEND_API_KEY` is required. Each conversion API stays dormant until both
its token and its id are set, so you can wire them one at a time.

Non-secret ids (`META_PIXEL_ID`, `LINKEDIN_CONVERSION_ID`, `GA4_MEASUREMENT_ID`)
go in the `[vars]` block of `wrangler.toml`.

## After deploying

Put the Worker's URL in the site's `PUBLIC_FORM_ENDPOINT`, with `/submit` on the
end, and add the site's origin to `ALLOWED_ORIGINS` in `index.js` if it is not
already there.

## Checking it

```sh
# Honeypot filled — expect 200 with no email sent.
curl -X POST "$WORKER_URL" -H 'Content-Type: application/json' \
  -H 'Origin: https://e2eapps.com' \
  -d '{"company_website":"x","elapsedMs":9000}'

# Too fast — same.
curl -X POST "$WORKER_URL" -H 'Content-Type: application/json' \
  -H 'Origin: https://e2eapps.com' \
  -d '{"name":"A","email":"a@b.co","spend":"Under $10k / month","message":"ten chars ok","elapsedMs":10}'

# Bad field — expect 422 naming the field.
curl -X POST "$WORKER_URL" -H 'Content-Type: application/json' \
  -H 'Origin: https://e2eapps.com' \
  -d '{"name":"A","email":"nope","spend":"Under $10k / month","message":"ten chars ok","elapsedMs":9000}'

# Wrong origin — expect 403.
curl -X POST "$WORKER_URL" -H 'Content-Type: application/json' \
  -H 'Origin: https://evil.example' -d '{}'
```

`npx wrangler tail` streams live logs, including any conversion fan-out that
failed after the email went out.

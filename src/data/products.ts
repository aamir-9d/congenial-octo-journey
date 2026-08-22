/**
 * Product overviews.
 *
 * Every string here is lifted from the PDF it links to — the eyebrow, the
 * headline, the summary and the figures are the documents' own words, not a
 * rewrite. Nothing is claimed on this page that the overview does not already
 * say and show.
 *
 * `pages` and `bytes` describe the actual file in public/pdf/ and are asserted
 * against it in tests/products.test.ts, so a card can never advertise a
 * document that is not there or misstate its size.
 */

export interface Product {
  /** Slug, used for the anchor and the analytics label. */
  id: string;
  /** Mono kicker, from the PDF cover. */
  kicker: string;
  name: string;
  /** The document's own headline, flattened to one line. */
  headline: string;
  /** The document's own summary paragraph, trimmed to the card. */
  summary: string;
  /** Cover figures, verbatim. Rendered as a mono row. */
  stats: { value: string; label: string }[];
  /** What it is built on, from the cover strapline. */
  stack: string;
  /** Filename within public/pdf/. */
  file: string;
  pages: number;
  bytes: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'monetization-scout',
    kicker: 'COMPETITOR PAYWALL INTELLIGENCE · COUNTRY BY COUNTRY',
    name: 'Monetization Scout',
    headline: "Reverse-engineer any competitor's paywall — in every market, automatically.",
    summary:
      'An autonomous agent that drives real Android devices through competitor apps to their paywalls — switching exit country per run, reading each screen with vision, and logging a structured teardown to a spreadsheet. It learns the route to each paywall as it goes, so repeat runs need no human and almost no model calls.',
    stats: [
      { value: '24', label: 'TARGET COUNTRIES' },
      { value: '136', label: 'PAYWALL CAPTURES' },
      { value: '~12,500', label: 'LINES OF PYTHON' },
    ],
    stack: 'Python · real Android devices · vision models',
    file: 'monetization-scout-overview.pdf',
    pages: 6,
    bytes: 953584,
  },
  {
    id: 'aso-suite',
    kicker: 'APP STORE OPTIMIZATION · BUILT ON GOOGLE SHEETS',
    name: 'ASO Suite',
    headline: 'The entire ASO stack, running inside one spreadsheet.',
    summary:
      'Keyword research, competitor scraping, AI metadata generation and bulk publishing to App Store Connect — for both the App Store and Google Play. No server, no subscription, no separate web app.',
    stats: [
      { value: '50', label: 'APP STORE LOCALES' },
      { value: '2', label: 'APP STORES' },
      { value: '0', label: 'SERVERS TO RUN' },
    ],
    stack: 'Google Apps Script · App Store Connect API · Groq LLM',
    file: 'aso-suite-overview.pdf',
    pages: 6,
    bytes: 1197875,
  },
  {
    id: 'aso-agent',
    kicker: 'ASO AGENT · APP STORE OPTIMIZATION PLATFORM',
    name: 'ASO Agent',
    headline: 'Research, write and track app store metadata — in one place.',
    summary:
      'A production web platform for App Store Optimization. Score keywords against live store data, generate publish-ready metadata with AI, and track ranking movements daily — across both the Apple App Store and Google Play.',
    stats: [
      { value: '10', label: 'TOOLS' },
      { value: '40', label: 'COUNTRIES' },
      { value: '58', label: 'API ENDPOINTS' },
    ],
    stack: 'Next.js · React · TypeScript · Tailwind CSS',
    file: 'aso-agent-overview.pdf',
    pages: 8,
    bytes: 1945339,
  },
];

/** "1.9 MB" — one decimal, matching how the cards read elsewhere. */
export function megabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

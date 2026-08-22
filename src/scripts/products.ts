import { track } from './analytics';

/**
 * Report which product overview someone opened.
 *
 * The page argues that measurement should reach the moment money is decided.
 * An overview open is the strongest intent signal on this page short of the
 * form, so it gets an event rather than being left to a generic outbound rule
 * in the tag manager.
 *
 * The link works without any of this: no preventDefault, no interception. If
 * the tag manager is blocked or consent is denied, the click still opens the
 * PDF and nothing here throws.
 */
export function initProducts(): void {
  const cards = document.querySelectorAll<HTMLAnchorElement>('[data-product]');

  for (const card of cards) {
    card.addEventListener('click', () => {
      track('product_overview_open', {
        product_id: card.dataset.product,
        product_name: card.querySelector('.products__name')?.textContent?.trim(),
      });
    });
  }
}

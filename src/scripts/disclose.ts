/**
 * Toggle for the mobile disclosures.
 *
 * CSS owns whether a disclosure is collapsible at all — below 768px, and only
 * with `.js` present. This only flips the class and keeps `aria-expanded`
 * honest, so there is nothing to tear down when the viewport crosses the
 * breakpoint: above it the toggle is `display: none` and the body shows
 * regardless of the class.
 */
export function initDisclose(): void {
  const blocks = document.querySelectorAll<HTMLElement>('.disclose');
  if (!blocks.length) return;

  for (const block of blocks) {
    const toggle = block.querySelector<HTMLButtonElement>('.disclose__toggle');
    if (!toggle) continue;

    toggle.addEventListener('click', () => {
      const open = block.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
}

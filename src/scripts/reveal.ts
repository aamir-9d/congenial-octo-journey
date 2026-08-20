/**
 * Scroll reveal for [data-reveal] blocks.
 *
 * Ported from the export's componentDidMount. Same threshold, same rootMargin,
 * same unobserve-on-first-intersection. The difference is where the hidden
 * state lives: the export set opacity/transform from JS, which flashes the
 * content before hiding it. Here CSS owns the hidden state behind the `.js`
 * class and this only toggles `.is-revealed`.
 */
export function initReveal(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!nodes.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  nodes.forEach((n) => io.observe(n));
}

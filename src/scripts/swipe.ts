/**
 * Swipe rows that move on by themselves.
 *
 * Below 700px a `.swipe` grid becomes one horizontal, snapping row (the CSS is
 * in redesign.css). This adds two things to every `[data-swipe]` row:
 *
 *  - the dots and the "2 of 6" counter under it follow the card in view;
 *  - while the row is on screen it scrolls to the next card every few seconds,
 *    and wraps back to the first after the last.
 *
 * It stops for good the moment the visitor touches, drags, wheels or focuses
 * inside the row: once someone is steering, moving it under their finger is
 * hostile. It never starts for visitors who ask for reduced motion, and it does
 * nothing at widths where the row is a grid.
 *
 * No dependency: one IntersectionObserver and one timer per row.
 */
const INTERVAL_MS = 2800;
const PHONE = '(max-width: 699px)';

function setup(row: HTMLElement): void {
  const cards = Array.from(row.children) as HTMLElement[];
  if (cards.length < 2) return;

  const meta = row.parentElement?.querySelector<HTMLElement>('[data-swipe-meta]') ?? null;
  const dots = meta ? Array.from(meta.querySelectorAll<HTMLElement>('[data-swipe-dots] i')) : [];
  const count = meta?.querySelector<HTMLElement>('[data-swipe-count]') ?? null;
  const label = row.dataset.swipeLabel ?? '';

  let index = 0;
  let timer = 0;
  let visible = false;
  let stopped = false;

  const pad = () => parseFloat(getComputedStyle(row).scrollPaddingLeft || '0') || 0;

  const paint = () => {
    dots.forEach((d, i) =>
      i === index ? d.setAttribute('data-on', '') : d.removeAttribute('data-on'),
    );
    if (count) count.textContent = `${label ? label + ' ' : ''}${index + 1} of ${cards.length}`;
  };

  const nearest = () => {
    const left = row.scrollLeft + pad();
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - left);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const go = (i: number) => {
    index = (i + cards.length) % cards.length;
    row.scrollTo({ left: cards[index]!.offsetLeft - pad(), behavior: 'smooth' });
    paint();
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    if (timer || stopped || !visible) return;
    if (!window.matchMedia(PHONE).matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = window.setInterval(() => go(index + 1), INTERVAL_MS);
  };

  const halt = () => {
    stopped = true;
    stop();
  };

  row.addEventListener('pointerdown', halt, { passive: true });
  row.addEventListener('touchstart', halt, { passive: true });
  row.addEventListener('wheel', halt, { passive: true });
  row.addEventListener('focusin', halt);

  let raf = 0;
  row.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        index = nearest();
        paint();
      });
    },
    { passive: true },
  );

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) start();
      else stop();
    },
    { threshold: 0.6 },
  ).observe(row);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  paint();
}

export function initSwipe(): void {
  document.querySelectorAll<HTMLElement>('[data-swipe]').forEach(setup);
}

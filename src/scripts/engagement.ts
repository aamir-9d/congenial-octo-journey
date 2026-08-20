/**
 * Scroll depth and section visibility.
 *
 * Both via IntersectionObserver rather than a scroll listener, so nothing runs
 * on the main thread between thresholds. Each milestone fires once per page
 * view.
 */
import { track } from './analytics';

const DEPTHS = [25, 50, 75, 100] as const;

function initScrollDepth(): void {
  if (!('IntersectionObserver' in window)) return;

  // A zero-height sentinel at each depth. Cheaper and steadier than sampling
  // scrollY, and it self-corrects when the page height changes.
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100%;pointer-events:none;visibility:hidden';

  const sentinels = DEPTHS.map((depth) => {
    const mark = document.createElement('div');
    mark.style.cssText = `position:absolute;left:0;width:1px;height:1px;top:calc(${depth}% - 1px)`;
    host.appendChild(mark);
    return { depth, mark };
  });

  const container = document.querySelector('.page') ?? document.body;
  if (getComputedStyle(container).position === 'static') {
    (container as HTMLElement).style.position = 'relative';
  }
  container.appendChild(host);

  const seen = new Set<number>();
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const hit = sentinels.find((s) => s.mark === entry.target);
      if (!hit || seen.has(hit.depth)) continue;
      seen.add(hit.depth);
      track('scroll_depth', { percent_scrolled: hit.depth });
      io.unobserve(entry.target);
    }
  });

  sentinels.forEach((s) => io.observe(s.mark));
}

function initSectionViews(): void {
  if (!('IntersectionObserver' in window)) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  if (!sections.length) return;

  const seen = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const name = (entry.target as HTMLElement).dataset.section!;
        if (seen.has(name)) continue;
        seen.add(name);
        track('section_view', { section_name: name });
        io.unobserve(entry.target);
      }
    },
    // Half the section on screen counts as reaching it.
    { threshold: 0.5 },
  );

  sections.forEach((s) => io.observe(s));
}

export function initEngagement(): void {
  initScrollDepth();
  initSectionViews();
}

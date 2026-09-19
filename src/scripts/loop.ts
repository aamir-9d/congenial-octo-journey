/**
 * The Full Loop's station details.
 *
 * Progressive enhancement, deliberately in that order: the four panels render
 * open in the markup and this collapses them. With scripting off a visitor
 * gets four headed sections of service detail below the diagram — longer than
 * intended, but complete and readable. Nothing is behind a script.
 *
 * One panel at a time, in a shared row below the ring. Opening a station never
 * changes the card geometry, which is the whole reason the panel is not inside
 * the card.
 */
export function initLoop(): void {
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-loop-trigger]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-loop-panel]'));
  if (triggers.length === 0 || panels.length === 0) return;

  /** Which station is open, or null for none. */
  let open: string | null = null;

  const render = () => {
    for (const t of triggers) {
      const on = t.dataset.loopTrigger === open;
      t.setAttribute('aria-expanded', String(on));
      t.closest('.st')?.classList.toggle('st--open', on);
    }
    for (const p of panels) p.hidden = p.dataset.loopPanel !== open;
  };

  // Collapse what the server rendered open.
  render();

  for (const t of triggers) {
    t.addEventListener('click', () => {
      const id = t.dataset.loopTrigger ?? null;
      // Clicking the open station closes it, so the diagram can be seen whole.
      open = open === id ? null : id;
      render();

      /* Focus stays on the trigger. The panel is associated through
         aria-controls and aria-expanded, so a screen-reader user is told what
         happened without being moved somewhere they did not ask to go. */
    });
  }
}

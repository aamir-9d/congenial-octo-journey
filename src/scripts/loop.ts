/**
 * The Full Loop's station scopes.
 *
 * Progressive enhancement, in that order: all four panels render open and this
 * collapses them on load. With scripting off a visitor reads four headed
 * sections of full service scope below the diagram — longer than intended, and
 * complete. Nothing is behind the script.
 *
 * One station open at a time, in a shared panel below the diagram on desktop.
 * Opening a station never resizes its card or moves the ring, which is why the
 * panel is a sibling of the cards rather than a child of one.
 *
 * On a phone the same panel moves: `--scope-order` places it directly after the
 * selected card in the flex stack, so the scope reads where it belongs without
 * a second copy of the content existing anywhere.
 */
export function initLoop(): void {
  const orbit = document.querySelector<HTMLElement>('[data-orbit]');
  if (!orbit) return;

  const triggers = Array.from(orbit.querySelectorAll<HTMLButtonElement>('[data-loop-trigger]'));
  const panels = Array.from(orbit.querySelectorAll<HTMLElement>('[data-loop-panel]'));
  const closers = Array.from(orbit.querySelectorAll<HTMLButtonElement>('[data-loop-close]'));
  const nodes = Array.from(orbit.querySelectorAll<SVGGElement>('[data-node]'));
  if (triggers.length === 0 || panels.length === 0) return;

  let open: string | null = null;

  const triggerFor = (id: string) => triggers.find((t) => t.dataset.loopTrigger === id) ?? null;

  const render = () => {
    for (const t of triggers) {
      const on = t.dataset.loopTrigger === open;
      t.setAttribute('aria-expanded', String(on));
      t.closest('.card')?.classList.toggle('card--open', on);
    }

    for (const p of panels) p.hidden = p.dataset.loopPanel !== open;

    // The ring says which scope is open, so the diagram and the panel agree.
    for (const n of nodes) n.classList.toggle('orbit__node--on', n.dataset.node === open);

    /* Place the panel after the selected card in the phone stack. Cards carry
       order 2, 4, 6, 8; the panel takes the odd number just above its own. */
    const card = open ? orbit.querySelector<HTMLElement>(`[data-card="${open}"]`) : null;
    const cardOrder = card ? Number(getComputedStyle(card).order) : NaN;
    orbit.style.setProperty('--scope-order', Number.isFinite(cardOrder) ? String(cardOrder + 1) : '99');
  };

  // Collapse what the server rendered open.
  render();

  for (const t of triggers) {
    t.addEventListener('click', () => {
      const id = t.dataset.loopTrigger ?? null;
      // Selecting the open station closes it, so the diagram can be seen whole.
      open = open === id ? null : id;
      render();
    });
  }

  for (const c of closers) {
    c.addEventListener('click', () => {
      const id = c.dataset.loopClose ?? null;
      open = null;
      render();
      // Focus goes back to the control that opened it, not to the top of the
      // document, which is where a closed panel would otherwise drop it.
      if (id) triggerFor(id)?.focus();
    });
  }
}

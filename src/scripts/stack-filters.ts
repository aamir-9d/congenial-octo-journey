/**
 * Discipline filter for the stack bundles.
 *
 * The export re-rendered the grid and dropped non-matching cards from the DOM.
 * Here they are hidden instead — same result on screen, and the copy stays
 * indexable.
 */
export function initStackFilters(): void {
  const grid = document.getElementById('stack-grid');
  if (!grid) return;

  const chips = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.stack__chip[data-filter]'),
  );
  const cards = Array.from(grid.querySelectorAll<HTMLDetailsElement>('[data-cat]'));
  if (!chips.length || !cards.length) return;

  const apply = (active: string) => {
    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === active));
    }
    for (const card of cards) {
      card.hidden = active !== 'all' && card.dataset.cat !== active;
    }
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => apply(chip.dataset.filter ?? 'all'));
  }
}

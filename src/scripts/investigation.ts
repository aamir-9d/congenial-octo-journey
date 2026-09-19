/**
 * The investigation canvas's three selectors.
 *
 * A real tablist rather than three buttons that recolour: the audit's test was
 * that a selector must change the question, the chart, the finding and the
 * source labels, and switching whole panels is the only way that stays true as
 * the content grows.
 *
 * Keyboard behaviour follows the APG tabs pattern, because half-implementing it
 * is worse than not claiming the role at all:
 *
 *   Arrow keys move between tabs and activate as they go
 *   Home / End jump to the first and last
 *   Tab leaves the tablist and lands in the visible panel
 *
 * Only the selected tab is in the tab order — a roving tabindex — so a keyboard
 * user passes the group in one press instead of three.
 *
 * With scripting off every panel but the first carries `hidden` from the
 * server, so the page still shows one complete, labelled example.
 */
export function initInvestigation(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-investigation]')) {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
    if (tabs.length === 0 || panels.length === 0) continue;

    const select = (i: number, moveFocus: boolean) => {
      const id = tabs[i]?.dataset.tab;
      if (!id) return;

      for (const t of tabs) {
        const on = t.dataset.tab === id;
        t.setAttribute('aria-selected', String(on));
        // Roving tabindex: the group costs one Tab press, not three.
        t.tabIndex = on ? 0 : -1;
      }

      for (const p of panels) p.hidden = p.dataset.panel !== id;

      if (moveFocus) tabs[i]!.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));

      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        let next: number | null = null;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;

        if (next === null) return;
        e.preventDefault();
        select(next, true);
      });
    });
  }
}

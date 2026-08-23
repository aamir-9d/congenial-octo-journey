/**
 * The mobile navigation sheet.
 *
 * NOTES.md flagged item 4: below 480px the links were simply `display: none`
 * with nothing replacing them, so a phone had no way to reach any section.
 *
 * Deliberately small. The sheet is a real element in the DOM that CSS shows or
 * hides; this only flips a class, keeps `aria-expanded` honest, closes on
 * Escape or on following a link, and returns focus to the button that opened
 * it — the part that is genuinely easy to get wrong and genuinely matters to
 * anyone navigating by keyboard.
 */
export function initNavMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const sheet = document.getElementById('nav-sheet');
  if (!toggle || !sheet) return;

  const close = document.querySelector<HTMLButtonElement>('[data-menu-close]');

  const setOpen = (open: boolean) => {
    document.documentElement.classList.toggle('menu-open', open);
    sheet.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));

    // Focus goes into the sheet on open and back to the button on close, so
    // keyboard focus never ends up behind a full-screen overlay.
    if (open) close?.focus();
    else toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(true));
  close?.addEventListener('click', () => setOpen(false));

  // Following a link closes the sheet: every destination is on this page, so
  // without this the anchor scrolls behind an overlay that is still covering it.
  for (const link of sheet.querySelectorAll('a')) {
    link.addEventListener('click', () => setOpen(false));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.hidden) setOpen(false);
  });
}

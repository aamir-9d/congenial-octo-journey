/**
 * The mobile navigation sheet.
 *
 * NOTES.md flagged item 4: below 480px the links were simply `display: none`
 * with nothing replacing them, so a phone had no way to reach any section.
 *
 * Deliberately small. The sheet is a real element in the DOM that CSS shows or
 * hides; this flips a class, keeps `aria-expanded` honest, closes on Escape or
 * on following a link, and returns focus to the button that opened it.
 *
 * It is now a real modal dialog rather than a visible overlay. The audit found
 * that Shift+Tab from the close button moved focus to the burger *behind* the
 * sheet: the overlay covered the page visually, but nothing stopped the tab
 * order walking out of it. A sighted keyboard user then loses the focus ring
 * entirely, and a screen-reader user is read a page that is not on screen.
 *
 * Two mechanisms, because they cover different users:
 *
 *   `inert` on everything outside the sheet takes the background out of the tab
 *   order *and* out of the accessibility tree, which is the real fix.
 *
 *   The Tab wrap below is the fallback for browsers without `inert`. It cannot
 *   be the only fix — it only moves focus, it does not hide anything.
 */

/** Focusable descendants, in tab order, skipping anything currently hidden. */
function focusables(root: HTMLElement): HTMLElement[] {
  const sel =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  );
}

export function initNavMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const sheet = document.getElementById('nav-sheet');
  if (!toggle || !sheet) return;

  const close = document.querySelector<HTMLButtonElement>('[data-menu-close]');

  /* Everything outside the sheet, without ever touching an ancestor of it.

     The sheet is nested inside `.page`, so inerting the body's children would
     inert `.page` — and with it the sheet itself, which is the opposite of the
     intent. Instead walk from the sheet up to `<body>` and collect the siblings
     at each level. That leaves the chain of ancestors alone and catches
     everything else, including any top-level element added later. */
  const outside: HTMLElement[] = [];
  for (let node: HTMLElement | null = sheet; node && node !== document.body; ) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sib of parent.children) {
      if (sib !== node && sib instanceof HTMLElement) outside.push(sib);
    }
    node = parent;
  }

  const setOpen = (open: boolean) => {
    document.documentElement.classList.toggle('menu-open', open);
    sheet.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));

    for (const el of outside) el.toggleAttribute('inert', open);

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
    if (sheet.hidden) return;

    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (e.key !== 'Tab') return;

    // Wrap at both ends. Without this, the first Shift+Tab from the close
    // button — which is the first control in the sheet — leaves it.
    const items = focusables(sheet);
    if (items.length === 0) return;

    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && (active === first || !sheet.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

# Brief for Claude Design — the finished mark, and the brand book v2

Two jobs. **Job A** turns one chosen direction into a real, shippable identity.
**Job B** folds that identity into the existing brand book. Run A first; B
depends on it.

Everything below is already decided and must not be re-litigated: the palette,
the two typefaces, and the dark ground. They are in the live site and in
`E2E Apps - Brand book.dc.html`.

---

## What to attach

| File | Why |
| --- | --- |
| `E2E Apps - Logo directions.dc.html` | The twelve directions. The chosen one is the input to Job A. |
| `E2E Apps - Brand book.dc.html` | v1. Job B extends this, it does not restart it. |
| `E2E Apps - Bento.dc.html` | Desktop site, for how the mark has to sit in a real nav. |
| `CLAUDE-BRAND-BRIEF.md` | This file. |

---

## The business, in one paragraph

E2E Apps fixes mobile attribution and then spends against the numbers it
recovers. The argument the whole site makes is that a dashboard shows a
campaign losing money while the real cohort broke even in month nine — the
revenue exists, it is just invisible. "End to end" is literal: instrumentation,
attribution, the decision, and the media buying, owned by the same person, so
the loop closes. The buyer is a growth lead or a founder at a subscription or
ad-monetised app, technical enough to know what SKAdNetwork is.

**Register:** an instrument, not a mascot. Precise, quiet, confident. The
nearest neighbours are Ahrefs, Sensor Tower, AppTweak, RevenueCat and Adapty —
one compact geometric glyph beside a bold sans wordmark. The differentiator is
that none of them says *end to end*: a start, a path, and a finish.

---

# Job A — the finished mark

## Input

One id from `E2E Apps - Logo directions.dc.html`: `1a`–`1f` or `2a`–`2f`.
**If no id has been chosen yet, do not guess** — ask which one, or produce Job A
for the two strongest (`2d` the bridge, `2c` the pin) and let the choice
happen against finished work.

## The one hard constraint most identities fail

The mark has to survive a **circle crop**. LinkedIn, X and Slack avatars all
crop to a circle, and that is where a client meets the brand before they meet
the site. Any mark whose meaning lives in its corners — `1f` and `2f`, the tile
directions — loses that meaning entirely at avatar size. Draw the circle-safe
variant explicitly rather than discovering the problem later.

## Deliverables

**1. The master mark**, on a 100×100 box, as it will actually ship. Then:

**2. A size ladder, each drawn deliberately rather than scaled:**

| Size | What it is | What has to change |
| --- | --- | --- |
| 512px | App store, PWA | Full detail |
| 180px | Apple touch icon | Full detail |
| 64px | Nav, letterhead | Full detail |
| 32px | Favicon, tab | Strokes thicken |
| 24px | Inline, list rows | Simplify — drop the third element |
| 16px | Favicon fallback | Silhouette only |

State what is dropped at each step and why. A mark that is merely scaled down
is not a size ladder.

**3. Colour variants:** on `#0E1014` ground, on `#F7F6F3` light, on `#E39A1F`
accent, single-colour black, single-colour white, and one-bit (fax test — pure
black on pure white, no greys).

**4. Lockups:** horizontal (mark + wordmark), stacked (mark over wordmark),
mark alone. With the tagline and without. Specify the gap between mark and
wordmark as a ratio of the mark's height, not a pixel value.

**5. Clear space and minimum size**, drawn, not described. Clear space as a
fraction of the mark's own height.

**6. Misuse plate — six panels, each showing the wrong thing:** re-coloured,
stretched, rotated, on a busy photo, drop-shadowed, wordmark re-spaced. This is
the page people actually consult.

**7. Favicon and app-icon renders:** the mark in a browser tab, in a circle
avatar, and in an iOS squircle with the correct safe area.

## Constraints

- Amber `#E39A1F` is the only accent. No second hue, no gradient.
- Never amber on a light ground — it falls to 2.2:1. On light, the mark is
  `#101725`; if the accent must appear on light, it is `#8F5900`.
- One stroke weight across the family, so all variants read at matched optical
  weight. The existing directions use 8–13 units on a 100 box.
- No typeface dependency inside the mark. The `E2E` lettering in `1c`/`1f` is
  drawn geometry and stays that way.
- The wordmark is Be Vietnam Pro 700 at `-0.032em`. It is never re-spaced,
  outlined, or set in another face.

## Ideas worth exploring, if the chosen direction needs a push

These build on what is already drawn rather than starting over:

- **The gap as the mark.** The site's whole thesis is the space between the
  true line and the dashboard line. A mark that *is* that gap — two paths and
  the shape between them — says the proposition, not the category.
- **The return stroke.** `1b` and `2e` both draw a cycle. The one detail that
  makes a loop mean *closed* rather than *circular* is the arrowhead re-entering
  the start. Make that the load-bearing element instead of a decoration.
- **Asymmetry as direction.** `2a` and `2d` read left-to-right: something enters
  and something leaves. That is the most legible way to say "end to end" at
  16px, because it survives as a silhouette.
- **The filled/open pair.** A solid node and a hollow node is the cheapest way
  to say "counted" and "not yet counted". It costs two shapes and survives any
  size.

---

# Job B — brand book v2

`E2E Apps - Brand book.dc.html` is v1 and already covers colour, palette
iterations, typography, fifteen text styles, space, components, data
visualisation, motion, icons and rules. **Do not rebuild those sections.**

## What changes

**1. Section 01 · Logo** — currently a placeholder that says a direction is out
for review. It becomes the real thing: master mark, size ladder, colour
variants, lockups, clear space, minimum sizes, misuse plate. Everything from
Job A.

**2. New section · Applications.** The identity doing its job, not sitting in a
grid: browser tab, LinkedIn avatar, email signature, the site nav, an audit PDF
cover, a slide master, an invoice header.

**3. New section · Voice.** The site has a strong written register and the
brand book does not record it. Three or four rules with a right and a wrong
example each, taken from copy that already exists:
   - Name the mechanism, never the benefit. "Renewals happen on Apple's servers
     while your app is closed" — not "maximise your revenue".
   - Say the awkward thing. "If there's nothing wrong, I'll tell you that too."
   - No exclamation marks. No "unlock", "supercharge", "game-changing".
   - Figures carry their unit and their basis: "day 277", not "fast payback".

**4. Fix in passing.** The contrast table lists the dashboard line `#5B626B` at
3.1:1. Measured against the surface it actually sits on, `#16191F`, it is
2.85:1 — under the 3:1 floor for non-text. `#5F666F` gives 3.03:1. Either
correct the value or change the colour, but the table should not claim a pass
it does not have.

## Format

Same canvas language as v1: dark ground, one accent, mono labels, values exact
and copy-pasteable. Every specimen rendered at its real specification rather
than described — that is what makes v1 useful, and it is the thing most brand
books get wrong.

# Redesign plan — ranked by impact

**No code changed.** This is an audit and a plan for you to approve, reject or
reorder before anything is touched.

Written 1 September 2026 against the live `redesign` branch. Evidence is
measured from the built page, the impeccable anti-pattern detector, the contrast
script, and the 91-test suite — not from impression.

---

## The finding in one paragraph

**The design system is not the problem.** The palette, the two typefaces, the
spacing scale and the component vocabulary are coherent and were signed off in
`design/E2E Apps - Bento.dc.html`. What is wrong is **how much** has been poured
into one page and **how uniformly** it is arranged. The homepage is 4,269 words
— nineteen minutes of reading — across twelve sections that each open the same
way. That sameness, more than any single element, is what reads as machine-made.
Three mechanical AI tells sit on top of it, and the navigation mislabels two of
its own destinations.

---

## Ranked findings

Highest impact first. "Impact" means effect on whether a qualified visitor
believes you and books a call.

| # | Finding | Category | Effort |
| --- | --- | --- | --- |
| 1 | Homepage is ~4× too long: 4,269 words, 19 min read | Critical | High |
| 2 | Nav labels point at the wrong sections | Critical / UX | Low |
| 3 | No single primary action — 24 buttons, 36 links compete | Critical / UX | Medium |
| ~~4~~ | ~~Aphoristic copy cadence~~ — **false positive, withdrawn** (see §8) | — | — |
| 5 | Amber zero-offset glow — the canonical AI-UI look | Generic / AI tell | Low |
| 6 | Infinite scan-line marquee in the hero | Generic / AI tell | Low |
| 7 | Twelve sections with identical eyebrow→h2→lead→cards rhythm | Visual hierarchy | High |
| 8 | 35 disclosures — collapsing used instead of cutting | UX / Critical | Medium |
| 9 | Flat heading hierarchy: 12 h2s all at one size | Typography | Medium |
| 10 | Mobile inherits the full 19-minute read | Mobile | High |
| 11 | Chart line fails contrast at 2.85:1 (needs 3:1) | Colour | Low |
| 12 | Calculator is 259 elements on a phone | Mobile / Layout | Medium |
| 13 | Section rhythm is uniform `--section-pad` throughout | Spacing | Medium |

---

## 1. Critical problems

### 1.1 The page is four times too long — *highest impact*

Measured on the built homepage:

| Metric | Actual | Converting B2B page |
| --- | --- | --- |
| Visible words | **4,269** | 600–1,200 |
| Reading time | **19 min** | 3–5 min |
| Sections | **12** | 5–7 |
| Headings (h2+h3) | **27** | 8–12 |
| Disclosures | **35** | 0–5 |
| DOM elements | **1,201** | ~400 |
| HTML | **248 KB** | ~80 KB |

Where the words actually are:

| Section | Words | Share | Disclosures |
| --- | --- | --- | --- |
| FAQ | 1,211 | **29%** | 19 |
| Payback calculator | 579 | 14% | 1 |
| The stack | 458 | 11% | 10 |
| Services (problems) | 366 | 9% | 5 |
| The Loop | 344 | 8% | — |
| Case study | 338 | 8% | — |
| Products | 244 | 6% | — |
| Blog | 183 | 4% | — |
| Founders | 158 | 4% | — |
| Proof | 157 | 4% | — |
| Contact | 131 | 3% | — |
| Hero | 69 | 2% | — |

**Nearly a third of your homepage is FAQ.** FAQ plus the stack is 40% of the
words and 29 of the 35 disclosures. Neither is homepage content — both are
reference material a visitor consults *after* they are interested.

**Recommendation:** move FAQ and the stack to their own pages, linked from the
nav. That single move removes ~1,670 words (39%) and 29 disclosures without
deleting a sentence. Products likely follows.

### 1.2 The navigation lies about where it goes

| Nav label | Actually lands on | Verdict |
| --- | --- | --- |
| Services | "Three places the money goes missing" | **Wrong** — that is a problem statement |
| The Loop | "The Full Loop" | Correct — and this is your actual *approach* |
| Approach | "The full stack, in bundles" | **Wrong** — that is your actual *services* list |
| Products | "Three products, in detail" | Correct |
| FAQ | "Questions people ask" | Correct |

Services and Approach are effectively swapped, and the section that really is
your approach is labelled "The Loop". A visitor's first click teaches them the
page cannot be trusted to do what it says — which is unusually costly for a
consultancy selling accuracy.

**Recommendation:** rename to match destinations. `Problems` → the bento;
`Approach` → The Loop; `Services` → the stack. Lowest-effort, highest-trust fix
on this list.

### 1.3 There is no single primary action

24 buttons and 36 links, with at least six distinct calls to action competing:
*Find what your stack is missing*, *See how it works*, *Book a call*,
*Read the case study*, *Read the overview*, *All posts*.

A page with six actions has none. Marketing-page anatomy is **one** primary
action, repeated down the page, with everything else visibly subordinate.

**Recommendation:** "Book a call" is the only primary. Everything else becomes a
text link or is removed.

---

## 2. Visual hierarchy problems

**Twelve sections, one rhythm.** Every section opens: centred mono eyebrow →
centred h2 → centred lead → grid of cards. Twelve times.

This is the single strongest reason the page reads as generated. A human
designer varies the beat — an asymmetric section, a full-bleed statement, a
quiet one-line interstitial, something that breaks the column. Uniform repetition
is what a template does, and readers recognise it even when they cannot name it.

**Also:** nothing outranks anything. Twelve h2s at the same size means the
calculator — genuinely the strongest thing you own — has exactly the same visual
weight as the founder bios.

**Recommendation:** three tiers. One hero. Two or three *major* movements
(calculator, case study) that get full-bleed treatment and a larger heading.
Everything else compressed to supporting scale.

---

## 3. UX problems

- **35 disclosures.** Collapsing content is being used instead of deciding what
  to cut. Every one is a decision deferred to the reader, and readers do not
  open them — they scroll past.
- **The calculator is buried at position 4**, after two sections of preamble. It
  is the most persuasive object on the site and the only thing a competitor
  cannot copy.
- **The Loop, Proof and the case study make overlapping arguments.** Three
  sections establishing credibility in sequence, before the visitor has been
  asked to do anything.
- **No exit for a convinced reader.** A visitor sold by section 4 must scroll
  past eight more to reach the form.

---

## 4. Typography problems

The type *system* is sound — Be Vietnam Pro over IBM Plex Mono, a 21-step scale,
tabular figures, `text-wrap: balance`, measures capped in ch. The problem is
**application**, not specification.

- **One size does all the work.** `--t-h2` carries all twelve section headings,
  so the scale's range is unused. `--t-h1` appears once; `--t-h2-closing` and
  `--t-pull` are barely used.
- **No typographic variety of voice.** No pull quote at scale, no oversized
  figure as a graphic element, no editorial moment. Every block is body copy at
  `--t-body` or `--t-card`.
- **Mono is overused** in places where it signals nothing — it should mean
  "machine value or label", and in several sections it is decorating headings.

**Recommendation:** use the scale you already have. Two sections should carry
headings at `--t-h1` scale. Two figures should be set as display type.

---

## 5. Colour and contrast problems

Colour is the healthiest area. One accent, four greys, no second hue, no red —
correct and consistently applied.

- **One real failure:** the dashboard chart line, `#5B626B` on `#16191F` = **2.85:1**,
  below the 3:1 floor for non-text graphics. `#5F666F` gives 3.03:1. Known,
  recorded, still unfixed.
- **The amber glow is an AI tell**, not a contrast problem — see §8.
- Everything else passes AA, verified by `scripts/check-contrast.mjs`, which
  reads the tokens directly and so cannot drift.

---

## 6. Spacing and layout problems

- **Uniform section padding.** `--section-pad` on all twelve sections means the
  page has no breathing rhythm — no compression before a big moment, no release
  after one. Even spacing across twelve sections reads mechanical.
- **Card grids everywhere.** Bento, proof, products, blog, founders and stack
  are all card grids. Six different ideas in one container shape.
- **Nothing breaks the wrap.** Every section sits inside the same 1280px column.
  No full-bleed moment in 19 minutes of scrolling.

---

## 7. Mobile responsiveness problems

Mobile is *technically* well built — a separate signed-off design, 44px targets
enforced by test, the Loop rebuilt as a rail, no horizontal overflow. The
problems are of amount, not implementation:

- **19 minutes of reading is materially worse on a phone.** Everything in §1
  hits harder here.
- **The calculator is 259 elements on a phone.** It works, but it is a heavy
  object to meet on a small screen at position 4.
- **35 disclosures on mobile** means a very long list of tap-to-expand rows —
  the pattern readers abandon fastest.
- The phone chart is 300 tall against a design that calls for 150, because the
  height comes from the frozen model file.

---

## 8. Components that look generic or outdated

Three mechanical AI tells, found by the detector rather than by taste:

1. **~~Aphoristic cadence~~ — withdrawn. This finding was wrong.**
   I reported the detector's hit without checking it. The flagged text is the
   calculator's *model assumptions* — `<li>` items in a caveats list reading
   "Constant ARPDAU across tenure." / "No seasonality in eCPM." The detector
   joined two adjacent list items across the boundary and matched its "X. No Y."
   pattern on the seam. They are precise technical caveats, correctly written,
   and rewriting them would have made the calculator less honest. The plan
   originally called this "the most identifiably AI thing on the site"; that was
   an error, and the real answer is item 4 below.
2. **Zero-offset amber glow.** A chromatic halo with no offset on a dark ground
   is the default "cool" look of generated UI. It appears on buttons and cards.
   Neutral elevation reads more expensive.
3. **Infinite scan-line marquee** in the hero. Continuous motion that demands
   attention it has not earned.

4. **The twelve-section eyebrow→heading→cards template** (§2). Found by
   inspection rather than by the detector, and with the length in §1 it is the
   real reason the page reads as machine-made — deeper than any of the three
   above and the most work to undo.

The detector ran degraded — its HTML parser modules are unavailable, so custom
properties, selector matching and computed contrast were not evaluated. **Treat
three findings as an undercount.**

---

## 9. What should be kept

Do not touch these. Several are genuinely rare.

- **The payback calculator.** Nobody else in this category has one. It is the
  proof mechanism, the lead-intelligence source, and the reason a technical
  buyer stays. Move it up; do not dilute it.
- **The PDF scanner case study.** Real figures, a real control, an honest
  account of the metric that got worse. This is your best asset after the
  calculator.
- **The voice rules** — mechanism over benefit, say the awkward thing, no
  exclamation marks. The problem is the four aphorisms, not the register.
- **The colour system and the two typefaces.** Correct, accessible, distinctive.
- **The mark and the icon set.**
- **The dark ground.** It is doing real work: amber is 8.1:1 on it and 2.2:1 on
  light.
- **The 91-test suite.** It is why figures on the page can be trusted.
- **The blog.** 15 posts is a genuine SEO asset; it just should not all be
  crowded onto the homepage.

---

## 10. Recommended direction

**Not a new visual world.** The design system is signed off and sound. This is a
severe edit and a re-composition using the vocabulary that exists.

### The shape

Six sections, roughly 1,100 words, one primary action:

| # | Section | Job | Words |
| --- | --- | --- | --- |
| 1 | Hero | The claim, one action | ~70 |
| 2 | **The calculator** | Prove it with their numbers — *moved up* | ~250 |
| 3 | The case study | One proof, all the way down | ~300 |
| 4 | How it works | The Loop, compressed | ~200 |
| 5 | Who you talk to | Founders, short | ~130 |
| 6 | Contact | One action | ~130 |

Moved off the homepage to their own pages, nav-linked: **FAQ**, **the stack**,
**products**, **blog index**. Nothing is deleted; it stops competing.

### The four moves that remove the AI feel

1. **Cut to 1,100 words.** Length itself is the strongest tell.
2. **Break the rhythm.** Two full-bleed movements, one asymmetric section, one
   quiet interstitial. Not twelve identical beats.
3. **Remove the glow and the marquee.** Neutral elevation, no continuous motion.
4. **Leave the model assumptions alone.** They read as terse because they are
   precise; that is the voice working, not failing.

### Sequence

1. Rename the nav (§1.2) — an hour, immediate trust gain
2. Remove glow and marquee (§8) — half a day
3. Move FAQ, stack, products to their own pages (§1.1) — a day
4. Re-order: calculator to position 2 (§3) — half a day
5. Re-compose rhythm and hierarchy (§2, §6) — the real work
6. Fix the chart contrast (§5) — minutes

Steps 1, 2 and 6 are worth doing whatever you decide about the rest.

---

## What I need from you

1. **Approve or reorder the ranking**, particularly moving FAQ/stack/products off
   the homepage — it is the biggest change and the one you may disagree with.
2. **Confirm nothing gets deleted**, only relocated. My assumption.
3. **Nav naming:** `Problems / Approach / Services / Products / Blog / FAQ`?
4. Whether to run `/impeccable critique` for a second, independent read before
   any code moves.

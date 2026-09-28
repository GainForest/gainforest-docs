# GainForest Docs: Design System

The public help site for GainForest.app and Bumicerts. It shares its whole visual
system with `gainforest-admin` (tokens, ladder, radii, motion, kit) so the two read
as one product family. What differs is the job: the admin is scanned for hours by
staff, the docs are *read*, often once, often on a phone, often in a second language.
That changes the type and the density (§4a) and nothing else.

---

## 1. Principles

**Reading comes first.** The article column is the product. Chrome recedes to a
tonal ladder: no borders, no shadows, no dividers. Colour is reserved for meaning
(tip / important / warning, the active page, links), never for flair.

**Calm, then specific.** A reader arrives with one question. The sidebar, search,
and the page's own title and description should answer "am I in the right place"
in one glance; everything else waits below the fold.

**Unseen details compound.** Tabular numerals so figures don't jitter. Press feedback on
every button. Popovers that scale from their trigger. Individually invisible; together
they're the difference between "internal tool" and "good software".

**One accent, used sparingly.** Forest green marks the primary action, the active
nav item, link underlines, and step numbers. When everything is highlighted, nothing is.

---

## 2. Surfaces: elevation is luminance

**There are no borders and no shadows in this UI.** Every edge, every separation,
every sense of depth comes from one thing: a step in background luminance. If you find
yourself reaching for `border`, `ring`, or `shadow`, the answer is a tonal step instead.

### The ladder

Four rungs, in `src/app/globals.css`:

| Rung | Token | What sits here |
| --- | --- | --- |
| **L0** | `--sidebar` | The page list rail the panel floats on. Furthest back. |
| **L1** | `--background` | The inset main panel, and the article inside it. |
| **L2** | `--card` | Every content surface on the article: cards, link cards, figure frames, tables, code, blockquotes, the note callout, prev/next, and the header bar. |
| **L1** | `--muted` | Wells recessed *inside* an L2 surface: the icon chip in a card. Same value as L1, reused deliberately. |

The article itself is L1, so a surface drawn in `--muted` directly on it is
invisible. Content on the page is always L2.

Steps are ~0.035 L in light and ~0.045 L in dark: the smallest gap that still reads as
an edge on an uncalibrated laptop panel.

**Recessed always means "toward the canvas value."** That keeps the mental model
identical in both themes instead of inverting the way most dark modes do. A well is
darker than its card in light mode *and* darker in dark mode.

### The one exception

Overlays (dropdown, tooltip, sheet, the search palette) leave the document flow, so no background step can
separate them from what they cover. They get `--shadow-overlay`, the single shadow in the
system: real offset, soft blur, never a zero-offset halo. Nothing else may use it.

### The control tier

`--input` sits deliberately *off* the ladder: below every surface in light, above every
surface in dark. A field has to read as a slot on whichever rung it lands on. Do not use
`--muted` for a field: it is L1, which is exactly the panel a header input sits on, and
the field will vanish.

### Hover lifts

Cards and link cards are already at L2, so they hover to `--accent`, a green-tinted
step, rather than climbing a rung that does not exist. The
gesture reads as lifting, which is the same language the ladder already speaks.

### Palette intent

| Token | Role |
| --- | --- |
| `primary` | Forest green. Primary action, active nav, focus ring, chart-1. |
| `muted-foreground` | Secondary labels, timestamps, column headers. |
| `accent` | Hover tint on the sidebar rail. |
| `destructive` | Irreversible actions only. Never for "warning" or "overdue". |
| `chart-1…5` | Canopy → moss → leaf → soil → water. Adjacent series stay distinguishable. |
| `border` | Focus rings only. Nothing draws a resting border. |

### Semantic status (and callouts)

Status is **text + colour + shape**, never colour alone (~8% of men have colour vision
deficiency, and nobody can opt out of an internal tool).

| State | Treatment |
| --- | --- |
| Healthy / verified | `text-primary` on `primary/10`, solid dot |
| Pending / in review | amber, hollow dot |
| Attention / overdue | `text-destructive` on `destructive/10`, dot with a ring |
| Inactive / archived | `text-muted-foreground` on `muted`, faded dot |

Callouts use the same tiers: `info` is `muted`, `success` is ok, `warning` is warn,
`danger` is bad. Each carries its own icon and a hidden word ("Tip:", "Warning:")
so the meaning survives without colour.

### Contrast floor

Body and placeholder text ≥ 4.5:1, large text ≥ 3:1: verified on *every rung*, since
`muted-foreground` has to clear the bar on L1 and L2 both.

---

## 3. Radius: concentric, and pills at control height

Two rules. They cover every case.

**Rule 1: anything at control height is `rounded-full`.** Buttons, inputs, badges,
status pills, nav rows, avatars, progress tracks, the delta chips, the biome bar
segments. At ≤36px a fixed radius reads as a squircle fighting the cap height; a full
round reads as a deliberate object.

**The test is the box, not the element's name.** Rule 1 holds while the element is
one line at control height, and only then. A textarea, the panel of a select or a
dropdown, a row inside such a panel, a card, a well, and any strip whose copy runs
past one line are boxes, and boxes take a step from the scale. Two failures this
prevents: a pill that wraps becomes a stadium with the text crowded into the curve,
and a panel drawn as a pill reads as one enormous button. Keep a notice's copy to
one bounded sentence (the read-only notice in the shell is the pattern) or move the
explanation to the surface it is about.

Every element therefore has exactly one radius question: one line at ≤36px, or a box?

**Rule 2: nested containers are concentric.** A child's radius is its parent's radius
minus the padding between them, so the two arcs stay parallel instead of drifting:

```
r_inner = r_outer − padding
```

The scale is explicit, not multiplied off a base, because the arithmetic *is* the system:

| Token | px | Role |
| --- | --- | --- |
| `rounded-3xl` | 32 | Shell: the inset main panel |
| `rounded-xl` | 24 | Card |
| `rounded-md` | 16 | Well inside a card (24 − 8 padding) |
| `rounded-sm` | 12 | Row inside a well (16 − 4 padding) |
| `rounded-xs` | 8 | Deepest nesting |

The canonical stacks, enforced in the MDX components and in the popover surfaces
(`select`, `dropdown-menu`, `popover`):

```
Shell   r=32 (rounded-3xl)         the inset panel
Card    r=24 (rounded-xl), p-4      Card, link card, prev/next
└ Chip  rounded-full                 control height
Frame   r=24 (rounded-xl), p-1 (4)  figure
└ Image r=20 (rounded-lg)           24 − 4
Table   r=16 (rounded-md), p-1 (4)
Callout r=16 (rounded-md)           a box: it runs to several lines

Panel   r=20 (rounded-lg), p-1 (4)
└ Row   r=16 (rounded-md)

Field   r=16 (rounded-md)          a multi-line field; never full
```

Use the MDX components rather than re-deriving this per page. If you need a new
nesting depth, subtract the padding: do not pick a radius that looks about right.

## 4. Typography: chrome

**Geist Sans** for everything, **Geist Mono** for IDs, hashes, and coordinates.

| Role | Class | Notes |
| --- | --- | --- |
| Page title | `text-3xl md:text-4xl font-semibold tracking-tight text-balance` | One per page, from frontmatter |
| Page description | `text-lg text-muted-foreground text-pretty` | From frontmatter |
| Section heading | `text-sm font-medium` | Above card groups |
| Card title | `text-sm font-medium` | Paired with muted description |
| Metric value | `text-2xl font-semibold tabular` | Always tabular numerals |
| Chrome body | `text-sm` | Sidebar, header, cards, palette |
| Meta / label | `text-xs text-muted-foreground` | Timestamps, units, column headers |
| Code / ID | `font-mono text-xs` | Wallet addresses, project IDs |

`tracking-tight` on anything ≥ `text-2xl`; large text at default tracking looks unset.
Never go below `text-xs`: if it doesn't fit, the layout is wrong, not the type.

Numbers use the `.tabular` utility so values don't shift width as they update or count up.

## 4a. Typography: the reading surface

The article body is `.prose`, defined once in `globals.css`. It is the only place
content is styled; a page never carries utility classes.

| Element | Treatment |
| --- | --- |
| Body | 16px, 17px from `md`, line-height 1.75, foreground at 88% over the panel |
| Measure | `max-w-[72ch]` on the article column |
| h2 / h3 / h4 | 1.5em / 1.2em / 1em, semibold, `-0.015em`, `text-wrap: balance`, `scroll-margin-top` clears the sticky header |
| Links | Foreground text, underline in `primary` at 45%, full `primary` on hover |
| Lists | Markers in `muted-foreground` |
| Blockquote | An L2 surface, `rounded-md`, muted text. No left rule. |
| Code | Geist Mono on `card`; inline `rounded-xs`, blocks `rounded-md` |
| Tables | An L2 surface, `rounded-md`, tracked-caps column heads, no rules |
| Steps | Counter-numbered status-ok pills on a 2px foreground-10% rail |
| hr | A 4px `card` pill, not a line |

Anything `.not-prose` (every MDX component) opts out and styles itself from the kit.

---

## 5. Space & layout

4px base grid. Only use multiples: `1 2 3 4 6 8 12 16`.

| Context | Value |
| --- | --- |
| Icon ↔ label | `gap-2` |
| Within a card | `gap-3` / `p-5` |
| Between cards | `gap-4` |
| Between sections | `gap-6` |
| Page padding | `p-4 md:p-6`, section gap `gap-4 md:gap-6` |
| Sidebar width | `16rem`; a sheet below `md` |
| Article column | `max-w-[72ch]`; outline column `w-56` from `xl` |

**A frame is never thinner than a seam.** A container that spaces its children with
`gap-*` (or `space-*`) keeps its own padding at or above that value, per axis:

```
p ≥ g
```

The edge of a group is a boundary and the gaps inside it are divisions; when the
boundary is thinner, the children read as one run spilling past its own frame, and
the eye stops trusting the container as a container. `gap-3` with `p-2` is the
classic form, and a list is where it shows most: rows with more space between them
than around them look unparented. State it per container, not per composition,
because padding only sums down the tree: a container that satisfies `p ≥ g` on its
own cannot be broken by a new ancestor, while a sum through a transparent wrapper
can. State it per axis too: a row gets its height from its block padding and has no
block gap, so `gap-2 px-3 py-1` is not a defect. Lint enforces the pairs a class
list can prove (`design/containment`).

**The frame is often in another file.** The rule is about what the reader sees, and
what they see is usually a container in one file and a gap in another. A well
is `p-1` (4px), so content composed inside it divides by `gap-1`: a child that
declares `gap-2` at the well's edge has more space between its parts than around
them, and no single class list holds both numbers, so lint is silent. A component
that renders its own layout root (a grid, a table) and lands in a well carries `p-1`
of its own, so its frame and its gap agree wherever it is used. When you put content
in a well, write the `gap-1 p-1` pair.

Page max width is `max-w-6xl`. Card grids go `1 → 2` columns at `sm`.
The main content column scrolls; the sidebar and header do not.

**Radii and elevation:** see §2 and §3. Short version: no borders, no shadows, depth
from luminance, concentric radii, pills at control height.

---

## 6. Motion

Motion rules follow Emil Kowalski's design-engineering skill, installed at
`.agents/skills/` (`emil-design-eng`, `animate`, `review-animations`). Read those before
adding any animation. Summary of what applies here:

### Should it animate at all?

| Frequency seen | Decision |
| --- | --- |
A docs site is read occasionally, not operated all day, so it sits higher on this
table than the admin does: arriving on a page is an occasional event and earns an
entrance. Keyboard actions stay instant.

| Frequency seen | Decision |
| --- | --- |
| Keyboard actions (⌘K, arrow keys) | Instant, or a sub-250ms glide that never lags the key |
| Tens/visit (hover, nav clicks) | Colour ≤ 150ms, a 2px lift, a spring pill that tracks the click |
| Per page (arriving, scrolling) | A staggered entrance on the first screen, a once-only reveal below it |
| Occasional (palette by pointer, sheet, folder) | Standard enter/exit |
| Rare (theme change, first paint) | Delight: the circular theme reveal, the sidebar cascade |

**Never animate a keyboard-initiated action.** If a shortcut opens it, it appears.

### Inventory

Everything that moves, and why. Values are tokens; see `globals.css` *Motion*.

| Where | What | Purpose | Ingredients |
| --- | --- | --- | --- |
| Page arrival | Title, description, actions, then body blocks rise 8px and fade, 40ms apart, capped at the 10th | Prevent a jarring swap | CSS keyframe, `--duration-overlay`, `--ease-out-strong`, `backwards` fill, replayed by `app/template.tsx` |
| Below the fold | Blocks rise 12px once, the first time they enter view | Pace long pages | IntersectionObserver in `page-motion.tsx`, 400ms transition; never hidden without JS |
| Heading reached by link | Primary tint fades out over 1.2s | Show where you landed | `:target` keyframe |
| Sidebar active page | A tinted pill slides from the old row to the new one | Spatial consistency | Motion `layoutId`, `NAV_SPRING` |
| Sidebar first paint | Groups cascade 30ms apart, once | Delight, rare | CSS keyframe; the shell persists so it never replays |
| Sidebar folders | Height opens 180ms, closes 150ms; children fade | State indication | Radix collapsible height var (the sanctioned accordion case) |
| Sidebar rows | Colour, icon scales 1.1 on hover | Feedback | 140ms, pointer-gated |
| Outline | A thumb on a rail follows the heading being read | State indication | Motion `layoutId`, `NAV_SPRING` |
| Header | Reading-progress bar across the bottom edge | State indication | Scroll-driven animation, `linear`, off the main thread |
| Cards, page links, prev/next | 2px lift, icon chip turns, arrow nudges toward its direction, 0.98 press | Feedback | `.lift` family, pointer-gated |
| Buttons | 0.97 press | Feedback | Global rule in `globals.css` |
| Search palette | Scales in from 0.96 when opened by pointer; instant from ⌘K | Spatial cue / speed | `data-palette` on `<html>`, dialog retuned by `data-slot` |
| Search results | Rise in 25ms apart when they first appear; the highlight glides between rows | Feedback | CSS keyframe; Motion `layoutId`, 220ms spring |
| Copy page | Icon and label crossfade to a tick with a turn and blur | Feedback | `.swap` |
| Theme | Circular reveal from the toggle; sun and moon turn over | Delight, rare | View Transitions API, 500ms `--ease-in-out-strong`; skipped under reduced motion |
| Embeds | Shimmer until the frame paints | State indication | `linear`, constant |
| Anchor jumps | Smooth scroll inside the panel | Spatial consistency | `scroll-behavior`, instant under reduced motion |
| Glossary term | Popover rises from the word after a 250ms hover intent | Explanation | Kit popover, retuned `--duration-menu` |
| Checklist | Ring fills, strike fades in, eight dots burst once on completion | Feedback / delight (rare) | `stroke-dashoffset` transition, Motion |
| Calls archive | Cards scale out and in and reflow on filter; thumbnails zoom 1.04 on hover | Spatial consistency | Motion `layout` + `popLayout` |
| Role explorer | Tick and dash swap by scale | State indication | Motion, 180ms |
| Question flows | Questions slide in the direction of travel; progress dots stretch | Spatial consistency | Motion, 240ms |
| Steps | Passed numbers fill, the current one rings, the rail turns green | State indication | CSS on `data-state`, set from scroll |
| Countdown | Only the digit that changed rolls | State indication | Motion, 280ms; "Live" dot pings |
| Sound player | Playhead tracks audio; spectrogram fades in | State indication | Transform written per frame |
| Globe | Slow auto-turn, pulsing rings on organizations | Delight | globe.gl; still under reduced motion |
| Figure zoom | Dialog grows out of the image's position | Spatial consistency | `transform-origin` at the thumbnail, enter scale 0.55 |
| Keyboard page change | No entrance | Speed | `data-instant` on `<html>` |

Chips are `CHIP` in `src/lib/chip.ts`: muted pill, brand green when on. Inline
controls inside running text use the kit's `InlineTrigger`, the one primitive
that flows with a paragraph.

### Tokens

```css
--ease-out-strong:    cubic-bezier(0.23, 1, 0.32, 1);    /* enter / exit */
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
--ease-drawer:        cubic-bezier(0.32, 0.72, 0, 1);    /* sheets, drawers */
```

Built-in `ease-out` is too weak to read as intentional. **Never use `ease-in` on UI**: it
delays the first frame, the exact moment the user is watching.

### Durations

| Element | Duration |
| --- | --- |
| Button press | 100–160ms |
| Tooltip | 125–200ms |
| Dropdown, select | 150–250ms |
| Sheet, dialog | 200–300ms |
| Page-load stagger | 30–60ms between items |

Hard ceiling of 300ms for anything interactive.

### Rules that are not negotiable

- Animate `transform` and `opacity` only. Never `height`, `width`, `margin`, `padding`.
- Never enter from `scale(0)`: start at `scale(0.95)` with `opacity: 0`. Nothing in the
  real world appears from nothing.
- Popovers and dropdowns use `transform-origin: var(--radix-*-transform-origin)` so they
  grow from their trigger. Dialogs are the exception and stay centred.
- Exit faster than enter. The system responding should feel quicker than the user deciding.
- In Motion, prefer `transform: "translateY(8px)"` over the `y` shorthand for anything
  that animates while the page is busy: the shorthand runs on the main thread.
- Gate hover animations behind `@media (hover: hover) and (pointer: fine)`.
- Stagger on mount only, once, and never block interaction while it plays.

### Spring config

Apple-style parameters, easier to reason about than stiffness/damping:

```ts
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

Keep `bounce` between 0 and 0.2 in this app. A help page that wobbles reads as unserious.

### Reduced motion

`prefers-reduced-motion` collapses durations globally in `globals.css` and disables press
scaling. Opacity and colour transitions survive because they aid comprehension. This is
handled centrally: don't re-implement it per component.

---

## 7. Components

Built on **shadcn/ui** (Radix primitives, `radix-nova` preset) with **Motion** for
orchestration. Primitives live in `src/components/ui/`: treat them as owned source, edit
them directly rather than wrapping in layers.

### Composition rules

- `src/components/ui/` is the kit, `src/components/docs/` the shell,
  `src/components/mdx/` the components pages may use. Nothing page-specific in `ui/`.
- Server Components by default. `"use client"` only at the leaf that needs state,
  an event handler, or a browser API (sidebar, search, TOC, copy button).
- Icons: Lucide, `size-4` inline, `size-5` standalone, `strokeWidth` left at default.
  Content names icons in Font Awesome's vocabulary; `mdx/icon.tsx` maps them.

### Patterns in use

| Pattern | Rule |
| --- | --- |
| Card grid | `Cards`: L2 cards, `gap-2`, hover to accent, icon in a round L1 chip. |
| Page link | `PageLink`: icon chip, target title and description read from the target page. |
| Data table | Header `text-xs uppercase tracking-wide text-muted-foreground`. No row rules. |
| Status badge | Dot + text, `rounded-full`. Never a bare colour swatch. |
| Notice | One sentence, tinted from the status palette, `rounded-full` at control height. The shell's read-only notice is the pattern: the mode is stated once, at the top of the surface it affects, so every disabled control below has its explanation above it. A longer explanation goes on that surface, not in the strip. |
| Empty state | Icon, one sentence of what goes here, one action. Never a bare "No data". |
| Loading | Skeletons matching final layout dimensions. No spinners for page content. |

### Browser surfaces

Selection, caret, `accent-color`, scrollbars (both `scrollbar-color` and the WebKit long
form), and the focus ring are themed from the palette in `globals.css`. These ship with
defaults that belong to no design system; a stock blue selection highlight is the loudest
unthemed pixel in a sage-and-green site. Do not revert them to browser defaults.

### Accessibility floor

Focus rings are visible and use `ring` (never `outline: none` without a replacement).
Every icon-only control has an `aria-label` or a tooltip. Interactive targets ≥ 36px on
pointer, ≥ 44px on touch. Sidebar collapse is keyboard reachable (`⌘B`).

---

## 8. Adding to this system

1. Check whether a shadcn primitive already covers it before writing a component.
2. Use tokens. A raw hex or a magic pixel value in a PR is a review comment.
3. For anything that moves, run the `review-animations` skill against the diff.
4. Look at it again the next day. Timing problems are invisible while you're building them.

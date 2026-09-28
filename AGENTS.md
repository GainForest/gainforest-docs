# GainForest Docs: working agreements

Three files hold the truth, and they do not overlap:

- **`AGENTS.md`** (this file): how to write code and content here.
- **`design.md`**: the visual system: colour, radius, space, motion, reading type.
- **`README.md`**: how to run it.

The design system, kit, lint rules, and skills are ported from
`gainforest-admin`, so the two products look and behave as one family. When a
shared rule changes, change it in both.

Rules are durable. When a rule changes it changes here first, then the code.
`pnpm lint` enforces most of this file mechanically; the sections that say
"lint catches this" are not aspirational, they are AST checks that will fail
your build.

**Skills.** `.agents/skills/` (linked into `.claude/skills/`) holds the design
engineering skills: `emil-design-eng`, `animate`, `review-animations`,
`improve-animations`, `find-animation-opportunities`, `animation-vocabulary`,
`apple-design`, `prototype`, `pick-ui-library`, `ask-sonner`. Read the relevant
one before any UI or motion work; run `review-animations` against any diff that
moves something.

**Fast orientation.** `content/docs/` is the content, `src/lib/source.tsx` the
pipeline, `src/app/[[...slug]]/page.tsx` the page, `src/components/mdx/` the
authoring API, `src/app/globals.css` the tokens and prose styles.

---

## 1. Nothing is assembled from primitives

The single highest-leverage rule in this repo. Read it before writing any
markup.

**Never render a native form control.** No `<input>`, `<select>`,
`<textarea>`, `<button>`, `<option>`, `<progress>`, `<meter>`, `<dialog>`,
`<details>`, `<summary>`, `<fieldset>`, `<output>`. Not once, not "just this
small one", not with `className="sr-only"`.

A native control is a promise about behaviour that the raw element does not
keep: it does not manage focus, does not trap it in a portal correctly, does
not wire `aria-expanded`/`aria-controls`/`aria-activedescendant`, does not
handle typeahead, does not announce selection, does not survive RTL, and does
not carry this design system's tokens. Every one of those has been solved
already, correctly, in `src/components/ui/`. Rendering the primitive throws
that away and hand-rolls a worse version.

**The seam.** `src/components/ui/**` is the only directory allowed to render
native elements, and even there only when wrapping a Radix primitive so the
a11y wiring comes from the library. `src/components/ui/**` is generated
shadcn code you may retokenise; it is not a place to invent behaviour.
Everything outside it composes from `src/components/ui/**`.

**Before you write a control, in order:**

1. **Search the kit.** `ls src/components/ui/` then read the component. It is
   probably there: `select`, `combobox`, `dialog`, `alert-dialog`, `switch`,
   `checkbox`, `radio-group`, `sonner`, `command`, `popover`, `collapsible`,
   `tooltip`, `dropdown-menu`, `tabs`, `pagination`, `field`.
2. **Search the app.** `src/components/docs/` holds the shell (`DocsSidebar`,
   `DocsHeader`, `SearchPalette`, `Toc`, `PageActions`, `Reveal`) and
   `src/components/mdx/` holds every component a page can use (`Callout`,
   `Cards`/`Card`, `PageLink`, `Embed`, `Figure`, `Steps`/`Step`,
   `ButtonLink`, `Icon`). If you are about to write a second card, link card,
   or notice, stop.
3. **Add the shadcn component.** `pnpm dlx shadcn@latest add <name>`, then
   `pnpm retokenise` and read the diff. Generated defaults carry borders,
   `shadow-md` halos and double-drawn focus rings, which is exactly what the
   design system forbids. Adding without retokenising is how this drifts. The
   script knows a control from a panel (`NOT_CONTROL_HEIGHT` in
   `scripts/retokenise-ui.mjs`): when a file holds both, such as a select's
   trigger and its list, teach the script the marker for the part that is not
   the control rather than correcting the radius by hand, or the next `add`
   will undo the correction.
4. **Only then** write something new, and put it in `src/components/ui/` if it
   is a primitive or `src/components/docs/` or `src/components/mdx/` if it is a composition.

The same rule governs non-visual code, and it is the same rule.

**Prefer the library.** Before writing a helper, an algorithm, a state
machine, or a formatting function, ask whether a maintained library already
does it. Reach for a library *before* writing the 40 lines you think will be
quicker, because the 40 lines is the version that misses the edge case:

| Job | Library |
| --- | --- |
| Content: MDX, frontmatter, page tree, TOC | `fumadocs-core` + `fumadocs-mdx` (headless) |
| Search | `fumadocs-core/search` (static Orama index) |
| Any untrusted shape entering the app | `zod` |
| Cross-cutting client state | `zustand` |
| Command palette | `cmdk`, via `src/components/ui/command.tsx` |
| Class merging | `cn()` (already) |
| Accessible primitives | `radix-ui` (already) |

Hand-rolling one of these is a defect, not a preference. Parsing markdown,
walking the page tree, or tracking the active heading by hand is the most
common form of this mistake here: fumadocs already does each of them.

**Exceptions.** A raw element is acceptable when it carries no interaction and
no styling: a `<div>` wrapper, a `<span>` for text, `<ul>`/`<li>` for a genuine
list, `<h2>` for a heading. The ban is on *controls* and on anything that
duplicates a kit component. If you believe you need an exception, you need it
in the form of an inline `eslint-disable-next-line` with a reason, which is a
review conversation, not a private decision.

---

## 2. TypeScript: types are proven, never asserted

`as` is banned in this codebase. So are `!` (non-null assertion),
`@ts-ignore`, `@ts-nocheck`, and `any`. Lint catches all of them.

The reasoning is the point, so it is worth stating plainly: **a type assertion
is a claim the compiler cannot check.** `value as Project` does not verify that
`value` is a `Project`; it silences the one tool that was about to tell you it
is not. A codebase that asserts freely has TypeScript's syntax and none of its
guarantees, which is strictly worse than plain JavaScript because it also
carries the false confidence.

Every legitimate need for `as` has a real answer:

| Instead of | Do |
| --- | --- |
| `json as Foo` | Parse it: `FooSchema.parse(json)`, the boundary in §3 |
| `x as const` | Annotate: `const X: readonly Status[] = [...]` |
| `x as SomeType` because a branch narrowed it | A type predicate: `function isFoo(v: unknown): v is Foo` |
| `x!` | Prove it: `if (!x) throw new Error(...)`, or `??` a real default |
| `x as unknown as Y` | You have a boundary problem. Parse at the boundary. |
| `x as any` to satisfy a signature | The signature is wrong. Fix it, or write a real adapter. |
| A third-party type is incorrect | Write a validating adapter in `src/lib/`, not a cast at each call site |

`satisfies` is encouraged: unlike `as` it *checks* the value against a type and
keeps the narrower inference. `z.infer<typeof Schema>` is the normal way to get
a type from a runtime contract, and it is preferred over a hand-written
interface precisely because the schema is the thing that actually runs.

**Unknown input is `unknown` until it is parsed.** A function that accepts JSON
takes `unknown` and returns a parsed type, or it takes a schema. It never takes
a caller's claim about what the JSON is.

`tsconfig` carries `strict`, `noUncheckedIndexedAccess`, and
`noImplicitOverride`. Indexing an array gives `T | undefined` and you handle
it. Do not reach for `!`.

---

## 3. Content is the source of truth

The site is a renderer for `content/docs`. Everything a reader sees on a page
comes from a file there, and the build fails rather than guessing.

- **One page, one `.mdx` file.** The URL is the path: `content/docs/evidence/batch-uploads.mdx`
  is `/evidence/batch-uploads`. A folder's `index.mdx` is the folder's URL.
- **Order and grouping live in `meta.json`**, never in code. `"---Group name---"`
  starts a sidebar group; `"...folder"` inlines a folder's pages into the
  current group. The sidebar, prev/next, and search all read the same tree, so
  they cannot disagree.
- **Frontmatter is parsed**, against `pageSchema` in `src/lib/source.tsx`.
  `title` is required; `description` is the one-line summary used by
  `PageLink`, search, and metadata, so write one for every page. `icon` is a
  Font Awesome name (the vocabulary GitBook used), resolved to Lucide in
  `src/components/mdx/icon.tsx`. A new name goes in that map.
- **Links between pages are absolute URL paths** (`/evidence/batch-uploads`),
  not relative `.md` paths.
- **Images live in `public/assets/`**, lowercase-kebab names, referenced as
  `/assets/name.webp`. Prefer `.webp`. Keep screenshots under ~500KB; anything
  larger (reports, PDFs) is linked from where it is hosted, not committed.
- **Pages use only the components in `src/components/mdx/index.tsx`.** That map
  is the whole authoring API. A new component goes there, is documented here,
  and is built from the kit (§1). No raw HTML in MDX: `class=`, `<table>`,
  `<button>`, and inline `style` are GitBook residue.
- **Every URL that has ever been public keeps working.** A renamed or moved page
  adds an entry to `src/lib/redirects.json` in the same change.
- **Agents read the same content.** `/llms.txt`, `/llms-full.txt`, and
  `/llms.mdx/<slug>/content.md` are generated from the source; do not
  hand-maintain a second copy.

**Interactive components** (`src/components/interactive/`), all usable in MDX:

| Component | Use |
| --- | --- |
| `<Checklist id title>` + `<Check>` | A list the reader ticks off, saved in this browser. `id` must be unique site-wide. |
| `<CallArchive />` | The community calls. Data is `content/data/community-calls.json`: add a call there, not in MDX. |
| `<RoleExplorer />` | Owner / Admin / Member capabilities. Only what the permissions page states. |
| `<UploadPicker />`, `<GrantCheck />` | Question flows built on `flow.tsx`. Every outcome links to a real page. |
| `<GlobePreview />` | Live organizations from GainForest.app, fetched at build and refreshed daily. |
| `<SoundSample />` | Recent real AudioMoth recordings from the indexer. |
| `<BioblitzCountdown />` | The live round, from `src/lib/bioblitz.ts` (a port of GainForest.app's schedule). |
| `<DonatePicker />` | Amounts compared only to figures stated elsewhere in the docs. |

Site-wide, with no authoring needed: glossary terms (first use per page, from
`src/lib/glossary.ts` via `remark-glossary`), copy-link on headings, image
zoom on every `Figure`, read time and git "updated" date, "Was this helpful?"
(forwarded to `FEEDBACK_WEBHOOK_URL` if set), and keyboard shortcuts.

**Nothing interactive invents a fact.** Every figure, date, and capability
comes from a page in `content/docs`, a file in `content/data`, or a live
GainForest source parsed with zod in `src/lib/upstream/`. If a source cannot
be read, the component says so; it never shows a placeholder number.

**State that should be shareable lives in the URL** (`nuqs`: calls filters,
the open call, compared roles). Components that read it are wrapped in a
`Suspense` boundary in `src/components/mdx/index.tsx` so pages still
prerender. **State that is personal lives in this browser** (`useLocal` in
`src/lib/stores/local.ts`). Nothing is stored on a server.

`scripts/migrate-gitbook.py` is the one-shot importer from the old GitBook repo.
It is kept for reference and re-running is destructive to hand edits in
`content/docs`; do not run it again once pages have been edited here.

## 4. Rendering

- **Everything is static.** Every page, the search index, and the `llms`
  routes are prerendered at build (`generateStaticParams`, `revalidate =
  false`). Nothing reads a cookie or a request. If a change makes a route
  dynamic, that is a regression.
- **Page data comes from `source`** (`src/lib/source.tsx`), never from reading
  `content/` with `fs`. `source.getPage`, `source.getPageTree`, and
  `findNeighbour` are the API.
- **No bare `fetch` in components.** There is no server data. The one
  exception is `PageActions` fetching the page's own markdown on click.

## 5. Components

- **Server components by default.** `"use client"` is a claim that you need
  state, an effect, an event handler, or a browser API. Push the boundary as
  deep as the leaf that actually needs it, never to the top of a page.
- **Colocate by role.** `src/components/ui/` is the kit, `src/components/docs/`
  is the shell, `src/components/mdx/` is what pages may render.
- **Props are explicit and typed.** No spreading through more than one layer.
- **`not-found.tsx` is designed**, and names the recovery (search, or the
  welcome page). The error boundary prop is `retry` (Next 16.3+), never `reset`.
- **Never render a raw failure.** `error.message`, `error.digest`, stack
  traces, `undefined`, and `NaN` are not copy. An error names the problem and
  the recovery.

## 6. Styling

`design.md` is the visual system; this is the short version.

- **The article is a reading surface, not a dashboard.** `.prose` in
  `globals.css` owns body type, rhythm, links, lists, tables, and code, at
  16/17px with a 72ch measure (design.md §4a). Style content there, once;
  never with classes inside a page.
- **Tokens only.** Colour, radius, spacing, shadow, and easing come from the
  custom properties in `globals.css`. A raw hex, a raw `px` gap, or an inline
  `cubic-bezier` in a component is a bug.
- **No borders, no shadows.** Depth is luminance. Every edge is a step on the
  four-rung tonal ladder. The single exception is `--shadow-overlay`, reserved
  for things that leave the document flow: dialogs, dropdowns, tooltips,
  sheets, popovers.
- **Concentric radii.** `r_inner = r_outer − padding`. Use the `--radius-*`
  scale; do not invent a value.
- **Padding contains the gap.** A container that spaces its children with
  `gap-*` (or `space-*`) keeps its own padding at or above that value, per
  axis: `p ≥ g`. A frame thinner than the divisions inside it makes the
  children read as one run spilling past its own edge. State it per container,
  because that is the version that stays true wherever the container is
  nested: padding only sums down the tree, so a container that satisfies
  `p ≥ g` on its own cannot be broken by a new ancestor. Lint enforces it
  (`design/containment`).
- **This crosses components too.** The rule is about the frame a reader sees,
  and that frame is often a container in one file and a gap in another. A
  well (`Cards`, a table, a figure frame) is `p-1` (4px), so content composed *inside* it divides by
  `gap-1`, not `gap-2`: a child that declares `gap-2` at the well's edge has
  8px between its parts and 4px around them, which is the defect, even though
  no single class list contains both numbers. A component that renders its own
  layout root (a grid, a table) and is used inside a well carries `p-1` of its
  own, so its frame and its gap agree wherever it lands. Lint cannot see across
  the file boundary, so prefer the `gap-1 p-1` pair when you add content to a
  well.
- **Anything at control height is `rounded-full`.** Buttons, inputs, badges,
  pills, nav rows, avatars, chips. A pill is never multiline.
- **`rounded-full` is a test, not a soft edge.** The test is the box: one line
  at control height (≤36px). Everything that can grow or scroll is not control
  height and takes a step from the scale: a textarea, a select or dropdown
  panel, a row inside such a panel, a card, a well. A notice stays one bounded
  sentence so that it stays a pill; a longer explanation belongs in the surface
  it is about. Lint proves the loud half (`design/control-height`): full radius
  on anything that sizes to its content, scrolls, or sets a minimum height past
  36px fails.
- **`cn()` for conditional classes.** Later utilities win.
- **Use logical properties** (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) so
  the layout is RTL-clean. The one deliberate exception is the centering idiom
  `left-1/2 -translate-x-1/2`, which must stay physical.

---

## 7. Motion

- One curve and one duration scale, owned by `src/lib/motion.ts`. Components do
  not author transitions inline.
- **One entrance, reused.** Everything arriving on screen goes through
  `<Reveal>`. No hand-rolled entrances.
- Content is visible at rest. A hidden variant never sets `display: none`, so a
  failed animation degrades to visible content rather than nothing.
- **Animate `transform` and `opacity` only.** Never `width`, `height`, `top`,
  or `left`.
- **Never `scale(0)`.** Start at `0.95` with opacity. A spinner is the one
  exception.
- Never `ease-in` on something entering. Use `--ease-out-strong`.
- `prefers-reduced-motion` is handled globally in two places and never
  per-component: the media query in `globals.css` for CSS transitions, and
  `MotionConfig reducedMotion="user"` for Motion transforms.

`design.md` §6 has the frequency table and the inventory of every motion in
the site. The short version: **this is a reading site, visited occasionally,
so it is allowed to feel alive**, but the more often a user sees something,
the less it moves, and a keyboard action never waits on an animation.

- CSS motion lives in the *Motion* section at the end of `globals.css`. Add
  to it; do not put keyframes or `transition-*` utilities with invented
  values in components. Overlay timing is retuned there by `data-slot`, not
  by editing kit class lists.
- Motion (`motion/react`) is only for what CSS cannot do: shared-layout
  trackers (`layoutId`: sidebar pill, outline thumb, search highlight), all
  on `NAV_SPRING` from `src/lib/motion.ts`.
- Hover motion goes through the `.lift` family (`lift-chip`, `lift-arrow`,
  `lift-arrow-back`, `lift-arrow-out`), which is already pointer-gated.
- Icon or label swaps use `.swap` with `data-shown`, and the hidden half is
  `aria-hidden`.
- Run the `review-animations` skill against any diff that moves something.

---

## 8. Accessibility floor

Not a later pass. A component that fails any of these is unfinished.

- Keyboard operable end to end. Every interactive control reachable and
  visible when focused.
- The global focus ring is never removed. If it is invisible against a surface,
  the surface is wrong.
- Text ≥ 4.5:1, large text ≥ 3:1, against the surface it actually lands on:
  remember that a tinted badge composites over the rung beneath it.
- **No meaning by colour alone.** Status carries a word and a shape.
- Icon-only controls carry an accessible name that survives the label being
  hidden at a breakpoint.
- Scrollable regions are keyboard-reachable.
- Live regions (`aria-live="polite"`) for anything that updates on its own.
- Interactive targets ≥ 44px on touch.
- Axe is run against the welcome page and at least one page per component in light and dark before a UI change is
  called done, using the browser tooling rather than a script. Zero violations
  is the bar. There is no `pnpm a11y` yet: a runnable gate would need a browser
  driver (`@axe-core/playwright`) that is not installed, and a gate command
  that cannot run is one people learn to ignore.

---

## 9. Adding things

**A page.** Create `content/docs/<path>.mdx` with `title`, `description`, and
`icon`; add its name to the folder's `meta.json`; link it from wherever a
reader would look for it. `pnpm build`.

**An MDX component.** Build it in `src/components/mdx/` from the kit, add it
to the map in `src/components/mdx/index.tsx`, list it in §3's component set
above, and use it on a real page before calling it done.

**A kit primitive.** §1: `pnpm dlx shadcn@latest add <name>`, then
`pnpm retokenise`, then read the diff.

## 10. Gates

Nothing is done until all of these pass.

```bash
pnpm lint        # includes the AST rules in §1, §2, §6
pnpm typecheck
pnpm build       # also fails on bad frontmatter or a broken MDX component
```

Then, for any UI change, look at it on `pnpm dev` (http://localhost:4040) in
both themes and at phone width, and run axe in the browser tooling.

`pnpm lint` is `--max-warnings=0`. Warnings are errors here.

## 11. Language

- **Wording is plain.** Readers are nature stewards, funders, and community
  members, many reading in a second language. Short sentences, common words,
  the product's own names (`Bumicerts`, `Project`, `Tainá`, `BioBlitz`,
  `AudioMoth`) used consistently. No crypto or developer jargon without a
  one-line explanation.
- **No em dash, anywhere**: not in copy, metadata, `alt` text, comments, or
  these documents. Use the mark that names the relationship: a comma for an
  aside, a colon for an expansion, a semicolon or two sentences for clauses,
  parentheses for a parenthetical, `to` or `→` for a range. `grep -rn "—" src content`
  returning anything is a defect. (The migrated GitBook copy still carries
  em dashes; remove them when you edit a page.)
- **No eyebrow.** Nothing sits above a heading whose job is to introduce it: no
  kicker, no tracked-caps string, no group name. The heading carries its own
  weight.
- Copy is sentence case. Tracked caps are for column heads and measurement
  units, never sentences.

---

## 12. What lint enforces

These are implemented in `eslint.config.mjs`, except the two class-list rules,
which live in `eslint/rules/design.mjs`. They are described here so the
rule is never a surprise, and so you know which ones are a conversation versus a
failure.

| Rule | Scope |
| --- | --- |
| No `as`, `<T>x`, `!`, `@ts-ignore`, `@ts-nocheck`, `any` | everywhere |
| No native form controls | everywhere except `src/components/ui/**` |
| No `dangerouslySetInnerHTML` | everywhere |
| Padding smaller than the gap, per axis | everywhere (`design/containment`) |
| `rounded-full` on a box that is not control height | everywhere (`design/control-height`) |

What lint cannot see, and review therefore owns: whether a pill's copy stays on
one line, and whether a transparent wrapper's padding adds to an ancestor's.
The first is bounded by keeping notice copy to one sentence; the second is why
the containment rule is stated per container and not per composition.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
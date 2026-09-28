# GainForest Docs

The help site at docs.gainforest.earth, replacing GitBook. Same design system
as `gainforest-admin`.

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, fully static |
| Content | MDX in `content/docs`, via `fumadocs-core` + `fumadocs-mdx` (headless) |
| Styling | Tailwind CSS v4, tokens in `src/app/globals.css` |
| Components | shadcn/ui `radix-nova`, Radix primitives, retokenised |
| Search | Static Orama index, ⌘K palette |
| Icons / fonts | Lucide, Geist Sans / Geist Mono |

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:4040
pnpm lint && pnpm typecheck && pnpm build
```

## Writing a page

Add `content/docs/<path>.mdx` with `title`, `description`, and `icon` in the
frontmatter, then list it in that folder's `meta.json`. Components available in
MDX: `Callout`, `Cards` + `Card`, `PageLink`, `Embed`, `Figure`, `Steps` +
`Step`, `ButtonLink`, `Icon`. `AGENTS.md` §3 has the rules.

## Environment

| Variable | Needed for |
| --- | --- |
| `FEEDBACK_WEBHOOK_URL` | Optional. Where "Was this helpful?" votes are posted (Slack or Discord style JSON). Without it they go to the function log. |
| `VERCEL_DEEP_CLONE=true` | On Vercel, so git history is available for "Updated" dates. |

## Layout

```
content/docs/          pages and meta.json (sidebar order + groups)
public/assets/         images referenced by pages
src/lib/source.tsx     the content pipeline (fumadocs loader)
src/lib/redirects.json old GitBook URLs -> new URLs
src/app/[[...slug]]/   the page route
src/app/api/search/    static search index
src/app/llms*          llms.txt, llms-full.txt, per-page markdown
src/components/ui/     kit (owned shadcn source)
src/components/docs/   shell: sidebar, header, search, TOC, page actions
src/components/mdx/    everything a page can render
scripts/               migrate-gitbook.py (one-shot import), retokenise-ui.mjs
```

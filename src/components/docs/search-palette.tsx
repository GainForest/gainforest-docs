"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import { FileText, Hash, History, Search, Sparkles, TextQuote } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { create } from "zustand";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { NAV_SPRING } from "@/lib/motion";
import { useLocal } from "@/lib/stores/local";

/**
 * Open state is shared by the header trigger and the ⌘K listener.
 *
 * How it was opened decides whether it animates. From the keyboard it
 * appears instantly: a shortcut used all day should never wait on a
 * transition (design.md §6). From the pointer it scales in, which is the
 * spatial cue a click deserves. The flag is an attribute on <html> because
 * the dialog renders in a portal outside this tree.
 */
type Via = "keyboard" | "pointer";
export const useSearchOpen = create<{ open: boolean; setOpen: (open: boolean, via?: Via) => void }>(
  (set) => ({
    open: false,
    setOpen: (open, via) => {
      if (open) document.documentElement.dataset.palette = via === "keyboard" ? "instant" : "animated";
      set({ open });
    },
  }),
);

/**
 * Created once. `useDocsSearch` compares the client's `deps` array by
 * reference, so a client built during render restarts (and cancels) every
 * search on every render and nothing is ever returned.
 */
const SEARCH_CLIENT = staticClient({});

const ICON = { page: FileText, heading: Hash, text: TextQuote };


export function SearchTrigger() {
  const setOpen = useSearchOpen((s) => s.setOpen);
  return (
    <Button
      variant="secondary"
      className="w-full max-w-72 justify-start gap-2 text-muted-foreground"
      onClick={() => setOpen(true, "pointer")}
    >
      <Search aria-hidden />
      <span className="flex-1 text-start">Search the docs</span>
      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
    </Button>
  );
}

export function SearchPalette() {
  const { open, setOpen } = useSearchOpen();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!useSearchOpen.getState().open, "keyboard");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search the docs"
      description="Find a page, a section, or a phrase."
    >
      {/* The dialog mounts its content only while open, so the search hook
          below starts fresh each time, the way fumadocs' own dialog uses it.
          Held in an always-mounted component, it never settles. */}
      <SearchResults onNavigate={() => setOpen(false)} />
    </CommandDialog>
  );
}

/** Where a new reader usually starts. Shown when the box is empty. */
const SUGGESTIONS: readonly string[] = [
  "How do I upload observations?",
  "AudioMoth",
  "Rewilding grant",
  "Data Council",
  "Enable donations",
];

type Hit = { id: string; url: string; type: "page" | "heading" | "text"; content: string };
type Group = { page: Hit; hits: Hit[] };

/** fumadocs returns a page followed by its matching sections; fold that into groups. */
function group(results: readonly Hit[]): Group[] {
  const out: Group[] = [];
  for (const r of results) {
    if (r.type === "page" || out.length === 0) out.push({ page: r, hits: [] });
    else out[out.length - 1]?.hits.push(r);
  }
  return out;
}

/** The index marks matches with <mark>. Split on it and render real <mark>s,
 *  never HTML: the content is text we did not write by hand. */
function Highlighted({ text }: { text: string }) {
  const parts = text.replace(/[*_`#]/g, "").split(/(<mark>.*?<\/mark>)/g);
  return (
    <span className="truncate">
      {parts.map((p, i) =>
        p.startsWith("<mark>") ? (
          <mark key={i} className="rounded-xs bg-primary/20 px-0.5 text-foreground">
            {p.slice(6, -7)}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

function SearchResults({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({ client: SEARCH_CLIENT });
  const results: Hit[] = query.data === "empty" || !query.data ? [] : query.data;
  const [selected, setSelected] = useState("");
  const recent = useLocal((s) => s.recentSearches);
  const pushRecent = useLocal((s) => s.pushRecentSearch);
  const picks = useLocal((s) => s.picks);
  const pick = useLocal((s) => s.pick);

  // Pages this reader has chosen before rise to the top; ties keep the
  // engine's order (Array.prototype.sort is stable).
  const groups = group(results).sort(
    (a, b) => (picks[b.page.url.split("#")[0] ?? ""] ?? 0) - (picks[a.page.url.split("#")[0] ?? ""] ?? 0),
  );

  function choose(hit: Hit) {
    pushRecent(search);
    pick(hit.url.split("#")[0] ?? hit.url);
    onNavigate();
    router.push(hit.url);
  }

  let n = 0;
  const row = (hit: Hit, nested: boolean) => {
    const Icon = ICON[hit.type];
    const delay: CSSProperties = { animationDelay: `${Math.min(n++, 8) * 25}ms` };
    return (
      <CommandItem
        key={hit.id}
        value={hit.id}
        style={delay}
        onSelect={() => choose(hit)}
        className={`result-enter isolate data-selected:bg-transparent ${nested ? "ps-8" : ""}`}
      >
        {/* One highlight that glides between rows as the arrow keys move,
            fast and without bounce: list navigation is frequent, so it must
            never feel like it lags the key. */}
        {selected === hit.id ? (
          <motion.span
            aria-hidden
            layoutId="search-highlight"
            transition={{ ...NAV_SPRING, duration: 0.22 }}
            className="absolute inset-0 -z-10 rounded-lg bg-muted"
          />
        ) : null}
        <Icon aria-hidden />
        <Highlighted text={hit.content} />
      </CommandItem>
    );
  };

  return (
    <Command shouldFilter={false} value={selected} onValueChange={setSelected}>
      <CommandInput placeholder="Search the docs" value={search} onValueChange={setSearch} />
      <CommandList>
        {search.length === 0 ? (
          <>
            {recent.length > 0 ? (
              <CommandGroup heading="Recent">
                {recent.map((r) => (
                  <CommandItem key={`recent-${r}`} value={`recent-${r}`} onSelect={() => setSearch(r)} className="result-enter isolate">
                    <History aria-hidden />
                    {r}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            <CommandGroup heading="Try">
              {SUGGESTIONS.map((q) => (
                <CommandItem key={`try-${q}`} value={`try-${q}`} onSelect={() => setSearch(q)} className="result-enter isolate">
                  <Sparkles aria-hidden />
                  {q}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
        {search.length > 0 && !query.isLoading ? (
          <CommandEmpty className="result-enter">Nothing matches that. Try a shorter phrase.</CommandEmpty>
        ) : null}
        {groups.map((g) => (
          <CommandGroup key={g.page.id}>
            {row(g.page, false)}
            {g.hits.map((h) => row(h, true))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd> open
        </span>
        <span className="flex items-center gap-1">
          <Kbd>esc</Kbd> close
        </span>
      </div>
    </Command>
  );
}

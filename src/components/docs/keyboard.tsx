"use client";

import { Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

import { useSearchOpen } from "@/components/docs/search-palette";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocal } from "@/lib/stores/local";

/**
 * Keyboard navigation for the whole site.
 *
 *   j / k   next / previous page       [ / ]   previous / next heading
 *   /       search                     ?       this sheet
 *   r       reading mode
 *
 * The page registers its neighbours and headings (`PageKeys`); the listener
 * lives once in the shell. A keyboard action never waits on motion, so a
 * page reached by key skips its entrance (`data-instant` on <html>).
 * Nothing fires while the reader is typing in a field.
 */
type Keys = { prev: string | null; next: string | null; headings: string[] };
const useKeys = create<Keys & { set: (k: Keys) => void; help: boolean; setHelp: (h: boolean) => void }>((set) => ({
  prev: null,
  next: null,
  headings: [],
  set: (k) => set(k),
  help: false,
  setHelp: (help) => set({ help }),
}));

export function PageKeys(props: Keys) {
  const set = useKeys((s) => s.set);
  const { prev, next, headings } = props;
  useEffect(() => set({ prev, next, headings }), [set, prev, next, headings]);
  return null;
}

function typing(e: KeyboardEvent): boolean {
  const t = e.target;
  return t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

function instant() {
  document.documentElement.dataset.instant = "";
  window.setTimeout(() => delete document.documentElement.dataset.instant, 600);
}

const ROWS: readonly [string[], string][] = [
  [["j"], "Next page"],
  [["k"], "Previous page"],
  [["]"], "Next heading"],
  [["["], "Previous heading"],
  [["/"], "Search"],
  [["⌘", "K"], "Search"],
  [["r"], "Reading mode"],
  [["?"], "Show these shortcuts"],
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const help = useKeys((s) => s.help);
  const setHelp = useKeys((s) => s.setHelp);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey || useSearchOpen.getState().open) return;
      const { prev, next, headings } = useKeys.getState();
      const main = document.getElementById("main");
      if (e.key === "j" && next) {
        instant();
        router.push(next);
      } else if (e.key === "k" && prev) {
        instant();
        router.push(prev);
      } else if ((e.key === "]" || e.key === "[") && main && headings.length) {
        const tops = headings
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => el !== null)
          .map((el) => ({ el, top: el.getBoundingClientRect().top }));
        const target =
          e.key === "]" ? tops.find((h) => h.top > 90) : [...tops].reverse().find((h) => h.top < 70);
        if (target) {
          target.el.scrollIntoView({ block: "start", behavior: "instant" });
          history.replaceState(null, "", `#${target.el.id}`);
        }
      } else if (e.key === "/") {
        useSearchOpen.getState().setOpen(true, "keyboard");
      } else if (e.key === "r") {
        const { reading, setReading } = useLocal.getState();
        setReading(!reading);
      } else if (e.key === "?") {
        setHelp(true);
      } else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setHelp]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden size-8 md:inline-flex" aria-label="Keyboard shortcuts" onClick={() => setHelp(true)}>
            <Keyboard aria-hidden className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Keyboard shortcuts <Kbd>?</Kbd>
        </TooltipContent>
      </Tooltip>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="max-w-sm gap-3 p-4">
          <DialogTitle className="text-base font-semibold">Keyboard shortcuts</DialogTitle>
          <DialogDescription className="sr-only">Move around the docs without a mouse.</DialogDescription>
          <ul className="flex flex-col gap-1 rounded-lg bg-muted p-1">
            {ROWS.map(([keys, label]) => (
              <li key={label + keys.join()} className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm">
                {label}
                <span className="flex gap-1">
                  {keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

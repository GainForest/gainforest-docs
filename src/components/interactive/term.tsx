"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

import { InlineTrigger } from "@/components/ui/inline-trigger";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { glossaryTerm } from "@/lib/glossary";

/**
 * A glossary term in running text. Marked by `remark-glossary` on its first
 * use on a page; the definition comes from `src/lib/glossary.ts`.
 *
 * A popover, not a hover card, so it works everywhere: a precise pointer
 * opens it on hover (after a short intent delay, closing on leave), touch and
 * keyboard open it with a tap or Enter. The underline is dotted so it reads
 * as "there is more here", distinct from a link's solid one, and faint at
 * rest so a page with many terms still reads as running text; it firms up
 * under the pointer.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossaryTerm(id);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  if (!entry) return <>{children}</>;

  function hover(next: boolean, e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? 250 : 150);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <InlineTrigger
          onPointerEnter={(e) => hover(true, e)}
          onPointerLeave={(e) => hover(false, e)}
          className="term underline decoration-dotted decoration-1 underline-offset-4 [text-decoration-color:color-mix(in_oklch,var(--muted-foreground)_45%,transparent)] hover:[text-decoration-color:var(--muted-foreground)]"
        >
          {children}
        </InlineTrigger>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        onPointerEnter={(e) => hover(true, e)}
        onPointerLeave={(e) => hover(false, e)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="gap-2 p-3"
      >
        <span className="text-sm font-medium text-foreground">{entry.term}</span>
        <p className="text-sm leading-relaxed text-muted-foreground">{entry.definition}</p>
        {entry.href ? (
          <Link
            href={entry.href}
            onClick={() => setOpen(false)}
            className="lift flex items-center gap-1 self-start text-sm font-medium text-primary"
          >
            Read more <ArrowRight aria-hidden className="lift-arrow size-3.5" />
          </Link>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocal } from "@/lib/stores/local";
import { cn } from "@/lib/utils";

const R = 14;
const C = 2 * Math.PI * R;

/** Header of a checklist: a ring that fills as items are ticked, the count,
 *  and a small burst the moment the last one is ticked (rare, so allowed). */
export function ChecklistProgress({ list, title, total }: { list: string; title: string; total: number }) {
  const done = useLocal((s) => (s.checks[list] ?? []).filter((i) => i < total).length);
  const reset = useLocal((s) => s.resetChecks);
  const complete = total > 0 && done === total;

  return (
    <div className="flex items-center gap-2 px-2 pt-1">
      <span className="relative flex size-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="size-9 -rotate-90" aria-hidden>
          <circle cx="18" cy="18" r={R} fill="none" strokeWidth="3.5" className="stroke-muted" />
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - (total ? done / total : 0))}
            className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-[var(--ease-out-strong)]"
          />
        </svg>
        <AnimatePresence>
          {complete ? <Burst key="burst" /> : null}
        </AnimatePresence>
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground tabular" aria-live="polite">
          {complete ? "All done. You're ready." : `${done} of ${total} ready`}
        </span>
      </div>
      {done > 0 ? (
        <Button variant="ghost" size="sm" onClick={() => reset(list)} aria-label={`Clear ${title}`}>
          <RotateCcw aria-hidden />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

/** Eight dots thrown outward from the ring and faded, once. */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className={cn("absolute top-1/2 left-1/2 size-1.5 rounded-full", i % 2 ? "bg-primary" : "bg-chart-3")}
            initial={{ opacity: 1, transform: "translate(-50%, -50%) translate(0px, 0px) scale(1)" }}
            animate={{
              opacity: 0,
              transform: `translate(-50%, -50%) translate(${Math.cos(a) * 26}px, ${Math.sin(a) * 26}px) scale(0.6)`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />
        );
      })}
    </span>
  );
}

export function ChecklistItem({ list, index, children }: { list: string; index: number; children: ReactNode }) {
  const checked = useLocal((s) => (s.checks[list] ?? []).includes(index));
  const toggle = useLocal((s) => s.toggleCheck);
  const id = useId();

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-muted",
        checked && "text-muted-foreground",
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={() => toggle(list, index)} className="mt-0.5" />
      {/* The strike fades in rather than snapping on, and works across wrapped lines. */}
      <label
        htmlFor={id}
        className={cn(
          "flex-1 cursor-pointer text-sm leading-relaxed line-through transition-[text-decoration-color,color] duration-300",
          checked ? "decoration-current" : "decoration-transparent",
        )}
      >
        {children}
      </label>
    </li>
  );
}

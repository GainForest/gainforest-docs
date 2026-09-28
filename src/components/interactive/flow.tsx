"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/motion";

/**
 * A small question flow: one question at a time, each answer either leads to
 * another question or to an outcome. Used by the upload picker and the grant
 * check. Questions slide in the direction of travel, so going back feels
 * like going back.
 */
export type Answer = { label: string; hint?: string; next: string };
export type Step =
  | { kind: "question"; prompt: string; answers: readonly Answer[] }
  | { kind: "outcome"; title: string; body: ReactNode; href?: string; cta?: string; tone?: "ok" | "warn" };

export function Flow({ steps, start, title }: { steps: Record<string, Step>; start: string; title: string }) {
  const [trail, setTrail] = useState<string[]>([start]);
  const [dir, setDir] = useState(1);
  const id = trail[trail.length - 1] ?? start;
  const step = steps[id];
  if (!step) return null;

  const go = (next: string) => {
    setDir(1);
    setTrail((t) => [...t, next]);
  };
  const back = () => {
    setDir(-1);
    setTrail((t) => (t.length > 1 ? t.slice(0, -1) : t));
  };

  return (
    <section aria-label={title} className="not-prose my-6 flex flex-col gap-2 overflow-hidden rounded-xl bg-card p-2">
      <div className="flex items-center gap-2 px-2 pt-1">
        <span className="flex-1 text-sm font-medium">{title}</span>
        <span aria-hidden className="flex gap-1">
          {trail.map((t, i) => (
            <motion.span
              key={`${t}-${i}`}
              layout
              className={`h-1.5 rounded-full ${i === trail.length - 1 ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
            />
          ))}
        </span>
      </div>
      <div aria-live="polite" className="relative">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={id}
            custom={dir}
            initial={{ opacity: 0, transform: `translateX(${dir * 24}px)` }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            exit={{ opacity: 0, transform: `translateX(${dir * -24}px)` }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="flex flex-col gap-2"
          >
            {step.kind === "question" ? (
              <>
                <p className="px-2 text-lg font-semibold tracking-tight">{step.prompt}</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {step.answers.map((a) => (
                    <Button
                      key={a.label}
                      variant="ghost"
                      onClick={() => go(a.next)}
                      className="lift h-auto flex-col items-start gap-0.5 rounded-lg bg-muted px-4 py-3 text-start whitespace-normal hover:bg-accent"
                    >
                      <span className="text-sm font-medium">{a.label}</span>
                      {a.hint ? <span className="text-xs font-normal text-muted-foreground">{a.hint}</span> : null}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className={`flex flex-col gap-2 rounded-lg p-4 ${step.tone === "warn" ? "bg-status-warn-bg" : "bg-status-ok-bg"}`}>
                <p className="text-lg font-semibold tracking-tight">{step.title}</p>
                <div className="text-sm leading-relaxed">{step.body}</div>
                {step.href ? (
                  <Button asChild className="lift mt-1 self-start">
                    <Link href={step.href}>
                      {step.cta ?? "Open the guide"}
                      <ArrowRight aria-hidden className="lift-arrow" data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {trail.length > 1 ? (
        <div className="flex gap-1 px-1 pb-1">
          <Button variant="ghost" size="sm" onClick={back}>
            <ArrowLeft aria-hidden /> Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDir(-1);
              setTrail([start]);
            }}
          >
            <RotateCcw aria-hidden /> Start over
          </Button>
        </div>
      ) : null}
    </section>
  );
}

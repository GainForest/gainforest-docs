"use client";

import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROLL } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Intent = { label: string; href: string };

/**
 * The phrase that has left rises out and blurs; the next one rises in from
 * below. One that is waiting sits below, invisible, so it always enters from
 * the same side. `transform` and `filter` only.
 */
const roll: Variants = {
  shown: { opacity: 1, transform: "translateY(0%)", filter: "blur(0px)" },
  gone: { opacity: 0, transform: "translateY(-55%)", filter: "blur(6px)" },
  waiting: { opacity: 0, transform: "translateY(55%)", filter: "blur(6px)" },
};

/**
 * "I want to ___", where the blank is a link that turns over every few
 * seconds through the things people most often come here to do.
 *
 * Every phrase is stacked in one grid cell, so the line is as wide as the
 * longest one and never reflows as they change. The pace is set by the
 * active dot filling (a CSS animation, `.intent-timer`); its end advances the
 * phrase, so pausing the fill on hover or focus pauses everything with no
 * timer to keep in step. Under reduced motion the fill does not run
 * (globals.css), so no end ever fires and nothing turns on its own: the dots
 * are how you choose. That is CSS rather than a hook on purpose: the server
 * cannot know the reader's preference, and a class that differed between the
 * two renders would be a hydration mismatch. The full list is the grid
 * below, too.
 */
export function IntentRoller({ intents }: { intents: Intent[] }) {
  const [{ index, previous }, setState] = useState({ index: 0, previous: -1 });
  const [paused, setPaused] = useState(false);
  const current = intents[index];
  if (!current) return null;

  const go = (to: number) => setState((s) => (to === s.index ? s : { index: to, previous: s.index }));
  const advance = () => go((index + 1) % intents.length);

  return (
    <div
      className="flex flex-col gap-3"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <p className="flex flex-wrap items-baseline gap-x-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        <span className="text-muted-foreground">I want to</span>
        <Link href={current.href} className="intent group inline-grid text-foreground" data-pressable>
          {intents.map((intent, i) => (
            <motion.span
              key={intent.href}
              aria-hidden={i !== index}
              initial={false}
              animate={i === index ? "shown" : i === previous ? "gone" : "waiting"}
              variants={roll}
              transition={ROLL}
              className={cn(
                "col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap",
                i !== index && "pointer-events-none",
              )}
            >
              <span className="relative">
                {intent.label}
                <span aria-hidden className="intent-line absolute inset-x-0 -bottom-1 h-0.5 rounded-full" />
              </span>
              <ArrowRight aria-hidden className="lift-arrow size-6 text-primary" />
            </motion.span>
          ))}
        </Link>
      </p>
      {intents.length > 1 ? (
        <div role="group" aria-label="Choose what you want to do" className="-ms-1.5 flex items-center pointer-coarse:hidden">
          {intents.map((intent, i) => (
            <Button
              key={intent.href}
              variant="ghost"
              size="icon-xs"
              aria-label={intent.label}
              aria-pressed={i === index}
              onClick={() => go(i)}
            >
              <span
                className={cn(
                  "intent-dot relative block h-1.5 w-4 overflow-hidden rounded-full bg-foreground/15",
                  i === index && "is-on",
                )}
              >
                {i === index ? (
                  <span
                    key={index}
                    className={cn("intent-timer is-running absolute inset-0 rounded-full bg-primary", paused && "is-paused")}
                    onAnimationEnd={advance}
                  />
                ) : null}
              </span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

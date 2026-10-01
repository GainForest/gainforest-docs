"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EASE_OUT, NAV_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Sighting } from "@/lib/upstream/field-record";

const KINGDOM: Record<string, string> = { Plantae: "Plant", Animalia: "Animal", Fungi: "Fungus" };

function when(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * The best picture of each of the latest BioBlitz rounds, one large at a
 * time. The photo after the current one is already loading (an invisible
 * copy at the same size), so turning never waits on the network.
 * The wall turns on its own (a CSS timer bar whose end advances it, so it
 * pauses for free while pointed at or focused), and the round thumbnails
 * pick one directly. Under reduced motion it never turns by itself.
 *
 * A new photo settles from a slight zoom while the old one fades under it;
 * the caption rises in after. Both are interruptible: picking quickly just
 * retargets.
 */
export function FieldWall({ sightings }: { sightings: Sighting[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const current = sightings[index] ?? sightings[0];
  const next = sightings[(index + 1) % sightings.length];
  if (!current) return null;
  const advance = () => setIndex((i) => (i + 1) % sightings.length);

  return (
    <figure
      aria-label="BioBlitz best pictures"
      className="field-wall flex flex-col gap-2 rounded-3xl bg-card p-2"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: "scale(1.06)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <Image
              src={current.imageUrl}
              alt={`${current.commonName ?? current.scientificName}, photographed in the field`}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority={index === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {next && next.id !== current.id ? (
          <Image
            aria-hidden
            src={next.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="pointer-events-none object-cover opacity-0"
          />
        ) : null}
        <div aria-hidden className="field-scrim pointer-events-none absolute inset-x-0 bottom-0 h-2/5" />
        <figcaption aria-live="polite" className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              className="flex flex-col gap-1"
              initial={{ opacity: 0, transform: "translateY(6px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <span className="text-lg leading-tight font-semibold">{current.commonName ?? current.scientificName}</span>
              <span className="text-sm text-white/80">
                {current.commonName ? <i>{current.scientificName}</i> : null}
                {current.kingdom && KINGDOM[current.kingdom]
                  ? `${current.commonName ? " · " : ""}${KINGDOM[current.kingdom]}`
                  : null}
              </span>
              <span className="text-xs text-white/70">
                {[`${current.round} best picture`, current.by && `by ${current.by}`, when(current.date)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </motion.div>
          </AnimatePresence>
        </figcaption>
        {!reduced && sightings.length > 1 ? (
          <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-white/15">
            <span
              key={current.id}
              className={cn("field-timer block h-full bg-white/80", held && "is-paused")}
              onAnimationEnd={advance}
            />
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto p-2 [scrollbar-width:none]" role="group" aria-label="Choose a round">
        {sightings.map((s, i) => (
          <Button
            key={s.id}
            variant="ghost"
            size="icon"
            aria-label={`${s.round}: ${s.commonName ?? s.scientificName}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            data-pressable
            className={cn(
              "relative size-9 shrink-0 overflow-hidden p-0 pointer-coarse:size-11 opacity-60 transition-[opacity,transform] duration-200 hover:opacity-100",
              i === index && "opacity-100",
            )}
          >
            <Image src={s.imageUrl} alt="" fill sizes="36px" className="object-cover" />
            {i === index ? (
              <motion.span
                layoutId="field-ring"
                aria-hidden
                className="field-ring absolute inset-0 rounded-full"
                transition={NAV_SPRING}
              />
            ) : null}
          </Button>
        ))}
      </div>
    </figure>
  );
}

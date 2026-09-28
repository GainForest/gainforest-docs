"use client";

import { Globe2 } from "lucide-react";
import { motion, useMotionTemplate, useReducedMotion, useSpring } from "motion/react";

import { GlobeCanvas } from "@/components/interactive/globe-canvas";
import { useGlobeFocus } from "@/lib/stores/globe-focus";
import type { GlobeOrg } from "@/lib/upstream/globe";

/** Soft, slow follow: the glow trails the pointer rather than sticking to it. */
const FOLLOW = { stiffness: 70, damping: 18, mass: 0.6 };

/**
 * The live globe, large, with a halo that leans toward the pointer. The halo
 * is decoration, so it runs on a spring from pointer position (a raw mapping
 * would feel attached, not alive), only for a mouse, and not at all under
 * reduced motion. The globe itself
 * turns to whichever organization the roster strip below is pointing at.
 *
 * Three layers, each owning one transform so none fights another: the
 * entrance on the outermost, the scroll-away on the middle
 * (`.hero-scroll`, a scroll-driven animation), the halo's follow inside.
 */
export function HeroGlobe({ orgs }: { orgs: GlobeOrg[] | null }) {
  const focus = useGlobeFocus((s) => s.focus);
  const reduced = useReducedMotion() ?? false;
  const x = useSpring(0, FOLLOW);
  const y = useSpring(0, FOLLOW);
  // One transform string, not the x/y shorthands, so the halo is a single
  // composited layer being translated.
  const transform = useMotionTemplate`translate(${x}px, ${y}px)`;

  return (
    <div
      className="hero-in hero-in-globe relative mx-auto aspect-square w-full max-w-md lg:max-w-none"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.18);
        y.set((e.clientY - r.top - r.height / 2) * 0.18);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className="hero-scroll relative size-full">
        <motion.div aria-hidden style={{ transform }} className="pointer-events-none absolute inset-[6%]">
          <span className="hero-glow block size-full rounded-full" />
        </motion.div>
        {orgs && orgs.length > 0 ? (
          <GlobeCanvas orgs={orgs} altitude={2.3} focus={focus} className="aspect-square rounded-full" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Globe2 aria-hidden className="size-6" />
            The live globe is unavailable right now.
          </div>
        )}
      </div>
    </div>
  );
}

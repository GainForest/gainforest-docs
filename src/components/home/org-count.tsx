"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { EASE_OUT } from "@/lib/motion";

/**
 * The number of organizations on the Globe, counted up once as it comes into
 * view. The server renders the real figure, so without JS (or under reduced
 * motion) the number is simply correct; the count only ever ends on it. The
 * digits are tabular so the line does not jitter as they change.
 */
export function OrgCount({ count }: { count: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el || !seen || reduced) return;
    const controls = animate(0, count, {
      duration: 1.4,
      ease: EASE_OUT,
      delay: 0.6,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en");
      },
    });
    return () => controls.stop();
  }, [seen, reduced, count]);

  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative size-2 rounded-full bg-primary" />
      </span>
      <span>
        <span ref={ref} className="font-medium text-foreground tabular">
          {count.toLocaleString("en")}
        </span>{" "}
        organizations on the Globe
      </span>
    </span>
  );
}

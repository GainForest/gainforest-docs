"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { EASE_OUT } from "@/lib/motion";

/**
 * A real figure, counted up once as it comes into view. The server renders
 * the final number, so without JS (or under reduced motion) it is simply
 * correct; the count only ever ends on it. Digits are tabular so the line
 * does not jitter while they change.
 */
export function CountUp({ value, delay = 0 }: { value: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el || !seen || reduced) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_OUT,
      delay,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en");
      },
    });
    return () => controls.stop();
  }, [seen, reduced, value, delay]);

  return (
    <span ref={ref} className="tabular">
      {value.toLocaleString("en")}
    </span>
  );
}

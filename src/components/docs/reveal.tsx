"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Strong ease-out. Built-in curves are too weak to read as intentional. */
const EASE_OUT: readonly [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Mount-only entrance. Runs once on first paint, which users see rarely, so a
 * small amount of movement is earned. Stagger stays at 45ms: long enough to
 * cascade, short enough that nothing feels gated behind it.
 *
 * Uses the full `transform` string rather than Motion's `y` shorthand so the
 * animation stays off the main thread while the page is still hydrating.
 */
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: reduced ? "none" : "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{
        duration: 0.32,
        ease: EASE_OUT,
        delay: reduced ? 0 : index * 0.045,
      }}
    >
      {children}
    </motion.div>
  );
}

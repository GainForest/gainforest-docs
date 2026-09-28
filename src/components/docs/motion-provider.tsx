"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Motion honours `prefers-reduced-motion` everywhere, set once (AGENTS.md §7). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

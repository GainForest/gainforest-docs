"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { REVEAL, blurUp } from "@/lib/motion";

/**
 * A welcome-page section title and its one-line lead, rising into focus the
 * first time they scroll into view. The id makes the section linkable.
 */
export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <motion.div
      className="flex max-w-2xl flex-col gap-3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.h2
        id={id}
        variants={blurUp}
        transition={REVEAL}
        className="scroll-mt-20 text-3xl font-semibold tracking-tight text-balance md:text-4xl"
      >
        {title}
      </motion.h2>
      {children ? (
        <motion.p variants={blurUp} transition={REVEAL} className="text-lg text-pretty text-muted-foreground">
          {children}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

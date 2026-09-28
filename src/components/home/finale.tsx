"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { REVEAL, blurUp } from "@/lib/motion";

/**
 * The welcome page's last word: one clear next step, on a surface lit by a
 * slow aurora (three soft pools of the primary drifting on long loops,
 * `.aurora` in globals.css). It scales up into place the first time it is
 * seen; the aurora is still under reduced motion.
 */
export function Finale({
  id,
  title,
  href,
  action,
  children,
}: {
  id: string;
  title: string;
  href: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      aria-labelledby={id}
      className="relative isolate overflow-hidden rounded-xl bg-card px-6 py-12 md:px-12 md:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: { opacity: 0, transform: "scale(0.96)" },
        visible: { opacity: 1, transform: "scale(1)", transition: { ...REVEAL, staggerChildren: 0.08, delayChildren: 0.1 } },
      }}
    >
      <span aria-hidden className="aurora absolute inset-0 -z-10">
        <span />
        <span />
        <span />
      </span>
      <div className="flex max-w-xl flex-col items-start gap-4">
        <motion.h2 id={id} variants={blurUp} transition={REVEAL} className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {title}
        </motion.h2>
        <motion.div
          variants={blurUp}
          transition={REVEAL}
          className="flex flex-col gap-3 text-lg text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground"
        >
          {children}
        </motion.div>
        <motion.div variants={blurUp} transition={REVEAL} className="pt-2">
          <Button asChild size="lg">
            <Link href={href} className="lift" data-pressable>
              {action}
              <ArrowRight aria-hidden data-icon="inline-end" className="lift-arrow" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CHIP } from "@/lib/chip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EASE_OUT } from "@/lib/motion";

/**
 * Pick an amount and see what it is worth in the programs these docs
 * describe. Every comparison is a figure stated elsewhere in the docs (the
 * BioBlitz prizes, the Data Council stipend, the sample grant budget), not
 * an estimate. The donation itself happens on Donorbox or Giveth.
 */
const AMOUNTS: readonly { usd: number; worth: string }[] = [
  { usd: 10, worth: "one week's best BioBlitz picture prize" },
  { usd: 50, worth: "a Data Council member's stipend" },
  { usd: 90, worth: "about one AudioMoth recorder, from the sample grant budget" },
  { usd: 1000, worth: "a whole Rewilding the Web grant for one community" },
];

export function DonatePicker() {
  const [usd, setUsd] = useState("50");
  const pick = AMOUNTS.find((a) => String(a.usd) === usd) ?? AMOUNTS[1];

  return (
    <section aria-label="Choose a donation amount" className="not-prose my-6 flex flex-col gap-3 rounded-xl bg-card p-4">
      <span className="text-sm font-medium">Choose an amount</span>
      <ToggleGroup type="single" value={usd} onValueChange={(v) => v && setUsd(v)} className="flex flex-wrap justify-start gap-1" aria-label="Amount in USD">
        {AMOUNTS.map((a) => (
          <ToggleGroupItem key={a.usd} value={String(a.usd)} className={`${CHIP} px-4 tabular`}>
            USD {a.usd.toLocaleString("en")}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="relative min-h-12 rounded-lg bg-muted px-4 py-3" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={pick?.usd}
            initial={{ opacity: 0, transform: "translateY(6px)", filter: "blur(2px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
            exit={{ opacity: 0, transform: "translateY(-6px)", filter: "blur(2px)" }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="text-sm"
          >
            <span className="font-semibold tabular">USD {pick?.usd.toLocaleString("en")}</span> is {pick?.worth}.
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="lift">
          <a href="https://donorbox.org/gainforest" target="_blank" rel="noreferrer">
            Give by card on Donorbox <ArrowUpRight aria-hidden className="lift-arrow lift-arrow-out" data-icon="inline-end" />
          </a>
        </Button>
        <Button asChild variant="secondary" className="lift">
          <a href="https://giveth.io/project/gainforest" target="_blank" rel="noreferrer">
            Give crypto on Giveth <ArrowUpRight aria-hidden className="lift-arrow lift-arrow-out" data-icon="inline-end" />
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Enter your chosen amount on the donation page. Donorbox takes USD, EUR, and CHF.</p>
    </section>
  );
}

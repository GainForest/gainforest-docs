"use client";

import { ArrowRight, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A quick check against the Rewilding the Web grant conditions. Each
 * question is one eligibility or delivery condition, worded as on the
 * Grant Conditions page. It tells the reader what is missing, never that
 * they are rejected: the team reviews every application.
 */
type Id = "steward" | "wallet" | "audiomoth" | "months" | "public";

const QUESTIONS: readonly { id: Id; q: string; need: string }[] = [
  { id: "steward", q: "Are you a community, organization, or group actively working in conservation or environmental stewardship?", need: "Be a community, organization, or group working in conservation or stewardship." },
  { id: "wallet", q: "Do you have, or are you willing to set up, a crypto wallet to receive funds?", need: "Have or set up a crypto wallet. Rabby or MetaMask both work." },
  { id: "audiomoth", q: "Can you deploy AudioMoth sensors and manage the field recordings?", need: "Deploy AudioMoth sensors. Passive audio must be central to the Project." },
  { id: "months", q: "Can you complete the Project within 3 months?", need: "Complete the Project within 3 months." },
  { id: "public", q: "Are you able to make the data you collect public as updates on your Project page?", need: "Publish collected data as Project updates on Bumicerts." },
];

export function GrantCheck() {
  const [answers, setAnswers] = useState<Partial<Record<Id, boolean>>>({});
  const answered = QUESTIONS.filter((x) => answers[x.id] !== undefined).length;
  const missing = QUESTIONS.filter((x) => answers[x.id] === false);
  const done = answered === QUESTIONS.length;

  return (
    <section aria-label="Grant eligibility check" className="not-prose my-6 flex flex-col gap-2 rounded-xl bg-card p-2">
      <div className="flex items-center gap-2 px-2 pt-1">
        <span className="flex-1 text-sm font-medium">Am I ready to apply?</span>
        <span className="text-xs text-muted-foreground tabular">
          {answered} of {QUESTIONS.length}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-[var(--ease-out-strong)]"
          style={{ transform: `scaleX(${answered / QUESTIONS.length})` }}
        />
      </div>
      <ol className="flex flex-col gap-1">
        {QUESTIONS.map((x, i) => {
          const a = answers[x.id];
          return (
            <li key={x.id} className="flex flex-col gap-2 rounded-lg bg-muted p-3 sm:flex-row sm:items-center">
              <span className="flex-1 text-sm">
                <span className="me-2 text-muted-foreground tabular">{i + 1}.</span>
                {x.q}
              </span>
              <span className="flex shrink-0 gap-1" role="group" aria-label={`Answer question ${i + 1}`}>
                {[true, false].map((v) => (
                  <Button
                    key={String(v)}
                    size="sm"
                    variant={a === v ? "default" : "secondary"}
                    aria-pressed={a === v}
                    onClick={() => setAnswers((s) => ({ ...s, [x.id]: v }))}
                    className={cn(a === v && !v && "bg-status-warn text-card hover:bg-status-warn/90")}
                  >
                    {v ? <Check aria-hidden /> : <X aria-hidden />}
                    {v ? "Yes" : "Not yet"}
                  </Button>
                ))}
              </span>
            </li>
          );
        })}
      </ol>
      <AnimatePresence initial={false}>
        {done ? (
          <motion.div
            key={missing.length === 0 ? "ready" : "missing"}
            initial={{ opacity: 0, transform: "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className={cn("flex flex-col gap-2 rounded-lg p-4", missing.length ? "bg-status-warn-bg" : "bg-status-ok-bg")}
            aria-live="polite"
          >
            {missing.length === 0 ? (
              <>
                <p className="text-lg font-semibold tracking-tight">You meet every condition.</p>
                <p className="text-sm">Write your Project page, then submit the one-click application on the Grants page.</p>
                <Button asChild className="lift mt-1 self-start">
                  <a href="https://www.gainforest.app/en/grants" target="_blank" rel="noreferrer">
                    Apply for your Project <ArrowRight aria-hidden className="lift-arrow" data-icon="inline-end" />
                  </a>
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold tracking-tight">
                  {missing.length === 1 ? "One thing to sort out first" : `${missing.length} things to sort out first`}
                </p>
                <ul className="flex list-disc flex-col gap-1 ps-5 text-sm">
                  {missing.map((m) => (
                    <li key={m.id}>{m.need}</li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">Questions? Reach out to the GainForest team before you apply.</p>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

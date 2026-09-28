"use client";

import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocal } from "@/lib/stores/local";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * "Was this helpful?" at the foot of every page. A vote is one tap; a
 * thumbs-down opens a short box asking what was missing, because that is the
 * answer worth having. The vote is remembered in this browser so the reader
 * is not asked twice.
 */
export function Feedback({ page }: { page: string }) {
  const given = useLocal((s) => s.feedback[page]);
  const setGiven = useLocal((s) => s.setFeedback);
  const [pending, setPending] = useState<"down" | null>(null);
  const [comment, setComment] = useState("");
  const [thanked, setThanked] = useState(false);

  async function send(vote: "up" | "down", text?: string) {
    setGiven(page, vote);
    setPending(null);
    setThanked(true);
    await window
      .fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page, vote, comment: text || undefined }),
      })
      .catch(() => undefined);
  }

  return (
    <section aria-label="Page feedback" className="mx-auto mt-16 flex max-w-[72ch] flex-col gap-2 rounded-xl bg-card p-2">
      <AnimatePresence mode="wait" initial={false}>
        {given && !pending ? (
          <motion.p
            key="thanks"
            initial={{ opacity: 0, transform: "scale(0.96)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="flex items-center gap-2 px-3 py-2 text-sm"
            aria-live="polite"
          >
            <span className={cn("flex size-7 items-center justify-center rounded-full", given === "up" ? "bg-status-ok-bg text-status-ok" : "bg-muted")}>
              {given === "up" ? <ThumbsUp aria-hidden className="size-3.5" /> : <ThumbsDown aria-hidden className="size-3.5" />}
            </span>
            {thanked ? "Thank you. This helps us improve the docs." : "You rated this page. Thank you."}
          </motion.p>
        ) : (
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1">
              <span className="flex-1 text-sm font-medium">Was this page helpful?</span>
              <Button variant="ghost" size="sm" onClick={() => void send("up")} className="lift">
                <ThumbsUp aria-hidden className="lift-chip" /> Yes
              </Button>
              <Button
                variant={pending === "down" ? "secondary" : "ghost"}
                size="sm"
                aria-expanded={pending === "down"}
                onClick={() => setPending(pending ? null : "down")}
                className="lift"
              >
                <ThumbsDown aria-hidden className="lift-chip" /> No
              </Button>
            </div>
            <AnimatePresence initial={false}>
              {pending === "down" ? (
                <motion.form
                  key="why"
                  initial={{ opacity: 0, transform: "translateY(-4px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex flex-col gap-2 p-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send("down", comment.trim());
                  }}
                >
                  <Textarea
                    autoFocus
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What were you looking for, or what was unclear? (optional)"
                    aria-label="What was missing"
                    rows={3}
                  />
                  <Button type="submit" size="sm" className="self-end">
                    <Send aria-hidden /> Send
                  </Button>
                </motion.form>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

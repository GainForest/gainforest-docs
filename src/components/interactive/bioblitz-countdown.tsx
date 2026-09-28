"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { firstRound, roundAt, type Round } from "@/lib/bioblitz";

/**
 * How long the current BioBlitz round has left, from the same schedule
 * GainForest.app uses. Ticks every second; each digit rolls when it changes
 * (only that digit, so the eye is drawn to what moved). The bar is the share
 * of the week gone. Renders nothing until mounted: the server does not know
 * the reader's "now", and a wrong first frame is worse than a late one.
 */
function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function BioblitzCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  const live: Round | null = now === null ? null : roundAt(now);
  const upcoming = now !== null && !live ? firstRound() : null;
  const round = live ?? upcoming;
  const target = live ? live.endMs : (upcoming?.startMs ?? 0);
  const p = parts(now === null ? 0 : target - now);
  const share = live && now !== null ? (now - live.startMs) / (live.endMs - live.startMs) : 0;

  return (
    <section aria-label="BioBlitz round countdown" className="not-prose my-6 flex flex-col gap-3 rounded-xl bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">
          {round ? (live ? `Round ${round.id} ends in` : `Round ${round.id} starts in`) : "Loading the current round"}
        </span>
        {live ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-status-ok">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-status-ok opacity-60" />
              <span className="relative size-2 rounded-full bg-status-ok" />
            </span>
            Live now
          </span>
        ) : null}
      </div>
      <div className="flex gap-2" aria-hidden={now === null}>
        {(
          [
            ["days", p.d],
            ["hours", p.h],
            ["min", p.m],
            ["sec", p.s],
          ] satisfies [string, number][]
        ).map(([label, v]) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-muted py-3">
            <span className="flex text-3xl font-semibold tracking-tight tabular">
              {String(v)
                .padStart(2, "0")
                .split("")
                .map((ch, i) => (
                  <Digit key={i} ch={now === null ? "–" : ch} />
                ))}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      {live ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full origin-left rounded-full bg-primary transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${share})` }} />
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {round && round.id >= 15 ? "Rounds run Monday 00:00 to Sunday 23:59 UTC." : "From Round 15, rounds run Monday 00:00 to Sunday 23:59 UTC."}
        {live && now !== null ? ` The next round starts ${new Date(live.endMs + 1).toLocaleString(undefined, { weekday: "long", hour: "2-digit", minute: "2-digit" })} your time.` : ""}
      </p>
    </section>
  );
}

function Digit({ ch }: { ch: string }) {
  return (
    <span className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={ch}
          initial={{ opacity: 0, transform: "translateY(-100%)" }}
          animate={{ opacity: 1, transform: "translateY(0%)" }}
          exit={{ opacity: 0, transform: "translateY(100%)" }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

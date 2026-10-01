"use client";

import { useState } from "react";

import { CountUp } from "@/components/home/count-up";

const W = 1000;
const H = 120;

function day(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Every observation recorded on GainForest, added up day by day. The line
 * draws itself once on arrival (CSS, `.growth-line`); pointing along it
 * reads out the total on that day. Points are placed by date, not by index,
 * so a quiet month looks quiet.
 */
export function GrowthCurve({ growth, total }: { growth: { date: string; total: number }[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const first = growth[0];
  const last = growth[growth.length - 1];
  if (!first || !last || growth.length < 2) return null;

  const t0 = Date.parse(first.date);
  const span = Math.max(1, Date.parse(last.date) - t0);
  const max = Math.max(1, last.total);
  const pts = growth.map((p) => ({
    x: ((Date.parse(p.date) - t0) / span) * W,
    y: H - (p.total / max) * (H - 8) - 4,
    ...p,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const shown = hover === null ? null : pts[hover];

  return (
    <section
      aria-label="Observations recorded over time"
      className="grid grid-cols-1 items-end gap-4 rounded-3xl bg-card p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-5"
    >
      <div className="flex flex-col gap-1 sm:w-72" aria-live="polite">
        <span className="text-3xl font-semibold tracking-tight">
          {shown ? <span className="tabular">{shown.total.toLocaleString("en")}</span> : <CountUp value={total} delay={0.4} />}
        </span>
        <span className="text-sm text-muted-foreground">
          {shown ? `observations by ${day(shown.date)}` : `observations recorded since ${day(first.date)}`}
        </span>
      </div>
      <div
        className="relative h-28"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          let best = 0;
          pts.forEach((p, i) => {
            if (Math.abs(p.x - x) < Math.abs((pts[best]?.x ?? 0) - x)) best = i;
          });
          setHover(best);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden className="size-full overflow-visible">
          <defs>
            <linearGradient id="growth-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#growth-fill)" className="growth-area" />
          <path
            d={line}
            pathLength={1}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="growth-line"
          />
        </svg>
        {shown ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-foreground/30"
            style={{ left: `${(shown.x / W) * 100}%` }}
          >
            <span
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
              style={{ top: `${(shown.y / H) * 100}%`, left: "50%" }}
            />
          </span>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import {
  Award,
  Camera,
  Check,
  Eye,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Mic,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { styleVars } from "@/lib/css-vars";
import { DRAW, SCENE_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The picture beside "How Bumicerts works". One Project assembles itself as
 * the reader scrolls through the five steps: the page appears, evidence
 * arrives, lines link it in, updates tick along a timeline, and finally the
 * evidence settles into the Project and what it is used for fans out.
 *
 * Every piece is placed on a spring and keyed to `stage`, so scrolling back
 * up plays it in reverse from wherever it is, never from zero. Geometry is in
 * percent of a 4:3 frame whose SVG view box is also 4:3 (400 × 300), so the
 * link lines land on the tiles at any width without distortion. The frame is
 * `dir="ltr"`: it is a drawing, and its lines are drawn left to right.
 *
 * Decorative: hidden from assistive tech, because the steps beside it say
 * the same thing in words.
 */

type Tile = { icon: LucideIcon; label: string; top: string; y: number; wave?: boolean };

/** Where each evidence tile sits, and the y its link line leaves from. */
const TILES: Tile[] = [
  { icon: Camera, label: "Photo", top: "top-[10%]", y: 54 },
  { icon: Mic, label: "Audio", top: "top-[28%]", y: 108, wave: true },
  { icon: FileSpreadsheet, label: "Dataset", top: "top-[46%]", y: 162 },
];

/** Where each line lands on the Project card's edge. */
const CARD_Y = [84, 108, 132];
const TILE_X = 244;
const CARD_X = 200;

const USES: { icon: LucideIcon; label: string }[] = [
  { icon: FileText, label: "Reporting" },
  { icon: Eye, label: "Visibility" },
  { icon: Award, label: "Grants" },
  { icon: HandCoins, label: "Funding" },
];

function link(i: number): string {
  const tile = TILES[i]?.y ?? 0;
  const card = CARD_Y[i] ?? 0;
  const mid = (TILE_X + CARD_X) / 2;
  return `M ${TILE_X} ${tile} C ${mid} ${tile}, ${mid} ${card}, ${CARD_X} ${card}`;
}

/** How far a tile travels down to meet its line's end on the card, as a
 *  share of its own height (16% of the 300-unit frame, so 48 units). */
function absorbY(i: number): number {
  return (((CARD_Y[i] ?? 0) - (TILES[i]?.y ?? 0)) / 48) * 100;
}

export function JourneyScene({ stage }: { stage: number }) {
  const at = (n: number) => stage >= n;
  // At the last step the evidence has done its job: it folds into the
  // Project and the uses take its place.
  const settled = at(4);

  return (
    <div
      aria-hidden
      dir="ltr"
      className="scene relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-card"
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full">
        {TILES.map((tile, i) => (
          <g key={tile.label}>
            <motion.path
              d={link(i)}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity={0.5}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: at(2) && !settled ? 1 : 0, opacity: at(2) && !settled ? 1 : 0 }}
              transition={{ ...DRAW, delay: at(2) && !settled ? 0.1 + i * 0.12 : 0 }}
            />
            {/* A pulse travelling along the line, tile to Project. Its own
                dash pattern, so it is a plain path inside the fading group. */}
            <motion.g
              initial={false}
              animate={{ opacity: at(2) && !settled ? 1 : 0 }}
              transition={{ duration: 0.3, delay: at(2) && !settled ? 0.8 + i * 0.12 : 0 }}
            >
              <path
                d={link(i)}
                pathLength={1}
                className="scene-flow"
                fill="none"
                stroke="var(--primary)"
                strokeWidth={3}
                strokeLinecap="round"
                style={styleVars({ "--i": i })}
              />
            </motion.g>
          </g>
        ))}
      </svg>

      {/* The Project, and the light it gives off once it is in use */}
      <motion.span
        className="scene-halo pointer-events-none absolute start-[6%] top-[10%] h-[52%] w-[44%] rounded-lg"
        initial={false}
        animate={{ opacity: settled ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute start-[6%] top-[10%] flex h-[52%] w-[44%] flex-col gap-1.5 rounded-lg bg-muted p-2"
        initial={false}
        animate={
          stage < 0
            ? { opacity: 0, transform: "translateY(12px) scale(0.94)" }
            : { opacity: 1, transform: settled ? "translateY(0px) scale(1.03)" : "translateY(0px) scale(1)" }
        }
        transition={SCENE_SPRING}
      >
        <span className="relative flex min-h-0 flex-1 items-center justify-center rounded-sm bg-accent text-primary">
          <Sprout className="size-6 sm:size-8" />
          <motion.span
            className="absolute end-1.5 top-1.5 flex h-5 items-center gap-1 rounded-full bg-card px-2 text-xs font-medium text-status-ok"
            initial={false}
            animate={at(3) ? { opacity: 1, transform: "scale(1)" } : { opacity: 0, transform: "scale(0.9)" }}
            transition={SCENE_SPRING}
          >
            <span className="size-1.5 rounded-full bg-current" />
            Public
          </motion.span>
        </span>
        <span className="truncate px-0.5 text-xs font-medium sm:text-sm">Your Project</span>
        <span className="flex flex-col gap-1 px-0.5">
          {["w-[92%]", "w-[64%]"].map((w, i) => (
            <motion.span
              key={w}
              className={cn("h-1.5 origin-left rounded-full bg-foreground/10", w)}
              initial={false}
              animate={{ transform: stage < 0 ? "scaleX(0)" : "scaleX(1)" }}
              transition={{ ...DRAW, delay: stage < 0 ? 0 : 0.25 + i * 0.1 }}
            />
          ))}
        </span>
        <motion.span
          className="flex h-5 items-center gap-1 self-start rounded-full bg-status-ok-bg px-2 text-xs font-medium text-status-ok"
          initial={false}
          animate={at(2) ? { opacity: 1, transform: "translateY(0px)" } : { opacity: 0, transform: "translateY(4px)" }}
          transition={{ ...SCENE_SPRING, delay: at(2) ? 0.7 : 0 }}
        >
          <Check className="size-3" />3 linked
        </motion.span>
      </motion.div>

      {/* Evidence */}
      {TILES.map((tile, i) => (
        <motion.div
          key={tile.label}
          className={cn("absolute end-[5%] flex h-[16%] w-[34%] items-center gap-1.5 rounded-md bg-muted p-1.5", tile.top)}
          initial={false}
          animate={
            !at(1)
              ? { opacity: 0, transform: "translate(12%, 10%) scale(0.95)" }
              : settled
                ? { opacity: 0, transform: `translate(-120%, ${absorbY(i)}%) scale(0.6)` }
                : { opacity: 1, transform: "translate(0%, 0%) scale(1)" }
          }
          transition={{ ...SCENE_SPRING, delay: at(1) && !settled ? i * 0.08 : i * 0.04 }}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-primary sm:size-7">
            <tile.icon className="size-3.5" />
          </span>
          <span className="truncate text-xs font-medium">{tile.label}</span>
          {tile.wave ? (
            <span className={cn("wave ms-auto flex h-3 items-center gap-0.5 pe-1", at(1) && "is-on")}>
              {[0, 1, 2, 3, 4].map((b) => (
                <span key={b} className="h-full w-0.5 rounded-full bg-primary" />
              ))}
            </span>
          ) : null}
          <motion.span
            className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
            initial={false}
            animate={at(2) ? { opacity: 1, transform: "scale(1)" } : { opacity: 0, transform: "scale(0.6)" }}
            transition={{ ...SCENE_SPRING, delay: at(2) ? 0.5 + i * 0.12 : 0 }}
          >
            <Check className="size-2.5" strokeWidth={3} />
          </motion.span>
        </motion.div>
      ))}

      {/* Uses, where the evidence was */}
      <div className="absolute end-[5%] top-[10%] flex h-[52%] w-[34%] flex-col items-start justify-center gap-1.5 sm:gap-2">
        {USES.map((use, i) => (
          <motion.span
            key={use.label}
            className="flex h-6 max-w-full items-center gap-1.5 rounded-full bg-accent px-2.5 text-xs font-medium text-accent-foreground sm:h-8 sm:gap-2 sm:px-3 sm:text-sm"
            initial={false}
            animate={settled ? { opacity: 1, transform: "translateX(0px) scale(1)" } : { opacity: 0, transform: "translateX(-16px) scale(0.95)" }}
            transition={{ ...SCENE_SPRING, delay: settled ? 0.25 + i * 0.08 : 0 }}
          >
            <use.icon className="size-3 shrink-0 sm:size-3.5" />
            <span className="truncate">{use.label}</span>
          </motion.span>
        ))}
      </div>

      {/* Updates */}
      <motion.div
        className="absolute start-[6%] end-[5%] top-[72%] flex flex-col gap-2"
        initial={false}
        animate={{ opacity: at(3) ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xs text-muted-foreground">Updates</span>
        <span className="relative flex h-3 items-center justify-between">
          <span className="absolute inset-x-1 h-0.5 rounded-full bg-foreground/10" />
          <motion.span
            className="absolute inset-x-1 h-0.5 origin-left rounded-full bg-primary"
            initial={false}
            animate={{ transform: at(3) ? "scaleX(1)" : "scaleX(0)" }}
            transition={{ ...DRAW, duration: 0.9, delay: at(3) ? 0.1 : 0 }}
          />
          {[0, 1, 2, 3].map((d) => (
            <motion.span
              key={d}
              className="relative size-3 rounded-full bg-primary"
              initial={false}
              animate={at(3) ? { opacity: 1, transform: "scale(1)" } : { opacity: 0, transform: "scale(0.5)" }}
              transition={{ ...SCENE_SPRING, delay: at(3) ? 0.15 + d * 0.22 : 0 }}
            />
          ))}
        </span>
      </motion.div>
    </div>
  );
}

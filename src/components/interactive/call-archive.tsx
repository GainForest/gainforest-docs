"use client";

import { ChevronLeft, ChevronRight, Play, Search, VideoOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { z } from "zod";

import raw from "../../../content/data/community-calls.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CHIP } from "@/lib/chip";
import { EASE_OUT } from "@/lib/motion";
import { parseVideo } from "@/lib/video";

/**
 * The community calls, as an archive rather than a column of 22 videos.
 *
 * The data is `content/data/community-calls.json`, parsed here so a broken
 * edit fails loudly. Every filter lives in the URL (nuqs): a link to
 * `?topic=bioacoustics` or `?call=2025-01` shows exactly that, and the back
 * button closes the player.
 */
const CallSchema = z.object({
  id: z.string(),
  date: z.string(),
  label: z.string(),
  title: z.string(),
  video: z.string().nullable(),
  summary: z.string(),
  topics: z.array(z.string()),
});
const CALLS = z.array(CallSchema).parse(raw);
type Call = z.infer<typeof CallSchema>;

const TOPIC_LABEL: Record<string, string> = {
  platform: "Bumicerts",
  mrv: "MRV",
  trees: "Tree data",
  bioacoustics: "Bioacoustics",
  restoration: "Restoration",
  web3: "Web3",
  ai: "AI",
  drones: "Drones",
  funding: "Funding",
};
const TOPICS = Object.keys(TOPIC_LABEL).filter((t) => CALLS.some((c) => c.topics.includes(t)));
const YEARS = [...new Set(CALLS.map((c) => c.date.slice(0, 4)))].filter(Boolean);

export function CallArchive() {
  const [topic, setTopic] = useQueryState("topic", parseAsString.withDefault(""));
  const [year, setYear] = useQueryState("year", parseAsString.withDefault(""));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions({ throttleMs: 200 }));
  const [open, setOpen] = useQueryState("call", parseAsString.withDefault("").withOptions({ history: "push", scroll: false }));

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CALLS.filter(
      (c) =>
        (!topic || c.topics.includes(topic)) &&
        (!year || c.date.startsWith(year)) &&
        (!needle || `${c.title} ${c.summary}`.toLowerCase().includes(needle)),
    );
  }, [topic, year, q]);

  const index = shown.findIndex((c) => c.id === open);
  const current = CALLS.find((c) => c.id === open) ?? null;

  return (
    <div className="not-prose my-8 flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-3">
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => void setQ(e.target.value || null)}
            placeholder="Search calls, speakers, places"
            aria-label="Search community calls"
            className="ps-9"
          />
        </div>
        <ToggleGroup
          type="single"
          value={topic}
          onValueChange={(v) => void setTopic(v || null)}
          aria-label="Filter by topic"
          className="flex flex-wrap justify-start gap-1"
        >
          {TOPICS.map((t) => (
            <ToggleGroupItem key={t} value={t} size="sm" className={CHIP}>
              {TOPIC_LABEL[t]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          type="single"
          value={year}
          onValueChange={(v) => void setYear(v || null)}
          aria-label="Filter by year"
          className="flex flex-wrap justify-start gap-1"
        >
          {YEARS.map((y) => (
            <ToggleGroupItem key={y} value={y} size="sm" className={`${CHIP} tabular`}>
              {y}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="px-1 text-sm text-muted-foreground tabular" aria-live="polite">
        {shown.length === CALLS.length ? `${CALLS.length} calls` : `${shown.length} of ${CALLS.length} calls`}
      </p>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No call matches those filters.</p>
          <Button
            variant="secondary"
            onClick={() => {
              void setTopic(null);
              void setYear(null);
              void setQ(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.ul layout className="grid gap-2 sm:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((call) => (
              <motion.li
                key={call.id}
                layout
                initial={{ opacity: 0, transform: "scale(0.96)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.96)" }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <CallCard call={call} onOpen={() => void setOpen(call.id)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Dialog open={current !== null} onOpenChange={(o) => (o ? null : void setOpen(null))}>
        <DialogContent className="max-w-3xl gap-3 p-3 sm:max-w-3xl">
          {current ? (
            <Player
              call={current}
              prev={index > 0 ? shown[index - 1] : undefined}
              next={index >= 0 && index < shown.length - 1 ? shown[index + 1] : undefined}
              go={(id) => void setOpen(id, { history: "replace" })}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CallCard({ call, onOpen }: { call: Call; onOpen: () => void }) {
  const video = parseVideo(call.video);
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      disabled={!video}
      className="lift group h-auto w-full flex-col items-stretch gap-0 overflow-hidden rounded-xl bg-card p-0 text-start whitespace-normal hover:bg-accent disabled:opacity-100"
    >
      <span className="relative block aspect-video overflow-hidden bg-muted">
        {video?.thumb ? (
          <Image
            src={video.thumb}
            alt=""
            fill
            sizes="(min-width: 640px) 360px, 100vw"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_60%)]" />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="lift-chip flex size-11 items-center justify-center rounded-full bg-card/90 text-primary backdrop-blur">
            {video ? <Play aria-hidden className="size-4 translate-x-px fill-current" /> : <VideoOff aria-hidden className="size-4" />}
          </span>
        </span>
        <span className="absolute start-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur tabular">
          {call.label}
        </span>
      </span>
      <span className="flex flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-medium text-foreground">{call.title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {video ? call.summary : "Not recorded. The speaker did not give permission to publish."}
        </span>
      </span>
    </Button>
  );
}

function Player({ call, prev, next, go }: { call: Call; prev?: Call; next?: Call; go: (id: string) => void }) {
  const video = parseVideo(call.video);
  return (
    <>
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        {video ? (
          <iframe
            key={video.embed}
            src={`${video.embed}${video.provider === "youtube" ? "?autoplay=1" : ""}`}
            title={call.title}
            allow="autoplay; fullscreen; picture-in-picture"
            className="size-full"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-2">
        <span className="text-xs text-muted-foreground tabular">{call.label}</span>
        <DialogTitle className="text-lg font-semibold tracking-tight">{call.title}</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{call.summary}</DialogDescription>
      </div>
      <div className="flex items-center justify-between gap-1 px-1 pb-1">
        <Button variant="ghost" size="sm" disabled={!prev} onClick={() => prev && go(prev.id)}>
          <ChevronLeft aria-hidden /> Newer
        </Button>
        <Button variant="ghost" size="sm" disabled={!next} onClick={() => next && go(next.id)}>
          Older <ChevronRight aria-hidden />
        </Button>
      </div>
    </>
  );
}

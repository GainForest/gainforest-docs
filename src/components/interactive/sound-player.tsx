"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Recording } from "@/lib/upstream/recordings";

type Rec = Recording & { by: string | null };

/**
 * Play a real field recording over its spectrogram. The playhead is moved
 * with a transform written directly to the element each frame (never through
 * React state or a CSS variable on a parent), so it stays smooth while the
 * audio decodes. Clicking the spectrogram seeks. The spectrogram is how
 * bioacousticians read sound: time left to right, pitch bottom to top.
 */
export function SoundPlayer({ recordings }: { recordings: Rec[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rec = recordings[i] ?? recordings[0];

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const a = audio.current;
      const h = head.current;
      const t = track.current;
      if (a && h && t && a.duration) h.style.transform = `translateX(${(a.currentTime / a.duration) * t.clientWidth}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!rec) return null;
  const when = rec.recordedAt
    ? new Date(rec.recordedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })
    : null;

  function toggle() {
    const a = audio.current;
    if (!a) return;
    // A browser may refuse to start audio; the button simply stays on Play.
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  }

  function go(d: number) {
    setPlaying(false);
    setI((x) => (x + d + recordings.length) % recordings.length);
  }

  return (
    <figure className="not-prose my-6 flex flex-col gap-2 rounded-xl bg-card p-2">
      {/* A field soundscape has no speech to caption; the spectrogram is its visual form. */}
      <audio
        ref={audio}
        key={rec.audioUrl}
        src={rec.audioUrl}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div
        ref={track}
        className="relative aspect-[3/1] cursor-pointer overflow-hidden rounded-lg bg-muted"
        onPointerDown={(e) => {
          const a = audio.current;
          const r = e.currentTarget.getBoundingClientRect();
          if (!a) return;
          const seek = () => {
            if (a.duration) a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
          };
          if (a.readyState < 1) {
            a.addEventListener("loadedmetadata", seek, { once: true });
            a.play().catch(() => setPlaying(false));
          } else seek();
        }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote PDS blob, not an optimisable asset */}
        <img
          key={rec.spectrogramUrl}
          src={rec.spectrogramUrl}
          alt=""
          className="size-full object-cover opacity-0 transition-opacity duration-500 [&.loaded]:opacity-100"
          onLoad={(e) => e.currentTarget.classList.add("loaded")}
        />
        <span ref={head} className="absolute inset-y-0 start-0 w-0.5 bg-primary" />
      </div>
      <div className="flex items-center gap-2 px-2">
        <Button size="icon" onClick={toggle} aria-label={playing ? "Pause recording" : "Play recording"} className="size-10">
          <span className="swap">
            <Play aria-hidden className="translate-x-px fill-current" data-shown={!playing} />
            <Pause aria-hidden className="fill-current" data-shown={playing} />
          </span>
        </Button>
        <figcaption className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{rec.by ?? "A GainForest steward"}</span>
          <span className="truncate text-xs text-muted-foreground tabular">
            AudioMoth recording{when ? `, ${when} UTC` : ""}
            {rec.sampleRate ? `, ${Math.round(rec.sampleRate / 1000)} kHz` : ""}
          </span>
        </figcaption>
        {recordings.length > 1 ? (
          <span className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={() => go(-1)} aria-label="Previous recording">
              <ChevronLeft aria-hidden />
            </Button>
            <span className="w-12 text-center text-xs text-muted-foreground tabular">
              {i + 1} / {recordings.length}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={() => go(1)} aria-label="Next recording">
              <ChevronRight aria-hidden />
            </Button>
          </span>
        ) : null}
      </div>
    </figure>
  );
}

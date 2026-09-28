import { ArrowUpRight, Globe } from "lucide-react";
import type { ReactNode } from "react";

import { parseVideo } from "@/lib/video";

/**
 * GitBook's embed. Video providers become a lazy iframe in a 16:9 well; every
 * other URL becomes a link card, because a third-party page framed inside the
 * docs is slow, often blocked by the provider, and never styled to match.
 */
function videoSrc(raw: string): string | null {
  return parseVideo(raw)?.embed ?? null;
}

export function Embed({ url, children }: { url: string; children?: ReactNode }) {
  const video = videoSrc(url);
  const host = URL.parse(url)?.hostname.replace(/^www\./, "") ?? url;
  return (
    <figure className="my-6 flex flex-col gap-2">
      {video ? (
        <div className="shimmer not-prose aspect-video rounded-xl bg-card">
          <iframe
            src={video}
            title={`Video from ${host}`}
            loading="lazy"
            allow="fullscreen; picture-in-picture"
            className="relative size-full"
          />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="lift not-prose group flex items-center gap-2 rounded-xl bg-card p-2 pe-4 hover:bg-accent"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary lift-chip">
            <Globe aria-hidden className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{host}</span>
            <span className="truncate text-xs text-muted-foreground">{url}</span>
          </span>
          <ArrowUpRight aria-hidden className="lift-arrow lift-arrow-out size-4 shrink-0 text-muted-foreground" />
        </a>
      )}
      {children ? <figcaption className="prose-caption">{children}</figcaption> : null}
    </figure>
  );
}

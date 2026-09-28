"use client";

import { Check, Copy, SquarePen } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Copy the page as markdown (for pasting into an assistant) and edit it on
 * GitHub. `copied` is genuinely local and ephemeral, so it is `useState`.
 */
export function PageActions({ markdownUrl, editUrl }: { markdownUrl: string; editUrl: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only" aria-live="polite">
        {copied ? "Page copied as markdown" : ""}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          const res = await window.fetch(markdownUrl);
          await navigator.clipboard.writeText(await res.text());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {/* Both glyphs stay mounted and crossfade, so the confirmation reads
            as the icon turning into a tick rather than being replaced. */}
        <span className="swap">
          <Copy aria-hidden data-shown={!copied} />
          <Check aria-hidden data-shown={copied} className="text-primary" />
        </span>
        <span className="swap">
          <span data-shown={!copied} aria-hidden={copied}>
            Copy page
          </span>
          <span data-shown={copied} aria-hidden={!copied}>
            Copied
          </span>
        </span>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={editUrl} target="_blank" rel="noreferrer">
          <SquarePen aria-hidden />
          Edit
        </a>
      </Button>
    </div>
  );
}

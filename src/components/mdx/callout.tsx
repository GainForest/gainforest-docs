import { CircleCheck, Info, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { createElement, type ReactNode } from "react";

import { iconFor } from "@/components/mdx/icon";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, { icon: LucideIcon; label: string; mark: string }> = {
  info: { icon: Info, label: "Note", mark: "text-muted-foreground" },
  success: { icon: CircleCheck, label: "Tip", mark: "text-status-ok" },
  warning: { icon: TriangleAlert, label: "Important", mark: "text-status-warn" },
  danger: { icon: OctagonAlert, label: "Warning", mark: "text-status-bad" },
};

function isTone(v: string): v is Tone {
  return v in TONES;
}

/**
 * GitBook's hint. A box, not a pill: hints run to several sentences and lists,
 * so they take a radius from the scale (design.md §3).
 *
 * Every tone sits on the same neutral L2 surface, so a page with several
 * hints does not turn into a patchwork. The tone is carried by the icon, in
 * the status colour, and by a visually hidden word, so meaning never rests on
 * colour alone (AGENTS.md §8).
 */
export function Callout({
  type = "info",
  icon,
  children,
}: {
  type?: string;
  icon?: string;
  children: ReactNode;
}) {
  const key = isTone(type) ? type : "info";
  const tone = TONES[key];
  return (
    <div role="note" className="my-6 flex gap-3 rounded-md bg-card p-4">
      <span className="sr-only">{tone.label}: </span>
      {/* One line box tall, so the icon centres on the first line of text. */}
      <span aria-hidden className="flex h-lh shrink-0 items-center">
        {createElement(icon ? iconFor(icon) : tone.icon, {
          "aria-hidden": true,
          className: cn("size-4", tone.mark),
        })}
      </span>
      <div className="prose-callout min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

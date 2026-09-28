import { CircleCheck, Info, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import { createElement, type ReactNode } from "react";

import { iconFor } from "@/components/mdx/icon";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, { icon: LucideIcon; label: string; surface: string; mark: string }> = {
  info: { icon: Info, label: "Note", surface: "bg-card", mark: "text-muted-foreground" },
  success: { icon: CircleCheck, label: "Tip", surface: "bg-status-ok-bg", mark: "text-status-ok" },
  warning: { icon: TriangleAlert, label: "Important", surface: "bg-status-warn-bg", mark: "text-status-warn" },
  danger: { icon: OctagonAlert, label: "Warning", surface: "bg-status-bad-bg", mark: "text-status-bad" },
};

function isTone(v: string): v is Tone {
  return v in TONES;
}

/**
 * GitBook's hint. A box, not a pill: hints run to several sentences and lists,
 * so they take a radius from the scale (design.md §3). Meaning is carried by
 * the icon and a visually hidden word as well as the tint (AGENTS.md §8).
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
  const tone = TONES[isTone(type) ? type : "info"];
  return (
    <div role="note" className={cn("my-6 flex gap-3 rounded-md p-4", tone.surface)}>
      {createElement(icon ? iconFor(icon) : tone.icon, {
        "aria-hidden": true,
        className: cn("mt-1 size-4 shrink-0", tone.mark),
      })}
      <div className="prose-callout min-w-0 flex-1">
        <span className="sr-only">{tone.label}: </span>
        {children}
      </div>
    </div>
  );
}

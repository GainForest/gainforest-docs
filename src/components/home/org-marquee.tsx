"use client";

import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { styleVars } from "@/lib/css-vars";
import { useGlobeFocus } from "@/lib/stores/globe-focus";
import type { GlobeOrg } from "@/lib/upstream/globe";
import { cn } from "@/lib/utils";

/**
 * Real organizations on GainForest, drifting past in a strip under the hero.
 * Pointing at one (hover, focus, or a tap) turns the globe to it and pins its
 * name there; leaving the strip lets the globe turn on its own again.
 *
 * The strip is two identical rows translated by half their width, which loops
 * without a seam. The second row is `inert` and hidden from assistive tech,
 * so every name is reachable exactly once by keyboard. Hover or focus pauses
 * it; reduced motion stops it and lets it scroll by hand (globals.css).
 * Constant motion, so linear, and slow enough to read.
 */
export function OrgMarquee({ orgs }: { orgs: GlobeOrg[] }) {
  const focus = useGlobeFocus((s) => s.focus);
  const setFocus = useGlobeFocus((s) => s.setFocus);

  const row = (copy: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-1 pe-1"
      {...(copy ? { inert: true, "aria-hidden": true } : {})}
    >
      {orgs.map((org) => (
        <li key={org.did}>
          <Button
            variant="ghost"
            size="sm"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setFocus(org);
            }}
            onFocus={() => setFocus(org)}
            onClick={() => setFocus(org)}
            aria-pressed={focus?.did === org.did}
            className={cn(
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              focus?.did === org.did && "bg-accent text-accent-foreground",
            )}
          >
            {org.name}
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="region"
        aria-label="Organizations on the Globe"
        className="marquee w-full rounded-full bg-card p-1"
        onPointerLeave={() => setFocus(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocus(null);
        }}
      >
        <div className="marquee-track flex w-max" style={styleVars({ "--marquee-duration": `${orgs.length * 3}s` })}>
          {row(false)}
          {row(true)}
        </div>
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin aria-hidden className="size-3" />
        Point at a name to find it on the globe.
      </p>
    </div>
  );
}

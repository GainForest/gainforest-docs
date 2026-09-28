import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A link that leaves this app.
 *
 * Admin panels govern records that live somewhere else: on the public site, on
 * a block explorer, in a chat runtime. Every one of those links wants the same
 * three things, and each place that hand-rolled it got a different subset
 * right: `rel="noreferrer"` so the destination is not told where the operator
 * came from, an icon so the reader knows the click leaves, and a name that
 * survives the icon being decorative.
 *
 * `target="_blank"` is deliberate rather than habitual. An admin checking
 * whether a hidden record deserved hiding is mid-task; sending them away and
 * making them find their place again on the back button is the wrong trade.
 */
export function OutboundLink({
  href,
  children,
  className,
}: {
  href: string;
  /** The link's own words. An icon-only outbound link has no accessible name. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:text-foreground inline-flex items-center gap-1 text-xs transition-colors",
        className,
      )}
    >
      {children}
      <ExternalLink aria-hidden className="size-3.5 shrink-0" />
    </a>
  );
}

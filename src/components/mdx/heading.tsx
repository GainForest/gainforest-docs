"use client";

import { Link2 } from "lucide-react";
import type { ComponentProps } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * h2 to h4 with a copy-link button that appears on hover or focus. Copying
 * gives the full URL to this section, the thing support staff paste into
 * Telegram; the toast confirms without moving anything on the page.
 */
function make(Tag: "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props} className="group/heading relative">
        {children}
        {id ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Copy a link to this section"
            className="ms-2 inline-flex align-middle opacity-0 transition-opacity duration-150 group-hover/heading:opacity-100 focus-visible:opacity-100 max-sm:hidden"
            onClick={async () => {
              const url = `${window.location.origin}${window.location.pathname}#${id}`;
              await navigator.clipboard.writeText(url);
              history.replaceState(null, "", `#${id}`);
              toast.success("Link copied", { description: "Paste it anywhere to share this section." });
            }}
          >
            <Link2 aria-hidden />
          </Button>
        ) : null}
      </Tag>
    );
  };
}

export const H2 = make("h2");
export const H3 = make("h3");
export const H4 = make("h4");

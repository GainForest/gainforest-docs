"use client";

import { AnchorProvider, TOCItem, useActiveAnchor, type TOCItemType } from "fumadocs-core/toc";
import { motion } from "motion/react";

import { NAV_SPRING } from "@/lib/motion";

/**
 * "On this page". Shown only at `xl`, where there is a third column to spare;
 * below that the article takes the width and the outline would crowd it.
 *
 * A thumb on a thin rail follows the heading being read. It moves with the
 * same spring as the sidebar pill, so the two trackers of "where am I" speak
 * the same language, and it is interruptible while the reader scrolls fast.
 * The active item is marked by colour and weight as well as the thumb.
 */
export function Toc({ items }: { items: TOCItemType[] }) {
  if (items.length < 2) return null;
  return (
    <AnchorProvider toc={items} single>
      <nav aria-label="On this page" className="toc-enter flex flex-col gap-2">
        <h2 className="text-sm font-medium">On this page</h2>
        <TocList items={items} />
      </nav>
    </AnchorProvider>
  );
}

function TocList({ items }: { items: TOCItemType[] }) {
  const active = useActiveAnchor();

  return (
    <div className="relative flex flex-col">
      <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 rounded-full bg-foreground/10" />
      {items.map((item) => {
        const isActive = item.url === `#${active ?? ""}`;
        return (
          <TOCItem
            key={item.url}
            href={item.url}
            className="relative rounded-sm py-1 ps-4 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-primary"
            style={{ paddingInlineStart: `${16 + (item.depth - 2) * 12}px` }}
          >
            {isActive ? (
              <motion.span
                aria-hidden
                layoutId="toc-thumb"
                transition={NAV_SPRING}
                className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            {item.title}
          </TOCItem>
        );
      })}
    </div>
  );
}

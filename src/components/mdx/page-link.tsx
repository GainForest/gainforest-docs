import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { DocIcon } from "@/components/mdx/icon";
import { source } from "@/lib/source";

/**
 * GitBook's content-ref: a link that names its destination with the target
 * page's own title and description, read from the source, so the card cannot
 * drift from the page it points at.
 */
export function PageLink({ href }: { href: string }) {
  const slugs = href.replace(/^\/|#.*$/g, "").split("/").filter(Boolean);
  const page = source.getPage(slugs);
  const title = page?.data.title ?? href;
  return (
    <Link
      href={href}
      className="lift not-prose group my-3 flex items-center gap-2 rounded-xl bg-card p-2 pe-4 hover:bg-accent"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary lift-chip">
        <DocIcon name={page?.data.icon ?? ""} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{title}</span>
        {page?.data.description ? (
          <span className="truncate text-xs text-muted-foreground">{page.data.description}</span>
        ) : null}
      </span>
      <ArrowRight
        aria-hidden
        className="lift-arrow size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}

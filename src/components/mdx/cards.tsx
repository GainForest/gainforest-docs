import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { DocIcon } from "@/components/mdx/icon";

/**
 * A grid of destinations. The article is L1, so each card is an L2 surface
 * with its icon chip recessed back to L1, and hover tints toward the accent.
 */
export function Cards({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 grid gap-2 sm:grid-cols-2">
      {children}
    </div>
  );
}

export function Card({
  title,
  href,
  icon,
  image,
  children,
}: {
  title: string;
  href?: string;
  icon?: string;
  image?: string;
  children?: ReactNode;
}) {
  const external = href?.startsWith("http") ?? false;
  const body = (
    <>
      {image ? (
        <Image
          src={image}
          alt=""
          width={800}
          height={450}
          sizes="(min-width: 640px) 360px, 100vw"
          className="aspect-video w-full rounded-lg bg-muted object-cover"
        />
      ) : null}
      <div className="flex items-center gap-2">
        {image ? null : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary lift-chip">
            <DocIcon name={icon ?? ""} />
          </span>
        )}
        <span className="text-sm font-medium text-foreground">{title}</span>
        {external ? <ArrowUpRight aria-hidden className="lift-arrow lift-arrow-out ms-auto size-4 text-muted-foreground" /> : null}
      </div>
      {children ? <p className="text-sm text-muted-foreground">{children}</p> : null}
    </>
  );
  const cls =
    "lift group flex flex-col gap-3 rounded-xl bg-card p-4 hover:bg-accent";
  if (!href) return <div className={cls}>{body}</div>;
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}

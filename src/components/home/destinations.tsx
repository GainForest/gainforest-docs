"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { SectionHeading } from "@/components/home/section-heading";
import { DocIcon } from "@/components/mdx/icon";
import { REVEAL, blurUp, staggerVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * "What do you want to do?": the welcome page's map of the site, as a bento
 * of destinations. The cards arrive in a cascade the first time the grid
 * scrolls into view, and a soft light follows the pointer across the whole
 * grid, so the cards near the one you are on catch a little of it too.
 *
 * The light is luminance, like every other edge in the system: a radial
 * step of the primary behind each card's content, positioned by custom
 * properties written straight to the elements (no React state per frame).
 * Mouse only; touch has no hover to follow.
 */
export function Destinations({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const grid = useRef<HTMLDivElement>(null);

  function follow(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !grid.current) return;
    for (const el of grid.current.querySelectorAll<HTMLElement>("[data-spot]")) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
    }
  }

  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <SectionHeading id={id} title={title}>
        {description}
      </SectionHeading>
      <motion.div
        ref={grid}
        onPointerMove={follow}
        className="spot-grid grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        variants={staggerVariants(0.05)}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function Destination({
  title,
  href,
  icon,
  featured = false,
  children,
}: {
  title: string;
  href: string;
  icon: string;
  /** Takes two columns, with the icon drawn large behind it. */
  featured?: boolean;
  children?: ReactNode;
}) {
  return (
    <motion.div variants={blurUp} transition={REVEAL} className={cn(featured && "sm:col-span-2")}>
      <Link
        href={href}
        data-spot
        className={cn(
          "spot lift group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl bg-card p-5 hover:bg-accent",
          featured && "lg:min-h-48 lg:justify-between",
        )}
      >
        {featured ? (
          <span aria-hidden className="spot-art absolute -end-6 -bottom-10 text-primary">
            <DocIcon name={icon} className="size-44 opacity-10" />
          </span>
        ) : null}
        <span className="flex items-center gap-3">
          <span className="lift-chip flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
            <DocIcon name={icon} className="size-5" />
          </span>
          <ArrowRight aria-hidden className="lift-arrow ms-auto size-4 text-muted-foreground" />
        </span>
        <span className="relative flex flex-col gap-1">
          <span className={cn("font-medium text-foreground", featured ? "text-xl tracking-tight" : "text-base")}>{title}</span>
          {children ? (
            <span className={cn("text-sm text-pretty text-muted-foreground", featured && "max-w-md")}>{children}</span>
          ) : null}
        </span>
      </Link>
    </motion.div>
  );
}

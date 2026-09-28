"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * The page's arrival, and what happens as it is read.
 *
 * 1. The panel (`#main`) is the scroll container, not the window, so the
 *    router's scroll restoration never reaches it. A new page starts at the
 *    top, instantly (a smooth scroll here would be motion nobody asked for),
 *    unless the URL names a heading, which is then brought into view.
 * 2. Blocks of the article that start below the fold are marked `pending`
 *    and revealed once, the first time they come into view. Blocks already on
 *    screen are left alone: they have the CSS entrance cascade. With no JS
 *    nothing is marked, so nothing is ever hidden. Reduced motion skips it.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = document.getElementById("main");
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? document.getElementById(hash) : null;
    if (main) {
      if (target) target.scrollIntoView({ block: "start" });
      else main.scrollTo({ top: 0, behavior: "instant" });
    }

    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fold = window.innerHeight;
    // Plain prose only. Interactive blocks (`.not-prose`) may still be
    // hydrating inside a Suspense boundary, and touching their attributes
    // before React does is a hydration mismatch; they have their own entrances.
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(".prose > :not(.not-prose)")).filter(
      (el) => el.getBoundingClientRect().top > fold,
    );
    for (const el of blocks) el.dataset.reveal = "pending";

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
          entry.target.dataset.reveal = "shown";
          io.unobserve(entry.target);
        }
      },
      { root: main, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of blocks) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}

"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GitBook's stepper, made to follow the reader. As the page scrolls, steps
 * that have been passed turn "done" and the rail between them fills; the
 * step in the reading band is "current". Longer runs (five or more) get a
 * row of numbered pills to jump straight to a step, with "Step n of N".
 * Numbers are CSS counters, so reordering the MDX leaves nothing stale.
 */
export function Steps({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);
  const total = Children.toArray(children).length;

  useEffect(() => {
    const list = ref.current;
    const main = document.getElementById("main");
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLLIElement>(":scope > li"));
    const update = () => {
      const band = window.innerHeight * 0.45;
      let idx = 0;
      items.forEach((li, i) => {
        if (li.getBoundingClientRect().top < band) idx = i;
      });
      items.forEach((li, i) => {
        li.dataset.state = i < idx ? "done" : i === idx ? "current" : "upcoming";
      });
      setCurrent(idx);
    };
    update();
    const target: HTMLElement | Window = main ?? window;
    target.addEventListener("scroll", update, { passive: true });
    return () => target.removeEventListener("scroll", update);
  }, []);

  function jump(i: number) {
    const li = ref.current?.querySelectorAll<HTMLLIElement>(":scope > li")[i];
    li?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <div className="my-6 flex flex-col gap-4">
      {total >= 5 ? (
        <div className="not-prose sticky top-16 z-10 flex items-center gap-1 self-start rounded-full bg-card/85 p-1 pe-3 backdrop-blur-md">
          <span className="flex gap-0.5">
            {Array.from({ length: total }, (_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="icon-xs"
                aria-label={`Go to step ${i + 1}`}
                aria-current={i === current ? "step" : undefined}
                onClick={() => jump(i)}
                className={cn(
                  "text-xs tabular transition-colors duration-150",
                  i === current && "bg-primary text-primary-foreground hover:bg-primary",
                  i < current && "text-primary",
                )}
              >
                {i + 1}
              </Button>
            ))}
          </span>
          <span className="text-xs text-muted-foreground tabular" aria-live="polite">
            Step {current + 1} of {total}
          </span>
        </div>
      ) : null}
      <ol ref={ref} className="steps flex flex-col gap-6 ps-0">
        {children}
      </ol>
    </div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return <li className="step relative list-none ps-12">{children}</li>;
}

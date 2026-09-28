"use client";

import { useInView } from "motion/react";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";

import { JourneyScene } from "@/components/home/journey-scene";
import { SectionHeading } from "@/components/home/section-heading";
import { cn } from "@/lib/utils";

/**
 * "How Bumicerts works" as a scroll story. The steps are ordinary text in a
 * column; beside them (above them, on a phone) the scene stays pinned and
 * builds the Project one step at a time. The step crossing the middle of the
 * panel is the current one: an IntersectionObserver with a thin band at the
 * centre, on the panel's own scroll, so nothing runs per scroll frame.
 *
 * The scene waits until it is half in view before it starts, so its first
 * build is seen rather than finished off screen.
 */
export function Journey({
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
  const steps = Children.toArray(children);
  const list = useRef<HTMLOListElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const seen = useInView(frame, { once: true, amount: 0.5 });
  const [active, setActive] = useState(0);
  const stage = seen ? active : -1;

  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLLIElement>(":scope > li");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number(entry.target.getAttribute("data-step"));
          if (Number.isInteger(i)) setActive(i);
        }
      },
      { root: document.getElementById("main"), rootMargin: "-45% 0px -45% 0px" },
    );
    for (const li of items) io.observe(li);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <SectionHeading id={id} title={title}>
        {description}
      </SectionHeading>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        {/* Pinned under the header; from lg it is centred in the visible
            panel, level with the band that picks the current step. */}
        <div className="sticky top-14 z-10 -mx-4 bg-background px-4 pt-2 pb-4 lg:mx-0 lg:flex lg:h-[calc(100svh-4.5rem)] lg:items-center lg:self-start lg:bg-transparent lg:p-0">
          <div ref={frame} className="mx-auto w-full max-w-md lg:max-w-none">
            <JourneyScene stage={stage} />
          </div>
        </div>
        <ol ref={list} className="flex flex-col">
          {steps.map((step, i) => (
            <li
              key={i}
              data-step={i}
              data-state={stage < 0 || i > stage ? "upcoming" : i === stage ? "current" : "done"}
              className={cn("journey-step flex gap-4 py-10 lg:min-h-[55vh] lg:items-center", i === 0 && "lg:pt-0")}
            >
              <span aria-hidden className="journey-num flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular">
                {i + 1}
              </span>
              <div className="journey-body flex min-w-0 flex-col gap-2">{step}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** One step: a title and a sentence or two. Only meaningful inside `Journey`. */
export function JourneyStep({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
      <p className="text-base text-pretty text-muted-foreground md:text-lg">{children}</p>
    </>
  );
}

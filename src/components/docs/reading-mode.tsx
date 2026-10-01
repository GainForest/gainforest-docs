"use client";

import { BookOpen, BookOpenText } from "lucide-react";
import { useEffect, useEffectEvent } from "react";

import { Kbd } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocal } from "@/lib/stores/local";

/**
 * Reading mode: the page and nothing else. It closes the page list, hides
 * the outline, the page actions and the feedback box, and turns the green
 * inside the article to grey, so links, steps and card icons stop pulling
 * at the eye. Warnings keep their colour, because that colour is meaning.
 *
 * The switch is `data-reading` on <html>; globals.css does the hiding and
 * the recolouring, so no page has to know about it. The choice is
 * remembered in this browser (`useLocal`) and `r` toggles it (keyboard.tsx).
 */
export function ReadingModeToggle() {
  const reading = useLocal((s) => s.reading);
  const setReading = useLocal((s) => s.setReading);
  const { setOpen } = useSidebar();
  const syncSidebar = useEffectEvent((on: boolean) => setOpen(!on));

  useEffect(() => {
    const root = document.documentElement;
    if (reading) root.dataset.reading = "";
    else delete root.dataset.reading;
    syncSidebar(reading);
  }, [reading]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          pressed={reading}
          onPressedChange={setReading}
          aria-label="Reading mode"
          className="size-8 px-0 aria-pressed:text-primary"
        >
          <span className="swap">
            <BookOpen aria-hidden data-shown={!reading} className="size-4" />
            <BookOpenText aria-hidden data-shown={reading} className="size-4" />
          </span>
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        {reading ? "Show the page list and outline" : "Reading mode: just the page"} <Kbd>R</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

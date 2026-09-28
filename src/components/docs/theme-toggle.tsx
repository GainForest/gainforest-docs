"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Light and dark.
 *
 * Which icon shows is CSS, not React state: the resolved theme is unknown
 * during server render, so the two glyphs are stacked in a `.swap` and
 * `dark:` decides which is shown. They crossfade with a turn and a blur, so
 * the change reads as one object turning over.
 *
 * The switch itself is a circular reveal growing from the button, through
 * the View Transitions API. Changing theme is rare and deliberate, which is
 * the tier that earns a flourish. Where the API is missing, or the reader
 * asks for reduced motion, the theme simply changes.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme();
  const label = "Change the colour theme";

  function apply() {
    const dark = document.documentElement.classList.contains("dark");
    // Write the class now, inside the transition's snapshot, rather than
    // waiting for next-themes' effect; `setTheme` then persists the choice.
    document.documentElement.classList.toggle("dark", !dark);
    document.documentElement.style.colorScheme = dark ? "light" : "dark";
    flushSync(() => setTheme(dark ? "light" : "dark"));
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={label}
          onClick={(event) => {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!document.startViewTransition || reduce) {
              apply();
              return;
            }
            const rect = event.currentTarget.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
            const root = document.documentElement.style;
            root.setProperty("--vt-x", `${x}px`);
            root.setProperty("--vt-y", `${y}px`);
            root.setProperty("--vt-r", `${r}px`);
            document.startViewTransition(apply);
          }}
        >
          <span className="swap">
            <Sun aria-hidden className="theme-sun size-4" />
            <Moon aria-hidden className="theme-moon size-4" />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Switch between the light and dark themes</TooltipContent>
    </Tooltip>
  );
}

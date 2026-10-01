import { ArrowUpRight } from "lucide-react";

import { KeyboardShortcuts } from "@/components/docs/keyboard";
import { ReadingModeToggle } from "@/components/docs/reading-mode";
import { SearchTrigger } from "@/components/docs/search-palette";
import { ThemeToggle } from "@/components/docs/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { site } from "@/lib/site";

/**
 * The panel's top bar, one rung above the page (L2 over L1) and translucent
 * so the page reads as passing underneath it. Same construction as the
 * admin's header: no rule, no shadow, a luminance step.
 */
export function DocsHeader() {
  return (
    <header className="sticky top-0 z-20 shrink-0 rounded-t-3xl bg-background/80 backdrop-blur-md dark:bg-card/70">
      {/* Reading progress, drawn by a scroll-driven animation on the panel's
          own scroll (globals.css). Pure CSS, off the main thread. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <span className="read-progress block size-full rounded-full bg-primary/60" />
      </span>
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <SidebarTrigger className="md:hidden" aria-label="Open the page list" />
        <SearchTrigger />
        <div className="ms-auto flex items-center gap-1">
          <Button asChild variant="ghost" className="hidden sm:inline-flex" data-reading-hide>
            <a href={site.app} target="_blank" rel="noreferrer" className="lift">
              GainForest.app
              <ArrowUpRight aria-hidden data-icon="inline-end" className="lift-arrow-out lift-arrow" />
            </a>
          </Button>
          <ReadingModeToggle />
          <KeyboardShortcuts />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

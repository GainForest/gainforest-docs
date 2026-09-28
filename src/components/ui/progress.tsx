"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // The value is a percentage of the track, clamped so an overrun cannot draw
  // wider than the track it sits in.
  const percent = Math.min(Math.max(value ?? 0, 0), 100)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {/* The indicator's width is the value, and its floor is in pixels: a
          near-zero percent must draw a bar a few pixels wide rather than a
          fraction of one that reads as a rendering artifact. A true zero gets
          no floor, because nothing must still show nothing. Width is not
          transitioned (AGENTS.md §7); the colour is, so a theme change does
          not snap. */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full bg-primary transition-colors",
          percent > 0 && "min-w-[6px]"
        )}
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

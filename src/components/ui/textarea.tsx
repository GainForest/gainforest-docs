import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      // Not `rounded-full`. A textarea is a multi-line field: it grows with its
      // content, so it is never control height, and full radius is reserved
      // for single-line controls. This radius is the scale's recessed slot.
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md bg-input px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

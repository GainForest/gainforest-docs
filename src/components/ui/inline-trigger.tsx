import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A control that sits inside running text: a glossary term, an inline
 * disclosure. It is a real `<button>` so it is focusable and announced, but
 * it inherits the paragraph's font and flows with it, which no kit button at
 * control height can do. The only kit primitive allowed to be inline.
 */
function InlineTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="inline-trigger"
      className={cn(
        "inline cursor-help appearance-none border-0 bg-transparent p-0 text-start font-[inherit] text-[length:inherit] leading-[inherit] text-inherit",
        className
      )}
      {...props}
    />
  )
}

export { InlineTrigger }

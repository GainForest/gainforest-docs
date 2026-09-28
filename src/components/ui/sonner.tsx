"use client"

import { useTheme } from "next-themes"
import { z } from "zod"
import { styleVars } from "@/lib/css-vars"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/** next-themes types its value as `string`; sonner accepts three literal
 *  values. Parsing is the only honest bridge, and it is what AGENTS.md §2
 *  requires instead of an assertion. */
const themeSchema = z.enum(["light", "dark", "system"]);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  const resolved = themeSchema.safeParse(theme).data ?? "system"

  return (
    <Sonner
      theme={resolved}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={styleVars({
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        // Sonner draws a 1px border around the toast and the close button from
        // this value. Nothing in this system draws a resting border, and the
        // toast already carries --shadow-overlay (see `.cn-toast` in
        // globals.css), so the border is set to transparent rather than to a
        // colour from the palette.
        "--normal-border": "transparent",
        "--border-radius": "var(--radius)",
        "--width": "22rem",
      })}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

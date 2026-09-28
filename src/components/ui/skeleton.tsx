import { cn } from "cn"

/**
 * A loading placeholder.
 *
 * Tinted from `--foreground`, not `--muted`. `--muted` is deliberately the same
 * value as `--background` (it is the L1 rung, reused for wells recessed inside a
 * card), so a `bg-muted` block placed on an L1 panel — which is where a route's
 * `loading.tsx` renders — is painted in exactly the colour of the surface
 * beneath it and is invisible. A foreground tint steps off whatever rung it
 * lands on: lighter than the surface in dark, darker in light, in both cases by
 * the same amount, because it is a mix of the text colour rather than a fixed
 * value. `animate-pulse` breathes between two opacities of that tint.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-foreground/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

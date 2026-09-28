import type { CSSProperties } from "react";

/**
 * A style object that may carry CSS custom properties.
 *
 * React's `CSSProperties` has no index signature, so `{ "--x": "1rem" }` is
 * rejected and the usual fix is `as CSSProperties`, which states something
 * false: the object is not a `CSSProperties`, it is a `CSSProperties` plus
 * custom properties. This type says what is actually true, so the literal
 * type-checks on its own and no assertion is needed anywhere.
 *
 * AGENTS.md §2: when a third-party type is wrong, widen it once here rather
 * than cast at each call site.
 */
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Identity function with a declared parameter type, so a misspelled property
 * or a bad value is reported at the literal instead of widening silently.
 */
export function styleVars(vars: CSSVars): CSSProperties {
  return vars;
}
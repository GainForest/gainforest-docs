"use client";

import { useEffect, useState } from "react";

/**
 * A counter that changes when the theme does.
 *
 * The palette the globe paints with is read from the tokens on `:root`, and
 * the tokens change when `next-themes` writes a class onto `<html>`. That write
 * happens in an effect, and a child's effects run before its parent's, so a
 * component that re-read the tokens on `resolvedTheme` would read them one
 * commit too early and paint the previous theme. (It is the sort of bug that
 * looks like a cache problem and is not.)
 *
 * So the class attribute is watched directly instead of inferred: the observer
 * fires after the class lands, which is exactly when the tokens are current.
 * The DOM is the source of truth because the DOM is what `getComputedStyle`
 * will answer from.
 */
export function useThemeRevision(): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setRevision((current) => current + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return revision;
}

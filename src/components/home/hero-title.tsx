import { Fragment } from "react";

import { styleVars } from "@/lib/css-vars";

/**
 * The welcome headline. Each word rises out of a blur, 70ms after the one
 * before, and the accent word is underlined by a stroke that draws itself
 * once the sentence has landed.
 *
 * CSS, not Motion, and a server component: the keyframes run on first paint,
 * before hydration, with `backwards` fill, so a word is only hidden during its
 * own delay. If the animation never runs the headline is simply there. The
 * sentence is read once, whole, by assistive tech; the split copy is hidden.
 */
export function HeroTitle({ id, text, accent }: { id: string; text: string; accent?: string }) {
  const words = text.split(" ");
  return (
    <h1 id={id} className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="hero-word inline-block" style={styleVars({ "--i": i })}>
              {word === accent ? (
                <span className="relative inline-block text-primary">
                  {word}
                  <svg
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 -bottom-2 h-3 w-full overflow-visible"
                  >
                    <path
                      className="hero-underline"
                      d="M3 8.5 C 30 3, 70 2.5, 117 6.5"
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      style={styleVars({ "--d": `${words.length * 70 + 250}ms` })}
                    />
                  </svg>
                </span>
              ) : (
                word
              )}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </h1>
  );
}

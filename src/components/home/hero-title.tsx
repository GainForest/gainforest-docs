import { Fragment } from "react";

/**
 * The welcome headline, with the accent word in green over a hand-drawn
 * underline. It has no entrance of its own: the whole hero rises in as one
 * block (`.hero-enter`). The sentence is read once, whole, by assistive
 * tech; the split copy is hidden.
 */
export function HeroTitle({ id, text, accent }: { id: string; text: string; accent?: string }) {
  const words = text.split(" ");
  return (
    <h1 id={id} className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="inline-block">
              {word === accent ? (
                <span className="relative inline-block text-primary">
                  {word}
                  <svg
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 -bottom-2 h-3 w-full overflow-visible"
                  >
                    <path
                      d="M3 8.5 C 30 3, 70 2.5, 117 6.5"
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
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

import { Fragment } from "react";

/**
 * The welcome headline, with the accent word in green. It has no entrance of its own: the whole hero rises in as one
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
                <span className="text-primary">{word}</span>
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

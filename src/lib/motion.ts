import type { Transition, Variants } from "motion/react";

/**
 * Every motion value in the app.
 *
 * Components do not author transitions inline (AGENTS.md §7): one curve and
 * one duration scale, defined once, so two things arriving at the same time
 * cannot disagree about how.
 *
 * The frequency table from design.md §6 decides *whether* to animate at all.
 * The more often a user sees something, the less it should move. Nav clicks do
 * not animate. A panel's first mount does.
 */

/**
 * Cubic beziers as fixed-length tuples. Motion's `ease` accepts a 4-tuple, not
 * an array, so the type is written out rather than inferred: an annotation
 * gives the same readonly-ness `as const` would, and is checked. AGENTS.md §2.
 */
export type Bezier = readonly [number, number, number, number];

export const EASE_OUT: Bezier = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT: Bezier = [0.77, 0, 0.175, 1];

export const DURATION = {
  /** Under the eye's threshold: colour and press feedback. */
  instant: 0.14,
  /** The default for anything that appears or moves. */
  quick: 0.24,
  /** Overlays, sheets, and anything travelling a long distance. */
  settled: 0.32,
} satisfies Record<string, number>;

/** The one spring. Low bounce, so it reads as confident rather than playful. */
export const SPRING: Transition = { duration: 0.5, bounce: 0.2 };

/**
 * Enter and leave. `transform` and `opacity` only, so the compositor does the
 * work and nothing triggers layout.
 *
 * The hidden state is never `display: none` or `visibility: hidden`, and the
 * resting state is fully visible. If the animation never runs, the content is
 * simply there.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, transform: "translateY(8px)" },
  visible: { opacity: 1, transform: "translateY(0px)" },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** An overlay arriving. Scale starts at 0.97, never 0: a panel that grows from
 *  nothing looks like a glitch, and scale(0) is banned outright. */
export const overlayIn: Variants = {
  hidden: { opacity: 0, transform: "scale(0.97)" },
  visible: { opacity: 1, transform: "scale(1)" },
};

/**
 * A staggered list. Used for a grid of cards or a feed, never for table rows:
 * rows arrive as one object, and animating 40 rows individually makes a fast
 * page feel slow.
 *
 * Returns variants, not a transition. A stagger is orchestration that belongs
 * to the parent's `transition`, so handing a `Transition` to a `variants` prop
 * is the wrong shape and TypeScript is right to refuse it.
 */
export function staggerVariants(step = 0.045): Variants {
  return {
    visible: { transition: { staggerChildren: step, delayChildren: 0.02 } },
  };
}

export const transition = {
  quick: { duration: DURATION.quick, ease: EASE_OUT },
  settled: { duration: DURATION.settled, ease: EASE_IN_OUT },
} satisfies Record<string, Transition>;
/**
 * The active-page pill in the sidebar and the outline's thumb. A spring, not
 * a duration, because a reader can click the next page while the pill is
 * still travelling and the spring carries its velocity into the new target.
 * No bounce: it is navigation, not play.
 */
export const NAV_SPRING: Transition = { type: "spring", duration: 0.38, bounce: 0 };

/**
 * The welcome page. It is seen once a visit at most, so it sits at the
 * "rare" end of the frequency table and is allowed to be expressive: blocks
 * rise and come into focus as they enter view, once, and the explainer scene
 * moves on a spring so a reader scrolling back and forth never sees a
 * transition restart from zero.
 */
export const blurUp: Variants = {
  hidden: { opacity: 0, transform: "translateY(16px)", filter: "blur(6px)" },
  visible: { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
};

/** A block arriving in view. Longer than UI motion: it explains, it does not respond. */
export const REVEAL: Transition = { duration: 0.6, ease: EASE_OUT };

/** The explainer scene's pieces. A touch of bounce: they are placed, not slid. */
export const SCENE_SPRING: Transition = { type: "spring", duration: 0.6, bounce: 0.15 };

/** A line being drawn from one thing to another: on-screen movement, so in-out. */
export const DRAW: Transition = { duration: 0.7, ease: EASE_IN_OUT };

/** Words in the intent line trade places. */
export const ROLL: Transition = { duration: 0.45, ease: EASE_OUT };

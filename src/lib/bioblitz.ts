/**
 * The BioBlitz schedule, ported line for line from GainForest.app
 * (`gainforest-app/app/_lib/bioblitz.ts`, `roundStartMs` / `roundIdFor`).
 * If the rule changes upstream it changes here too.
 *
 *   Round 1 (pilot)  26 Jun to 3 Jul 2026
 *   Rounds 2 to 13   Saturday to Friday, weekly
 *   Round 14         Saturday 26 Sep to Sunday 4 Oct (nine days)
 *   Round 15 onward  Monday 00:00 to Sunday 23:59:59.999 UTC
 */
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const FIRST_ROUND_START_MS = Date.parse("2026-06-26T00:00:00.000Z");
const FIRST_ROUND_END_MS = Date.parse("2026-07-03T23:59:59.999Z");
const SECOND_ROUND_START_MS = FIRST_ROUND_END_MS + 1;
const MONDAY_ROUNDS_FROM = 15;
const MONDAY_ROUNDS_START_MS = Date.parse("2026-10-05T00:00:00.000Z");

export type Round = { id: number; startMs: number; endMs: number };

function roundStartMs(id: number): number {
  if (id <= 1) return FIRST_ROUND_START_MS;
  if (id >= MONDAY_ROUNDS_FROM) return MONDAY_ROUNDS_START_MS + (id - MONDAY_ROUNDS_FROM) * WEEK_MS;
  return SECOND_ROUND_START_MS + (id - 2) * WEEK_MS;
}

function roundIdFor(now: number): number {
  if (now <= FIRST_ROUND_END_MS) return 1;
  if (now >= MONDAY_ROUNDS_START_MS) return MONDAY_ROUNDS_FROM + Math.floor((now - MONDAY_ROUNDS_START_MS) / WEEK_MS);
  return Math.min(MONDAY_ROUNDS_FROM - 1, 2 + Math.floor(Math.max(0, now - SECOND_ROUND_START_MS) / WEEK_MS));
}

/** The round running at `now`, or null before the pilot began. */
export function roundAt(now: number): Round | null {
  if (now < FIRST_ROUND_START_MS) return null;
  const id = roundIdFor(now);
  const endMs = id === 1 ? FIRST_ROUND_END_MS : roundStartMs(id + 1) - 1;
  return { id, startMs: roundStartMs(id), endMs };
}

/** The pilot, for the period before the challenge began. */
export function firstRound(): Round {
  return { id: 1, startMs: FIRST_ROUND_START_MS, endMs: FIRST_ROUND_END_MS };
}

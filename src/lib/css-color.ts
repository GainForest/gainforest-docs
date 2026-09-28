import { formatHex, formatRgb, parse } from "culori";

/**
 * Theme tokens in a form WebGL can consume.
 *
 * The globe is three.js, and three.js has no CSS: it and the colour parser
 * inside globe.gl understand hex and rgb(), and neither knows oklch, which is
 * how every token in globals.css is written. So the tokens are *read* from the
 * document and converted here rather than duplicated as literals in a
 * component: a second copy of the palette is a copy that drifts away from the
 * design system the first time a token changes.
 *
 * Browser only. Nothing here runs on the server, and nothing calls it before
 * the theme class is on <html>.
 */
function tokenValue(name: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (raw === "") throw new Error(`Theme token ${name} is not defined`);
  return raw;
}

function parsedToken(name: string) {
  const colour = parse(tokenValue(name));
  if (colour === undefined) {
    throw new Error(`Theme token ${name} is not a colour`);
  }
  return colour;
}

/** "#197c4f", for the parsers that only speak hex. */
export function tokenHex(name: string): string {
  const hex = formatHex(parsedToken(name));
  if (hex === undefined) {
    throw new Error(`Theme token ${name} could not be converted to hex`);
  }
  return hex;
}

/** "rgba(25, 124, 79, 0.4)", because a trail fades and a WebGL material has no
 *  colour-mix. */
export function tokenRgba(name: string, alpha: number): string {
  const rgba = formatRgb({ ...parsedToken(name), alpha });
  if (rgba === undefined) {
    throw new Error(`Theme token ${name} could not be converted to rgba`);
  }
  return rgba;
}
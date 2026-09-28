#!/usr/bin/env node
/**
 * Retokenise shadcn primitives onto this design system.
 *
 * WHY THIS EXISTS
 * `pnpm dlx shadcn@latest add <name>` writes upstream defaults: resting
 * borders, `shadow-md` halos, `ring-1 ring-foreground/10` contours, and
 * `focus-visible:ring-3` double-drawn on top of the global focus ring. Those
 * are the exact things design.md forbids. Running `add` without this script
 * silently reverts the visual system, and that is how a design system drifts.
 *
 * So: add a component, run this, read the diff.
 *
 *   pnpm dlx shadcn@latest add dialog
 *   pnpm retokenise
 *   git diff src/components/ui/dialog.tsx
 *
 * SAFETY MODEL
 * Every rule runs against the *contents of a class-list string literal*, never
 * against the file. That distinction is the whole design of this script.
 *
 * An earlier version ran cleanup regexes over the raw source and ate live
 * code: the `success:` keys of sonner's icon map (`/^\s*[a-z-]+:/` matched
 * them), and the space in `from "next-themes"` (`/\s+"/` matched it). Class
 * strings are the only thing a class rewriter may touch, so the string
 * boundary is enforced first and every rule is written knowing it will only
 * ever see a class list.
 *
 * WHAT IT DOES NOT DO
 * It cannot choose a radius for you, or decide whether a surface floats. The
 * `CONTROLS` / `FLOATING` / `FIELDS` sets below say which components are which,
 * and `NOT_CONTROL_HEIGHT` says which class strings inside a control file are
 * something other than the control, and anything unrecognised is *reported*
 * rather than quietly skipped.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const UI_DIR = "src/components/ui";

/** Control height: a pill, because a fixed radius fights the cap height. */
const CONTROLS = new Set([
  "button",
  "input",
  "select",
  "toggle",
  "toggle-group",
  "pagination",
  "kbd",
]);

/**
 * `textarea` is deliberately not a control. It is a multi-line field: it grows
 * with its content, so it is never control height, and `rounded-full` on it is
 * the one shape the design system spends §3 forbidding. Leaving it in CONTROLS
 * is what put a pill on every textarea in the app.
 *
 * A control file can still hold something that is not the control: `select`
 * ships its trigger and its panel in one file. A class list carrying one of
 * these markers is proof that the box is not the trigger, so the radius
 * rewrite skips it and the string keeps a scale radius, chosen by hand.
 */
const NOT_CONTROL_HEIGHT = [
  [/\bbg-popover\b/, "a floating panel"],
  [/\bfocus:bg-accent\b/, "a row inside a panel"],
  [/\bfield-sizing-content\b/, "a multi-line field"],
];

/** Leaves the document flow: the only things allowed to cast a shadow. */
const FLOATING = new Set([
  "dialog",
  "alert-dialog",
  "popover",
  "select",
  "command",
  "dropdown-menu",
  "tooltip",
  "sheet",
  "sonner",
]);

/** Fields sit on the off-ladder control tier, not on a surface rung. */
const FIELDS = new Set(["input", "textarea", "select", "input-group"]);

// ── Is this string literal a class list? ───────────────────────────────────

/**
 * A Tailwind token: a known utility prefix at a token boundary. The boundary
 * is `^`, whitespace, or a `:` variant separator, which is what keeps CSS
 * custom properties (`"--normal-bg"`, where `bg` follows a `-`) and module
 * specifiers out.
 */
const CLASS_TOKEN =
  /(?:^|[\s:])(?:rounded|border|bg|ring|shadow|text-|font-|flex|grid|gap|size|inline|items|justify|self|place|absolute|relative|fixed|sticky|overflow|opacity|transition|duration|ease|animate|select|pointer|cursor|outline|whitespace|truncate|antialiased|aspect|order|space|divide|fill|stroke|leading|tracking|tabular|uppercase|lowercase|capitalize|underline|line-clamp|sr-only|has-|group|peer|in-data|data-|aria-|disabled|hidden|block|content|col|row|z|top|right|bottom|left|inset|min-|max-|w-|h-|p-|p[xytrbl]-|m-|m[xytrbl]-)(?:-|$|\[)/;

function isClassList(value) {
  if (value.includes("\n")) return false;
  if (/^[@/]/.test(value)) return false; // module or file path
  if (/^--/.test(value)) return false; // CSS custom property
  return CLASS_TOKEN.test(value);
}

/**
 * Walk every quoted literal and hand `isClassList` the contents, so a rule can
 * never see an import path, an object key, or a CSS variable name.
 */
function mapClassStrings(source, fn) {
  return source.replace(
    /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g,
    (whole, dq, sq) => {
      const value = dq ?? sq;
      if (value === undefined || !isClassList(value)) return whole;
      const quote = dq !== undefined ? '"' : "'";
      return quote + fn(value) + quote;
    },
  );
}

// ── Rules. Each sees only a class list. ────────────────────────────────────

const RULES = [
  // Resting borders out. `border-transparent` reserves room for a border this
  // system never draws, so it goes too.
  [/\bborder border-input\b/g, "", "resting border (input)"],
  [/\bborder-transparent\b/g, "", "reserved border"],
  [/\bborder-border\b/g, "", "resting border (border)"],
  [/\bborder-input\/30\b/g, "", "resting border tint"],
  [/\bborder-dashed\b/g, "", "dashed border"],
  [/\brounded-b-xl border-t\b/g, "rounded-b-xl", "footer rule"],
  [/\bborder-t bg-muted\/50\b/g, "bg-muted", "footer divider -> tonal"],
  [/\brounded-b-xl border-t\b/g, "rounded-b-xl", "footer rule"],

  // Focus rings. globals.css draws one offset `:focus-visible` outline for the
  // whole app; a per-component ring double-draws and tracks the wrong surface.
  [/\bfocus-visible:border-ring\b/g, "", "focus border"],
  [/\bfocus-visible:ring-\[3px\] focus-visible:ring-ring\/50\b/g, "", "focus ring"],
  [/\bfocus-visible:ring-3 focus-visible:ring-ring\/50\b/g, "", "focus ring"],
  [/\bfocus-visible:ring-2 focus-visible:ring-ring\/50\b/g, "", "focus ring"],
  [/\bring-1 ring-foreground\/10\b/g, "", "resting contour ring"],
  [/\bfocus-visible:ring-0\b/g, "", "no-op ring"],
  [/\bring-0\b/g, "", "no-op ring"],

  // Error state keeps a ring: it is a signal, not decoration.
  [
    /\baria-invalid:ring-3 aria-invalid:ring-destructive\/20\b/g,
    "aria-invalid:ring-2 aria-invalid:ring-destructive/40",
    "error ring (normalised)",
  ],
  [/\baria-invalid:border-destructive\b/g, "", "error border"],

  // Shadows: one token, and only where something floats.
  [/\bshadow-md\b/g, "shadow-[var(--shadow-overlay)]", "halo -> overlay shadow"],

  // Hairlines become a tonal step rather than a stroke.
  [/\bbg-border\b/g, "bg-foreground/10", "hairline -> tonal step"],
];

/**
 * Utilities that are always removed, prefix or not.
 *
 * A regex over the string cannot see `has-[>[data-slot=field]]:border` as a
 * border, because the variant sits in front of the utility. A token loop can:
 * it reads the utility name from after the last top-level colon, so the width
 * is removed and the dead variant is cleaned up afterwards.
 */
const DROP_TOKENS = new Set(["border"]);

/** Field-only: a field must be visible against whatever rung it lands on. */
const FIELD_RULES = [
  [/\bbg-transparent\b/g, "bg-input", "field fill"],
  [/\bdark:bg-input\/30\b/g, "", "field fill (dark override)"],
];

/**
 * Artifacts any class rewriter produces. Removing the middle of a three-part
 * sequence leaves the variant prefix behind (`focus-visible:` with nothing
 * after it), and removing a class leaves a double space. Both are malformed,
 * and both are cleaned here so the pass is idempotent.
 */
const CLEANUP = [
  // A variant with no utility after it. The final `:` must be followed by
  // whitespace, the end of the string, or a modifier, which is what stops this
  // from eating the `hover:` of `hover:bg-muted`.
  [
    /(?<=^|\s)([a-z][\w-]*(?:\[[^\]]*\])?(?:\/[a-z-]+)?(?::[a-z-]+(?:\[[^\]]*\])?)*):(?=\s|$|\/)/g,
    "",
    "dangling variant",
  ],
  // A modifier with no utility. `dark:/50` is what removing the middle of
  // `dark:bg-input/50` leaves behind, and Tailwind reads `/50` as nothing.
  [/(?<=^|\s)\/\d+(?=\s|$)/g, "", "orphan modifier"],
  [/ {2,}/g, " ", "collapsed whitespace"],
  [/^ +| +$/g, "", "trim"],
];

function applyRules(value, rules) {
  let out = value;
  const hits = [];
  for (const [pattern, replacement, label] of rules) {
    const found = out.match(pattern);
    if (found) {
      hits.push(`${label} x${found.length}`);
      out = out.replace(pattern, replacement);
    }
  }
  return [out, hits];
}

/** The utility name of a token: what follows the last colon outside brackets. */
function utilityName(token) {
  let depth = 0;
  let split = -1;
  for (let i = 0; i < token.length; i += 1) {
    const char = token[i];
    if (char === "[" || char === "(") depth += 1;
    else if (char === "]" || char === ")") depth -= 1;
    else if (char === ":" && depth === 0) split = i;
  }
  const raw = token.slice(split + 1);
  return raw.endsWith("!") ? raw.slice(0, -1) : raw;
}

function dropTokens(value) {
  const kept = [];
  const dropped = [];
  for (const token of value.split(" ")) {
    if (DROP_TOKENS.has(utilityName(token))) dropped.push(token);
    else kept.push(token);
  }
  return [kept.join(" "), dropped.length ? { count: dropped.length } : null];
}

const report = { changed: [], review: [], flags: [] };

for (const file of readdirSync(UI_DIR).filter((f) => f.endsWith(".tsx"))) {
  const name = file.replace(/\.tsx$/, "");
  const path = join(UI_DIR, file);
  const before = readFileSync(path, "utf8");
  const hits = [];

  const out = mapClassStrings(before, (value) => {
    const notControl = NOT_CONTROL_HEIGHT.find(([pattern]) => pattern.test(value));
    const rules = [...RULES];
    if (FIELDS.has(name)) rules.push(...FIELD_RULES);
    if (CONTROLS.has(name) && !notControl) {
      rules.push([
        // `\]` is not a word character, so a trailing \b never matched
        // `rounded-[min(var(--radius-md),12px)]`. Anchor on a non-word
        // lookahead instead.
        /\brounded-(?:\[min\(var\(--radius-md\),\d+px\)\]|xs|sm|md|lg|xl|2xl|3xl)(?![\w-])/g,
        "rounded-full",
        "control radius -> full",
      ]);
    }

    const [afterRules, ruleHits] = applyRules(value, rules);
    const [afterTokens, dropped] = dropTokens(afterRules);
    if (dropped) hits.push(`resting border x${dropped.count}`);
    const [afterCleanup, cleanupHits] = applyRules(afterTokens, CLEANUP);
    hits.push(...ruleHits, ...cleanupHits);
    return afterCleanup;
  });

  if (FLOATING.has(name) && !out.includes("--shadow-overlay")) {
    report.flags.push(`${name}: floats but carries no --shadow-overlay`);
  }

  if (!hits.length) {
    report.review.push(name);
    continue;
  }
  writeFileSync(path, out);
  report.changed.push([name, hits]);
}

const line = (s) => `\n${s}`;
console.log(line("retokenise: ui primitives onto the design system"));

const tally = (hits) => {
  const counts = new Map();
  for (const hit of hits) {
    const [label, n] = hit.split(" x");
    counts.set(label, (counts.get(label) ?? 0) + Number(n));
  }
  return [...counts].map(([label, n]) => `${label} x${n}`).join(", ");
};

if (report.changed.length) {
  console.log(line("  retokenised:"));
  for (const [name, hits] of report.changed) {
    console.log(`    ${name}: ${tally(hits)}`);
  }
}

if (report.flags.length) {
  console.log(line("  decide a shadow for:"));
  for (const f of report.flags) console.log(`    ! ${f}`);
}

if (report.review.length) {
  console.log(line("  no class rule matched, read these by eye:"));
  for (const name of report.review) console.log(`    ? ${name}`);
}

console.log(
  line(
    "Done. `git diff src/components/ui` and confirm two things by eye:\n" +
      "  · every floating surface has --shadow-overlay and a panel radius\n" +
      "  · every control-height element is rounded-full, and a textarea or a\n" +
      "    panel that shares a file with a control is not",
  ),
);
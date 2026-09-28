import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import design from "./eslint/rules/design.mjs";

/**
 * The rules in AGENTS.md, enforced.
 *
 * `no-restricted-syntax` may only be configured once per file scope, so the
 * selector lists are composed here and attached to progressively narrower
 * scopes rather than re-declared per rule. Later config objects win, which is
 * how `src/components/ui/**` and `src/app/api/**` relax exactly one ban each.
 *
 * The two rules a selector cannot express, because they compare one class
 * against another, live in `eslint/rules/design.mjs` and are attached below.
 */

// ── §2 Types are proven, never asserted ────────────────────────────────────
const typeSafety = [
  {
    selector: "TSNonNullExpression",
    message:
      "`!` is banned. Prove the value exists (`if (!x) throw new Error(...)`) or supply a real default. AGENTS.md §2.",
  },
  {
    selector: "TSAnyKeyword",
    message:
      "`any` is banned. Accept `unknown` at the boundary and parse it. AGENTS.md §2.",
  },
];

// ── §1 Nothing is assembled from primitives ───────────────────────────────
const NATIVE_CONTROL = [
  "input",
  "select",
  "textarea",
  "option",
  "optgroup",
  "datalist",
  "button",
  "progress",
  "meter",
  "dialog",
  "details",
  "summary",
  "fieldset",
  "output",
].join("|");

const nativeControls = [
  {
    selector: `JSXOpeningElement[name.name=/^(${NATIVE_CONTROL})$/]`,
    message:
      "Native controls are banned outside src/components/ui. Compose from the kit: search src/components/ui, then src/components/docs, then `pnpm dlx shadcn@latest add <name>`. AGENTS.md §1.",
  },
];

// ── §1 Render structured content, never raw HTML ─────────────────────────
const dataFlow = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message:
      "dangerouslySetInnerHTML is banned. Render content through MDX components. AGENTS.md §1.",
  },
];

// `as const` has its own selector because `consistent-type-assertions` with
// `assertionStyle: "never"` skips an `as const` node on purpose. AGENTS.md §2
// bans it with the rest of `as`, so the ban is stated here, beside the other
// type-safety selectors, and every file in the app inherits it.
const asConst = [
  {
    selector: "TSAsExpression[typeAnnotation.typeName.name='const']",
    message:
      "`as const` is banned. Annotate the value with its type, or use `satisfies`, so the compiler checks it. AGENTS.md §2.",
  },
];

const rule = (selectors) => ({
  "no-restricted-syntax": ["error", ...selectors],
});

const sources = ["src/**/*.{ts,tsx,mts}"];
const primitives = ["src/components/ui/**/*.tsx"];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".source/**"]),

  // Type safety applies to every file, including the retokenised primitives.
  {
    files: sources,
    rules: {
      ...rule(typeSafety),
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        // "never" bans `as` and `<T>x`. It does NOT ban `as const`: the rule
        // deliberately skips an `as const` node when the style is `never`
        // (node_modules/@typescript-eslint/eslint-plugin/dist/rules/
        // consistent-type-assertions.js). AGENTS.md §2 bans `as const` too, so
        // the `no-restricted-syntax` selector below is what actually enforces
        // that half.
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 12,
        },
      ],
    },
  },

  // Everything in the app, minus the two relaxations below.
  {
    files: sources,
    rules: rule([...typeSafety, ...asConst, ...nativeControls, ...dataFlow]),
  },

  // Primitives wrap Radix and must render the native element to do their job.
  // This is the only place the native-control ban is lifted; the type-safety
  // selectors, including the `as const` ban, still apply.
  {
    files: primitives,
    rules: rule([...typeSafety, ...asConst]),
  },


  // §6 Styling: the geometry a class list can prove on its own. The primitives
  // keep these too. `src/components/ui/**` relaxes the native-control ban, not
  // the design system, and the retokenise script is what corrects the kit.
  {
    files: sources,
    plugins: { design },
    rules: {
      "design/containment": "error",
      "design/control-height": "error",
    },
  },
]);
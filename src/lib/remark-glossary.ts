import type { Parent, PhrasingContent, Root, RootContent, Text } from "mdast";
import type { MdxJsxTextElement } from "mdast-util-mdx-jsx";

import { GLOSSARY } from "./glossary";

/**
 * Wrap the first use of each glossary term on a page in `<Term id="…">`.
 *
 * First use only, because a page underlined twenty times reads as noise and
 * the reader only needs the definition once. Never inside a heading, a link,
 * code, or an existing component's attributes: a definition card on a link
 * would fight the link for the click.
 */
const SKIP = new Set(["heading", "link", "linkReference", "inlineCode", "code", "definition"]);

/** Components whose body is itself a link when given an `href`: a term inside
 *  one would put a button inside an anchor. */
const LINKING = new Set(["Card", "Destination", "ButtonLink"]);

function isLinkingComponent(node: RootContent): boolean {
  if (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement") return false;
  if (!node.name || !LINKING.has(node.name)) return false;
  return node.attributes.some((a) => a.type === "mdxJsxAttribute" && a.name === "href");
}

type Matcher = { id: string; re: RegExp };

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest spellings first, so "Data Council" wins over a shorter overlap.
const MATCHERS: Matcher[] = GLOSSARY.flatMap((t) => t.match.map((m) => ({ id: t.id, m })))
  .sort((a, b) => b.m.length - a.m.length)
  .map(({ id, m }) => ({ id, re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(m)}(?![\\p{L}\\p{N}])`, "iu") }));

function term(id: string, value: string): MdxJsxTextElement {
  return {
    type: "mdxJsxTextElement",
    name: "Term",
    attributes: [{ type: "mdxJsxAttribute", name: "id", value: id }],
    children: [{ type: "text", value }],
  };
}

function isParent(node: RootContent | Root): node is Parent & RootContent {
  return "children" in node;
}

export function remarkGlossary() {
  return (tree: Root) => {
    const used = new Set<string>();

    function splitText(node: Text): PhrasingContent[] | null {
      for (const { id, re } of MATCHERS) {
        if (used.has(id)) continue;
        const m = re.exec(node.value);
        if (!m) continue;
        used.add(id);
        const before = node.value.slice(0, m.index);
        const after = node.value.slice(m.index + m[0].length);
        const out: PhrasingContent[] = [];
        if (before) out.push(...(splitText({ type: "text", value: before }) ?? [{ type: "text", value: before }]));
        out.push(term(id, m[0]));
        if (after) out.push(...(splitText({ type: "text", value: after }) ?? [{ type: "text", value: after }]));
        return out;
      }
      return null;
    }

    function walk(parent: Parent) {
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (!child || SKIP.has(child.type)) continue;
        if (child.type === "mdxJsxTextElement" && child.name === "Term") continue;
        if (isLinkingComponent(child)) continue;
        if (child.type === "text") {
          const parts = splitText(child);
          if (parts) {
            parent.children.splice(i, 1, ...parts);
            i += parts.length - 1;
          }
          continue;
        }
        if (isParent(child)) walk(child);
      }
    }

    walk(tree);
  };
}

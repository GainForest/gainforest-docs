import { llms, loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

import { DocIcon } from "@/components/mdx/icon";
import { remarkGlossary } from "@/lib/remark-glossary";

/**
 * The content pipeline. `content/docs` is the only place pages live; the
 * frontmatter is parsed against `pageSchema`, so a page with a missing title
 * fails the build rather than rendering blank. AGENTS.md §4.
 */
const SidebarTitle = z.object({ sidebarTitle: z.string().optional() });

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** A shorter label for the sidebar when the page title is long. */
      sidebarTitle: z.string().optional(),
    }),
    postprocess: { includeProcessedMarkdown: true },
    // From git. Pages with no commit yet have no date, and the page says so.
    lastModified: true,
    // The fumadocs preset plus the glossary marker (AGENTS.md §3).
    mdxOptions: applyMdxPreset({ remarkPlugins: (defaults) => [...defaults, remarkGlossary] }),
  },
  meta: { schema: metaSchema },
});

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      {
        file(node, filePath) {
          const file = filePath ? this.storage.read(filePath) : undefined;
          const parsed = SidebarTitle.safeParse(file?.data);
          return parsed.success && parsed.data.sidebarTitle
            ? { ...node, name: parsed.data.sidebarTitle }
            : node;
        },
      },
    ],
  },
  icon(name) {
    return name ? <DocIcon name={name} /> : undefined;
  },
});

export const docsLlms = llms(source, {
  renderPage: async (page) =>
    `# ${page.data.title} (${page.url})\n\n${await page.data.getText("processed")}`,
});

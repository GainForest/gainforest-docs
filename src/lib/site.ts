/** Facts about the site, named once. */
export const site = {
  name: "GainForest Docs",
  description:
    "Guides for Bumicerts on GainForest.app: Projects, evidence, opportunities, and support.",
  url: "https://docs.gainforest.earth",
  app: "https://gainforest.app",
  repo: { owner: "GainForest", name: "gainforest-docs", branch: "main" },
};

export function editUrl(path: string): string {
  const { owner, name, branch } = site.repo;
  return `https://github.com/${owner}/${name}/edit/${branch}/content/docs/${path}`;
}

/** Where a page's raw markdown is served, for "copy page" and agents. */
export function markdownUrl(slugs: readonly string[]): string {
  return `/llms.mdx/${[...slugs, "content.md"].join("/")}`;
}

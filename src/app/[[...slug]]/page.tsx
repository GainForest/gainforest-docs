import { findNeighbour } from "fumadocs-core/page-tree";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageKeys } from "@/components/docs/keyboard";
import { PageActions } from "@/components/docs/page-actions";
import { Feedback } from "@/components/interactive/feedback";
import { Toc } from "@/components/docs/toc";
import { mdxComponents } from "@/components/mdx";
import { editUrl, markdownUrl } from "@/lib/site";
import { source } from "@/lib/source";

export default async function DocPage(props: PageProps<"/[[...slug]]">) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const { previous, next } = findNeighbour(source.getPageTree(), page.url);
  // About 200 words a minute: many readers are reading in a second language.
  const words = (await page.data.getText("processed")).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const updated = page.data.lastModified;

  // The welcome page draws its own sections full width: no title block,
  // outline, or neighbours. Its content is still one MDX file.
  if (page.data.layout === "home") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 md:px-8 md:pt-12 xl:px-12">
        <div className="flex flex-col gap-24 md:gap-32">
          <MDX components={mdxComponents} />
        </div>
        <Feedback page={page.url} />
        <PageKeys prev={null} next={next?.url ?? null} headings={[]} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl px-4 xl:gap-12 pt-8 pb-16 md:px-8 md:pt-12 xl:px-12">
      <article className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-[72ch] flex-col gap-3">
          <h1 className="enter-item text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {page.data.title}
          </h1>
          {page.data.description ? (
            <p className="enter-item text-lg text-pretty text-muted-foreground">{page.data.description}</p>
          ) : null}
          <p className="enter-item flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular">
            <span>{minutes} min read</span>
            {updated ? (
              <>
                <span aria-hidden>·</span>
                <time dateTime={updated.toISOString()}>
                  Updated {updated.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              </>
            ) : null}
          </p>
          <div className="enter-item">
            <PageActions markdownUrl={markdownUrl(page.slugs)} editUrl={editUrl(page.path)} />
          </div>
        </div>

        <div className="prose mx-auto mt-8 max-w-[72ch]">
          <MDX components={mdxComponents} />
        </div>

        <Feedback page={page.url} />
        <PageKeys prev={previous?.url ?? null} next={next?.url ?? null} headings={page.data.toc.map((t) => t.url.slice(1))} />

        <nav
          aria-label="More pages"
          className="mx-auto mt-4 grid max-w-[72ch] gap-2 sm:grid-cols-2"
        >
          {previous ? (
            <Link href={previous.url} className="lift flex flex-col gap-1 rounded-xl bg-card p-4 hover:bg-accent">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft aria-hidden className="lift-arrow lift-arrow-back size-3" /> Previous
              </span>
              <span className="text-sm font-medium">{previous.name}</span>
            </Link>
          ) : (
            <span aria-hidden className="hidden sm:block" />
          )}
          {next ? (
            <Link href={next.url} className="lift flex flex-col items-end gap-1 rounded-xl bg-card p-4 text-end hover:bg-accent">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                Next <ArrowRight aria-hidden className="lift-arrow size-3" />
              </span>
              <span className="text-sm font-medium">{next.name}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-24">
          <Toc items={page.data.toc} />
        </div>
      </aside>
    </div>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return {
    title: page.url === "/" ? { absolute: "GainForest Docs" } : page.data.title,
    description: page.data.description,
  };
}

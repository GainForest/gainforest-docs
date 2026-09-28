import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Suspense, type ComponentProps } from "react";

import { ButtonLink } from "@/components/mdx/button-link";
import { Callout } from "@/components/mdx/callout";
import { Card, Cards } from "@/components/mdx/cards";
import { Embed } from "@/components/mdx/embed";
import { Figure } from "@/components/mdx/figure";
import { DocIcon } from "@/components/mdx/icon";
import { PageLink } from "@/components/mdx/page-link";
import { Step, Steps } from "@/components/mdx/steps";
import { H2, H3, H4 } from "@/components/mdx/heading";
import { BioblitzCountdown } from "@/components/interactive/bioblitz-countdown";
import { CallArchive } from "@/components/interactive/call-archive";
import { Check, Checklist } from "@/components/interactive/checklist";
import { DonatePicker } from "@/components/interactive/donate-picker";
import { GlobePreview } from "@/components/interactive/globe-preview";
import { GrantCheck } from "@/components/interactive/grant-check";
import { RoleExplorer } from "@/components/interactive/role-explorer";
import { SoundSample } from "@/components/interactive/sound-sample";
import { Term } from "@/components/interactive/term";
import { UploadPicker } from "@/components/interactive/upload-picker";

/** Internal links go through the router; everything else opens in a new tab. */
function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props} />;
  return <a href={href} target="_blank" rel="noreferrer" {...props} />;
}

/**
 * Components that keep their state in the URL read search params, which a
 * static page only has in the browser. The boundary lets the page prerender
 * and the component fill in on hydration, with a placeholder the same shape.
 */
function UrlState({ children, height }: { children: React.ReactNode; height: string }) {
  return <Suspense fallback={<div aria-hidden className={`shimmer not-prose my-6 rounded-xl bg-card ${height}`} />}>{children}</Suspense>;
}

/** Every component a page may use. Adding one here is the whole API. */
export const mdxComponents: MDXComponents = {
  a: Anchor,
  h2: H2,
  h3: H3,
  h4: H4,
  BioblitzCountdown,
  CallArchive: () => (
    <UrlState height="h-[40rem]">
      <CallArchive />
    </UrlState>
  ),
  Check,
  Checklist,
  DonatePicker,
  GlobePreview,
  GrantCheck,
  RoleExplorer: () => (
    <UrlState height="h-96">
      <RoleExplorer />
    </UrlState>
  ),
  SoundSample,
  Term,
  UploadPicker,
  ButtonLink,
  Callout,
  Card,
  Cards,
  Embed,
  Figure,
  Icon: DocIcon,
  PageLink,
  Step,
  Steps,
};

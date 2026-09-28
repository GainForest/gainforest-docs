"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/docs/logo-mark";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NAV_SPRING } from "@/lib/motion";

/**
 * The current page's tint. One element with a shared `layoutId`, so moving
 * to another page slides the pill from the old row to the new one instead of
 * one row switching off and another switching on: the reader sees where they
 * went (spatial consistency). The rows themselves drop their own active fill
 * (`data-active:bg-transparent`) so the pill is the only one drawn.
 */
function ActivePill({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.span
      aria-hidden
      layoutId="nav-active"
      transition={NAV_SPRING}
      className="absolute inset-0 -z-10 rounded-full bg-sidebar-primary/14"
    />
  );
}

const PILL_HOST = "relative isolate overflow-visible data-active:bg-transparent [&>span:last-child]:min-w-0";

type Group = { name: ReactNode; key: string; nodes: PageTree.Node[] };

/**
 * The page tree split at its separators. Each separator becomes a group whose
 * name is a heading for the links under it, set in sentence case at body size
 * rather than as a tracked-caps eyebrow (AGENTS.md §11).
 */
function groups(tree: PageTree.Root): Group[] {
  const out: Group[] = [{ name: null, key: "root", nodes: [] }];
  for (const node of tree.children) {
    if (node.type === "separator") {
      out.push({ name: node.name, key: node.$id ?? String(out.length), nodes: [] });
    } else {
      out[out.length - 1]?.nodes.push(node);
    }
  }
  return out.filter((g) => g.nodes.length > 0);
}

function contains(node: PageTree.Node, pathname: string): boolean {
  if (node.type === "page") return node.url === pathname;
  if (node.type === "folder") {
    return node.index?.url === pathname || node.children.some((c) => contains(c, pathname));
  }
  return false;
}

export function DocsSidebar({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas" aria-label="Documentation">
      <SidebarHeader>
        <Link href="/" className="flex h-12 items-center gap-2 rounded-full p-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <LogoMark className="size-5" />
          </span>
          <span className="grid leading-tight">
            <span className="text-sm font-semibold">GainForest</span>
            <span className="text-xs text-muted-foreground">Documentation</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 pb-6">
        {groups(tree).map((group) => (
          <SidebarGroup key={group.key}>
            {group.name ? (
              <h2 className="px-2 pt-2 pb-1 text-sm font-medium text-foreground">{group.name}</h2>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.nodes.map((node) => (
                  <NavNode key={node.$id ?? node.name?.toString()} node={node} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function NavNode({ node, pathname }: { node: PageTree.Node; pathname: string }) {
  if (node.type === "separator") return null;

  if (node.type === "page") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={node.url === pathname} className={PILL_HOST}>
          <Link href={node.url}>
            <ActivePill show={node.url === pathname} />
            {node.icon}
            <span>{node.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const open = contains(node, pathname);
  const href = node.index?.url;
  return (
    <Collapsible asChild defaultOpen={open} className="group/folder">
      <SidebarMenuItem>
        <div className="flex items-center">
          <SidebarMenuButton asChild={Boolean(href)} isActive={href === pathname} className={`flex-1 ${PILL_HOST}`}>
            {href ? (
              <Link href={href}>
                <ActivePill show={href === pathname} />
                {node.icon}
                <span>{node.name}</span>
              </Link>
            ) : (
              <span>
                {node.icon}
                <span>{node.name}</span>
              </span>
            )}
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className="size-8 shrink-0 justify-center p-0"
              aria-label={`Show pages in ${typeof node.name === "string" ? node.name : "this section"}`}
            >
              <ChevronRight
                aria-hidden
                className="transition-transform duration-150 group-data-[state=open]/folder:rotate-90"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="folder-content">
          <SidebarMenuSub>
            {node.children.map((child) =>
              child.type === "page" ? (
                <SidebarMenuSubItem key={child.url}>
                  <SidebarMenuSubButton asChild isActive={child.url === pathname} className={PILL_HOST}>
                    <Link href={child.url}>
                      <ActivePill show={child.url === pathname} />
                      <span>{child.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : child.type === "folder" ? (
                <SubFolder key={child.$id ?? child.name?.toString()} node={child} pathname={pathname} />
              ) : null,
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

/** A folder inside a folder: its index is a link, its pages indent once more. */
function SubFolder({ node, pathname }: { node: PageTree.Folder; pathname: string }) {
  return (
    <>
      {node.index ? (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={node.index.url === pathname} className={PILL_HOST}>
            <Link href={node.index.url}>
              <ActivePill show={node.index.url === pathname} />
              <span>{node.name}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ) : null}
      {node.children.map((child) =>
        child.type === "page" ? (
          <SidebarMenuSubItem key={child.url} className="ps-3">
            <SidebarMenuSubButton asChild isActive={child.url === pathname} className={PILL_HOST}>
              <Link href={child.url}>
                <ActivePill show={child.url === pathname} />
                <span>{child.name}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ) : null,
      )}
    </>
  );
}

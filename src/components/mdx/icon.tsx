import { createElement } from "react";
import {
  Binoculars,
  BookHeart,
  Bot,
  Building2,
  Camera,
  ChartSpline,
  Earth,
  FileArchive,
  FileSignature,
  FileText,
  FolderTree,
  GitFork,
  Hand,
  HandCoins,
  HandHeart,
  Heart,
  Link,
  LockOpen,
  Mic,
  Newspaper,
  Presentation,
  Sparkles,
  Sprout,
  SquarePen,
  SquarePlus,
  Target,
  TreeDeciduous,
  Upload,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * GitBook pages name Font Awesome icons (`icon: seedling` in frontmatter,
 * `<i class="fa-tree">` inline). The content keeps those names so a writer
 * never has to learn two vocabularies; this map is the one place they become
 * Lucide. An unmapped name renders the neutral page glyph, never nothing.
 */
const ICONS: Record<string, LucideIcon> = {
  binoculars: Binoculars,
  "book-heart": BookHeart,
  "building-flag": Building2,
  "bullseye-arrow": Target,
  camera: Camera,
  "earth-americas": Earth,
  "file-archive": FileArchive,
  "file-signature": FileSignature,
  "folder-tree": FolderTree,
  github: GitFork,
  "hand-holding-circle-dollar": HandCoins,
  "hand-holding-heart": HandHeart,
  "hand-holding-seedling": Sprout,
  "hand-wave": Hand,
  "hands-holding-dollar": HandCoins,
  heart: Heart,
  instagram: Camera,
  link: Link,
  "lock-open": LockOpen,
  "magnifying-glass-chart": ChartSpline,
  "microphone-lines": Mic,
  newspaper: Newspaper,
  "pen-to-square": SquarePen,
  "people-group": Users,
  "rectangle-plus": SquarePlus,
  robot: Bot,
  "screen-users": Presentation,
  seedling: Sprout,
  sparkles: Sparkles,
  tree: TreeDeciduous,
  upload: Upload,
  "users-between-lines": UsersRound,
  wallet: Wallet,
};

export function iconFor(name: string | undefined): LucideIcon {
  return (name ? ICONS[name] : undefined) ?? FileText;
}

export function DocIcon({ name, className }: { name: string; className?: string }) {
  // createElement, not JSX: the component is a lookup in a static table, not
  // one created during render, which is what the JSX form reads as.
  return createElement(iconFor(name), {
    "aria-hidden": true,
    className: cn("size-4 shrink-0", className),
  });
}

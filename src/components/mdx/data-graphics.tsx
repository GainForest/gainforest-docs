import {
  AudioLines,
  Binoculars,
  Check,
  Eye,
  EyeOff,
  FileBadge,
  Folder,
  HandCoins,
  Heart,
  KeyRound,
  LayoutGrid,
  Mail,
  Map as MapIcon,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Drawings for the "Your data" page. Each restates one section as a picture,
 * so a reader who only skims still leaves with the right idea. Server-only:
 * they are diagrams, not controls.
 *
 * Frame: an L2 surface, rounded-xl (24) with p-2 (8), so nodes inside are
 * rounded-md (16). Nodes step down to L1 (the page) so they read as cut-outs.
 * Connectors are 2px rules in the accent at low strength, aria-hidden.
 */

function Frame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-6 flex flex-col gap-2">
      <div className="rounded-xl bg-card p-2">{children}</div>
      <figcaption className="text-center text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function Rail({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bg-primary/30", className)} />;
}

/* 1. One account, many apps ------------------------------------------------ */

const APPS: readonly { name: string; logo: string; width: number; height: number; text: string }[] = [
  { name: "GainForest", logo: "/decor/gainforest-logo.svg", width: 22, height: 22, text: "Sightings, Projects, and Bumicerts" },
  { name: "Ma Earth", logo: "/assets/logos/ma-earth.png", width: 100, height: 20, text: "Funding rounds for communities" },
  { name: "Hypercerts", logo: "/assets/logos/hypercerts.png", width: 104, height: 22, text: "Records of good work" },
];

export function AccountHub() {
  return (
    <Frame caption="One account, many apps. Each app opens the same account.">
      <div className="flex flex-col items-center p-4">
        <div className="flex w-full max-w-60 flex-col items-center gap-1 rounded-md bg-background p-4 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-status-ok-bg text-primary">
            <Folder aria-hidden className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">Your account</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <KeyRound aria-hidden className="size-3.5" /> Held by Certified, not GainForest
          </span>
        </div>
        <Rail className="h-5 w-0.5" />
        <Rail className="hidden h-0.5 w-[calc(75%+0.375rem)] sm:block" />
        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-4">
          {APPS.map((app) => (
            <li key={app.name} className="flex flex-col items-center">
              <Rail className="hidden h-5 w-0.5 sm:block" />
              <div className="flex w-full flex-1 flex-col items-center gap-2 rounded-md bg-background p-4 text-center">
                <span className="flex h-6 items-center gap-1.5">
                  <Image
                    src={app.logo}
                    alt={app.name === "GainForest" ? "" : app.name}
                    width={app.width}
                    height={app.height}
                    className={cn("h-auto object-contain", app.name !== "GainForest" && "mix-blend-multiply dark:mix-blend-screen dark:invert")}
                  />
                  {app.name === "GainForest" ? <span className="text-sm font-medium text-foreground">GainForest</span> : null}
                </span>
                <span className="text-xs text-muted-foreground">{app.text}</span>
              </div>
            </li>
          ))}
          <li className="flex flex-col items-center">
            <Rail className="hidden h-5 w-0.5 sm:block" />
            <div className="flex w-full flex-1 flex-col items-center gap-2 rounded-md bg-muted p-4 text-center">
              <LayoutGrid aria-hidden className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Other apps on the same network</span>
            </div>
          </li>
        </ul>
      </div>
    </Frame>
  );
}

/* 2. Public and private ---------------------------------------------------- */

const PUBLIC: readonly [LucideIcon, string][] = [
  [User, "Your name, picture, and bio"],
  [Binoculars, "Sightings and photos"],
  [AudioLines, "Sound recordings"],
  [MapIcon, "Sites and maps"],
  [FileBadge, "Projects and Bumicerts"],
  [Heart, "Posts, likes, and follows"],
  [Users, "Organizations you belong to"],
  [HandCoins, "Donations"],
];

const PRIVATE: readonly [LucideIcon, string][] = [
  [Mail, "Your email address"],
  [ShieldCheck, "Your sign-in codes"],
  [KeyRound, "Your password, if you set one"],
];

function ItemList({ items, tone }: { items: readonly [LucideIcon, string][]; tone: "public" | "private" }) {
  return (
    <ul className={cn("grid gap-1", tone === "public" && "sm:grid-cols-2")}>
      {items.map(([Icon, label]) => (
        <li key={label} className="flex items-center gap-2 rounded-xs bg-background px-3 py-2 text-sm text-foreground">
          <Icon aria-hidden className={cn("size-4 shrink-0", tone === "public" ? "text-primary" : "text-muted-foreground")} />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function PublicPrivate() {
  return (
    <Frame caption="Almost everything is public. Only what you use to sign in stays private.">
      <div className="grid gap-2 sm:grid-cols-[1.6fr_1fr]">
        <section className="flex flex-col gap-2 rounded-md bg-status-ok-bg p-2">
          <h3 className="flex items-center gap-2 px-2 pt-2 text-sm font-medium text-foreground">
            <Eye aria-hidden className="size-4 text-primary" /> Public: anyone can see
          </h3>
          <ItemList items={PUBLIC} tone="public" />
        </section>
        <section className="flex flex-col gap-2 rounded-md bg-muted p-2">
          <h3 className="flex items-center gap-2 px-2 pt-2 text-sm font-medium text-foreground">
            <EyeOff aria-hidden className="size-4 text-muted-foreground" /> Private: only for signing in
          </h3>
          <ItemList items={PRIVATE} tone="private" />
        </section>
      </div>
    </Frame>
  );
}

/* 3. How data is used ------------------------------------------------------ */

const USED = [
  "Show your work on maps, profiles, and Projects",
  "Connect it to organizations, BioBlitz, and funding",
  "Let you sign in and keep the service safe",
];
const NEVER = ["Sell your data", "Show you ads", "Follow you on other websites"];

function UseColumn({ title, items, yes }: { title: string; items: string[]; yes: boolean }) {
  return (
    <section className="flex flex-col gap-2 rounded-md bg-background p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                yes ? "bg-status-ok-bg text-status-ok" : "bg-status-bad-bg text-status-bad",
              )}
            >
              {yes ? <Check aria-hidden className="size-3" /> : <X aria-hidden className="size-3" />}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DataUse() {
  return (
    <Frame caption="Your data is used to run the app, and for nothing else.">
      <div className="grid gap-2 sm:grid-cols-2">
        <UseColumn title="What it is used for" items={USED} yes />
        <UseColumn title="What it is never used for" items={NEVER} yes={false} />
      </div>
    </Frame>
  );
}

/* 4. Removing data: a flowchart -------------------------------------------- */

function Node({ children, tone = "page" }: { children: ReactNode; tone?: "page" | "start" | "end" }) {
  return (
    <div
      className={cn(
        "w-full rounded-md p-3 text-center text-sm",
        tone === "start" && "bg-status-ok-bg font-medium text-foreground",
        tone === "page" && "bg-background text-foreground",
        tone === "end" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

function Branch({ title, icon: Icon, steps, end }: { title: string; icon: LucideIcon; steps: ReactNode[]; end: string }) {
  return (
    <li className="flex flex-col items-center">
      <Rail className="h-4 w-0.5" />
      <div className="flex w-full items-center justify-center gap-2 rounded-md bg-background p-3 text-sm font-medium text-foreground">
        <Icon aria-hidden className="size-4 text-primary" /> {title}
      </div>
      <ol className="flex w-full flex-col items-center">
        {steps.map((step, i) => (
          <li key={i} className="flex w-full flex-col items-center">
            <Rail className="h-4 w-0.5" />
            <Node>
              <span className="me-1 text-muted-foreground">{i + 1}.</span>
              {step}
            </Node>
          </li>
        ))}
      </ol>
      <Rail className="h-4 w-0.5" />
      <Node tone="end">{end}</Node>
    </li>
  );
}

export function RemoveFlow() {
  return (
    <Frame caption="Two ways to remove your data, depending on how much you want to remove.">
      <div className="flex flex-col items-center p-4">
        <div className="w-full max-w-72">
          <Node tone="start">What do you want to remove?</Node>
        </div>
        <Rail className="h-4 w-0.5" />
        <Rail className="hidden h-0.5 w-[calc(50%+0.5rem)] sm:block" />
        <ul className="grid w-full gap-4 sm:grid-cols-2">
          <Branch
            title="One post"
            icon={Trash2}
            steps={["Sign in at gainforest.app", "Open the sighting, Project, or post", "Delete it from its page"]}
            end="Only that post is removed"
          />
          <Branch
            title="Your whole account"
            icon={Mail}
            steps={[
              "Email support@hypercerts.org",
              "Send it from the address you sign in with",
              "The Certified team confirms and deletes it",
            ]}
            end="Everything in the account is removed. This cannot be undone."
          />
        </ul>
      </div>
    </Frame>
  );
}

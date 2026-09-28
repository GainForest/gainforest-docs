"use client";

import { Check, Minus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { parseAsArrayOf, parseAsStringLiteral, useQueryState } from "nuqs";

import { CHIP } from "@/lib/chip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pick one role, or two to compare. Capabilities are exactly the ones the
 * User Permissions page states, nothing inferred beyond it. The selection
 * lives in the URL so "here is what Admins can do" is a link.
 */
type Role = "owner" | "admin" | "member";
const ROLES: readonly Role[] = ["owner", "admin", "member"];
const ROLE_LABEL: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member" };
const ROLE_NOTE: Record<Role, string> = {
  owner: "For the people responsible for the organization account. Keep this to a few.",
  admin: "For trusted team members who run Projects and day-to-day activity.",
  member: "For people connected to the organization who do not need management access.",
};

const CAPS: readonly { label: string; roles: readonly Role[] }[] = [
  { label: "Make high-level changes to the organization", roles: ["owner"] },
  { label: "Change members' roles", roles: ["owner"] },
  { label: "Invite or remove members", roles: ["owner"] },
  { label: "Manage regular members", roles: ["owner", "admin"] },
  { label: "Manage Projects, updates, and evidence", roles: ["owner", "admin"] },
  { label: "Belong to the organization and contribute where allowed", roles: ["owner", "admin", "member"] },
];

export function RoleExplorer() {
  const [picked, setPicked] = useQueryState(
    "roles",
    parseAsArrayOf(parseAsStringLiteral(ROLES)).withDefault(["admin"]),
  );
  const roles = ROLES.filter((r) => picked.includes(r));

  return (
    <div className="not-prose my-6 flex flex-col gap-2 rounded-xl bg-card p-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-2 pt-1">
        <span className="text-sm font-medium">Pick a role, or two to compare</span>
        <ToggleGroup
          type="multiple"
          value={roles}
          onValueChange={(v) => {
            const next = ROLES.filter((r) => v.includes(r)).slice(-2);
            void setPicked(next.length ? next : null);
          }}
          aria-label="Roles"
          className="gap-1"
        >
          {ROLES.map((r) => (
            <ToggleGroupItem key={r} value={r} size="sm" className={CHIP}>
              {ROLE_LABEL[r]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-1 rounded-lg bg-muted p-1" role="table" aria-label="What each role can do">
        <div role="row" className="grid grid-cols-[1fr_auto] gap-1 px-3 py-2">
          <span role="columnheader" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Can
          </span>
          <span className="flex gap-1">
            {roles.map((r) => (
              <span role="columnheader" key={r} className="w-16 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {ROLE_LABEL[r]}
              </span>
            ))}
          </span>
        </div>
        {CAPS.map((cap) => (
          <div role="row" key={cap.label} className="grid grid-cols-[1fr_auto] items-center gap-1 rounded-md bg-card px-3 py-2">
            <span role="cell" className="text-sm">
              {cap.label}
            </span>
            <span className="flex gap-1">
              {roles.map((r) => {
                const yes = cap.roles.includes(r);
                return (
                  <span role="cell" key={r} className="flex w-16 justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={`${r}-${yes}`}
                        initial={{ opacity: 0, transform: "scale(0.6)" }}
                        animate={{ opacity: 1, transform: "scale(1)" }}
                        exit={{ opacity: 0, transform: "scale(0.6)" }}
                        transition={{ duration: 0.18, ease: EASE_OUT }}
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full",
                          yes ? "bg-status-ok-bg text-status-ok" : "bg-status-idle-bg text-status-idle",
                        )}
                      >
                        {yes ? <Check aria-hidden className="size-3.5" /> : <Minus aria-hidden className="size-3.5" />}
                        <span className="sr-only">{yes ? "Yes" : "No"}</span>
                      </motion.span>
                    </AnimatePresence>
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {roles.map((r) => (
          <motion.p
            key={r}
            layout
            initial={{ opacity: 0, transform: "translateY(4px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="px-2 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">{ROLE_LABEL[r]}:</span> {ROLE_NOTE[r]}
          </motion.p>
        ))}
      </AnimatePresence>
      <p className="px-2 pb-1 text-xs text-muted-foreground">
        Data Council membership is separate from these roles: any member can also sit on it.
      </p>
    </div>
  );
}

import type { ReactNode } from "react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/**
 * What a panel shows when it has nothing to show.
 *
 * Four distinct empty states exist in this admin and they are not
 * interchangeable, so each names itself:
 *
 *   - nothing has happened yet        -> "No batches yet"
 *   - nothing matched the current view -> "No accounts match that search"
 *   - the source could not be read     -> <UnavailableState>
 *   - this panel is not configured     -> <UnavailableState>
 *
 * "No data" covers none of them, and a reader cannot tell which one they are
 * looking at. AGENTS.md §5: unknown is a real value, and a raw failure is
 * never rendered.
 */
export function EmptyState({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** A recovery, when there is one. Omit rather than invent. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn("rounded-sm py-10", className)}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {children}
    </Empty>
  );
}

/**
 * The panel could not read its source.
 *
 * This is not an error boundary and deliberately not styled like one: the
 * route still works, one figure is missing, and the rest of the page should
 * not be shouting. It names the panel, says what is missing, and repeats what
 * the reader can still trust.
 *
 * `role="status"` rather than `alert`: on first paint this is not an
 * interruption, it is a fact about the page.
 */
export function UnavailableState({
  what,
  className,
}: {
  /** The noun that could not be read, lower case: "the Tainá roster". */
  what: string;
  className?: string;
}) {
  return (
    <p
      role="status"
      className={cn(
        "bg-status-warn-bg text-status-warn rounded-sm px-3 py-2 text-sm",
        className,
      )}
    >
      {what.charAt(0).toLocaleUpperCase()}
      {what.slice(1)} could not be read. Everything else on this page is
      current.
    </p>
  );
}

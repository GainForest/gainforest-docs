import { Children, cloneElement, isValidElement, type ReactNode } from "react";

import { ChecklistItem, ChecklistProgress } from "@/components/interactive/checklist-client";

/**
 * A list the reader can tick off, remembered in this browser.
 *
 *   <Checklist id="rewilding-before-you-apply" title="Before you apply">
 *     <Check>a short description of your community</Check>
 *   </Checklist>
 *
 * The server numbers the items, so the MDX carries no indexes to keep in
 * order; renaming or reordering items is safe, adding one in the middle
 * shifts later ticks by one, which is acceptable for a personal list.
 */
export function Checklist({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const items = Children.toArray(children).filter((c) => isValidElement<{ list?: string; index?: number }>(c));
  return (
    <section aria-label={title} className="not-prose my-6 flex flex-col gap-2 rounded-xl bg-card p-2">
      <ChecklistProgress list={id} title={title} total={items.length} />
      <ul className="flex flex-col gap-1">
        {items.map((item, index) =>
          isValidElement<{ list?: string; index?: number }>(item) ? cloneElement(item, { list: id, index }) : null,
        )}
      </ul>
    </section>
  );
}

export function Check({ children, list = "", index = 0 }: { children: ReactNode; list?: string; index?: number }) {
  return (
    <ChecklistItem list={list} index={index}>
      {children}
    </ChecklistItem>
  );
}

import type { ReactNode } from "react";

import { SectionHeading } from "@/components/home/section-heading";

/**
 * A pair of live blocks side by side: whatever is happening on GainForest
 * right now (the BioBlitz round, the latest field recordings). The blocks
 * bring their own data and their own failure copy; this only lays them out.
 */
export function Live({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <SectionHeading id={id} title={title}>
        {description}
      </SectionHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:my-0 md:[&>*]:h-full md:[&>*]:justify-between">{children}</div>
    </section>
  );
}

import { ArrowUpRight, Globe2 } from "lucide-react";

import { GlobeCanvas } from "@/components/interactive/globe-canvas";
import { globeOrganizations } from "@/lib/upstream/globe";

/**
 * A live look at the Globe: every organization that has declared a location
 * on GainForest, on the same dotted Earth the admin draws. The roster is
 * read at build time and refreshed daily; if it cannot be read, the block
 * says so and still links to the real Globe.
 */
export async function GlobePreview() {
  const orgs = await globeOrganizations();
  return (
    <figure className="not-prose my-6 flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-xl bg-card">
        {orgs && orgs.length > 0 ? (
          <GlobeCanvas orgs={orgs} />
        ) : (
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Globe2 aria-hidden className="size-6" />
            The live preview is unavailable right now.
          </div>
        )}
        <a
          href="https://www.gainforest.app/en/globe"
          target="_blank"
          rel="noreferrer"
          className="lift absolute end-3 bottom-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Open the Globe <ArrowUpRight aria-hidden className="lift-arrow lift-arrow-out size-4" />
        </a>
      </div>
      <figcaption className="text-center text-sm text-muted-foreground tabular">
        {orgs ? `${orgs.length} organizations with a location on GainForest. Drag to turn it.` : "Organizations on GainForest."}
      </figcaption>
    </figure>
  );
}

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { HeroGlobe } from "@/components/home/hero-globe";
import { HeroTitle } from "@/components/home/hero-title";
import { IntentRoller, type Intent } from "@/components/home/intent-roller";
import { OrgCount } from "@/components/home/org-count";
import { OrgMarquee } from "@/components/home/org-marquee";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { globeOrganizations, type GlobeOrg } from "@/lib/upstream/globe";

/** Test and placeholder accounts in the public roster are not shown off. */
const PLACEHOLDER = /\b(test|demo|delete|sample|example)\b/i;
const ROSTER_SIZE = 36;

/**
 * A readable slice of the roster for the strip: real names only, one per
 * name, spread evenly through the list so it is not just the newest ones.
 */
function rosterFrom(orgs: GlobeOrg[]): GlobeOrg[] {
  const seen = new Set<string>();
  const named = orgs.filter((o) => {
    const key = o.name.trim().toLowerCase();
    if (o.name === "An organization" || PLACEHOLDER.test(o.name) || o.name.length > 40 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const step = Math.max(1, named.length / ROSTER_SIZE);
  return Array.from({ length: Math.min(ROSTER_SIZE, named.length) }, (_, i) => named[Math.floor(i * step)]).filter(
    (o): o is GlobeOrg => o !== undefined,
  );
}

/**
 * The welcome page's first screen: the headline, what this site is, the
 * "I want to" line, and the live globe of every organization on GainForest,
 * with a strip of their names beneath that steers it. The roster is read at
 * build time and refreshed daily; if it cannot be read the globe says so and
 * the rest of the hero stands on its own.
 */
export async function Hero({
  title,
  accent,
  intents,
  children,
}: {
  title: string;
  accent?: string;
  intents: Intent[];
  children: ReactNode;
}) {
  const orgs = await globeOrganizations();
  const roster = orgs ? rosterFrom(orgs) : [];

  return (
    <section aria-labelledby="welcome-title" className="hero-enter flex flex-col gap-10">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
        <div className="flex flex-col gap-6">
          <HeroTitle id="welcome-title" text={title} accent={accent} />
          <div className="flex max-w-xl flex-col gap-3 text-lg text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
            {children}
          </div>
          <div>
            <IntentRoller intents={intents} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button asChild size="lg">
              <a href={site.app} target="_blank" rel="noreferrer" className="lift" data-pressable>
                Open GainForest.app
                <ArrowUpRight aria-hidden data-icon="inline-end" className="lift-arrow lift-arrow-out" />
              </a>
            </Button>
            {orgs ? <OrgCount count={orgs.length} /> : null}
          </div>
        </div>
        <HeroGlobe orgs={orgs} />
      </div>
      {roster.length > 0 ? <OrgMarquee orgs={roster} /> : null}
    </section>
  );
}

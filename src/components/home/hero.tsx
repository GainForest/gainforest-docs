import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/home/count-up";
import { FieldWall } from "@/components/home/field-wall";
import { HeroTitle } from "@/components/home/hero-title";
import { IntentRoller, type Intent } from "@/components/home/intent-roller";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { fieldRecord } from "@/lib/upstream/field-record";

/**
 * The welcome page's first screen: the headline, what this site is, the
 * "I want to" line, and what communities have actually recorded with these
 * tools: the latest BioBlitz best pictures and the running totals. All of it is read from GainForest's
 * public indexer at build time and refreshed daily; if it cannot be read
 * the copy stands on its own and no figure is shown.
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
  const record = await fieldRecord();
  const figures = record
    ? [
        { value: record.observations, label: "observations" },
        { value: record.recordings, label: "sound recordings" },
        { value: record.sites, label: "mapped sites" },
        { value: record.contributors, label: "contributors" },
      ]
    : [];

  return (
    <section aria-labelledby="welcome-title" className="hero-enter hero-fill flex flex-col justify-center">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-6">
          <HeroTitle id="welcome-title" text={title} accent={accent} />
          <div className="flex max-w-xl flex-col gap-3 text-lg text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
            {children}
          </div>
          <div>
            <IntentRoller intents={intents} />
          </div>
          <div>
            <Button asChild size="lg">
              <a href={site.app} target="_blank" rel="noreferrer" className="lift" data-pressable>
                Open GainForest.app
                <ArrowUpRight aria-hidden data-icon="inline-end" className="lift-arrow lift-arrow-out" />
              </a>
            </Button>
          </div>
          {figures.length > 0 ? (
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {figures.map((f, i) => (
                <div key={f.label} className="flex flex-col">
                  <dt className="order-2 text-sm text-muted-foreground">{f.label}</dt>
                  <dd className="order-1 text-2xl font-semibold tracking-tight">
                    <CountUp value={f.value} delay={0.5 + i * 0.12} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {record && record.sightings.length > 0 ? <FieldWall sightings={record.sightings} /> : null}
      </div>
    </section>
  );
}

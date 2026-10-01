import { z } from "zod";


/**
 * What communities have recorded on GainForest: totals (from the public
 * indexer), and the best pictures
 * of the latest BioBlitz rounds (GainForest.app's own winners list, the one
 * its BioBlitz page shows). Read at build time and refreshed daily. Every number shown on the welcome page comes from here; if the
 * indexer cannot be read the hero shows no figures rather than old ones.
 */
const INDEXER = "https://api-hi.gainforest.app/graphql";
const OCCURRENCE = "app.gainforest.dwc.occurrence";
const AUDIO = "app.gainforest.ac.audio";
const SITE = "app.certified.location";

const QUERY = `query {
  stats: collectionStats(collections: ["${OCCURRENCE}", "${AUDIO}", "${SITE}"]) { collection count }
  series: collectionTimeSeries(collection: "${OCCURRENCE}") { uniqueUsers }
}`;

const ResponseSchema = z.object({
  data: z.object({
    stats: z.array(z.object({ collection: z.string(), count: z.number() })),
    series: z.object({ uniqueUsers: z.number() }),
  }),
});
/** Best picture of every finished round, newest first. */
const WINNERS = "https://www.gainforest.app/api/bioblitz/winning-entries";
const WinnersSchema = z.object({
  entries: z.array(
    z.object({
      round: z.object({ id: z.number(), label: z.string() }),
      record: z.object({
        id: z.string(),
        did: z.string(),
        scientificName: z.string().nullable(),
        vernacularName: z.string().nullable(),
        kingdom: z.string().nullable(),
        eventDate: z.string().nullable(),
        creatorName: z.string().nullable(),
        imageRef: z.string().nullable(),
      }),
      final: z.boolean().optional(),
    }),
  ),
});

const PlcSchema = z.object({ service: z.array(z.object({ id: z.string(), serviceEndpoint: z.string() })) });

export type Sighting = {
  id: string;
  imageUrl: string;
  round: string;
  scientificName: string;
  commonName: string | null;
  kingdom: string | null;
  date: string | null;
  by: string | null;
};

export type FieldRecord = {
  observations: number;
  recordings: number;
  sites: number;
  contributors: number;
  sightings: Sighting[];
};

const SIGHTINGS = 10;

async function pdsFor(did: string): Promise<string | null> {
  if (!did.startsWith("did:plc:")) return null;
  try {
    const res = await fetch(`https://plc.directory/${did}`, { next: { revalidate: 86_400 } });
    if (!res.ok) return null;
    const parsed = PlcSchema.safeParse(await res.json());
    return parsed.success ? (parsed.data.service.find((s) => s.id === "#atproto_pds")?.serviceEndpoint ?? null) : null;
  } catch {
    return null;
  }
}

/** Hyperindex sometimes serialises a ref as "map[$link:bafy…]"; take the CID either way (as GainForest.app does). */
function cidOf(ref: string): string | null {
  if (ref.startsWith("b") || ref.startsWith("Q")) return ref;
  return /\$link:([a-zA-Z0-9]+)/.exec(ref)?.[1] ?? null;
}

async function bestPictures(): Promise<Sighting[]> {
  try {
    const res = await fetch(WINNERS, { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return [];
    const parsed = WinnersSchema.safeParse(await res.json());
    if (!parsed.success) return [];
    const picks = parsed.data.entries
      .flatMap((e) => {
        const cid = e.record.imageRef ? cidOf(e.record.imageRef) : null;
        return cid ? [{ ...e, cid }] : [];
      })
      .slice(0, SIGHTINGS);
    const hosts = new Map<string, string | null>();
    for (const did of new Set(picks.map((p) => p.record.did))) hosts.set(did, await pdsFor(did));
    return picks.flatMap((p): Sighting[] => {
      const pds = hosts.get(p.record.did);
      if (!pds) return [];
      const r = p.record;
      return [
        {
          id: r.id,
          imageUrl: `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(r.did)}&cid=${encodeURIComponent(p.cid)}`,
          round: p.round.label,
          scientificName: r.scientificName ?? r.vernacularName ?? "Unidentified",
          commonName: r.vernacularName,
          kingdom: r.kingdom,
          date: r.eventDate,
          by: r.creatorName,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function fieldRecord(): Promise<FieldRecord | null> {
  try {
    const [res, sightings] = await Promise.all([
      fetch(INDEXER, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: QUERY }),
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(20_000),
      }),
      bestPictures(),
    ]);
    if (!res.ok) return null;
    const parsed = ResponseSchema.safeParse(await res.json());
    if (!parsed.success) return null;
    const { stats, series } = parsed.data.data;
    const count = (c: string) => stats.find((s) => s.collection === c)?.count ?? 0;

    return {
      observations: count(OCCURRENCE),
      recordings: count(AUDIO),
      sites: count(SITE),
      contributors: series.uniqueUsers,
      sightings,
    };
  } catch {
    return null;
  }
}

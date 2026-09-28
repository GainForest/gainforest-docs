import { z } from "zod";

/**
 * Organizations on the GainForest Globe, read from GainForest.app's public
 * roster at build time and refreshed daily. The endpoint sends no CORS
 * header, so it is read on the server and the page ships a snapshot.
 * Parsed, not trusted: a changed shape fails here, not in the scene.
 */
const OrgSchema = z.object({
  did: z.string(),
  name: z.string().nullable(),
  country: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
});
const PayloadSchema = z.object({ organizations: z.array(OrgSchema) });

export type GlobeOrg = { did: string; name: string; lat: number; lon: number };

export async function globeOrganizations(): Promise<GlobeOrg[] | null> {
  try {
    const res = await fetch("https://www.gainforest.app/api/globe/organizations", {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const parsed = PayloadSchema.safeParse(await res.json());
    if (!parsed.success) return null;
    return parsed.data.organizations.flatMap((o) =>
      o.lat === null || o.lon === null ? [] : [{ did: o.did, name: o.name ?? "An organization", lat: o.lat, lon: o.lon }],
    );
  } catch {
    return null;
  }
}

import { z } from "zod";

/**
 * Recent AudioMoth recordings published on GainForest, read from the public
 * indexer at build time and refreshed daily. Each recording's audio and
 * spectrogram are blobs on the uploader's PDS, which serves them with open
 * CORS, so the browser plays them directly.
 */
const INDEXER = "https://api-hi.gainforest.app/graphql";
const QUERY = `query { appGainforestAcAudio(first: 12, where: { blob: { isNull: false }, spectrogram: { isNull: false } }, sortBy: createdAt, sortDirection: DESC) {
  edges { node { did rkey name blob { file { ref } } spectrogram { file { ref } } metadata { recordedAt duration sampleRate } } } } }`;

const NodeSchema = z.object({
  did: z.string(),
  rkey: z.string(),
  name: z.string().nullable(),
  blob: z.object({ file: z.object({ ref: z.string() }) }),
  spectrogram: z.object({ file: z.object({ ref: z.string() }) }).nullable(),
  metadata: z
    .object({ recordedAt: z.string().nullable(), duration: z.string().nullable(), sampleRate: z.number().nullable() })
    .nullable(),
});
const ResponseSchema = z.object({
  data: z.object({ appGainforestAcAudio: z.object({ edges: z.array(z.object({ node: NodeSchema })) }) }),
});
const PlcSchema = z.object({
  service: z.array(z.object({ id: z.string(), serviceEndpoint: z.string() })),
});

export type Recording = {
  id: string;
  audioUrl: string;
  spectrogramUrl: string;
  recordedAt: string | null;
  durationS: number | null;
  sampleRate: number | null;
};

async function pdsFor(did: string): Promise<string | null> {
  if (!did.startsWith("did:plc:")) return null;
  const res = await fetch(`https://plc.directory/${did}`, { next: { revalidate: 86_400 } });
  if (!res.ok) return null;
  const parsed = PlcSchema.safeParse(await res.json());
  return parsed.success ? (parsed.data.service.find((s) => s.id === "#atproto_pds")?.serviceEndpoint ?? null) : null;
}

export async function recentRecordings(): Promise<Recording[] | null> {
  try {
    const res = await fetch(INDEXER, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const parsed = ResponseSchema.safeParse(await res.json());
    if (!parsed.success) return null;
    const nodes = parsed.data.data.appGainforestAcAudio.edges.map((e) => e.node);
    const hosts = new Map<string, string | null>();
    for (const did of new Set(nodes.map((n) => n.did))) hosts.set(did, await pdsFor(did));
    return nodes.flatMap((n) => {
      const pds = hosts.get(n.did);
      if (!pds || !n.spectrogram) return [];
      const blob = (cid: string) => `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(n.did)}&cid=${cid}`;
      const duration = Number(n.metadata?.duration);
      return [
        {
          id: `${n.did}/${n.rkey}`,
          audioUrl: blob(n.blob.file.ref),
          spectrogramUrl: blob(n.spectrogram.file.ref),
          recordedAt: n.metadata?.recordedAt ?? null,
          durationS: Number.isFinite(duration) ? duration : null,
          sampleRate: n.metadata?.sampleRate ?? null,
        },
      ];
    });
  } catch {
    return null;
  }
}

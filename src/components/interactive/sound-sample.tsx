import { SoundPlayer } from "@/components/interactive/sound-player";
import { globeOrganizations } from "@/lib/upstream/globe";
import { recentRecordings } from "@/lib/upstream/recordings";

/**
 * Real AudioMoth recordings published on GainForest, newest first, with the
 * name of the organization that recorded them. Read at build time and
 * refreshed daily; the audio itself streams from the uploader's server.
 */
export async function SoundSample() {
  const [recs, orgs] = await Promise.allSettled([recentRecordings(), globeOrganizations()]);
  const list = recs.status === "fulfilled" ? recs.value : null;
  const names = new Map((orgs.status === "fulfilled" ? (orgs.value ?? []) : []).map((o) => [o.did, o.name]));
  if (!list || list.length === 0) {
    return (
      <p className="not-prose my-6 rounded-xl bg-card p-4 text-sm text-muted-foreground">
        Recent recordings could not be loaded right now. You can hear them on GainForest.app.
      </p>
    );
  }
  return (
    <SoundPlayer
      recordings={list.map((r) => ({ ...r, by: names.get(r.id.split("/")[0] ?? "") ?? null }))}
    />
  );
}

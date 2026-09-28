/** Provider-aware video helpers, shared by `Embed` and the calls archive. */
export type Video = { provider: "youtube" | "loom"; id: string; embed: string; thumb: string | null };

export function parseVideo(raw: string | null | undefined): Video | null {
  if (!raw) return null;
  const url = URL.parse(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^www\./, "");
  let yt: string | null = null;
  if (host === "youtu.be") yt = url.pathname.slice(1);
  else if (host === "youtube.com") yt = url.searchParams.get("v");
  if (yt) {
    return {
      provider: "youtube",
      id: yt,
      embed: `https://www.youtube-nocookie.com/embed/${yt}`,
      thumb: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }
  if (host === "loom.com") {
    const id = url.pathname.split("/").pop() ?? "";
    return { provider: "loom", id, embed: `https://www.loom.com/embed/${id}`, thumb: null };
  }
  return null;
}

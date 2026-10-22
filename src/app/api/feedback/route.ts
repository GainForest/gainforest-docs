import { z } from "zod";

import { getSupabase } from "@/lib/supabase";

/**
 * "Was this helpful?" votes. Each vote is stored in Supabase
 * (`public.docs_feedback`, see supabase/migrations). If FEEDBACK_WEBHOOK_URL
 * is also set, the vote is posted there too (Slack or Discord style JSON).
 * With neither configured, votes go to the function log.
 */
const Body = z.object({
  page: z.string().startsWith("/").max(300),
  vote: z.enum(["up", "down"]),
  comment: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const { page, vote } = parsed.data;
  const comment = parsed.data.comment || null;

  const text = `${vote === "up" ? "👍" : "👎"} docs.gainforest.earth${page}${comment ? `\n> ${comment}` : ""}`;
  const supabase = getSupabase();
  const hook = process.env.FEEDBACK_WEBHOOK_URL;

  const [stored] = await Promise.all([
    supabase
      ? supabase
          .from("docs_feedback")
          .insert({ page, vote, comment })
          .then(({ error }) => {
            if (error) console.error("[feedback] supabase insert failed:", error.message);
            return !error;
          })
      : Promise.resolve(false),
    hook
      ? fetch(hook, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, content: text }),
        }).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  if (!supabase && !hook) console.info("[feedback]", text);
  return Response.json({ ok: true, stored });
}

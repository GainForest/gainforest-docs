import { z } from "zod";

/**
 * "Was this helpful?" votes. The site is static and has no database, so a
 * vote is forwarded to a webhook (Slack, Discord, or anything that takes a
 * JSON POST) named by FEEDBACK_WEBHOOK_URL. Without it, votes are logged in
 * the function logs and the reader still gets their thank-you.
 */
const Body = z.object({
  page: z.string().max(300),
  vote: z.enum(["up", "down"]),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const { page, vote, comment } = parsed.data;
  const text = `${vote === "up" ? "👍" : "👎"} docs.gainforest.earth${page}${comment ? `\n> ${comment}` : ""}`;
  const hook = process.env.FEEDBACK_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, content: text }),
    }).catch(() => undefined);
  } else {
    console.info("[feedback]", text);
  }
  return Response.json({ ok: true });
}

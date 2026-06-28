// PLAYERMIND – שכתוב דוחות בקול מאמן ביצועים (Edge Function)
import { aiConfigured, callLLM, json } from "./_provider";
import { reportSystem } from "../../src/lib/ai/prompts";

export const config = { runtime: "edge" };

interface Body {
  kind?: "daily" | "weekly" | "monthly";
  contextText?: string;
  draftJson?: unknown;
  playerName?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") return json({ available: aiConfigured() });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!aiConfigured()) return json({ report: null, available: false });

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "bad request" }, 400); }

  const kind = body.kind || "weekly";
  const userMsg = [
    body.playerName ? `שם השחקן: ${body.playerName}.` : "",
    body.contextText ? `הקשר אישי:\n${body.contextText}` : "",
    body.draftJson ? `טיוטת דוח (JSON) לשיפור הניסוח:\n${JSON.stringify(body.draftJson)}` : "",
    "נסח את הדוח בעברית, בנימה אישית ומקצועית, ללא ציונים.",
  ].filter(Boolean).join("\n\n");

  try {
    const report = await callLLM(reportSystem(kind), [{ role: "user", content: userMsg }]);
    return json({ report, available: true });
  } catch (e) {
    return json({ report: null, available: true, error: String(e) });
  }
}

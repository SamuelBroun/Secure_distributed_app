// PLAYERMIND – סיכום יומי פרואקטיבי (Edge Function)
import { aiConfigured, callLLM, json } from "./_provider";
import { DAILY_SYSTEM } from "../../src/lib/ai/prompts";

export const config = { runtime: "edge" };

interface Body { contextText?: string; draft?: string; playerName?: string; }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") return json({ available: aiConfigured() });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!aiConfigured()) return json({ summary: null, available: false });

  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "bad request" }, 400); }

  const userMsg = [
    body.playerName ? `שם השחקן: ${body.playerName}.` : "",
    body.contextText ? `הקשר אישי:\n${body.contextText}` : "",
    body.draft ? `טיוטה ראשונית (לשיפור הניסוח):\n${body.draft}` : "",
    "כתוב סיכום יומי קצר ופרואקטיבי לפי המבנה שהוגדר.",
  ].filter(Boolean).join("\n\n");

  try {
    const summary = await callLLM(DAILY_SYSTEM, [{ role: "user", content: userMsg }]);
    return json({ summary, available: true });
  } catch (e) {
    return json({ summary: null, available: true, error: String(e) });
  }
}

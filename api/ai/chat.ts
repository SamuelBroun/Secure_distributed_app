// PLAYERMIND – נתיב צ׳אט מאמן ה-AI (Vercel Edge Function)
// זרימה: בדיקת בטיחות → בניית פרומפט מערכת + ידע + הקשר → LLM → אימות תשובה.
import { aiConfigured, callLLM, json, type ChatMsg } from "./_provider";
import { buildSystemPrompt } from "../../src/lib/ai/prompts";
import { classifyRisk, safeReferral, validateResponse } from "../../src/lib/ai/safety";

export const config = { runtime: "edge" };

interface ChatBody {
  topic?: string;
  messages?: ChatMsg[];
  contextText?: string;
  playerName?: string;
}

export default async function handler(req: Request): Promise<Response> {
  // GET – בדיקת זמינות (האם מחובר מפתח)
  if (req.method === "GET") return json({ available: aiConfigured() });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const topic = body.topic || "free";
  const messages = (body.messages || []).filter((m) => m && m.content).slice(-12);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  // 1. שכבת בטיחות – עוצרת לפני ה-LLM
  const risk = classifyRisk(lastUser?.content || "");
  if (risk.refer) {
    return json({ reply: safeReferral(risk.kind, body.playerName || ""), source: "safety" });
  }

  // 2. fallback – אין מפתח LLM
  if (!aiConfigured()) {
    return json({ reply: null, available: false, source: "fallback" });
  }

  // 3. בניית פרומפט וקריאה ל-LLM
  try {
    const system = buildSystemPrompt({ topic, contextText: body.contextText || "" });
    const reply = await callLLM(system, messages);
    return json({ reply: validateResponse(reply), source: "ai" });
  } catch (e) {
    return json({ reply: null, available: true, error: "llm_error", detail: String(e) }, 200);
  }
}

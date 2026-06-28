// PLAYERMIND – ספק LLM צד-שרת (Anthropic / OpenAI)
// המפתח נשמר אך ורק בצד השרת דרך משתני סביבה. לעולם לא בפרונט.

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

function provider(): string {
  return (process.env.AI_PROVIDER || "anthropic").toLowerCase();
}

function model(): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider() === "openai" ? "gpt-4o-mini" : "claude-3-5-sonnet-latest";
}

export async function callLLM(system: string, messages: ChatMsg[]): Promise<string> {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("AI not configured");

  if (provider() === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model(),
        max_tokens: 700,
        temperature: 0.6,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  }

  // ברירת מחדל: Anthropic
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: 700,
      temperature: 0.6,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  const blocks = data?.content;
  if (Array.isArray(blocks)) {
    return blocks.map((b: { text?: string }) => b.text || "").join("").trim();
  }
  return "";
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

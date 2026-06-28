// PLAYERMIND – מתזמר ה-AI בצד הלקוח
// מנהל קריאה לנתיב המאובטח, ונופל בחזרה למנוע מבוסס-החוקים כשאין מפתח LLM.

export interface BrainMessage { role: "user" | "assistant"; content: string }

export interface AskOptions {
  topic: string;
  messages: BrainMessage[];
  contextText: string;
  playerName?: string;
  fallback: () => string;     // תשובת מנוע החוקים אם אין LLM
}

export interface AskResult {
  reply: string;
  source: "ai" | "fallback" | "safety";
}

// בדיקת זמינות ה-LLM (האם מחובר מפתח בצד השרת)
export async function checkAIAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/ai/chat", { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.available);
  } catch {
    return false;
  }
}

export async function askCoach(opts: AskOptions): Promise<AskResult> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: opts.topic,
        messages: opts.messages,
        contextText: opts.contextText,
        playerName: opts.playerName,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) {
        return { reply: data.reply, source: data.source === "safety" ? "safety" : "ai" };
      }
    }
  } catch {
    /* רשת/שרת לא זמינים – נופלים ל-fallback */
  }
  return { reply: opts.fallback(), source: "fallback" };
}

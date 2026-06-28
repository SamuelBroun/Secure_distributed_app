import { useEffect, useRef, useState } from "react";
import { Send, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Loading";
import {
  getCoachSignals, getLatestConversation, createConversation, getMessages,
  addMessage, type CoachMessage, type CoachSignals,
} from "../lib/db";
import { buildCoachReply, TOPICS, COACH_DISCLAIMER } from "../lib/ai/coach";
import { buildContextText } from "../lib/ai/context";
import { askCoach, checkAIAvailable, type BrainMessage } from "../lib/ai/brain";

export default function AICoach() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [signals, setSignals] = useState<CoachSignals | null>(null);
  const [topic, setTopic] = useState("free");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [contextText, setContextText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [sig, conv, available, ctx] = await Promise.all([
        getCoachSignals(user.id),
        getLatestConversation(user.id),
        checkAIAvailable(),
        buildContextText(user.id, profile),
      ]);
      setSignals(sig);
      setAiAvailable(available);
      setContextText(ctx);
      if (conv) {
        setConvId(conv);
        setMessages(await getMessages(conv));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function ensureConversation(t: string): Promise<string | null> {
    if (convId) return convId;
    if (!user) return null;
    const label = TOPICS.find((x) => x.key === t)?.label ?? "שיחה";
    const id = await createConversation(user.id, t, label);
    setConvId(id);
    return id;
  }

  async function send(text: string, t: string) {
    if (!user || !text.trim()) return;
    setThinking(true);
    const id = await ensureConversation(t);
    if (!id) { setThinking(false); return; }

    const now = new Date().toISOString();
    const userMsg: CoachMessage = {
      id: `tmp-${Date.now()}`, conversation_id: id, user_id: user.id,
      role: "user", content: text.trim(), created_at: now,
    };
    const history: BrainMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    await addMessage(user.id, id, "user", text.trim());

    // מנוע החוקים כ-fallback אם אין מפתח LLM
    const fallback = () => buildCoachReply(t, text.trim(), {
      profile,
      avgSleep: signals?.avgSleep ?? null,
      avgRecovery: signals?.avgRecovery ?? null,
      commonMood: signals?.commonMood ?? null,
      recentPain: signals?.recentPain ?? false,
      goals: signals?.goals ?? [],
      memory: signals?.memory ?? [],
    });

    const { reply } = await askCoach({
      topic: t, messages: history, contextText,
      playerName: profile?.full_name?.split(" ")[0],
      fallback,
    });

    const coachMsg: CoachMessage = {
      id: `tmp-c-${Date.now()}`, conversation_id: id, user_id: user.id,
      role: "coach", content: reply, created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, coachMsg]);
    await addMessage(user.id, id, "coach", reply);
    setThinking(false);
  }

  function startTopic(t: string) {
    setTopic(t);
    const opener = TOPICS.find((x) => x.key === t)?.opener ?? "";
    // הודעת פתיחה מהמאמן (לא נשמרת כשאלה – נשמרת כתשובת מאמן)
    if (user) {
      void (async () => {
        const id = await ensureConversation(t);
        if (!id) return;
        const msg: CoachMessage = {
          id: `tmp-o-${Date.now()}`, conversation_id: id, user_id: user.id,
          role: "coach", content: opener, created_at: new Date().toISOString(),
        };
        setMessages((m) => [...m, msg]);
        await addMessage(user.id, id, "coach", opener);
      })();
    }
  }

  async function newChat() {
    if (!user) return;
    const id = await createConversation(user.id, "free", "שיחה חדשה");
    setConvId(id);
    setMessages([]);
    setTopic("free");
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <PageHeader title="מאמן AI" subtitle="הליווי האישי שלך, כל יום." />

      {/* מצב fallback – אין מפתח LLM */}
      {!aiAvailable && (
        <div className="mb-3 rounded-2xl px-3 py-2 text-xs leading-relaxed"
             style={{ background: "var(--warning)", color: "#5a4a2a" }}>
          מאמן ה-AI המתקדם עדיין לא מחובר. ניתן להשתמש בתובנות בסיסיות בלבד.
        </div>
      )}

      {/* כתב ויתור קבוע */}
      <div className="mb-3 rounded-2xl px-3 py-2 text-xs leading-relaxed"
           style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
        {COACH_DISCLAIMER}
      </div>

      {messages.length === 0 ? (
        <div className="animate-fade-up">
          <div className="card mb-4" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
            <p className="text-sm leading-relaxed">
              שלום{profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}, אני המאמן האישי שלך.
              בחר נושא להתחלה, או שאל אותי כל דבר. אני כאן כדי ללוות – לא למדוד.
            </p>
          </div>
          <p className="mb-2 text-sm font-semibold">על מה נדבר?</p>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((t) => (
              <button key={t.key} onClick={() => startTopic(t.key)}
                className="card card-hover flex items-center gap-2 py-3 text-right">
                <span style={{ color: "var(--brand)" }}><Icon name={t.icon} size={18} /></span>
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 pb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className="max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                   style={m.role === "user"
                     ? { background: "var(--surface-2)", color: "var(--text)" }
                     : { background: "var(--brand)", color: "#fff" }}>
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-end">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: "var(--brand)", color: "#fff" }}>
                המאמן כותב…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* תיבת קלט */}
      <div className="safe-bottom sticky bottom-0 -mx-4 mt-auto px-4 pt-2"
           style={{ background: "linear-gradient(to top, var(--bg) 80%, transparent)" }}>
        <div className="mb-2 flex items-center gap-2">
          <button onClick={newChat} aria-label="שיחה חדשה"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl surface"
            style={{ color: "var(--text)" }}>
            <Plus size={18} />
          </button>
          <form className="flex flex-1 items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); send(input, topic); }}>
            <input className="input flex-1" value={input} placeholder="כתוב הודעה למאמן…"
                   onChange={(e) => setInput(e.target.value)} />
            <button type="submit" aria-label="שליחה" disabled={!input.trim() || thinking}
              className="btn btn-primary flex h-11 w-11 shrink-0 items-center justify-center !p-0">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

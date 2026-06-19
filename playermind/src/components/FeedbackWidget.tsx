import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { track } from "../lib/tracking";

const TYPES = ["רעיון", "באג", "שבח", "אחר"];

// כפתור צף + מודאל לאיסוף משוב מ-beta users
export function FeedbackWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("רעיון");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!message.trim() || !user) return;
    setBusy(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id, type, rating: rating || null,
      message: message.trim(), page: window.location.pathname,
    });
    setBusy(false);
    if (error) return toast("שליחת המשוב נכשלה.", "error");
    void track("feedback_submitted", { type, rating });
    toast("תודה! המשוב שלך עוזר לנו לשפר.", "success");
    setMessage(""); setRating(0); setType("רעיון"); setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="משוב"
        className="fixed bottom-28 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl shadow-float"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        💬
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center"
             onClick={() => setOpen(false)}>
          <div className="animate-fade-up w-full max-w-md rounded-t-3xl p-5 sm:rounded-3xl"
               style={{ background: "var(--surface)" }}
               onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">שיתוף משוב</h2>
              <button onClick={() => setOpen(false)} className="muted text-xl">✕</button>
            </div>

            <label className="label">סוג</label>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`chip ${type === t ? "chip-active" : ""}`}>{t}</button>
              ))}
            </div>

            <label className="label">דירוג חוויה</label>
            <div className="mb-4 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="text-3xl transition active:scale-90">
                  {n <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            <label className="label">מה תרצה לספר לנו?</label>
            <textarea className="input resize-none" rows={3} value={message}
                      placeholder="הרעיון / הבאג / מה שאהבת…"
                      onChange={(e) => setMessage(e.target.value)} />

            <button onClick={submit} disabled={busy || !message.trim()}
                    className="btn btn-primary mt-4 w-full">
              {busy ? "שולח…" : "שליחת משוב"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

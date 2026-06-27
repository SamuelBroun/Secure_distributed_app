import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { MarketingLayout } from "../../components/MarketingLayout";
import { supabase } from "../../lib/supabase";

const ROLES = ["שחקן", "מאמן", "הורה", "אחר"];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("שחקן");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(), name: name.trim() || null,
      role, source: "landing",
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") { setDone(true); return; } // כבר רשום
      setErr("אירעה שגיאה. נסה שוב.");
      return;
    }
    setDone(true);
  }

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-xl px-5 pt-16 pb-20">
        {done ? (
          <div className="card text-center animate-scale-in">
            <span className="flex justify-center" style={{ color: "var(--brand)" }}><CheckCircle2 size={52} /></span>
            <h1 className="mt-4 font-display text-3xl font-extrabold">אתה ברשימה!</h1>
            <p className="mt-3 muted leading-relaxed">
              תודה שהצטרפת. נעדכן אותך במייל ברגע שמקומות בטא נוספים ייפתחו.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-extrabold sm:text-5xl">רשימת המתנה</h1>
              <p className="mx-auto mt-4 max-w-md text-lg muted">
                מקומות הבטא מוגבלים. השאר פרטים ונעדכן אותך ראשון.
              </p>
            </div>
            <form onSubmit={submit} className="card space-y-4">
              <div>
                <label className="label">אימייל</label>
                <input className="input" type="email" dir="ltr" required value={email}
                       onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">שם (אופציונלי)</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" />
              </div>
              <div>
                <label className="label">אני…</label>
                <div className="grid grid-cols-4 gap-2">
                  {ROLES.map((r) => (
                    <button type="button" key={r} onClick={() => setRole(r)}
                      className={`chip ${role === r ? "chip-active" : ""}`}>{r}</button>
                  ))}
                </div>
              </div>
              {err && <p className="text-sm" style={{ color: "#b91c1c" }}>{err}</p>}
              <button type="submit" className="btn btn-primary w-full" disabled={busy}>
                {busy ? "שולח…" : "הצטרפות לרשימה"}
              </button>
              <p className="text-center text-xs muted">לא נשלח ספאם. רק עדכון אחד כשנפתח מקום.</p>
            </form>
          </>
        )}
      </section>
    </MarketingLayout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Feedback, ErrorLog, WaitlistEntry } from "../../lib/launchTypes";
import type { PlayerProfile } from "../../lib/types";
import { PageHeader } from "../../components/Layout";
import { Spinner } from "../../components/Loading";
import { useToast } from "../../context/ToastContext";

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ players: 0, coaches: 0, waitlist: 0, feedback: 0, errors: 0, checkinsToday: 0 });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);

  async function loadAll() {
    const today = new Date().toISOString().slice(0, 10);
    const [players_, coaches_, waitlistC, feedbackC, errorsC, checkinsC] = await Promise.all([
      count("player_profile", (q) => q.eq("role", "player")),
      count("player_profile", (q) => q.eq("role", "coach")),
      count("waitlist"),
      count("feedback"),
      count("error_logs"),
      count("daily_checkins", (q) => q.eq("log_date", today)),
    ]);
    setStats({ players: players_, coaches: coaches_, waitlist: waitlistC, feedback: feedbackC, errors: errorsC, checkinsToday: checkinsC });

    const [fb, er, wl, pl] = await Promise.all([
      supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("player_profile").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setFeedback((fb.data as Feedback[]) ?? []);
    setErrors((er.data as ErrorLog[]) ?? []);
    setWaitlist((wl.data as WaitlistEntry[]) ?? []);
    setPlayers((pl.data as PlayerProfile[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function setRole(p: PlayerProfile, role: string) {
    const { error } = await supabase.from("player_profile").update({ role }).eq("user_id", p.user_id);
    if (error) return toast("עדכון נכשל.", "error");
    toast(`התפקיד עודכן ל-${role}.`, "success");
    setPlayers((list) => list.map((x) => (x.user_id === p.user_id ? { ...x, role: role as PlayerProfile["role"] } : x)));
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="לוח ניהול" subtitle="ניהול משתמשים, משוב ותקלות." />

      <div className="grid grid-cols-3 gap-3">
        <Tile label="שחקנים" value={stats.players} icon="⚽" />
        <Tile label="מאמנים" value={stats.coaches} icon="🧭" />
        <Tile label="צ׳ק-אין היום" value={stats.checkinsToday} icon="📅" />
        <Tile label="רשימת המתנה" value={stats.waitlist} icon="📝" />
        <Tile label="משוב" value={stats.feedback} icon="💬" />
        <Tile label="תקלות" value={stats.errors} icon="🛠️" />
      </div>

      <div className="mt-3">
        <Link to="/analytics" className="btn btn-primary w-full">לוח אנליטיקות מלא ›</Link>
      </div>

      <Section title="ניהול משתמשים">
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.user_id} className="card flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.full_name || "ללא שם"}</p>
                <p className="text-xs muted">{[p.main_position, p.team].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <select value={p.role} onChange={(e) => setRole(p, e.target.value)}
                className="rounded-xl px-2 py-1.5 text-sm" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <option value="player">player</option>
                <option value="coach">coach</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </Section>

      <Section title="משוב אחרון">
        {feedback.length === 0 ? <Empty text="אין משוב עדיין." /> : (
          <div className="space-y-2">
            {feedback.map((f) => (
              <div key={f.id} className="card">
                <div className="mb-1 flex items-center gap-2">
                  <span className="pill" style={{ background: "var(--surface-2)" }}>{f.type || "כללי"}</span>
                  {f.rating ? <span className="text-sm">{"⭐".repeat(f.rating)}</span> : null}
                  <span className="mr-auto text-xs muted">{new Date(f.created_at).toLocaleDateString("he-IL")}</span>
                </div>
                <p className="text-sm">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="תקלות אחרונות">
        {errors.length === 0 ? <Empty text="אין תקלות מתועדות. 🎉" /> : (
          <div className="space-y-2">
            {errors.map((e) => (
              <div key={e.id} className="card">
                <div className="mb-1 flex items-center justify-between">
                  <span className="pill" style={{ background: "var(--warning)", color: "#143020" }}>{e.source || "error"}</span>
                  <span className="text-xs muted">{new Date(e.created_at).toLocaleString("he-IL")}</span>
                </div>
                <p className="text-sm font-medium" dir="ltr">{e.message}</p>
                {e.url && <p className="truncate text-xs muted" dir="ltr">{e.url}</p>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="רשימת המתנה אחרונה">
        {waitlist.length === 0 ? <Empty text="אין נרשמים עדיין." /> : (
          <div className="space-y-2">
            {waitlist.map((w) => (
              <div key={w.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="font-medium" dir="ltr">{w.email}</p>
                  <p className="text-xs muted">{[w.name, w.role].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="text-xs muted">{new Date(w.created_at).toLocaleDateString("he-IL")}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Tile({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="card text-center">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 font-display text-2xl font-extrabold" style={{ color: "var(--brand)" }}>{value}</div>
      <div className="text-xs muted">{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-sm muted">{text}</p>;
}

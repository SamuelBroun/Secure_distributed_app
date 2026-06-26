import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getTodayCheckin, getTodayRecovery, getLatestLife, getGoals,
  computeAndSaveInsights,
} from "../lib/db";
import { recoveryScore } from "../lib/ai/insights";
import type { DailyCheckin, RecoveryLog, LifeBalanceLog, PlayerGoal, Insight } from "../lib/types";
import { StatCard, InsightCard, SectionTitle } from "../components/Cards";
import { Spinner } from "../components/Loading";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  return "ערב טוב";
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [recovery, setRecovery] = useState<RecoveryLog | null>(null);
  const [life, setLife] = useState<LifeBalanceLog | null>(null);
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, r, l, g, ins] = await Promise.all([
        getTodayCheckin(user.id),
        getTodayRecovery(user.id),
        getLatestLife(user.id),
        getGoals(user.id),
        computeAndSaveInsights(user.id, "7"),
      ]);
      setCheckin(c); setRecovery(r); setLife(l); setGoals(g);
      setInsight(ins[0] ?? null);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Spinner />;

  const firstName = (profile?.full_name || "").split(" ")[0] || "שחקן";

  const actions: { label: string; to: string }[] = [];
  if (!checkin) actions.push({ label: "צ׳ק־אין בוקר", to: "/checkin/morning" });
  if (checkin?.today_type === "אימון") actions.push({ label: "הכנה לאימון", to: "/training/pre" });
  if (checkin?.today_type === "משחק") actions.push({ label: "הכנה למשחק", to: "/match/pre" });
  if (!recovery) actions.push({ label: "התאוששות", to: "/recovery" });
  actions.push({ label: "יומן הצלחות", to: "/journal" });

  return (
    <div className="animate-fade-up">
      {/* ברכה */}
      <div className="mb-1 mt-2">
        <p className="text-sm muted">{greeting()},</p>
        <h1 className="font-display text-3xl font-extrabold">{firstName} 👋</h1>
      </div>

      {/* כרטיס פרופיל */}
      {profile && (profile.team || profile.main_position) && (
        <Link to="/profile" className="card card-hover mb-4 mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white"
               style={{ background: "var(--brand)" }}>
            {profile.shirt_number ?? firstName[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold">{profile.full_name}</p>
            <p className="text-sm muted">
              {[profile.main_position, profile.team].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className="muted">›</span>
        </Link>
      )}

      {/* מטרות פעילות */}
      {goals.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {goals.slice(0, 4).map((g) => (
            <span key={g.id} className="pill" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
              🎯 {g.title.length > 28 ? g.title.slice(0, 28) + "…" : g.title}
            </span>
          ))}
        </div>
      )}

      {/* כרטיסי מצב */}
      <SectionTitle>המצב שלך היום</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="😴" title="שינה" accent="#7fa3c6"
          value={checkin?.sleep_hours ? `${checkin.sleep_hours} ש׳` : "—"}
          sub={checkin?.sleep_quality ?? "טרם דווח"} to="/checkin/morning" />
        <StatCard icon="♻️" title="התאוששות" accent="#B7D8B2"
          value={recovery ? `${recoveryScore(recovery)}/9` : "—"}
          sub={recovery ? "הושלם היום" : "טרם הושלם"} to="/recovery" />
        <StatCard icon="⚡" title="עומס היום" accent="#EADFCF"
          value={checkin?.today_type ?? "—"}
          sub={checkin ? "מתוכנן" : "טרם דווח"} to="/checkin/morning" />
        <StatCard icon="🧠" title="פוקוס" accent="#a78bfa"
          value={checkin?.mood ?? "—"}
          sub="מצב רוח" to="/checkin/morning" />
      </div>
      <div className="mt-3">
        <StatCard icon="⚖️" title="חיים אישיים" accent="#f0abfc"
          value={life?.week_feeling ?? "—"}
          sub="איך השבוע מרגיש" to="/life" />
      </div>

      {/* תובנה אחרונה */}
      <SectionTitle action={<Link to="/insights" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>הכל ›</Link>}>
        התובנה האחרונה
      </SectionTitle>
      {insight && <InsightCard insight={insight} />}

      {/* פעולות להיום */}
      <SectionTitle>פעולות להיום</SectionTitle>
      <div className="space-y-2.5">
        {actions.map((a) => (
          <Link key={a.to + a.label} to={a.to}
            className="card card-hover flex items-center justify-between py-4">
            <span className="font-semibold">{a.label}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
                  style={{ background: "var(--brand)" }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getTodayCheckin, getTodayRecovery, getLatestLife, getGoals,
  computeAndSaveInsights,
} from "../lib/db";
import { recoveryScore } from "../lib/ai/insights";
import type { DailyCheckin, RecoveryLog, LifeBalanceLog, PlayerGoal, Insight } from "../lib/types";
import { StatCard, InsightCard, SectionTitle, EmptyState } from "../components/Cards";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Loading";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  return "ערב טוב";
}

const QUICK_ACTIONS = [
  { label: "לפני אימון", to: "/training/pre", icon: "load" },
  { label: "אחרי אימון", to: "/training/post", icon: "recovery" },
  { label: "לפני משחק", to: "/match/pre", icon: "pre-match" },
  { label: "אחרי משחק", to: "/match/post", icon: "performance" },
  { label: "התאוששות", to: "/recovery", icon: "recovery" },
  { label: "מאמן AI", to: "/ai-coach", icon: "chat" },
];

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

  // הפעולה החשובה ביותר להיום
  const primary = (() => {
    if (!checkin) return { label: "התחל צ׳ק-אין יומי", to: "/checkin/morning", desc: "דקה אחת שמכוונת את כל היום" };
    if (checkin.today_type === "אימון") return { label: "הכנה לאימון", to: "/training/pre", desc: "היום יש אימון – היכנס ממוקד" };
    if (checkin.today_type === "משחק") return { label: "הכנה למשחק", to: "/match/pre", desc: "היום יש משחק – ראש צלול" };
    if (!recovery) return { label: "השלמת התאוששות", to: "/recovery", desc: "התאוששות היא חלק מהאימון" };
    return { label: "כתיבה ביומן ההצלחות", to: "/journal", desc: "סכם את הרגעים הטובים של היום" };
  })();

  return (
    <div className="animate-fade-up">
      {/* ברכה */}
      <div className="mb-3 mt-2">
        <p className="text-sm muted">{greeting()},</p>
        <h1 className="font-display text-3xl font-extrabold">{firstName}</h1>
      </div>

      {/* כרטיס פרופיל */}
      {profile && (profile.team || profile.main_position) && (
        <Link to="/profile" className="card card-hover mb-4 flex items-center gap-3">
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
          <ChevronLeft size={20} className="muted" />
        </Link>
      )}

      {/* הפעולה החשובה ביותר היום */}
      <Link to={primary.to}
        className="card card-hover mb-2 flex items-center gap-3"
        style={{ background: "var(--brand)", borderColor: "var(--brand)", color: "#fff" }}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.18)" }}>
          <Icon name="flame" size={24} />
        </span>
        <div className="flex-1">
          <p className="text-xs opacity-80">הפעולה החשובה ביותר היום</p>
          <p className="font-display text-lg font-extrabold">{primary.label}</p>
          <p className="text-xs opacity-80">{primary.desc}</p>
        </div>
        <ChevronLeft size={22} />
      </Link>

      {/* כרטיסי מצב */}
      {checkin ? (
        <>
          <SectionTitle>המצב שלך היום</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="sleep" title="שינה" accent="#7fa3c6"
              value={checkin.sleep_hours ? `${checkin.sleep_hours} ש׳` : "לא דווח"}
              sub={checkin.sleep_quality ?? "איכות שינה"} to="/checkin/morning" />
            <StatCard icon="recovery" title="התאוששות" accent="#7FAF79"
              value={recovery ? `${recoveryScore(recovery)}/9` : "לא הושלם"}
              sub={recovery ? "הושלם היום" : "פתח רשימת התאוששות"} to="/recovery" />
            <StatCard icon="load" title="עומס היום" accent="#D9A441"
              value={checkin.today_type ?? "לא דווח"}
              sub="סוג היום" to="/checkin/morning" />
            <StatCard icon="mental" title="פוקוס" accent="#a78bfa"
              value={checkin.mood ?? "לא דווח"}
              sub="מצב רוח" to="/checkin/morning" />
          </div>
          <div className="mt-3">
            <StatCard icon="life" title="חיים אישיים" accent="#c084fc"
              value={life?.week_feeling ?? "טרם דווח"}
              sub="איך השבוע מרגיש" to="/life" />
          </div>
        </>
      ) : (
        <div className="mt-4">
          <EmptyState icon="checklist" title="היום עוד לא תועד"
            text="השלם צ׳ק-אין בוקר כדי לראות את מצב השינה, ההתאוששות והפוקוס שלך."
            action={<Link to="/checkin/morning" className="btn btn-primary">התחל צ׳ק-אין יומי</Link>} />
        </div>
      )}

      {/* מטרות פעילות */}
      <SectionTitle action={<Link to="/goals" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>למטרות</Link>}>
        המטרות שלך
      </SectionTitle>
      {goals.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {goals.slice(0, 5).map((g) => (
            <span key={g.id} className="pill inline-flex items-center gap-1"
                  style={{ background: "var(--surface-2)", color: "var(--text)" }}>
              <Icon name="goals" size={13} />
              {g.title.length > 30 ? g.title.slice(0, 30) + "…" : g.title}
            </span>
          ))}
        </div>
      ) : (
        <EmptyState icon="goals" title="עדיין לא הגדרת מטרות"
          text="מטרות ברורות משפרות מוטיבציה, עקביות וביצועים."
          action={<Link to="/goals" className="btn btn-primary">הגדרת מטרות</Link>} />
      )}

      {/* תובנה אחרונה */}
      <SectionTitle action={<Link to="/insights" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>לכל התובנות</Link>}>
        התובנה האחרונה
      </SectionTitle>
      {insight ? (
        <InsightCard insight={insight} />
      ) : (
        <EmptyState icon="insight" title="אין תובנות עדיין"
          text="השלם צ׳ק-אין ראשון כדי להתחיל לקבל תובנות אישיות." />
      )}

      {/* פעולות מהירות */}
      <SectionTitle>פעולות מהירות</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.to + a.label} to={a.to}
            className="card card-hover flex flex-col items-center gap-2 py-4 text-center">
            <span style={{ color: "var(--brand)" }}><Icon name={a.icon} size={22} /></span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* קישורים נוספים */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          { label: "דוחות", to: "/reports", icon: "analytics" },
          { label: "מרכז ידע", to: "/knowledge", icon: "book" },
          { label: "הזיכרון שלי", to: "/memory", icon: "memory_pattern" },
        ].map((a) => (
          <Link key={a.to} to={a.to}
            className="card card-hover flex flex-col items-center gap-2 py-4 text-center">
            <span style={{ color: "var(--brand)" }}><Icon name={a.icon} size={22} /></span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

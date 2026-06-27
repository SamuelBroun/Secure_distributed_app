import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getTodayCheckin, getTodayRecovery, getGoals, getTodaySchedule,
  getAnalysisData, computeAndSaveInsights,
} from "../lib/db";
import { computeReadiness, TONE_COLOR } from "../lib/ai/readiness";
import type { DailyCheckin, PlayerGoal, Insight, ScheduleBlock } from "../lib/types";
import { InsightCard, SectionTitle, EmptyState } from "../components/Cards";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Loading";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  return "ערב טוב";
}

const SECONDARY = [
  { label: "הכנה לאימון", to: "/mental/training", icon: "load" },
  { label: "הכנה למשחק", to: "/mental/match", icon: "pre-match" },
  { label: "התאוששות", to: "/recovery", icon: "recovery" },
  { label: "לו״ז שבועי", to: "/schedule", icon: "calendar" },
  { label: "מאמן AI", to: "/ai-coach", icon: "chat" },
  { label: "מטרות", to: "/goals", icon: "goals" },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [recoveryDone, setRecoveryDone] = useState(false);
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [readiness, setReadiness] = useState<ReturnType<typeof computeReadiness> | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, r, g, sched, data, ins] = await Promise.all([
        getTodayCheckin(user.id),
        getTodayRecovery(user.id),
        getGoals(user.id),
        getTodaySchedule(user.id),
        getAnalysisData(user.id, 7),
        computeAndSaveInsights(user.id, "7"),
      ]);
      setCheckin(c); setRecoveryDone(!!r); setGoals(g); setSchedule(sched);
      setInsight(ins[0] ?? null);
      setReadiness(computeReadiness(data, c));
      setLoading(false);
    })();
  }, [user]);

  if (loading || !readiness) return <Spinner />;

  const firstName = (profile?.full_name || "").split(" ")[0] || "שחקן";

  const mainAction = (() => {
    if (!checkin) return { label: "להשלים צ׳ק-אין בוקר", to: "/checkin/morning" };
    const todayType = checkin.today_type;
    if (todayType === "משחק") return { label: "להיכנס למשחק עם פעולה ראשונה ברורה", to: "/mental/match" };
    if (todayType === "אימון") return { label: "להיכנס לאימון עם מטרה אחת ברורה", to: "/mental/training" };
    if (readiness.tone === "attention" && !recoveryDone) return { label: "לשים לב להתאוששות אחרי עומס", to: "/recovery" };
    return { label: "לכתוב סיכום קצר ביומן ההצלחות", to: "/journal" };
  })();

  return (
    <div className="animate-fade-up">
      {/* ברכה */}
      <div className="mb-3 mt-2">
        <p className="text-sm muted">{greeting()},</p>
        <h1 className="font-display text-3xl font-extrabold">{firstName}</h1>
        <p className="mt-0.5 text-sm muted">מה חשוב היום?</p>
      </div>

      {/* מוכנוּת היום (ללא ציון) */}
      <div className="card mb-3" style={{ borderColor: TONE_COLOR[readiness.tone] }}>
        <div className="mb-1 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: TONE_COLOR[readiness.tone] }} />
          <span className="text-xs font-semibold muted">המוכנוּת שלך היום</span>
        </div>
        <p className="font-display text-2xl font-extrabold" style={{ color: TONE_COLOR[readiness.tone] }}>
          {readiness.label}
        </p>
        <p className="mt-1 text-sm leading-relaxed muted">{readiness.explanation}</p>
      </div>

      {/* הפעולה החשובה היום */}
      <Link to={mainAction.to} className="card card-hover mb-3 flex items-center gap-3"
        style={{ background: "var(--brand)", borderColor: "var(--brand)", color: "#fff" }}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.18)" }}>
          <Icon name="flame" size={24} />
        </span>
        <div className="flex-1">
          <p className="text-xs opacity-80">הפעולה החשובה היום</p>
          <p className="font-display text-lg font-extrabold leading-tight">{mainAction.label}</p>
        </div>
        <ChevronLeft size={22} />
      </Link>

      {/* פוקוס היום */}
      <div className="card mb-3 flex items-start gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }}><Icon name="pre-match" size={20} /></span>
        <div>
          <p className="text-xs font-semibold muted">הפוקוס שלך היום</p>
          <p className="text-sm leading-relaxed">{readiness.focus}</p>
        </div>
      </div>

      {/* מה יש היום (לו״ז) */}
      <SectionTitle action={<Link to="/schedule" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>ללו״ז</Link>}>
        מה יש היום
      </SectionTitle>
      {schedule.length > 0 ? (
        <div className="space-y-2">
          {schedule.map((b) => (
            <div key={b.id} className="card flex items-center gap-3 py-3">
              <span className="shrink-0" style={{ color: "var(--brand)" }}><Icon name="calendar" size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{b.title || b.category}</p>
                <p className="text-xs muted">{[b.category, b.start_time].filter(Boolean).join(" · ")}</p>
              </div>
              {b.intensity && <span className="pill" style={{ background: "var(--surface-2)" }}>{b.intensity}</span>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="calendar" title="עדיין לא בנית לו״ז להיום"
          text="תכנון קצר עוזר לאזן עומס, התאוששות וזמן אישי."
          action={<Link to="/schedule" className="btn btn-primary">הוסף פעילות להיום</Link>} />
      )}

      {/* סטטוסים לפי תחום */}
      <SectionTitle>תמונת מצב</SectionTitle>
      <div className="grid grid-cols-1 gap-2">
        {readiness.domains.map((d) => (
          <div key={d.domain} className="card flex items-start gap-3 py-3">
            <span className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${TONE_COLOR[d.tone]}22`, color: TONE_COLOR[d.tone] }}>
              <Icon name={d.icon} size={18} />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.domain}</p>
                <span className="text-xs font-semibold" style={{ color: TONE_COLOR[d.tone] }}>{d.label}</span>
              </div>
              <p className="text-xs muted leading-relaxed">{d.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* תובנה אחרונה */}
      <SectionTitle action={<Link to="/insights" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>לכל התובנות</Link>}>
        התובנה האחרונה
      </SectionTitle>
      {insight ? <InsightCard insight={insight} /> : (
        <EmptyState icon="insight" title="אין תובנות עדיין"
          text="השלם צ׳ק-אין ראשון כדי להתחיל לקבל תובנות אישיות." />
      )}

      {/* CTA ראשי */}
      <Link to="/checkin/morning" className="btn btn-primary mt-5 w-full">התחל את היום</Link>

      {/* פעולות מהירות */}
      <SectionTitle>פעולות מהירות</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {SECONDARY.map((a) => (
          <Link key={a.to} to={a.to} className="card card-hover flex flex-col items-center gap-2 py-4 text-center">
            <span style={{ color: "var(--brand)" }}><Icon name={a.icon} size={22} /></span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* מטרות */}
      {goals.length > 0 && (
        <>
          <SectionTitle action={<Link to="/goals" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>למטרות</Link>}>
            המטרות שלך
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
            {goals.slice(0, 4).map((g) => (
              <span key={g.id} className="pill inline-flex items-center gap-1"
                    style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                <Icon name="goals" size={13} />
                {g.title.length > 28 ? g.title.slice(0, 28) + "…" : g.title}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAnalysisData } from "../lib/db";
import { buildWeeklyReport, buildMonthlyReport } from "../lib/ai/reports";
import type { WeeklyReportContent, MonthlyReportContent } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { Spinner } from "../components/Loading";
import { Icon } from "../components/Icon";

export default function Reports() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState<WeeklyReportContent | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReportContent | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const week = await getAnalysisData(user.id, 7);
      const month = await getAnalysisData(user.id, 30);
      setWeekly(buildWeeklyReport(week.checkins, week.trainings, week.recoveries, week.life));
      setMonthly(buildMonthlyReport(month.checkins, month.trainings, month.recoveries));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <PageHeader title="דוחות" subtitle="סיכום שמראה את התמונה הגדולה." />

      <div className="mb-4 flex gap-2 rounded-2xl p-1" style={{ background: "var(--surface-2)" }}>
        {([["weekly", "שבועי"], ["monthly", "חודשי"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex-1 rounded-xl py-2 text-sm font-semibold transition"
            style={{
              background: tab === k ? "var(--surface)" : "transparent",
              color: tab === k ? "var(--brand)" : "var(--text-muted)",
              boxShadow: tab === k ? "var(--tw-shadow, 0 2px 12px rgba(22,58,95,0.06))" : "none",
            }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : tab === "weekly" ? (
        weekly && <WeeklyView r={weekly} />
      ) : (
        monthly && <MonthlyView r={monthly} />
      )}
    </div>
  );
}

function ListCard({ icon, title, items, accent }: { icon: string; title: string; items: string[]; accent: string }) {
  return (
    <div className="card animate-fade-up">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${accent}22`, color: accent }}>
          <Icon name={icon} size={17} />
        </span>
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span style={{ color: accent }}>•</span><span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyView({ r }: { r: WeeklyReportContent }) {
  return (
    <div className="space-y-3">
      <div className="card text-center" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
        <p className="text-sm opacity-80">דוח שבועי</p>
        <p className="font-display text-xl font-extrabold">{r.period}</p>
      </div>
      <ListCard icon="worked" title="מה עבד השבוע" items={r.what_worked} accent="#7FAF79" />
      <ListCard icon="improved" title="מה השתפר" items={r.what_improved} accent="#163A5F" />
      <ListCard icon="attention" title="מה דרש תשומת לב" items={r.needs_attention} accent="#D9A441" />
      <ListCard icon="trends" title="מגמות" items={r.trends} accent="#7fa3c6" />
      <ListCard icon="habits" title="הרגלים שנבנו" items={r.habits} accent="#7FAF79" />
      <div className="card" style={{ background: "var(--success)", borderColor: "var(--success)" }}>
        <p className="text-xs font-bold" style={{ color: "#143020" }}>פעולה אחת לשבוע הבא</p>
        <p className="mt-1 font-medium" style={{ color: "#143020" }}>{r.next_week_action}</p>
      </div>
    </div>
  );
}

function MonthlyView({ r }: { r: MonthlyReportContent }) {
  const rows: [string, string, string][] = [
    ["sleep", "שינה", r.sleep],
    ["recovery", "התאוששות", r.recovery],
    ["load", "עומסים", r.load],
    ["mental", "מנטלי", r.mental],
    ["life", "חיים אישיים", r.life],
    ["goals", "מטרות", r.goals],
    ["performance", "ביצועים", r.performance],
  ];
  return (
    <div className="space-y-3">
      <div className="card text-center" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
        <p className="text-sm opacity-80">דוח חודשי</p>
        <p className="font-display text-xl font-extrabold">{r.period}</p>
      </div>
      {rows.map(([icon, title, text]) => (
        <div key={title} className="card flex items-start gap-3 animate-fade-up">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--surface-2)", color: "var(--brand)" }}>
            <Icon name={icon} size={18} />
          </span>
          <div>
            <p className="font-display font-bold">{title}</p>
            <p className="text-sm muted">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getAnalysisData, saveDailyReport, getDailyReports,
  saveWeeklyReport, saveMonthlyReport,
} from "../lib/db";
import { buildWeeklyReport, buildMonthlyReport, buildDailyReport } from "../lib/ai/reports";
import { SAVE_SUCCESS } from "../lib/save";
import type { WeeklyReportContent, MonthlyReportContent, DailyReportContent } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { Spinner } from "../components/Loading";
import { Icon } from "../components/Icon";

type Tab = "daily" | "weekly" | "monthly";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("daily");
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyReportContent | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReportContent | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReportContent | null>(null);
  const [dailyHistory, setDailyHistory] = useState<{ report_date: string; content_json: DailyReportContent }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const week = await getAnalysisData(user.id, 7);
      const month = await getAnalysisData(user.id, 30);
      const d = buildDailyReport(week.checkins, week.recoveries, week.trainings, week.life);
      setDaily(d);
      setWeekly(buildWeeklyReport(week.checkins, week.trainings, week.recoveries, week.life));
      setMonthly(buildMonthlyReport(month.checkins, month.trainings, month.recoveries));
      // שמירת דוח יומי אוטומטית + טעינת היסטוריה
      await saveDailyReport(user.id, d);
      setDailyHistory(await getDailyReports(user.id, 14));
      setLoading(false);
    })();
  }, [user]);

  async function saveWeekly() {
    if (!user || !weekly) return;
    await saveWeeklyReport(user.id, weekly);
    toast(SAVE_SUCCESS, "success");
  }
  async function saveMonthly() {
    if (!user || !monthly) return;
    await saveMonthlyReport(user.id, monthly);
    toast(SAVE_SUCCESS, "success");
  }

  return (
    <div>
      <PageHeader title="דוחות" subtitle="סקירה אישית כמו ממאמן ביצועים." />

      <div className="mb-4 flex gap-2 rounded-2xl p-1" style={{ background: "var(--surface-2)" }}>
        {([["daily", "יומי"], ["weekly", "שבועי"], ["monthly", "חודשי"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex-1 rounded-xl py-2 text-sm font-semibold transition"
            style={{
              background: tab === k ? "var(--surface)" : "transparent",
              color: tab === k ? "var(--brand)" : "var(--text-muted)",
            }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : tab === "daily" ? (
        daily && <DailyView r={daily} history={dailyHistory} />
      ) : tab === "weekly" ? (
        weekly && <WeeklyView r={weekly} onSave={saveWeekly} />
      ) : (
        monthly && <MonthlyView r={monthly} onSave={saveMonthly} />
      )}
    </div>
  );
}

function Banner({ kind, period }: { kind: string; period: string }) {
  return (
    <div className="card text-center" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
      <p className="text-sm opacity-80">{kind}</p>
      <p className="font-display text-xl font-extrabold">{period}</p>
    </div>
  );
}

function Row({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="card flex items-start gap-3 animate-fade-up">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--surface-2)", color: "var(--brand)" }}>
        <Icon name={icon} size={18} />
      </span>
      <div>
        <p className="font-display font-bold">{title}</p>
        <p className="text-sm muted leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function DailyView({ r, history }: { r: DailyReportContent; history: { report_date: string; content_json: DailyReportContent }[] }) {
  return (
    <div className="space-y-3">
      <Banner kind="דוח יומי" period="היום" />
      <Row icon="calendar" title="מה היה היום" text={r.what_happened} />
      <Row icon="worked" title="מה עבד טוב" text={r.what_worked} />
      <Row icon="attention" title="מה דרש תשומת לב" text={r.needs_attention} />
      <div className="card" style={{ background: "var(--success)", borderColor: "var(--success)" }}>
        <p className="text-xs font-bold" style={{ color: "#143020" }}>פעולה אחת למחר</p>
        <p className="mt-1 font-medium" style={{ color: "#143020" }}>{r.tomorrow_action}</p>
      </div>
      <Row icon="insight" title="תובנה אישית" text={r.personal_insight} />

      {history.length > 1 && (
        <>
          <h2 className="mb-1 mt-6 font-display text-lg font-bold">היסטוריה</h2>
          <div className="space-y-2">
            {history.slice(1).map((h) => (
              <div key={h.report_date} className="card py-3">
                <p className="mb-1 text-xs muted">{h.report_date}</p>
                <p className="text-sm">{h.content_json?.tomorrow_action ?? ""}</p>
              </div>
            ))}
          </div>
        </>
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
          <li key={i} className="flex gap-2 text-sm leading-relaxed"><span style={{ color: accent }}>•</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyView({ r, onSave }: { r: WeeklyReportContent; onSave: () => void }) {
  return (
    <div className="space-y-3">
      <Banner kind="דוח שבועי" period={r.period} />
      <ListCard icon="worked" title="מה עבד השבוע" items={r.what_worked} accent="#7FAF79" />
      <ListCard icon="improved" title="מה השתפר" items={r.what_improved} accent="#163A5F" />
      <ListCard icon="attention" title="מה דרש תשומת לב" items={r.needs_attention} accent="#D9A441" />
      <ListCard icon="trends" title="מגמות" items={r.trends} accent="#7fa3c6" />
      <ListCard icon="habits" title="הרגלים שנבנו" items={r.habits} accent="#7FAF79" />
      <div className="card" style={{ background: "var(--success)", borderColor: "var(--success)" }}>
        <p className="text-xs font-bold" style={{ color: "#143020" }}>פעולה אחת לשבוע הבא</p>
        <p className="mt-1 font-medium" style={{ color: "#143020" }}>{r.next_week_action}</p>
      </div>
      <button onClick={onSave} className="btn btn-ghost w-full">שמור דוח להיסטוריה</button>
    </div>
  );
}

function MonthlyView({ r, onSave }: { r: MonthlyReportContent; onSave: () => void }) {
  const rows: [string, string, string][] = [
    ["sleep", "שינה", r.sleep], ["recovery", "התאוששות", r.recovery],
    ["load", "עומסים", r.load], ["mental", "מנטלי", r.mental],
    ["life", "חיים אישיים", r.life], ["goals", "מטרות", r.goals],
    ["performance", "ביצועים", r.performance],
  ];
  return (
    <div className="space-y-3">
      <Banner kind="דוח חודשי" period={r.period} />
      {rows.map(([icon, title, text]) => <Row key={title} icon={icon} title={title} text={text} />)}
      <button onClick={onSave} className="btn btn-ghost w-full">שמור דוח להיסטוריה</button>
    </div>
  );
}

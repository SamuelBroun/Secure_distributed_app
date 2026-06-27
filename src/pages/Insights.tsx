import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { computeAndSaveInsights, getAnalysisData } from "../lib/db";
import { recoveryScore } from "../lib/ai/insights";
import type { Insight } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { InsightCard, SectionTitle, EmptyState } from "../components/Cards";
import { TrendChart, type TrendPoint } from "../components/charts/TrendChart";
import { Spinner } from "../components/Loading";

const PERIODS = [
  { key: "7", label: "7 ימים" },
  { key: "14", label: "14 ימים" },
  { key: "30", label: "30 ימים" },
  { key: "90", label: "90 ימים" },
  { key: "all", label: "הכל" },
];

const PERIOD_DAYS: Record<string, number> = { "7": 7, "14": 14, "30": 30, "90": 90, all: 9999 };
const MOOD_VAL: Record<string, number> = { "לחוץ": 1, "עמוס": 2, "ממוקד": 3, "רגוע": 3 };

export default function Insights() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("7");
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [sleepData, setSleepData] = useState<TrendPoint[]>([]);
  const [recData, setRecData] = useState<TrendPoint[]>([]);
  const [moodData, setMoodData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      const [ins, data] = await Promise.all([
        computeAndSaveInsights(user.id, period),
        getAnalysisData(user.id, PERIOD_DAYS[period]),
      ]);
      setInsights(ins);
      const fmt = (d: string) => format(parseISO(d), "dd/MM");
      setSleepData(data.checkins.map((c) => ({ label: fmt(c.log_date), value: c.sleep_hours })));
      setRecData(data.recoveries.map((r) => ({ label: fmt(r.log_date), value: recoveryScore(r) })));
      setMoodData(data.checkins.map((c) => ({ label: fmt(c.log_date), value: c.mood ? MOOD_VAL[c.mood] ?? null : null })));
      setLoading(false);
    })();
  }, [user, period]);

  return (
    <div>
      <PageHeader title="תובנות" subtitle="הדפוסים האישיים שלך, מתעדכנים מדי יום." />

      {/* בורר תקופה */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition ${period === p.key ? "" : "muted"}`}
            style={{
              background: period === p.key ? "var(--brand)" : "var(--surface-2)",
              color: period === p.key ? "#fff" : undefined,
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* גרפי מגמות */}
          {sleepData.length > 1 && (
            <>
              <SectionTitle>מגמות</SectionTitle>
              <div className="space-y-3">
                <ChartCard title="שינה (שעות)" data={sleepData} color="#163A5F" unit=" ש׳" />
                {recData.length > 1 && <ChartCard title="התאוששות (מתוך 9)" data={recData} color="#7FAF79" />}
                {moodData.filter((m) => m.value).length > 1 && (
                  <ChartCard title="מצב רוח (מגמה)" data={moodData} color="#a78bfa" />
                )}
              </div>
            </>
          )}

          {/* ציר תובנות */}
          <SectionTitle action={<Link to="/memory" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>זיכרון אישי ›</Link>}>
            ציר התובנות
          </SectionTitle>
          {insights.length === 0 ? (
            <EmptyState icon="insight" title="אין תובנות עדיין" text="מלא צ׳ק-אינים כדי שנוכל ללמוד אותך." />
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="relative pr-5">
                  <span className="absolute right-1 top-5 h-3 w-3 rounded-full" style={{ background: "var(--brand)" }} />
                  {i < insights.length - 1 && (
                    <span className="absolute right-[9px] top-8 bottom-[-12px] w-px" style={{ background: "var(--border)" }} />
                  )}
                  <InsightCard insight={ins} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChartCard({ title, data, color, unit }: { title: string; data: TrendPoint[]; color: string; unit?: string }) {
  return (
    <div className="card">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <TrendChart data={data} color={color} unit={unit} />
    </div>
  );
}

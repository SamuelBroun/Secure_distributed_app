import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { supabase } from "../../lib/supabase";
import type { UsageEvent } from "../../lib/launchTypes";
import { PageHeader } from "../../components/Layout";
import { Spinner } from "../../components/Loading";
import { TrendChart, type TrendPoint } from "../../components/charts/TrendChart";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [topEvents, setTopEvents] = useState<{ event: string; count: number }[]>([]);
  const [dailyActive, setDailyActive] = useState<TrendPoint[]>([]);
  const [checkinTrend, setCheckinTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    (async () => {
      const since = subDays(new Date(), 14);
      const sinceStr = since.toISOString();

      const { data: events } = await supabase
        .from("usage_events")
        .select("event, path, user_id, created_at")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: true })
        .limit(5000);
      const evs = (events as Pick<UsageEvent, "event" | "user_id" | "created_at">[]) ?? [];

      setTotalEvents(evs.length);
      setActiveUsers(new Set(evs.map((e) => e.user_id)).size);

      // top events
      const byEvent: Record<string, number> = {};
      evs.forEach((e) => (byEvent[e.event] = (byEvent[e.event] || 0) + 1));
      setTopEvents(Object.entries(byEvent).map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count).slice(0, 6));

      // משתמשים פעילים יומית (distinct user_id ליום)
      const byDay: Record<string, Set<string>> = {};
      evs.forEach((e) => {
        const d = e.created_at.slice(0, 10);
        (byDay[d] ||= new Set()).add(e.user_id ?? "?");
      });
      const days: TrendPoint[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "yyyy-MM-dd");
        days.push({ label: format(subDays(new Date(), i), "dd/MM"), value: byDay[d]?.size ?? 0 });
      }
      setDailyActive(days);

      // מגמת צ׳ק-אינים יומית
      const { data: checkins } = await supabase
        .from("daily_checkins")
        .select("log_date")
        .gte("log_date", format(since, "yyyy-MM-dd"))
        .limit(5000);
      const byDate: Record<string, number> = {};
      ((checkins as { log_date: string }[]) ?? []).forEach((c) => {
        byDate[c.log_date] = (byDate[c.log_date] || 0) + 1;
      });
      const ctrend: TrendPoint[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "yyyy-MM-dd");
        ctrend.push({ label: format(subDays(new Date(), i), "dd/MM"), value: byDate[d] ?? 0 });
      }
      setCheckinTrend(ctrend);

      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="אנליטיקות" subtitle="מדדי שימוש ב-14 הימים האחרונים." back />

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="font-display text-3xl font-extrabold" style={{ color: "var(--brand)" }}>{activeUsers}</div>
          <div className="text-xs muted">משתמשים פעילים (14 ימים)</div>
        </div>
        <div className="card text-center">
          <div className="font-display text-3xl font-extrabold" style={{ color: "var(--brand)" }}>{totalEvents}</div>
          <div className="text-xs muted">אירועי שימוש</div>
        </div>
      </div>

      <div className="card mt-4">
        <p className="mb-2 text-sm font-semibold">משתמשים פעילים ליום</p>
        <TrendChart data={dailyActive} color="#163A5F" />
      </div>

      <div className="card mt-3">
        <p className="mb-2 text-sm font-semibold">צ׳ק-אינים ליום</p>
        <TrendChart data={checkinTrend} color="#7FAF79" />
      </div>

      <h2 className="mb-3 mt-6 font-display text-lg font-bold">אירועים מובילים</h2>
      <div className="space-y-2">
        {topEvents.length === 0 ? <p className="text-sm muted">אין נתונים עדיין.</p> :
          topEvents.map((e) => {
            const max = topEvents[0].count || 1;
            return (
              <div key={e.event} className="card py-3">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium" dir="ltr">{e.event}</span>
                  <span className="muted">{e.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(e.count / max) * 100}%`, background: "var(--brand)" }} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

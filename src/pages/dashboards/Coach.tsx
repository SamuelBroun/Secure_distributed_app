import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import type { PlayerProfile, DailyCheckin, Insight } from "../../lib/types";
import { PageHeader } from "../../components/Layout";
import { Spinner } from "../../components/Loading";
import { EmptyState } from "../../components/Cards";

interface Row {
  profile: PlayerProfile;
  checkin: DailyCheckin | null;
  insight: Insight | null;
}

export default function Coach() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: links } = await supabase
        .from("coach_players").select("player_id").eq("coach_id", user.id);
      const ids = ((links as { player_id: string }[]) ?? []).map((l) => l.player_id);
      if (ids.length === 0) { setLoading(false); return; }

      const today = new Date().toISOString().slice(0, 10);
      const [profiles, checkins, insights] = await Promise.all([
        supabase.from("player_profile").select("*").in("user_id", ids),
        supabase.from("daily_checkins").select("*").in("user_id", ids).eq("log_date", today),
        supabase.from("insights").select("*").in("user_id", ids).eq("period", "7")
          .order("created_at", { ascending: false }),
      ]);

      const profList = (profiles.data as PlayerProfile[]) ?? [];
      const cks = (checkins.data as DailyCheckin[]) ?? [];
      const ins = (insights.data as Insight[]) ?? [];
      setRows(profList.map((p) => ({
        profile: p,
        checkin: cks.find((c) => c.user_id === p.user_id) ?? null,
        insight: ins.find((i) => i.user_id === p.user_id) ?? null,
      })));
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="לוח מאמן" subtitle="מצב השחקנים שלך במבט אחד." />

      {rows.length === 0 ? (
        <EmptyState icon="coach" title="אין שחקנים מקושרים"
          text="ברגע שמנהל המערכת יקשר אליך שחקנים, הם יופיעו כאן עם מצב יומי ותובנות." />
      ) : (
        <div className="space-y-3">
          {rows.map(({ profile, checkin, insight }) => (
            <div key={profile.user_id} className="card">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl font-display font-extrabold text-white"
                     style={{ background: "var(--brand)" }}>
                  {profile.shirt_number ?? (profile.full_name || "?")[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{profile.full_name || "שחקן"}</p>
                  <p className="text-xs muted">{[profile.main_position, profile.team].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <span className="mr-auto pill" style={{
                  background: checkin ? "var(--success)" : "var(--surface-2)",
                  color: checkin ? "#143020" : "var(--text-muted)",
                }}>
                  {checkin ? "דיווח היום" : "טרם דיווח"}
                </span>
              </div>

              {checkin && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Mini label="שינה" value={checkin.sleep_hours ? `${checkin.sleep_hours} ש׳` : "—"} />
                  <Mini label="גוף" value={checkin.body_feeling || "—"} />
                  <Mini label="מצב רוח" value={checkin.mood || "—"} />
                </div>
              )}

              {insight && (
                <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--brand)" }}>{insight.title}</p>
                  <p className="mt-0.5 text-sm">{insight.detected}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl py-2" style={{ background: "var(--surface-2)" }}>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[11px] muted">{label}</div>
    </div>
  );
}

// PLAYERMIND – שכבת גישה לנתונים מעל Supabase
import { supabase } from "./supabase";
import { format, subDays } from "date-fns";
import type {
  DailyCheckin, TrainingSession, RecoveryLog, LifeBalanceLog,
  SuccessJournalEntry, InjuryRecord, PlayerGoal, MemoryItem, Insight,
} from "./types";
import { generateInsights, deriveMemory } from "./ai/insights";

export const todayStr = () => format(new Date(), "yyyy-MM-dd");

async function fetchRange<T>(table: string, userId: string, days: number): Promise<T[]> {
  const since = days >= 9999 ? "2000-01-01" : format(subDays(new Date(), days), "yyyy-MM-dd");
  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", since)
    .order("log_date", { ascending: true });
  return (data as T[]) ?? [];
}

export async function getTodayCheckin(userId: string): Promise<DailyCheckin | null> {
  const { data } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", todayStr())
    .maybeSingle();
  return (data as DailyCheckin) ?? null;
}

export async function getTodayRecovery(userId: string): Promise<RecoveryLog | null> {
  const { data } = await supabase
    .from("recovery_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", todayStr())
    .maybeSingle();
  return (data as RecoveryLog) ?? null;
}

export async function getLatestLife(userId: string): Promise<LifeBalanceLog | null> {
  const { data } = await supabase
    .from("life_balance_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as LifeBalanceLog) ?? null;
}

export async function getAnalysisData(userId: string, days: number) {
  const [checkins, trainings, recoveries, life] = await Promise.all([
    fetchRange<DailyCheckin>("daily_checkins", userId, days),
    fetchRange<TrainingSession>("training_sessions", userId, days),
    fetchRange<RecoveryLog>("recovery_logs", userId, days),
    fetchRange<LifeBalanceLog>("life_balance_logs", userId, days),
  ]);
  return { checkins, trainings, recoveries, life };
}

const PERIOD_DAYS: Record<string, number> = { "7": 7, "14": 14, "30": 30, "90": 90, all: 9999 };

// מייצר תובנות, שומר אותן בטבלת insights ומעדכן זיכרון אישי
export async function computeAndSaveInsights(userId: string, period: string): Promise<Insight[]> {
  const data = await getAnalysisData(userId, PERIOD_DAYS[period] ?? 7);
  const insights = generateInsights(data, period);

  await supabase.from("insights").delete().eq("user_id", userId).eq("period", period);
  const rows = insights.map((i) => ({ ...i, user_id: userId }));
  await supabase.from("insights").insert(rows);

  // עדכון זיכרון אישי
  const mem = deriveMemory(insights);
  for (const m of mem) {
    const { data: existing } = await supabase
      .from("ai_memory")
      .select("id, weight")
      .eq("user_id", userId)
      .eq("kind", m.kind)
      .eq("content", m.content)
      .maybeSingle();
    if (existing) {
      await supabase.from("ai_memory")
        .update({ weight: (existing as MemoryItem).weight + 1, updated_at: new Date().toISOString() })
        .eq("id", (existing as MemoryItem).id);
    } else {
      await supabase.from("ai_memory").insert({ user_id: userId, ...m });
    }
  }
  return insights;
}

export async function rememberItem(userId: string, kind: string, content: string) {
  if (!content?.trim()) return;
  const { data: existing } = await supabase
    .from("ai_memory")
    .select("id, weight")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("content", content)
    .maybeSingle();
  if (existing) {
    await supabase.from("ai_memory")
      .update({ weight: (existing as MemoryItem).weight + 1, updated_at: new Date().toISOString() })
      .eq("id", (existing as MemoryItem).id);
  } else {
    await supabase.from("ai_memory").insert({ user_id: userId, kind, content });
  }
}

export async function getMemory(userId: string): Promise<MemoryItem[]> {
  const { data } = await supabase
    .from("ai_memory")
    .select("*")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .order("updated_at", { ascending: false });
  return (data as MemoryItem[]) ?? [];
}

export async function getInsights(userId: string, period: string): Promise<Insight[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("period", period)
    .order("created_at", { ascending: false });
  return (data as Insight[]) ?? [];
}

export async function getGoals(userId: string): Promise<PlayerGoal[]> {
  const { data } = await supabase
    .from("player_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);
  return (data as PlayerGoal[]) ?? [];
}

export async function getInjuries(userId: string): Promise<InjuryRecord[]> {
  const { data } = await supabase
    .from("injury_history")
    .select("*")
    .eq("user_id", userId)
    .order("injury_date", { ascending: false });
  return (data as InjuryRecord[]) ?? [];
}

export async function getJournalEntries(userId: string): Promise<SuccessJournalEntry[]> {
  const { data } = await supabase
    .from("success_journal")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data as SuccessJournalEntry[]) ?? [];
}

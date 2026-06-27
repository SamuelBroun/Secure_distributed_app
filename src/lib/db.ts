// PLAYERMIND – שכבת גישה לנתונים מעל Supabase
import { supabase } from "./supabase";
import { format, subDays } from "date-fns";
import type {
  DailyCheckin, TrainingSession, RecoveryLog, LifeBalanceLog,
  SuccessJournalEntry, InjuryRecord, PlayerGoal, MemoryItem, Insight,
  ScheduleBlock, HabitRecord, MentalPrep, DailyReportContent,
} from "./types";
import { generateInsights, deriveMemory, recoveryScore } from "./ai/insights";

export const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

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

export async function rememberItem(userId: string, kind: string, content: string, domain?: string) {
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
    await supabase.from("ai_memory").insert({ user_id: userId, kind, content, domain: domain ?? null });
  }
}

export async function getMemory(userId: string): Promise<MemoryItem[]> {
  const { data } = await supabase
    .from("ai_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("hidden", false)
    .order("weight", { ascending: false })
    .order("updated_at", { ascending: false });
  return (data as MemoryItem[]) ?? [];
}

export async function hideMemory(id: string) {
  await supabase.from("ai_memory").update({ hidden: true }).eq("id", id);
}

// עוצמת דפוס לפי כמה פעמים חזר (ללא מספרים מול המשתמש)
export function memoryStrength(weight: number): string {
  if (weight >= 3) return "דפוס שחוזר על עצמו";
  if (weight === 2) return "מגמה מתפתחת";
  return "סימן ראשוני";
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

// --- אותות הקשר עבור מאמן ה-AI ---
export interface CoachSignals {
  avgSleep: number | null;
  avgRecovery: number | null;
  commonMood: string | null;
  recentPain: boolean;
  goals: string[];
  memory: string[];
}

export async function getCoachSignals(userId: string): Promise<CoachSignals> {
  const data = await getAnalysisData(userId, 14);
  const sleep = data.checkins.map((c) => c.sleep_hours).filter((v): v is number => !!v);
  const avgSleep = sleep.length ? sleep.reduce((a, b) => a + b, 0) / sleep.length : null;
  const recScores = data.recoveries.map(recoveryScore);
  const avgRecovery = recScores.length ? recScores.reduce((a, b) => a + b, 0) / recScores.length : null;
  const moodCount: Record<string, number> = {};
  data.checkins.forEach((c) => { if (c.mood) moodCount[c.mood] = (moodCount[c.mood] || 0) + 1; });
  const commonMood = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0] || null;
  const recentPain = data.checkins.slice(-3).some((c) => c.pain_level && c.pain_level !== "לא");

  const [goals, memory] = await Promise.all([getGoals(userId), getMemory(userId)]);
  return {
    avgSleep, avgRecovery, commonMood, recentPain,
    goals: goals.map((g) => g.title),
    memory: memory.slice(0, 6).map((m) => m.content),
  };
}

// --- שיחות מאמן ה-AI ---
export interface CoachMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "coach";
  content: string;
  created_at: string;
}

export async function getLatestConversation(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function createConversation(userId: string, topic: string, title: string): Promise<string | null> {
  const { data } = await supabase
    .from("ai_conversations")
    .insert({ user_id: userId, topic, title })
    .select("id")
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function getMessages(conversationId: string): Promise<CoachMessage[]> {
  const { data } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data as CoachMessage[]) ?? [];
}

export async function addMessage(
  userId: string, conversationId: string, role: "user" | "coach", content: string,
): Promise<void> {
  await supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: userId, role, content });
  await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}

// --- לו״ז שבועי ---
export async function getWeekSchedule(userId: string, startISO: string, endISO: string): Promise<ScheduleBlock[]> {
  const { data } = await supabase
    .from("weekly_schedule")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startISO)
    .lte("date", endISO)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  return (data as ScheduleBlock[]) ?? [];
}

export async function getTodaySchedule(userId: string): Promise<ScheduleBlock[]> {
  const today = isoDate(new Date());
  return getWeekSchedule(userId, today, today);
}

export async function addScheduleBlock(block: Omit<ScheduleBlock, "id" | "created_at" | "updated_at">) {
  return supabase.from("weekly_schedule").insert(block);
}

export async function deleteScheduleBlock(id: string) {
  await supabase.from("weekly_schedule").delete().eq("id", id);
}

// --- הרגלים ---
export async function getHabitsInRange(userId: string, days: number): Promise<HabitRecord[]> {
  const since = isoDate(subDays(new Date(), days));
  const { data } = await supabase
    .from("habit_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("date", since)
    .order("date", { ascending: false });
  return (data as HabitRecord[]) ?? [];
}

export async function toggleHabitToday(userId: string, habitType: string, completed: boolean) {
  const date = isoDate(new Date());
  return supabase.from("habit_tracking")
    .upsert({ user_id: userId, habit_type: habitType, date, completed }, { onConflict: "user_id,habit_type,date" });
}

// תווית עקביות ללא מספרים
export function habitConsistencyLabel(completedDaysLast14: number): string {
  if (completedDaysLast14 >= 10) return "הרגל יציב";
  if (completedDaysLast14 >= 5) return "הרגל מתחיל להתייצב";
  if (completedDaysLast14 >= 1) return "התחלת לבנות הרגל";
  return "כדאי לחזור לרצף";
}

// --- הכנה מנטלית ---
export async function saveMentalPrep(prep: Omit<MentalPrep, "id" | "created_at">) {
  return supabase.from("mental_preparation").insert(prep);
}

export async function getRecentMentalPreps(userId: string, type: "training" | "match"): Promise<MentalPrep[]> {
  const { data } = await supabase
    .from("mental_preparation")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(5);
  return (data as MentalPrep[]) ?? [];
}

// --- דוח יומי ---
export async function saveDailyReport(userId: string, content: DailyReportContent) {
  return supabase.from("daily_reports")
    .upsert({ user_id: userId, report_date: content.date, content_json: content },
      { onConflict: "user_id,report_date" });
}

export async function getDailyReports(userId: string, limit = 14): Promise<{ report_date: string; content_json: DailyReportContent }[]> {
  const { data } = await supabase
    .from("daily_reports")
    .select("report_date, content_json")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .limit(limit);
  return (data as { report_date: string; content_json: DailyReportContent }[]) ?? [];
}

// --- שמירת דוחות שבועיים/חודשיים היסטורית ---
export async function saveWeeklyReport(userId: string, content: unknown) {
  const weekStart = isoDate(subDays(new Date(), 7));
  return supabase.from("weekly_reports").insert({ user_id: userId, week_start: weekStart, content_json: content });
}

export async function saveMonthlyReport(userId: string, content: unknown) {
  const label = format(new Date(), "yyyy-MM");
  return supabase.from("monthly_reports").insert({ user_id: userId, month_label: label, content_json: content });
}

export async function getSavedWeeklyReports(userId: string) {
  const { data } = await supabase.from("weekly_reports").select("*")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(8);
  return data ?? [];
}

export async function getSavedMonthlyReports(userId: string) {
  const { data } = await supabase.from("monthly_reports").select("*")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
  return data ?? [];
}

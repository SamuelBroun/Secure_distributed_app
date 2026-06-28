// PLAYERMIND – בניית חבילת הקשר לשחקן (צד לקוח, מעל Supabase)
// אוסף פרופיל + נתונים אחרונים + זיכרון + לו״ז, ומחזיר טקסט עברי תמציתי ל-LLM.
import { differenceInYears, parseISO } from "date-fns";
import type { PlayerProfile } from "../types";
import {
  getAnalysisData, getCoachSignals, getTodaySchedule, getMemory, getGoals,
  getInjuries,
} from "../db";
import { computeReadiness } from "./readiness";

export async function buildContextText(userId: string, profile: PlayerProfile | null): Promise<string> {
  const [signals, data, schedule, memory, goals, injuries] = await Promise.all([
    getCoachSignals(userId),
    getAnalysisData(userId, 14),
    getTodaySchedule(userId),
    getMemory(userId),
    getGoals(userId),
    getInjuries(userId),
  ]);

  const lines: string[] = [];

  // פרופיל
  if (profile) {
    const age = profile.birth_date ? differenceInYears(new Date(), parseISO(profile.birth_date)) : null;
    const p = [
      profile.full_name && `שם: ${profile.full_name}`,
      age && `גיל: ${age}`,
      profile.main_position && `תפקיד: ${profile.main_position}`,
      profile.strong_foot && `רגל חזקה: ${profile.strong_foot}`,
      profile.height_cm && `גובה: ${profile.height_cm} ס״מ`,
      profile.weight_kg && `משקל: ${profile.weight_kg} ק״ג`,
      profile.team && `קבוצה: ${profile.team}`,
      profile.league && `ליגה: ${profile.league}`,
    ].filter(Boolean).join(", ");
    if (p) lines.push(`פרופיל: ${p}.`);
  }

  // מטרות
  if (goals.length) lines.push(`מטרות פעילות: ${goals.map((g) => g.title).slice(0, 5).join("; ")}.`);

  // פציעות
  const activeInj = injuries.filter((i) => i.status && i.status !== "החלים");
  if (activeInj.length) lines.push(`פציעות לתשומת לב: ${activeInj.map((i) => i.title).join(", ")}.`);

  // מוכנוּת ומדדים איכותיים (ללא מספרים)
  const today = data.checkins[data.checkins.length - 1] ?? null;
  const readiness = computeReadiness(data, today);
  lines.push(`מוכנוּת היום: ${readiness.label} – ${readiness.explanation}`);
  lines.push("סטטוס לפי תחום: " + readiness.domains.map((d) => `${d.domain}: ${d.label}`).join("; ") + ".");

  // אותות אחרונים
  if (signals.avgSleep != null) lines.push(`ממוצע שינה (14 ימים): ${signals.avgSleep.toFixed(1)} שעות.`);
  if (signals.commonMood) lines.push(`מצב רוח שכיח: ${signals.commonMood}.`);
  if (signals.recentPain) lines.push("דווח על כאב כלשהו לאחרונה.");

  // לו״ז היום
  if (schedule.length) {
    lines.push("היום בלו״ז: " + schedule.map((s) => `${s.category}${s.intensity ? ` (${s.intensity})` : ""}`).join(", ") + ".");
  }

  // זיכרון אישי (דפוסים)
  if (memory.length) {
    lines.push("דפוסים שנלמדו: " + memory.slice(0, 6).map((m) => m.content).join(" | "));
  }

  return lines.join("\n");
}

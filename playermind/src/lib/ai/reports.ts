// PLAYERMIND – דוחות שבועיים וחודשיים (נגזרים מהנתונים)

import type {
  DailyCheckin, TrainingSession, RecoveryLog, LifeBalanceLog,
  WeeklyReportContent, MonthlyReportContent,
} from "../types";
import { recoveryScore } from "./insights";

interface Summary {
  checkins: number;
  trainings: number;
  avgSleep: number | null;
  avgRecovery: number | null;
  commonMood: string | null;
}

const avg = (vals: number[]): number | null =>
  vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

export function summarize(
  checkins: DailyCheckin[],
  trainings: TrainingSession[],
  recoveries: RecoveryLog[],
): Summary {
  const sleep = avg(checkins.map((c) => c.sleep_hours).filter((v): v is number => !!v));
  const rec = recoveries.length ? avg(recoveries.map(recoveryScore)) : null;
  const moodCount: Record<string, number> = {};
  checkins.forEach((c) => { if (c.mood) moodCount[c.mood] = (moodCount[c.mood] || 0) + 1; });
  const commonMood = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0] || null;
  return {
    checkins: checkins.length,
    trainings: trainings.length,
    avgSleep: sleep,
    avgRecovery: rec,
    commonMood,
  };
}

export function buildWeeklyReport(
  checkins: DailyCheckin[],
  trainings: TrainingSession[],
  recoveries: RecoveryLog[],
  _life: LifeBalanceLog[],
): WeeklyReportContent {
  const s = summarize(checkins, trainings, recoveries);
  const worked: string[] = [];
  const improved: string[] = [];
  const attention: string[] = [];
  const habits: string[] = [];

  if (s.avgSleep) {
    if (s.avgSleep >= 7.5) worked.push(`שמרת על שינה טובה (ממוצע ${s.avgSleep.toFixed(1)} שעות).`);
    else if (s.avgSleep < 6.5) attention.push(`השינה הייתה קצרה השבוע (ממוצע ${s.avgSleep.toFixed(1)} שעות).`);
  }
  if (s.avgRecovery !== null) {
    if (s.avgRecovery >= 6) habits.push("בניית הרגל התאוששות עקבי.");
    else attention.push("ההתאוששות הייתה חלקית השבוע.");
  }
  if (s.commonMood) worked.push(`מצב הרוח השכיח השבוע: ${s.commonMood}.`);
  if (s.checkins >= 5) improved.push("עקביות גבוהה במילוי צ׳ק־אין יומי.");

  const nextAction = (s.avgSleep ?? 8) < 7
    ? "בחר פעולה אחת לשבוע הבא: הקדמת שעת שינה."
    : "בחר פעולה אחת לשבוע הבא: שמירה על שגרת ההתאוששות.";

  return {
    period: "שבוע אחרון",
    what_worked: worked.length ? worked : ["שמרת על שגרה בסיסית."],
    what_improved: improved.length ? improved : ["המשך לאסוף נתונים כדי לראות שיפור."],
    needs_attention: attention.length ? attention : ["אין נקודה דחופה לתשומת לב."],
    trends: [`מילאת ${s.checkins} צ׳ק־אינים ו־${s.trainings} אימונים.`],
    habits: habits.length ? habits : ["המשך לבנות הרגלים קטנים וקבועים."],
    next_week_action: nextAction,
  };
}

export function buildMonthlyReport(
  checkins: DailyCheckin[],
  trainings: TrainingSession[],
  recoveries: RecoveryLog[],
): MonthlyReportContent {
  const s = summarize(checkins, trainings, recoveries);
  return {
    period: "30 ימים אחרונים",
    sleep: s.avgSleep ? `ממוצע שינה: ${s.avgSleep.toFixed(1)} שעות.` : "אין מספיק נתוני שינה.",
    recovery: s.avgRecovery !== null ? `ממוצע התאוששות: ${s.avgRecovery.toFixed(1)}/9.` : "אין מספיק נתוני התאוששות.",
    load: `${s.trainings} אימונים נרשמו החודש.`,
    mental: s.commonMood ? `מצב הרוח השכיח: ${s.commonMood}.` : "אין מספיק נתונים מנטליים.",
    life: "המשך לשמור על איזון בין כדורגל לחיים האישיים.",
    goals: "בדוק את המטרות שלך בפרופיל ועדכן את הפעילות.",
    performance: `נרשמו ${s.checkins} ימי מעקב החודש.`,
  };
}

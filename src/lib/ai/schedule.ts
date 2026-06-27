// PLAYERMIND – ניתוח לו״ז שבועי (עקרונות ניטור עומס ואיזון)
import type { ScheduleBlock } from "../types";

export const SCHEDULE_CATEGORIES = [
  "אימון קבוצתי", "אימון אישי", "חדר כושר", "משחק", "טיפול / פיזיותרפיה",
  "התאוששות", "זמן משפחה", "זמן חברים", "זמן אישי", "למידה / וידאו",
  "שינה מוקדמת", "אחר",
];

export const INTENSITIES = ["קל", "בינוני", "גבוה"];

const HIGH = "גבוה";
const RECOVERY_CATS = ["התאוששות", "טיפול / פיזיותרפיה", "שינה מוקדמת"];
const PERSONAL_CATS = ["זמן משפחה", "זמן חברים", "זמן אישי"];

export interface ScheduleReviewItem {
  tone: "good" | "stable" | "attention";
  text: string;
}

// מנתח שבוע ומחזיר תובנות איכותיות (ללא ציונים)
export function reviewSchedule(blocks: ScheduleBlock[]): ScheduleReviewItem[] {
  const items: ScheduleReviewItem[] = [];
  if (blocks.length === 0) {
    return [{ tone: "stable", text: "עדיין לא בנית לו״ז לשבוע. אפילו תכנון בסיסי עוזר לאזן עומס והתאוששות." }];
  }

  // קיבוץ לפי יום
  const byDay = new Map<string, ScheduleBlock[]>();
  blocks.forEach((b) => {
    const arr = byDay.get(b.date) ?? [];
    arr.push(b);
    byDay.set(b.date, arr);
  });
  const days = [...byDay.keys()].sort();

  // רצף ימי עומס גבוה
  let streak = 0, maxStreak = 0;
  for (const d of days) {
    const high = (byDay.get(d) ?? []).some((b) => b.intensity === HIGH ||
      ["משחק", "אימון קבוצתי", "חדר כושר"].includes(b.category) && b.intensity === HIGH);
    streak = high ? streak + 1 : 0;
    maxStreak = Math.max(maxStreak, streak);
  }
  if (maxStreak >= 3) {
    items.push({ tone: "attention", text: "יש שלושה ימים או יותר ברצף עם עומס גבוה. כדאי לשקול חלון התאוששות או זמן אישי כדי לשמור על יציבות." });
  }

  // התאוששות
  const hasRecovery = blocks.some((b) => RECOVERY_CATS.includes(b.category));
  if (!hasRecovery) {
    items.push({ tone: "attention", text: "לא משובץ זמן התאוששות השבוע. גם בלוק קצר של מתיחות, שינה מוקדמת או טיפול עוזר." });
  }

  // זמן אישי
  const hasPersonal = blocks.some((b) => PERSONAL_CATS.includes(b.category));
  if (!hasPersonal) {
    items.push({ tone: "attention", text: "אין זמן אישי או משפחתי בשבוע. איזון מחוץ למגרש תורם ליציבות מנטלית." });
  }

  // משחק – הכנה והתאוששות סביבו
  const matchDays = days.filter((d) => (byDay.get(d) ?? []).some((b) => b.category === "משחק"));
  for (const md of matchDays) {
    const idx = days.indexOf(md);
    const dayAfter = days[idx + 1];
    const recoveryAfter = dayAfter && (byDay.get(dayAfter) ?? []).some((b) => RECOVERY_CATS.includes(b.category));
    if (!recoveryAfter) {
      items.push({ tone: "stable", text: "אחרי יום משחק כדאי לשבץ התאוששות למחרת – זה חלק מהביצוע, לא תוספת." });
      break;
    }
  }

  if (items.length === 0) {
    items.push({ tone: "good", text: "השבוע נראה מאוזן – יש שילוב טוב בין עומס, התאוששות וזמן אישי. המשך כך." });
  }
  return items;
}

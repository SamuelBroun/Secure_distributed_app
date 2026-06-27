// PLAYERMIND – מערכת מוכנוּת ללא ציונים מספריים
// מתרגמת נתונים לסטטוסים איכותיים בשפה תומכת ומקצועית.
// ללא מספרים, ללא ציונים, ללא אבחנות.

import type { DailyCheckin, RecoveryLog, TrainingSession, LifeBalanceLog } from "../types";
import { recoveryScore } from "./insights";

export type ReadinessTone = "good" | "stable" | "attention";

export interface DomainStatus {
  domain: string;       // שינה / התאוששות / עומס / מנטלי / חיים
  icon: string;
  label: string;        // הסטטוס האיכותי
  note: string;         // הסבר קצר בעברית פשוטה
  tone: ReadinessTone;
}

export interface Readiness {
  label: string;        // מוכן / יציב / דורש תשומת לב / עומס גבוה ...
  explanation: string;
  tone: ReadinessTone;
  focus: string;        // הפוקוס המומלץ להיום
  domains: DomainStatus[];
}

const WAKE: Record<string, number> = { "רענן": 4, "בסדר": 3, "עייף": 2, "מותש": 1 };
const MOOD: Record<string, number> = { "רגוע": 3, "ממוקד": 3, "עמוס": 2, "לחוץ": 1 };
const PAIN: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "משמעותי": 3 };
const LOAD: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "גבוה": 3 };

const avg = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);

export interface ReadinessInput {
  checkins: DailyCheckin[];      // ממוין עולה לפי תאריך
  recoveries: RecoveryLog[];
  trainings: TrainingSession[];
  life: LifeBalanceLog[];
}

function sleepStatus(checkins: DailyCheckin[]): DomainStatus {
  const hours = checkins.map((c) => c.sleep_hours).filter((v): v is number => !!v);
  const base = avg(hours);
  const recent = hours.length >= 3 ? avg(hours.slice(-3)) : (hours.length ? hours[hours.length - 1] : null);
  const prev = hours.length >= 5 ? avg(hours.slice(-5, -2)) : null;

  if (base == null) {
    return { domain: "שינה", icon: "sleep", label: "אין מספיק נתונים", note: "מלא צ׳ק-אין כדי שנלמד את שגרת השינה שלך.", tone: "stable" };
  }
  if (recent != null && prev != null && recent > prev + 0.6)
    return { domain: "שינה", icon: "sleep", label: "שינה משתפרת", note: "השינה שלך מתארכת לאחרונה – המשך כך.", tone: "good" };
  if (recent != null && recent < 6)
    return { domain: "שינה", icon: "sleep", label: "שינה דורשת תשומת לב", note: "בימים האחרונים ישנת מעט. שווה לשים על זה דגש הערב.", tone: "attention" };
  if (recent != null && base != null && recent < base - 0.7)
    return { domain: "שינה", icon: "sleep", label: "שינה קצרה מהרגיל", note: "ישנת פחות מהממוצע שלך לאחרונה.", tone: "attention" };
  return { domain: "שינה", icon: "sleep", label: "שינה יציבה", note: "שגרת השינה שלך נראית יציבה.", tone: "good" };
}

function recoveryStatus(recoveries: RecoveryLog[], checkins: DailyCheckin[]): DomainStatus {
  const pains = checkins.slice(-3).map((c) => PAIN[c.pain_level || ""] ?? 0);
  const bodyVals = checkins.slice(-3).map((c) => c.body_feeling);
  const notRecovered = bodyVals.includes("לא התאושש");
  const recent = recoveries.length ? avg(recoveries.slice(-3).map(recoveryScore)) : null;

  if (pains.some((p) => p >= 2))
    return { domain: "התאוששות", icon: "recovery", label: "הגוף דורש תשומת לב", note: "דיווחת על כאב לאחרונה. כדאי לאמן בחוכמה ולא דרך כאב.", tone: "attention" };
  if (notRecovered)
    return { domain: "התאוששות", icon: "recovery", label: "מומלץ להאט מעט", note: "הגוף מדווח שעוד לא התאושש לגמרי.", tone: "attention" };
  if (recent != null && recent >= 6)
    return { domain: "התאוששות", icon: "recovery", label: "התאוששות טובה", note: "אתה שומר על שגרת התאוששות עקבית.", tone: "good" };
  if (recent != null && recent <= 3)
    return { domain: "התאוששות", icon: "recovery", label: "התאוששות חלקית", note: "השלמת פחות פעולות התאוששות לאחרונה.", tone: "attention" };
  return { domain: "התאוששות", icon: "recovery", label: "התאוששות סבירה", note: "אפשר להוסיף פעולת התאוששות אחת היום.", tone: "stable" };
}

function loadStatus(trainings: TrainingSession[], checkins: DailyCheckin[]): DomainStatus {
  const loads = trainings.filter((t) => t.phase === "post" && t.load_level)
    .slice(-4).map((t) => LOAD[t.load_level as string] ?? 0);
  const highStreak = loads.slice(-3).filter((l) => l >= 2).length;
  const wake = checkins.slice(-2).map((c) => WAKE[c.wake_feeling || ""] ?? 3);
  const tired = wake.some((w) => w <= 2);

  if (highStreak >= 3)
    return { domain: "עומס", icon: "load", label: "עומס מצטבר", note: "כמה ימים של עומס גבוה ברצף. שווה לשלב חלון התאוששות.", tone: "attention" };
  if (loads.length && loads[loads.length - 1] >= 3)
    return { domain: "עומס", icon: "load", label: "עומס גבוה", note: tired ? "העומס האחרון היה גבוה ואתה מדווח על עייפות." : "האימון האחרון היה אינטנסיבי.", tone: "attention" };
  if (highStreak >= 2)
    return { domain: "עומס", icon: "load", label: "עומס עולה", note: "העומס בעלייה – שמור על איזון מול התאוששות.", tone: "stable" };
  return { domain: "עומס", icon: "load", label: "עומס מאוזן", note: "העומס האחרון נראה מאוזן.", tone: "good" };
}

function mentalStatus(checkins: DailyCheckin[]): DomainStatus {
  const moods = checkins.slice(-4).map((c) => MOOD[c.mood || ""]).filter((v) => !!v);
  const m = avg(moods);
  if (m == null)
    return { domain: "מנטלי", icon: "mental", label: "פוקוס יציב", note: "מלא צ׳ק-אין כדי שנעקוב אחרי המצב המנטלי.", tone: "stable" };
  if (m <= 1.6)
    return { domain: "מנטלי", icon: "mental", label: "דרוש עוגן מנטלי", note: "לאחרונה יש יותר לחץ. עוגן קצר (נשימה/מילה) יכול לעזור.", tone: "attention" };
  if (m < 2.4)
    return { domain: "מנטלי", icon: "mental", label: "עומס מנטלי", note: "יש מעט עומס מנטלי. כדאי לשמור על שגרה מאוזנת.", tone: "stable" };
  return { domain: "מנטלי", icon: "mental", label: "פוקוס יציב", note: "המצב המנטלי שלך נראה יציב.", tone: "good" };
}

function lifeStatus(life: LifeBalanceLog[]): DomainStatus {
  const last = life[life.length - 1];
  if (!last)
    return { domain: "חיים", icon: "life", label: "אין מספיק נתונים", note: "מלא דיווח 'חיים מחוץ לכדורגל' כדי שנעקוב אחרי האיזון.", tone: "stable" };
  if (last.week_feeling === "זקוק למנוחה" || last.week_feeling === "עמוס")
    return { domain: "חיים", icon: "life", label: "יש עומס מחוץ לכדורגל", note: "השבוע מרגיש עמוס. גם מנוחה היא חלק מהביצועים.", tone: "attention" };
  if (last.family_time === "לא")
    return { domain: "חיים", icon: "life", label: "חסר זמן משפחה", note: "זמן עם המשפחה תומך ביציבות מנטלית.", tone: "stable" };
  if (last.did_enjoyable === "לא")
    return { domain: "חיים", icon: "life", label: "חסר זמן אישי", note: "שווה לשבץ פעילות שאתה נהנה ממנה.", tone: "stable" };
  return { domain: "חיים", icon: "life", label: "איזון טוב", note: "האיזון בין כדורגל לשאר החיים נראה טוב.", tone: "good" };
}

function pickFocus(domains: DomainStatus[], todayType: string | null): string {
  const attn = domains.find((d) => d.tone === "attention");
  if (attn) {
    switch (attn.domain) {
      case "שינה":
      case "התאוששות":
      case "עומס": return "פוקוס התאוששות: בחר היום פעולה אחת שתומכת בגוף – שתייה, ארוחה טובה אחרי מאמץ או שינה מוקדמת.";
      case "מנטלי": return "פוקוס מנטלי: עוגן קצר לפני אימון – נשימה עמוקה ומילת מפתח אחת.";
      case "חיים": return "פוקוס חיים אישיים: שבץ היום זמן קצר למשפחה, לחברים או לעצמך.";
    }
  }
  if (todayType === "משחק") return "פוקוס מנטלי: היכנס למשחק עם פעולה ראשונה ברורה ומילת מפתח.";
  if (todayType === "אימון") return "פוקוס מקצועי: בחר מטרה אחת ברורה לאימון והתחבר אליה מהרגע הראשון.";
  return "פוקוס מקצועי: בחר מטרה אחת קטנה לקדם היום.";
}

export function computeReadiness(input: ReadinessInput, today: DailyCheckin | null): Readiness {
  const domains = [
    sleepStatus(input.checkins),
    recoveryStatus(input.recoveries, input.checkins),
    loadStatus(input.trainings, input.checkins),
    mentalStatus(input.checkins),
    lifeStatus(input.life),
  ];

  const attentionCount = domains.filter((d) => d.tone === "attention").length;
  const todayType = today?.today_type ?? null;

  let label: string;
  let tone: ReadinessTone;
  let explanation: string;

  const sleepAttn = domains[0].tone === "attention";
  const loadAttn = domains[2].tone === "attention";

  if (sleepAttn && loadAttn) {
    label = "עומס גבוה"; tone = "attention";
    explanation = "בימים האחרונים יש שילוב של שינה קצרה ועומס גבוה. היום כדאי להיכנס בצורה חכמה ולשים לב לגוף.";
  } else if (attentionCount >= 2) {
    label = "דורש תשומת לב"; tone = "attention";
    explanation = "יש כמה אותות שכדאי לשים אליהם לב היום. לא צריך להיבהל – פעולה קטנה אחת יכולה לעזור.";
  } else if (attentionCount === 1) {
    const a = domains.find((d) => d.tone === "attention")!;
    label = "יום לבנייה חכמה"; tone = "stable";
    explanation = `רוב המדדים יציבים. ${a.note}`;
  } else {
    label = "מוכן"; tone = "good";
    explanation = "השינה שלך יציבה, אין דיווח על כאב משמעותי, והעומס האחרון נראה מאוזן.";
  }

  return { label, explanation, tone, focus: pickFocus(domains, todayType), domains };
}

export const TONE_COLOR: Record<ReadinessTone, string> = {
  good: "#7FAF79",
  stable: "#7fa3c6",
  attention: "#D9A441",
};

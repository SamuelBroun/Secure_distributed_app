// PLAYERMIND – מנוע התובנות (rule-based, שקוף וצפוי)
// עקרונות: ללא ציונים מספריים לשחקן, ללא אבחנות רפואיות/פסיכולוגיות.
// המנוע מזהה מגמות, דפוסים, קשרים בין משתנים ובונה תובנות אישיות.

import type {
  DailyCheckin, TrainingSession, RecoveryLog, LifeBalanceLog, Insight,
} from "../types";

export const RECOVERY_FIELDS: { key: keyof RecoveryLog; label: string }[] = [
  { key: "stretching", label: "מתיחות" },
  { key: "walking", label: "הליכה" },
  { key: "massage", label: "עיסוי" },
  { key: "foam_roll", label: "גליל" },
  { key: "ice", label: "קרח" },
  { key: "breathing", label: "נשימות" },
  { key: "early_sleep", label: "שינה מוקדמת" },
  { key: "post_meal", label: "ארוחה לאחר אימון" },
  { key: "hydration", label: "שתייה" },
];

const WAKE: Record<string, number> = { "רענן": 4, "בסדר": 3, "עייף": 2, "מותש": 1 };
const MOOD: Record<string, number> = { "רגוע": 3, "ממוקד": 3, "עמוס": 2, "לחוץ": 1 };
const PAIN: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "משמעותי": 3 };
const LOAD: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "גבוה": 3 };

export const PERIODS: Record<string, number> = { "7": 7, "14": 14, "30": 30, "90": 90 };

export function recoveryScore(r: RecoveryLog): number {
  return RECOVERY_FIELDS.reduce((acc, f) => acc + (r[f.key] ? 1 : 0), 0);
}

const avg = (vals: (number | null | undefined)[]): number | null => {
  const nums = vals.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

export interface AnalysisInput {
  checkins: DailyCheckin[];
  trainings: TrainingSession[];
  recoveries: RecoveryLog[];
  life: LifeBalanceLog[];
}

export function generateInsights(
  input: AnalysisInput,
  period: string,
): Insight[] {
  const { checkins, trainings, recoveries, life } = input;
  const insights: Insight[] = [];

  if (checkins.length < 2) {
    return [{
      period, category: "כללי",
      title: "ברוך הבא למסע",
      detected: "עדיין אין מספיק נתונים כדי לזהות מגמות.",
      why: "ככל שתמלא צ׳ק־אין יומי, PLAYERMIND ילמד אותך ויספק תובנות אישיות יותר.",
      action: "מלא היום צ׳ק־אין בוקר קצר – זו ההתחלה.",
    }];
  }

  // --- שינה ---
  const sleepHours = checkins.map((c) => c.sleep_hours).filter((v): v is number => !!v);
  const avgSleep = avg(sleepHours);
  const recentSleep = sleepHours.length >= 3 ? avg(sleepHours.slice(-3)) : null;
  if (avgSleep && recentSleep && recentSleep < avgSleep - 0.7) {
    insights.push({
      period, category: "שינה",
      title: "שינה קצרה מהרגיל",
      detected: `ב־3 הימים האחרונים ישנת בממוצע ${recentSleep.toFixed(1)} שעות, פחות מהממוצע שלך (${avgSleep.toFixed(1)} שעות).`,
      why: "שינה משפיעה על התאוששות, ריכוז וקבלת החלטות במגרש.",
      action: "נסה להקדים את שעת השינה הערב ב־30 דקות.",
    });
  } else if (avgSleep && avgSleep >= 7.5) {
    insights.push({
      period, category: "שינה",
      title: "שגרת שינה יציבה",
      detected: `שמרת על ממוצע שינה של ${avgSleep.toFixed(1)} שעות בתקופה זו.`,
      why: "שינה יציבה היא אחד הבסיסים החזקים ביותר לביצועים ולהתאוששות.",
      action: "המשך לשמור על שעת שינה קבועה גם בימי משחק.",
    });
  }

  // --- קשר שינה ↔ עייפות ---
  const pairs = checkins
    .filter((c) => c.sleep_hours && c.wake_feeling)
    .map((c) => ({ h: c.sleep_hours as number, w: WAKE[c.wake_feeling as string] }));
  const shortTired = pairs.filter((p) => p.h < 6.5 && p.w && p.w <= 2);
  if (pairs.length >= 4 && shortTired.length >= 2) {
    insights.push({
      period, category: "שינה",
      title: "קשר בין לילות קצרים לעייפות",
      detected: "זוהתה נטייה: בימים שאחרי שינה קצרה אתה קם עייף יותר.",
      why: "זיהוי הקשר הזה עוזר לתכנן מראש ימים אחרי לילה קצר.",
      action: "אם הלילה היה קצר – הוסף היום חימום ארוך יותר ושתייה מסודרת.",
    });
  }

  // --- התאוששות ---
  if (recoveries.length) {
    const scores = recoveries.map(recoveryScore);
    const avgRec = avg(scores);
    const recentRec = avg(scores.slice(-3));
    if (avgRec !== null && avgRec >= 6) {
      insights.push({
        period, category: "התאוששות",
        title: "הרגלי התאוששות חזקים",
        detected: `השלמת בממוצע ${Math.round(avgRec)} מתוך 9 פעולות התאוששות.`,
        why: "התמדה בהתאוששות מפחיתה עומס מצטבר ותורמת למניעת פציעות.",
        action: "שמור על אותו הרגל גם אחרי ימים עמוסים.",
      });
    } else if (recentRec !== null && recentRec <= 3) {
      insights.push({
        period, category: "התאוששות",
        title: "ההתאוששות ירדה לאחרונה",
        detected: "בימים האחרונים השלמת פחות פעולות התאוששות מהרגיל.",
        why: "התאוששות חלקית לאורך זמן עלולה להגביר עייפות וכאבים.",
        action: "בחר היום פעולה אחת פשוטה: מתיחות או נשימות לפני השינה.",
      });
    }
  }

  // --- עומס ↔ כאב ---
  const loads = trainings
    .filter((t) => t.phase === "post" && t.load_level)
    .map((t) => ({ l: LOAD[t.load_level as string], p: PAIN[t.pain_after || ""] }));
  const highLoadPain = loads.filter((x) => x.l >= 2 && x.p >= 2);
  if (loads.length >= 3 && highLoadPain.length >= 2) {
    insights.push({
      period, category: "עומס",
      title: "עומס גבוה לצד כאב",
      detected: "באימונים עם עומס גבוה הופיעו יותר כאבים.",
      why: "זיהוי מוקדם של הקשר הזה עוזר לאזן בין עומס להתאוששות.",
      action: "אחרי אימון עומס גבוה – הקפד על קירור, שתייה ושינה מוקדמת.",
    });
  }

  // --- מצב רוח ↔ חיים מחוץ לכדורגל ---
  const familyDays = life.filter((l) => l.family_time === "כן");
  if (life.length >= 2 && familyDays.length >= 1) {
    const moodsWithFamily = familyDays
      .map((l) => checkins.find((c) => c.log_date === l.log_date))
      .filter((c): c is DailyCheckin => !!c && !!c.mood)
      .map((c) => MOOD[c.mood as string]);
    if (moodsWithFamily.some((m) => m >= 3)) {
      insights.push({
        period, category: "חיים",
        title: "זמן עם המשפחה ומצב הרוח",
        detected: "בימים שבהם הקדשת זמן למשפחה, מצב הרוח שלך נטה להיות רגוע יותר.",
        why: "איזון בין כדורגל לחיים האישיים תורם ליציבות מנטלית לאורך זמן.",
        action: "שבץ השבוע זמן אחד קבוע עם המשפחה או החברים.",
      });
    }
  }

  // --- מגמת מצב רוח ---
  const moods = checkins.map((c) => MOOD[c.mood || ""]).filter((v) => !!v);
  if (moods.length >= 4) {
    const firstHalf = avg(moods.slice(0, Math.floor(moods.length / 2)));
    const secondHalf = avg(moods.slice(Math.floor(moods.length / 2)));
    if (firstHalf && secondHalf && secondHalf < firstHalf - 0.5) {
      insights.push({
        period, category: "מנטלי",
        title: "לחץ מצטבר",
        detected: "לאורך התקופה זוהתה נטייה ליותר עומס/לחץ במצב הרוח.",
        why: "זיהוי מוקדם מאפשר לפעול לפני שזה משפיע על הביצועים.",
        action: "הקדש היום 5 דקות לנשימות או הליכה רגועה ללא טלפון.",
      });
    }
  }

  if (!insights.length) {
    insights.push({
      period, category: "כללי",
      title: "המצב יציב",
      detected: "לא זוהו שינויים חריגים בתקופה זו.",
      why: "יציבות היא בסיס מצוין להמשך בנייה של הרגלים.",
      action: "בחר מטרה אחת קטנה לשיפור השבוע.",
    });
  }

  return insights;
}

// --- בניית פריטי זיכרון אישי מתוך תובנות ---
export function deriveMemory(insights: Insight[]): { kind: string; content: string }[] {
  const mem: { kind: string; content: string }[] = [];
  for (const ins of insights) {
    if (ins.category === "שינה" && ins.title.includes("קצרה")) {
      mem.push({ kind: "דפוס", content: "אצלך, לאחר לילות קצרים מופיעה יותר עייפות באימון." });
    } else if (ins.category === "חיים") {
      mem.push({ kind: "דפוס", content: "אצלך, זמן עם המשפחה קשור ליציבות במצב הרוח." });
    } else if (ins.category === "עומס") {
      mem.push({ kind: "דפוס", content: "אצלך, עומס גבוה נוטה להופיע יחד עם כאבים." });
    } else if (ins.category === "התאוששות" && ins.title.includes("חזקים")) {
      mem.push({ kind: "חוזקה", content: "התאוששות עקבית היא אחת החוזקות שלך." });
    }
  }
  return mem;
}

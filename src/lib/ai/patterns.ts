// PLAYERMIND – מנוע זיהוי דפוסים (משותף, טהור)
// מזהה קשרים בין משתנים, מודד כמה פעמים הדפוס הופיע, וקובע רמת ביטחון.
// לא מגיב יתר על המידה לנקודת מידע אחת.

import type { DailyCheckin, TrainingSession, RecoveryLog, LifeBalanceLog } from "../types";
import { recoveryScore } from "./insights";

const WAKE: Record<string, number> = { "רענן": 4, "בסדר": 3, "עייף": 2, "מותש": 1 };
const MOOD: Record<string, number> = { "רגוע": 3, "ממוקד": 3, "עמוס": 2, "לחוץ": 1 };
const PAIN: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "משמעותי": 3 };
const LOAD: Record<string, number> = { "לא": 0, "קל": 1, "בינוני": 2, "גבוה": 3 };

export type Confidence = "סימן ראשוני" | "מגמה מתפתחת" | "דפוס שחוזר על עצמו";

export function confidenceFromOccurrences(n: number): Confidence {
  if (n >= 4) return "דפוס שחוזר על עצמו";
  if (n >= 2) return "מגמה מתפתחת";
  return "סימן ראשוני";
}

export interface DetectedPattern {
  domain: string;          // מקצועי / פיזי / מנטלי / התאוששות / חיים
  kind: string;            // דפוס / חוזקה
  content: string;         // ניסוח הדפוס
  evidence: string;        // מה נצפה
  occurrences: number;
  confidence: Confidence;
  action: string;
  save: boolean;           // האם לשמור לזיכרון (לא שומרים נקודה בודדת)
}

export interface PatternInput {
  checkins: DailyCheckin[];
  trainings: TrainingSession[];
  recoveries: RecoveryLog[];
  life: LifeBalanceLog[];
}

export function detectPatterns(input: PatternInput): DetectedPattern[] {
  const { checkins, trainings, life } = input;
  const out: DetectedPattern[] = [];

  // שינה קצרה -> עייפות/פוקוס נמוך
  const shortTired = checkins.filter(
    (c) => c.sleep_hours && c.sleep_hours < 6.5 &&
      ((c.wake_feeling && WAKE[c.wake_feeling] <= 2) || (c.mood && MOOD[c.mood] <= 2)),
  ).length;
  if (shortTired >= 1) {
    out.push({
      domain: "התאוששות", kind: "דפוס",
      content: "אצלך, לאחר לילות קצרים מופיעה יותר עייפות ופחות פוקוס.",
      evidence: `זוהה ב-${shortTired} ימים בתקופה זו.`,
      occurrences: shortTired, confidence: confidenceFromOccurrences(shortTired),
      action: "בלילה אחרי יום עמוס – נסה להקדים שינה ולשמור על שגרת ערב.",
      save: shortTired >= 2,
    });
  }

  // עומס גבוה -> כאב
  const loadPain = trainings.filter(
    (t) => t.phase === "post" && t.load_level && LOAD[t.load_level] >= 2 &&
      t.pain_after && PAIN[t.pain_after] >= 2,
  ).length;
  if (loadPain >= 1) {
    out.push({
      domain: "פיזי", kind: "דפוס",
      content: "אצלך, עומס גבוה נוטה להופיע יחד עם כאב.",
      evidence: `זוהה ב-${loadPain} אימונים בתקופה זו.`,
      occurrences: loadPain, confidence: confidenceFromOccurrences(loadPain),
      action: "אחרי אימון עומס גבוה – הקפד על קירור, שתייה ושינה מוקדמת.",
      save: loadPain >= 2,
    });
  }

  // זמן משפחה -> מצב רוח טוב
  const familyGoodMood = life.filter((l) => l.family_time === "כן").map((l) => {
    const c = checkins.find((x) => x.log_date === l.log_date);
    return c && c.mood ? MOOD[c.mood] >= 3 : false;
  }).filter(Boolean).length;
  if (familyGoodMood >= 1) {
    out.push({
      domain: "חיים", kind: "דפוס",
      content: "אצלך, זמן עם המשפחה קשור ליציבות במצב הרוח.",
      evidence: `זוהה ב-${familyGoodMood} ימים בתקופה זו.`,
      occurrences: familyGoodMood, confidence: confidenceFromOccurrences(familyGoodMood),
      action: "שבץ השבוע זמן קבוע עם המשפחה או החברים.",
      save: familyGoodMood >= 2,
    });
  }

  // התמדה בהתאוששות -> חוזקה
  const goodRecovery = input.recoveries.filter((r) => recoveryScore(r) >= 6).length;
  if (goodRecovery >= 4) {
    out.push({
      domain: "התאוששות", kind: "חוזקה",
      content: "התאוששות עקבית היא אחת החוזקות שלך.",
      evidence: `זוהה ב-${goodRecovery} ימים בתקופה זו.`,
      occurrences: goodRecovery, confidence: confidenceFromOccurrences(goodRecovery),
      action: "שמור על אותו הרגל גם בימים עמוסים.",
      save: true,
    });
  }

  // לחץ לפני משחק (חוזר)
  const matchPressure = checkins.filter(
    (c) => c.today_type === "משחק" && c.mood && MOOD[c.mood] <= 1,
  ).length;
  if (matchPressure >= 1) {
    out.push({
      domain: "מנטלי", kind: "דפוס",
      content: "אצלך, מופיע לחץ לפני משחקים – הכנה מנטלית פשוטה עוזרת.",
      evidence: `זוהה ב-${matchPressure} ימי משחק בתקופה זו.`,
      occurrences: matchPressure, confidence: confidenceFromOccurrences(matchPressure),
      action: "לפני משחק: מילת מפתח אחת, פעולה ראשונה ברורה ושגרת נשימה קצרה.",
      save: matchPressure >= 2,
    });
  }

  return out;
}

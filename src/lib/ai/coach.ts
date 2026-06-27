// PLAYERMIND – מנוע מאמן ה-AI
// תשובות בעברית בלבד, פשוטות, מקצועיות ורגועות, מבוססות עקרונות מדעי הספורט.
// עקרונות בטיחות: לא לאבחן, לא לרשום טיפול, לא להחליף איש מקצוע.
// כאשר מזוהה סיכון – מפנים לרופא / פיזיותרפיסט / תזונאי / פסיכולוג ספורט.

import type { PlayerProfile } from "../types";

export const COACH_DISCLAIMER =
  "המידע אינו מחליף רופא, פיזיותרפיסט, תזונאי או פסיכולוג ספורט.";

export interface CoachContext {
  profile: PlayerProfile | null;
  avgSleep: number | null;
  avgRecovery: number | null;
  commonMood: string | null;
  recentPain: boolean;
  goals: string[];
  memory: string[];
}

export interface CoachTopic {
  key: string;
  label: string;
  icon: string;
  opener: string;     // הודעת פתיחה כשנכנסים לנושא
}

export const TOPICS: CoachTopic[] = [
  { key: "sleep", label: "שינה", icon: "sleep", opener: "ספר לי על השינה שלך לאחרונה – כמה שעות, ואיך אתה קם בבוקר?" },
  { key: "recovery", label: "התאוששות", icon: "recovery", opener: "איך אתה מרגיש מבחינת התאוששות? יש עייפות מצטברת?" },
  { key: "nutrition", label: "תזונה", icon: "nutrition", opener: "מה תרצה לשפר בתזונה סביב אימונים ומשחקים?" },
  { key: "hydration", label: "הידרציה", icon: "hydration", opener: "נדבר על שתייה – מתי אתה שותה ביחס לאימון?" },
  { key: "pre-training", label: "לפני אימון", icon: "load", opener: "מתי האימון הבא? נכין אותך נכון." },
  { key: "pre-match", label: "לפני משחק", icon: "pre-match", opener: "איך אתה מרגיש לקראת המשחק? מה הכי מעסיק אותך?" },
  { key: "confidence", label: "ביטחון", icon: "confidence", opener: "ספר לי – מתי אתה מרגיש הכי בטוח במגרש?" },
  { key: "mental", label: "מנטלי", icon: "mental", opener: "מה עובר עליך מנטלית בתקופה האחרונה?" },
  { key: "mistakes", label: "התמודדות עם טעויות", icon: "mistakes", opener: "ספר לי על רגע שבו טעות השפיעה עליך במגרש." },
  { key: "habits", label: "הרגלים", icon: "habits", opener: "איזה הרגל אחד תרצה לבנות החודש?" },
  { key: "goals", label: "מטרות", icon: "goals", opener: "על איזו מטרה תרצה שנעבוד עכשיו?" },
  { key: "life", label: "חיים מחוץ לכדורגל", icon: "life", opener: "איך האיזון בין כדורגל לשאר החיים בתקופה הזו?" },
  { key: "free", label: "שאלה חופשית", icon: "chat", opener: "שאל אותי כל דבר על ביצועים, התאוששות, ראש או חיים מחוץ למגרש." },
];

const RISK_WORDS = ["כאב", "כואב", "פציעה", "נקע", "שבר", "דם", "סחרחורת", "התעלפ", "דיכאון", "חרדה", "פאניקה", "נמשך שבוע"];

function firstName(p: PlayerProfile | null): string {
  return (p?.full_name || "").split(" ")[0] || "";
}

function personalLine(ctx: CoachContext): string {
  const bits: string[] = [];
  if (ctx.avgSleep != null) {
    if (ctx.avgSleep < 6.5) bits.push(`לפי הנתונים שלך ישנת לאחרונה בממוצע ${ctx.avgSleep.toFixed(1)} שעות – מעט מהמומלץ.`);
    else if (ctx.avgSleep >= 7.5) bits.push(`לפי הנתונים שלך השינה שלך יציבה (ממוצע ${ctx.avgSleep.toFixed(1)} שעות) – בסיס מצוין.`);
  }
  if (ctx.avgRecovery != null && ctx.avgRecovery <= 3)
    bits.push("שמתי לב שההתאוששות שלך ירדה לאחרונה – שווה לשים על זה דגש.");
  return bits.join(" ");
}

function topicAnswer(topic: string): string[] {
  switch (topic) {
    case "sleep":
      return [
        "שינה היא כלי ההתאוששות החזק ביותר שיש לך. שחקנים שמקפידים על 7–9 שעות רצופות מתאוששים טוב יותר, מרוכזים יותר ומקבלים החלטות טובות יותר.",
        "שתי פעולות פשוטות: שעת שינה קבועה (גם בסופ״ש), והפחתת מסכים בחצי השעה שלפני השינה.",
      ];
    case "recovery":
      return [
        "התאוששות היא חלק מהאימון, לא תוספת לו. שילוב של שינה, תזונה, שתייה ומעט תנועה קלה ביום אחרי מאמץ עוזר לגוף לחזור.",
        "אם יש עייפות מצטברת – יום התאוששות מתוכנן עדיף על אימון בכוח.",
      ];
    case "nutrition":
      return [
        "סביב מאמץ הגוף צריך דלק: פחמימות לאנרגיה וחלבון לשיקום. ארוחה מסודרת אחרי אימון עוזרת למלא מחדש את המאגרים.",
        "עדיף עקביות יומית על פני שינויים קיצוניים. תזונה מגוונת מנצחת דיאטות קיצון.",
      ];
    case "hydration":
      return [
        "אפילו התייבשות קלה פוגעת בריכוז ובביצועים. עדיף לשתות לאורך כל היום ולא רק לפני האימון.",
        "במזג אוויר חם ובמאמץ ארוך הגוף צריך גם נוזלים וגם מלחים.",
      ];
    case "pre-training":
      return [
        "לפני אימון כדאי להגיע עם מטרה אחת ברורה (מקצועית או מנטלית), חימום הדרגתי, ושתייה מסודרת.",
        "מטרת תהליך (\"היום אתמקד בקבלת החלטות מהירה\") עדיפה על מטרת תוצאה.",
      ];
    case "pre-match":
      return [
        "מתח לפני משחק הוא טבעי – המטרה לנתב אותו לאנרגיה. נשימות איטיות ועמוקות מרגיעות את מערכת העצבים.",
        "התמקד במה שבשליטתך ובפעולה הראשונה שלך במשחק, לא בתוצאה הסופית.",
      ];
    case "confidence":
      return [
        "ביטחון אמיתי נבנה מהצטברות של פעולות קטנות מוצלחות ומהכנה טובה – לא מתוצאה אחת.",
        "תיעוד יומי של מה שעשית טוב (יומן ההצלחות) מחזק לאורך זמן את תחושת המסוגלות.",
      ];
    case "mental":
      return [
        "הראש הוא שריר שאפשר לאמן. שגרה מאוזנת, דיבור עצמי תומך ופוקוס על ההווה משפרים ביצועים.",
        "אם הלחץ מצטבר – אפילו 5 דקות של נשימות או הליכה רגועה ללא טלפון עוזרות.",
      ];
    case "mistakes":
      return [
        "ההבדל בין שחקנים הוא לא בכמות הטעויות אלא במהירות החזרה מהן. טריגר קצר לאיפוס (נשימה או מילה) עוזר לחזור לפוקוס.",
        "הפרד בין הטעות לבין הזהות שלך כשחקן. ניתוח רגוע אחרי המשחק עדיף על שיפוט עצמי תוך כדי.",
      ];
    case "habits":
      return [
        "הרגלים נבנים מצעדים קטנים וקבועים. בחר הרגל אחד, חבר אותו לפעולה קיימת, ועקוב אחריו יום-יום.",
        "עקביות קטנה לאורך זמן מנצחת מאמץ גדול וחד-פעמי.",
      ];
    case "goals":
      return [
        "מטרות טובות הן חיוביות, בשליטתך ומדידות. למשל: \"להשלים 90% מהמסירות\" עדיף על \"לא לאבד כדור\".",
        "אפשר לבנות יחד מטרה לפי מודל SMART – ספציפית, מדידה, ברת-השגה, רלוונטית ותחומה בזמן. רוצה שנבנה אחת במסך המטרות?",
      ];
    case "life":
      return [
        "זהות רחבה מעבר לכדורגל תורמת ליציבות ולאריכות קריירה. זמן עם משפחה וחברים הוא מקור תמיכה אמיתי.",
        "כדורגל הוא חלק מהחיים שלך – לא כל החיים שלך.",
      ];
    default:
      return [
        "אני כאן כדי ללוות אותך – שינה, התאוששות, תזונה, ראש, ביטחון, טעויות, מטרות וחיים מחוץ למגרש.",
        "ספר לי במשפט מה הכי מעסיק אותך עכשיו, ונתחיל משם.",
      ];
  }
}

// ניתוב שאלה חופשית לנושא הקרוב ביותר לפי מילות מפתח
function routeFree(question: string): string {
  const q = question;
  if (/שינה|לישון|ישן|עייף|מותש/.test(q)) return "sleep";
  if (/התאושש|עומס|כבד|תשוש/.test(q)) return "recovery";
  if (/אוכל|תזונה|לאכול|ארוחה|חלבון|פחמימ/.test(q)) return "nutrition";
  if (/שתי|מים|נוזל|הידרצ/.test(q)) return "hydration";
  if (/משחק/.test(q)) return "pre-match";
  if (/אימון/.test(q)) return "pre-training";
  if (/ביטחון|בטוח/.test(q)) return "confidence";
  if (/טעות|טעויות|פספ/.test(q)) return "mistakes";
  if (/מטרה|מטרות|יעד/.test(q)) return "goals";
  if (/משפחה|חברים|איזון|חיים/.test(q)) return "life";
  if (/לחץ|חרד|ראש|פוקוס|ריכוז|מוטיבצ/.test(q)) return "mental";
  return "free";
}

export function buildCoachReply(
  topic: string,
  question: string,
  ctx: CoachContext,
): string {
  const name = firstName(ctx.profile);
  const hello = name ? `${name}, ` : "";

  // זיהוי סיכון – מפנים לאיש מקצוע
  if (RISK_WORDS.some((w) => question.includes(w))) {
    return [
      `${hello}תודה ששיתפת. דברים שקשורים לכאב מתמשך, פציעה או מצוקה רגשית חשוב לבדוק עם איש מקצוע מתאים – רופא או פיזיותרפיסט לכאב גופני, ופסיכולוג ספורט לעומס רגשי.`,
      "בינתיים אפשר להוריד עומס, לשמור על שינה ושתייה, ולא לאמן דרך כאב.",
      COACH_DISCLAIMER,
    ].join("\n\n");
  }

  const effectiveTopic = topic === "free" ? routeFree(question) : topic;
  const parts = topicAnswer(effectiveTopic);
  const personal = personalLine(ctx);

  const body = [
    hello + parts[0],
    ...(parts.slice(1)),
  ];
  if (personal) body.push(personal);
  if (ctx.goals.length) body.push(`זכור את המטרה שהצבת: "${ctx.goals[0]}".`);
  body.push("רוצה שנעמיק, או שיש משהו ספציפי שמעסיק אותך?");

  return body.join("\n\n");
}

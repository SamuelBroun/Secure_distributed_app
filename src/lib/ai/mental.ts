// PLAYERMIND – הכנה מנטלית (עקרונות פסיכולוגיית ספורט)
// שגרת טרום-ביצוע, דיבור עצמי, דמיון, נשימה, מילת מפתח, כוונת יישום.
// זהו אימון מנטלי לביצועים – אינו טיפול.

export interface MentalInputs {
  professionalGoal: string;
  mentalGoal: string;
  firstAction: string;
  focusWord: string;
  obstacle: string;
  responsePlan: string;
  teamContribution?: string;
}

// משפט כניסה לאימון
export function generateTrainingCard(i: MentalInputs): string {
  const parts: string[] = [];
  if (i.professionalGoal) parts.push(`היום אני מתמקד ב${i.professionalGoal}`);
  if (i.mentalGoal) parts.push(i.mentalGoal);
  if (i.firstAction) parts.push(`הפעולה הראשונה שלי: ${i.firstAction}`);
  const main = parts.length ? parts.join(", ") + "." : "היום אני נכנס עם מטרה אחת ברורה ונוכחות מהרגע הראשון.";
  const cue = i.focusWord ? ` מילת המפתח שלי: ${i.focusWord}.` : "";
  const plan = i.obstacle && i.responsePlan ? ` אם ${i.obstacle} – ${i.responsePlan}.` : "";
  return main + cue + plan;
}

// כרטיס מנטלי לפני משחק
export function generateMatchCard(i: MentalInputs): string {
  const lines: string[] = [];
  if (i.focusWord) lines.push(`מילת מפתח: ${i.focusWord}`);
  if (i.firstAction) lines.push(`פעולה ראשונה: ${i.firstAction}`);
  if (i.obstacle && i.responsePlan) lines.push(`תגובה לטעות: ${i.responsePlan}`);
  if (i.teamContribution) lines.push(`מה אני מביא לקבוצה: ${i.teamContribution}`);
  lines.push("עוגן נשימה: 30 שניות של נשימה איטית לפני הכניסה.");
  return lines.join("\n");
}

// שגרת 60–90 שניות מודרכת
export const GUIDED_ROUTINE = [
  { step: "נשימה", text: "נשום עמוק שלוש פעמים – שאיפה ארוכה, נשיפה ארוכה." },
  { step: "מיקוד", text: "הבא לתודעה את המטרה האחת שלך להיום." },
  { step: "דמיון", text: "דמיין את הפעולה הראשונה שלך – ברורה ומדויקת." },
  { step: "מילת מפתח", text: "בחר מילה אחת שמחזירה אותך לפוקוס." },
  { step: "משפט ביצוע", text: "אמור לעצמך: עכשיו אני נכנס לפעולה." },
];

// זיהוי מצוקה חמורה – הפניה לאיש מקצוע
const DISTRESS = ["חסר טעם", "אין טעם", "לא מסוגל", "לבד", "ייאוש", "לפגוע בעצמי", "דיכאון", "חרדה קשה"];
export function detectDistress(text: string): boolean {
  return DISTRESS.some((w) => text.includes(w));
}

export const MENTAL_DISCLAIMER =
  "הכנה מנטלית היא אימון לביצועים ואינה תחליף לליווי מקצועי. אם אתה חווה מצוקה מתמשכת, פנה לפסיכולוג ספורט או לאדם שאתה סומך עליו.";

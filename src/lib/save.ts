// PLAYERMIND – שמירת נתונים אחידה + יצירת תובנה מחדש
import { computeAndSaveInsights } from "./db";
import { track } from "./tracking";

export const SAVE_SUCCESS = "הנתונים נשמרו בהצלחה";
export const SAVE_ERROR = "לא הצלחנו לשמור את הנתונים. נסה שוב.";

export interface SupabaseResult { error: { message: string } | null }

/**
 * עוטף שמירה ל-Supabase:
 *  - מחזיר ok=true/false
 *  - במקרה הצלחה: מתעד אירוע ומרענן את תובנות 7 הימים (כדי שהדאשבורד יתעדכן)
 *  - מטפל בכשלי רשת/שרת בצורה אחידה
 */
export async function persist(
  userId: string,
  eventName: string,
  run: () => Promise<SupabaseResult>,
): Promise<{ ok: boolean }> {
  try {
    const { error } = await run();
    if (error) {
      console.error(`[persist:${eventName}]`, error.message);
      return { ok: false };
    }
    void track(eventName);
    // יצירת תובנה חדשה על בסיס הנתון שנשמר (לא חוסם – נכשל בשקט)
    try { await computeAndSaveInsights(userId, "7"); } catch { /* ignore */ }
    return { ok: true };
  } catch (e) {
    console.error(`[persist:${eventName}] network`, e);
    return { ok: false };
  }
}

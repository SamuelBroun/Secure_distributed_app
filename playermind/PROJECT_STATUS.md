# PROJECT STATUS — PLAYERMIND

> מסמך מצב חי. מתעדכן ככל שהפיתוח מתקדם.
> **עודכן לאחרונה:** 2026-06-19

סטאק: **React 18 + TypeScript + Vite + Supabase + Tailwind CSS**.
האפליקציה עוברת `tsc` במצב strict ו-`vite build` בהצלחה.

---

## ✅ מה הושלם

### תשתית
- [x] פרויקט Vite + React + TypeScript (strict) — בונה ועובר type-check נקי.
- [x] Tailwind עם ערכת צבעים מותאמת (Primary `#163A5F`, Success, Warning).
- [x] תמיכת **RTL מלאה** + פונטים Assistant / Heebo.
- [x] **Dark / Light mode** עם משתני CSS ושמירה ב-localStorage.
- [x] מערכת Toast גלובלית, מסכי טעינה, Layout עם ניווט תחתון.
- [x] PWA: `manifest.json`, `sw.js`, אייקונים (SVG + PNG 192/512).
- [x] `vercel.json` + `.env.example` — מוכן לפריסה.

### אימות וחשבונות
- [x] הרשמה, התחברות, התנתקות (Supabase Auth).
- [x] שחזור סיסמה (שליחת קישור) + מסך הגדרת סיסמה חדשה.
- [x] `AuthContext` עם session, פרופיל, ושמירה אוטומטית.
- [x] מסך `SetupRequired` כשאין הגדרת Supabase.

### מסד נתונים
- [x] `supabase/schema.sql` מלא: כל הטבלאות, אינדקסים, **RLS** לכל טבלה,
      וטריגר ליצירת פרופיל אוטומטית בהרשמה.

### מנוע AI
- [x] מנוע תובנות מבוסס-חוקים (`src/lib/ai/insights.ts`).
- [x] זיהוי מגמות וקשרים: שינה↔עייפות, עומס↔כאב, משפחה↔מצב רוח, מגמת מצב רוח.
- [x] מבנה תובנה: כותרת / מה זוהה / למה חשוב / פעולה.
- [x] זיכרון אישי מתחזק (`ai_memory`) עם משקלים.
- [x] דוחות שבועיים וחודשיים נגזרים מהנתונים (`src/lib/ai/reports.ts`).

### מסכים (UI/UX) — פעילים ומחוברים ל-DB
- [x] **אונבורדינג** — אשף 5 שלבים עם progress bar.
- [x] **Dashboard** — ברכה אישית, כרטיס פרופיל, מטרות, כרטיסי מצב, תובנה אחרונה, פעולות להיום.
- [x] **פרופיל שחקן** — כל השדות + מטרות + היסטוריית פציעות.
- [x] **צ׳ק-אין בוקר** (מסך 3) — כולל עריכת רשומת היום.
- [x] **לפני אימון** (מסך 4) ו**אחרי אימון** (מסך 5).
- [x] **לפני משחק** (מסך 6) ו**אחרי משחק** (מסך 7).
- [x] **התאוששות** (מסך 8) — checklist אינטראקטיבי עם מונה.
- [x] **החיים מחוץ לכדורגל** (מסך 9).
- [x] **יומן הצלחות** (מסך 10) — כולל רשימת רשומות.
- [x] **תובנות** — בורר תקופה (7/14/30/90/הכל), ציר תובנות, **גרפי מגמות** (שינה/התאוששות/מצב רוח).
- [x] **דוחות** — שבועי וחודשי בכרטיסים.
- [x] **זיכרון אישי** — מקובץ לפי סוג עם משקלים.
- [x] **מרכז ידע** — 12 מאמרים + מסך מאמר.
- [x] **הגדרות** — מצב תצוגה, תזכורות, קישורים, התנתקות.

### התראות
- [x] Notifications API + תזכורת יומית מקומית + רישום service worker.
- [x] תשתית Web Push ב-`sw.js` (מאזין `push`) — מוכן לחיבור שרת Push.

---

## 🟡 הושלם חלקית / לשיפור עתידי

- [ ] **Push notifications מרחוק (server-side)** — ה-SW מוכן, אך אין עדיין
      שמירת subscription ושרת שליחה (נדרש VAPID + Edge Function). כרגע פועלות
      תזכורות מקומיות בלבד.
- [ ] **דוחות אוטומטיים מתוזמנים** — כרגע נוצרים בעת צפייה. תזמון "כל יום שישי /
      סוף חודש" דורש Supabase Cron / Edge Function.
- [ ] **שמירת דוחות היסטוריים** — הטבלאות `weekly_reports` / `monthly_reports`
      קיימות; כרגע הדוח מחושב on-the-fly ולא נשמר היסטורית.
- [ ] **code-splitting** — bundle יחיד (~860KB, בעיקר recharts). אפשר lazy-load.
- [ ] טבלאות `nutrition_logs` / `sleep_logs` / `mental_logs` קיימות בסכמה; כרגע
      התזונה/שינה/מנטלי נאספים דרך הצ׳ק-אין והאימון. ניתן להרחיב לרישום ייעודי.

---

## ❌ מה שלא נכלל (מחוץ ל-scope הנוכחי)

- בדיקות אוטומטיות (unit / e2e).
- העלאת תמונת פרופיל / מדיה.
- ריבוי שפות (כרגע עברית בלבד, כנדרש).
- אינטגרציה עם מכשירים לבישים (Whoop/Apple Health) — עתידי.

---

## 🗄️ סכמת מסד הנתונים (תקציר)

כל הטבלאות תחת `public`, עם `user_id → auth.users(id)` ו-RLS פעיל.

| טבלה | תיאור |
|------|-------|
| `player_profile` | פרופיל שחקן + מטרות + דגל `onboarded` |
| `daily_checkins` | צ׳ק-אין בוקר (ייחודי לכל יום) |
| `training_sessions` | לפני/אחרי אימון (`phase`) |
| `matches` | לפני/אחרי משחק (`phase`) |
| `recovery_logs` | checklist התאוששות (ייחודי לכל יום) |
| `nutrition_logs` · `sleep_logs` · `mental_logs` | רישומי תזונה/שינה/מנטלי |
| `life_balance_logs` | החיים מחוץ לכדורגל |
| `success_journal` | יומן הצלחות |
| `injury_history` | היסטוריית פציעות |
| `player_goals` | מטרות פעילות |
| `insights` | תובנות AI |
| `weekly_reports` · `monthly_reports` | דוחות |
| `ai_memory` | זיכרון אישי מתחזק |

הסכמה המלאה: `supabase/schema.sql`.

---

## 🔌 דרישות Supabase

1. פרויקט Supabase + הרצת `supabase/schema.sql`.
2. Email auth מופעל (לפיתוח אפשר לכבות אישור מייל).
3. משתני סביבה: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. URL Configuration עבור redirect של איפוס סיסמה.

---

## 🏃 הרצה מקומית (תקציר)

```bash
npm install
cp .env.example .env      # מלא ערכי Supabase
# הרץ supabase/schema.sql ב-SQL Editor
npm run dev               # http://localhost:5173
```

## ☁️ פריסה ל-Vercel (תקציר)

1. Import הריפו ל-Vercel (Root: `playermind`, Framework: Vite).
2. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Deploy (rewrites ל-SPA כבר ב-`vercel.json`).

פירוט מלא ב-`README.md`.

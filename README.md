# PLAYERMIND ⚽🧠

**מערכת ההפעלה האישית של שחקן הכדורגל.**

לא אפליקציית מעקב רגילה – מערכת ליווי יומית שמחברת בין ביצועים, התאוששות, שינה,
תזונה, מניעת פציעות, פסיכולוגיית ספורט, בריאות מנטלית, חיים מחוץ לכדורגל ומטרות
קריירה. המערכת לומדת את השחקן לאורך זמן והופכת למאמן אישי מבוסס נתונים.

> כדורגל הוא חלק מהחיים שלך. הוא לא כל החיים שלך. PLAYERMIND מלווה אותך כשחקן וכאדם.

האפליקציה כולה בעברית עם תמיכת **RTL מלאה**, עיצוב מינימליסטי בהשראת
Whoop · Apple Health · Notion · Headspace, ותמיכת **Dark / Light mode**.

---

## 🧱 Stack

- **React 18 + TypeScript** (Vite)
- **Supabase** – Auth + Postgres + RLS
- **Tailwind CSS** – ערכת עיצוב מותאמת (Primary `#163A5F`)
- **Recharts** – גרפי מגמות
- **PWA** – manifest + service worker + התראות מקומיות
- פונטים: **Assistant** + **Heebo**

---

## 🚀 הרצה מקומית

```bash
# 1. התקנת תלויות
npm install

# 2. הגדרת משתני סביבה
cp .env.example .env
#   ערוך את .env והדבק את הערכים מ-Supabase (Project Settings → API):
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_ANON_KEY=...

# 3. הקמת מסד הנתונים
#   פתח את ה-SQL Editor בפרויקט Supabase והרץ את כל התוכן של:
#   supabase/schema.sql

# 4. הרצה
npm run dev
#   → http://localhost:5173
```

ללא `.env` תקין תוצג מסך הנחיה (SetupRequired) המסביר מה חסר.

### הגדרות Supabase Auth
- ב-**Authentication → Providers → Email** ודא ש-Email מופעל.
- לפיתוח מהיר ניתן לכבות *Confirm email* כדי להתחבר מיד לאחר הרשמה.
- ב-**Authentication → URL Configuration** הוסף את כתובת ה-Redirect של האתר
  (למשל `http://localhost:5173` ובהמשך דומיין הפרודקשן) עבור איפוס סיסמה.

---

## ☁️ פריסה ל-Vercel

1. דחוף את הקוד ל-GitHub.
2. ב-Vercel: **New Project → Import** את הריפו (Root Directory: `./` – שורש הריפו).
3. Framework: **Vite** (זוהה אוטומטית). Build: `npm run build`, Output: `dist`.
4. הוסף Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy. הקובץ `vercel.json` כבר מגדיר rewrite ל-SPA.

---

## 📁 מבנה הפרויקט

```
.   (שורש הריפו – אפליקציית ה-Vite)
├── index.html
├── package.json · tsconfig.json · vite.config.ts
├── tailwind.config.js · postcss.config.js
├── vercel.json · .env.example
├── public/
│   ├── manifest.json · sw.js
│   └── icons/ (logo.svg, logo-192.png, logo-512.png)
├── supabase/
│   └── schema.sql            # כל הטבלאות + RLS + טריגרים
└── src/
    ├── main.tsx · App.tsx · index.css
    ├── context/              # Auth, Theme, Toast
    ├── lib/
    │   ├── supabase.ts · db.ts · types.ts
    │   ├── knowledge.ts · notifications.ts
    │   └── ai/               # insights.ts, reports.ts (מנוע ה-AI)
    ├── components/           # Layout, BottomNav, Cards, Form, charts, ...
    └── pages/
        ├── Login · Register · ResetPassword · SetupRequired
        ├── Onboarding · Dashboard · Profile · Settings
        ├── Insights · Reports · Memory
        ├── Knowledge · KnowledgeArticle
        └── checkins/         # 8 מסכי צ׳ק-אין
```

---

## 🧠 מוח ה-AI

PLAYERMIND משלב **מודל LLM אמיתי** (Anthropic / OpenAI) דרך נתיב מאובטח בצד שרת,
לצד מנוע מבוסס-חוקים שמשמש כ-fallback וכמקור לזיהוי דפוסים.

**זרימת הצ׳אט:**
```
פרונט (צ׳אט) → /api/ai/chat → שכבת בטיחות → בניית הקשר + ידע מדעי
→ LLM → אימות תשובה → שמירה ב-Supabase
```

**שכבות (`src/lib/ai/`):**
- `context.ts` – בונה חבילת הקשר אישית (פרופיל, נתוני 14 יום, מוכנוּת, לו״ז, זיכרון).
- `prompts.ts` – פרומפט מערכת בעברית: זהות, בטיחות, מבנה תשובה, הזרקת ידע.
- `knowledgeBase.ts` – כרטיסי ידע מדעיים מובְנים לפי נושא.
- `safety.ts` – זיהוי סיכון (כאב חד, מצוקה נפשית) → הפניה לאיש מקצוע; אימות תשובות.
- `patterns.ts` – זיהוי דפוסים עם רמות ביטחון (סימן ראשוני / מגמה מתפתחת / דפוס שחוזר).
- `readiness.ts` – מוכנוּת יומית ללא ציונים מספריים.
- `brain.ts` – מתזמר צד-לקוח: קורא ל-API ונופל ל-fallback כשאין מפתח.
- `coach.ts` / `insights.ts` / `reports.ts` – מנוע החוקים (fallback + תובנות + דוחות).

**עקרונות:** ללא ציונים מספריים · ללא אבחנות רפואיות/נפשיות · ללא מרשמים ·
ניסוחים זהירים ("מחקרים מציעים", "נראה שאצלך"). כל תשובה מסתיימת בכתב ויתור.

### חיבור ספק ה-LLM
1. הוסף משתני סביבה בצד השרת (Vercel → Settings → Environment Variables):
   `AI_PROVIDER` (anthropic/openai), `AI_API_KEY`, ובאופן אופציונלי `AI_MODEL`.
   **שים לב:** ללא קידומת `VITE_` – המפתח נשאר בצד השרת בלבד ולא נחשף לדפדפן.
2. הפונקציות תחת `api/ai/*` רצות כ-Vercel Edge Functions וקוראות ל-LLM.
3. ללא `AI_API_KEY` האפליקציה עובדת במצב fallback (תובנות מבוססות-חוקים) ומציגה
   הודעה מתאימה – היא לא נשברת.

הערה: בפיתוח מקומי עם `npm run dev` (Vite בלבד) נתיבי ה-`/api` אינם רצים; הם פעילים
בפריסת Vercel או דרך `vercel dev`. ללא נתיב פעיל, הצ׳אט פשוט עובד ב-fallback.

---

## 🔒 אבטחה

- אימות מלא דרך Supabase Auth (הרשמה, התחברות, שחזור סיסמה).
- **Row Level Security** על כל הטבלאות – כל משתמש ניגש אך ורק לנתונים שלו.
- אין מפתחות סודיים בקוד; רק ה-anon key הציבורי דרך משתני סביבה.

---

הערה: התוכן במרכז הידע חינוכי בלבד ואינו מהווה ייעוץ רפואי או טיפולי.

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

## 🧠 מנוע ה-AI

מנוע מבוסס-חוקים (שקוף וצפוי), הפועל על נתוני 7 / 14 / 30 / 90 ימים וכל ההיסטוריה.

**עקרונות:** ללא ציונים מספריים לשחקן · ללא אבחנות רפואיות · ללא אבחנות פסיכולוגיות.

- מזהה מגמות, דפוסים, קשרים בין משתנים (שינה↔עייפות, עומס↔כאב, משפחה↔מצב רוח).
- כל תובנה בנויה כ: **כותרת · מה זוהה · למה זה חשוב · פעולה אחת להיום**.
- **זיכרון אישי (`ai_memory`)** מתחזק: דפוסים חוזרים מקבלים משקל גבוה יותר.
- דוחות **שבועיים וחודשיים** נגזרים מהנתונים.

הלוגיקה ב-`src/lib/ai/` – ניתן להעבירה בעתיד ל-Supabase Edge Function ללא שינוי
ממשק.

---

## 🔒 אבטחה

- אימות מלא דרך Supabase Auth (הרשמה, התחברות, שחזור סיסמה).
- **Row Level Security** על כל הטבלאות – כל משתמש ניגש אך ורק לנתונים שלו.
- אין מפתחות סודיים בקוד; רק ה-anon key הציבורי דרך משתני סביבה.

---

הערה: התוכן במרכז הידע חינוכי בלבד ואינו מהווה ייעוץ רפואי או טיפולי.

import { Wordmark } from "../components/Logo";

export default function SetupRequired() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center"
         style={{ background: "var(--bg)" }}>
      <Wordmark size={40} />
      <div className="card mt-6 w-full text-right">
        <h1 className="font-display text-xl font-bold">נדרשת הגדרת Supabase</h1>
        <p className="mt-2 text-sm muted leading-relaxed">
          כדי להריץ את PLAYERMIND יש להגדיר חיבור ל-Supabase. צור קובץ <code>.env</code> בתיקיית
          הפרויקט והוסף את המשתנים הבאים:
        </p>
        <pre dir="ltr" className="mt-3 overflow-x-auto rounded-2xl p-3 text-xs"
             style={{ background: "var(--surface-2)" }}>
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p className="mt-3 text-sm muted leading-relaxed">
          לאחר מכן הרץ את הסכמה מהקובץ <code>supabase/schema.sql</code> ב-SQL Editor של הפרויקט,
          ואתחל מחדש את השרת. פרטים מלאים ב-<code>README.md</code>.
        </p>
      </div>
    </div>
  );
}

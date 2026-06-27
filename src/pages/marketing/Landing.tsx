import { Link } from "react-router-dom";
import { MarketingLayout } from "../../components/MarketingLayout";
import { Icon } from "../../components/Icon";

const PILLARS = [
  { icon: "sleep", title: "שינה והתאוששות", desc: "מעקב יומי שמחבר בין מנוחה לביצועים." },
  { icon: "load", title: "עומס ופציעות", desc: "זיהוי מוקדם של עומס מצטבר ודפוסי כאב." },
  { icon: "mental", title: "מנטלי ופוקוס", desc: "פסיכולוגיית ספורט ובריאות מנטלית, יום-יום." },
  { icon: "life", title: "איזון חיים", desc: "כדורגל הוא חלק מהחיים – לא כל החיים." },
  { icon: "insight", title: "תובנות AI אישיות", desc: "המערכת לומדת אותך והופכת למאמן מבוסס נתונים." },
  { icon: "goals", title: "מטרות וקריירה", desc: "מטרות מקצועיות, פיזיות, מנטליות וקבוצתיות." },
];

const STEPS = [
  { n: "1", title: "צ׳ק-אין יומי", desc: "דקה בבוקר ולפני/אחרי אימון ומשחק." },
  { n: "2", title: "המערכת לומדת", desc: "מנוע ה-AI מזהה מגמות, דפוסים וקשרים." },
  { n: "3", title: "פעולה אחת ביום", desc: "כל תובנה מסתיימת בצעד פרקטי אחד." },
];

export default function Landing() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-12 pb-16 text-center sm:pt-20">
        <span className="pill mb-5 inline-block" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
          גרסת בטא – ההרשמה פתוחה
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          מערכת ההפעלה האישית<br />של שחקן הכדורגל
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg muted leading-relaxed">
          PLAYERMIND מלווה אותך כל יום – ביצועים, התאוששות, שינה, מנטלי וחיים מחוץ למגרש –
          ולומד אותך לאורך זמן כדי לתת תובנות אישיות באמת.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn btn-primary px-7 py-3.5 text-base">התחלה חינם</Link>
          <Link to="/waitlist" className="btn btn-ghost px-7 py-3.5 text-base">הצטרפות לרשימת המתנה</Link>
        </div>
        <p className="mt-4 text-xs muted">ללא ציונים · ללא אבחנות · ליווי, לא מדידה</p>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="mb-2 text-center font-display text-3xl font-bold">הכל במקום אחד</h2>
        <p className="mb-8 text-center muted">תשעה תחומים שמרכיבים את החיים של שחקן – מחוברים זה לזה.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="card card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: "var(--surface-2)", color: "var(--brand)" }}>
                <Icon name={p.icon} size={24} />
              </span>
              <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="mb-8 text-center font-display text-3xl font-bold">איך זה עובד</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl font-extrabold text-white"
                   style={{ background: "var(--brand)" }}>{s.n}</div>
              <h3 className="font-display font-bold">{s.title}</h3>
              <p className="mt-1 text-sm muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principle banner */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="card text-center" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
          <p className="mx-auto max-w-2xl font-display text-2xl font-bold leading-relaxed">
            “המערכת אינה מודדת שחקן. המערכת מלווה שחקן.”
          </p>
          <Link to="/register" className="btn mt-6 inline-flex bg-white px-7 py-3 text-base"
                style={{ color: "var(--brand)" }}>
            בוא נתחיל
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}

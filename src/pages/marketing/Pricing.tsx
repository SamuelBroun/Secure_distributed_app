import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { MarketingLayout } from "../../components/MarketingLayout";

const PLANS = [
  {
    name: "בטא",
    price: "חינם",
    period: "בתקופת ההשקה",
    highlight: true,
    badge: "מומלץ",
    cta: "התחלה חינם",
    to: "/register",
    features: [
      "צ׳ק-אין יומי מלא",
      "כל מסכי האימון והמשחק",
      "תובנות AI אישיות (7/14/30/90 ימים)",
      "זיכרון אישי שלומד אותך",
      "דוחות שבועיים וחודשיים",
      "מרכז ידע מלא",
    ],
  },
  {
    name: "Pro",
    price: "₪39",
    period: "לחודש · בקרוב",
    highlight: false,
    cta: "הצטרפות לרשימה",
    to: "/waitlist",
    features: [
      "כל מה שבבטא",
      "תזכורות חכמות מותאמות אישית",
      "ניתוח מעמיק ל-90 יום וכל ההיסטוריה",
      "ייצוא דוחות PDF",
      "עדיפות בתמיכה",
    ],
  },
  {
    name: "Team",
    price: "מותאם",
    period: "למועדונים ומאמנים",
    highlight: false,
    cta: "דברו איתנו",
    to: "/waitlist",
    features: [
      "לוח מאמן לכל השחקנים",
      "מעקב עומסים קבוצתי",
      "ניהול שחקנים והרשאות",
      "אנליטיקות מתקדמות",
      "ליווי הטמעה",
    ],
  },
];

export default function Pricing() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-5 pt-12 pb-8 text-center sm:pt-16">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">תמחור פשוט והוגן</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg muted">
          בתקופת הבטא הכל פתוח וחינמי. בחר את המסלול שמתאים לך כשנשיק.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-12 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name}
            className="card flex flex-col"
            style={p.highlight ? { borderColor: "var(--brand)", borderWidth: 2 } : undefined}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{p.name}</h2>
              {p.badge && (
                <span className="pill" style={{ background: "var(--success)", color: "#143020" }}>{p.badge}</span>
              )}
            </div>
            <div className="mb-1 font-display text-4xl font-extrabold">{p.price}</div>
            <p className="mb-5 text-sm muted">{p.period}</p>
            <ul className="mb-6 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} /><span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to={p.to}
              className={`btn w-full ${p.highlight ? "btn-primary" : "btn-ghost"}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-xl px-5 pb-8 text-center text-sm muted">
        מחירי ה-Pro וה-Team סופיים ייקבעו לקראת ההשקה הרשמית. משתמשי הבטא יקבלו תנאים מועדפים.
      </p>
    </MarketingLayout>
  );
}

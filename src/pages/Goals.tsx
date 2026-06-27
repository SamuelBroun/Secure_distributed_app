import { useEffect, useState } from "react";
import { Trash2, Sparkles, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { getGoals, rememberItem } from "../lib/db";
import { SAVE_SUCCESS, SAVE_ERROR } from "../lib/save";
import type { PlayerGoal } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Loading";
import { EmptyState } from "../components/Cards";

const CATEGORIES = [
  {
    key: "מקצועית", icon: "goals",
    desc: "מיומנויות כדורגל. למשל: שיפור קבלת החלטות, מסירות, מיקום במגרש, להפוך לשחקן יסוד.",
  },
  {
    key: "פיזית", icon: "load",
    desc: "הגוף שלך. למשל: הגדלת מסת שריר, שיפור מהירות, שיפור סבולת, הפחתת אחוז שומן.",
  },
  {
    key: "מנטלית", icon: "mental",
    desc: "הראש שלך. למשל: שיפור ריכוז, הגברת ביטחון, תגובה טובה יותר לטעויות, שליטה רגשית.",
  },
  {
    key: "קבוצתית", icon: "leadership",
    desc: "התרומה שלך לקבוצה. למשל: תקשורת טובה יותר, מנהיגות, עזרה לחברים, התנהגות מקצועית.",
  },
];

const WRITING_TIPS = [
  { bad: "אני לא רוצה לאבד את הכדור", good: "אני רוצה לשפר את קבלת ההחלטות שלי", rule: "נסח בחיוב" },
  { bad: "אני רוצה שהמאמן ישתף אותי", good: "אני רוצה להשתפר מספיק כדי להתחרות על מקום בהרכב", rule: "התמקד במה שבשליטתך" },
  { bad: "אני רוצה להשתפר", good: "אני רוצה להשלים 90% מהמסירות", rule: "הפוך את המטרה למדידה" },
];

const SMART = [
  ["S", "ספציפית", "מה בדיוק תשפר?"],
  ["M", "מדידה", "איך תדע שהתקדמת?"],
  ["A", "ברת-השגה", "ריאלית אך מאתגרת"],
  ["R", "רלוונטית", "מקדמת מטרה גדולה יותר"],
  ["T", "תחומה בזמן", "מתי תבדוק את עצמך?"],
];

export default function Goals() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);

  const load = () => { if (user) getGoals(user.id).then(setGoals); };
  useEffect(() => { if (user) getGoals(user.id).then((g) => { setGoals(g); setLoading(false); }); }, [user]);

  async function removeGoal(id: string) {
    await supabase.from("player_goals").update({ is_active: false }).eq("id", id);
    setGoals((g) => g.filter((x) => x.id !== id));
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="מטרות" subtitle="מטרות נכונות הן מנוע ההתקדמות שלך." />

      {/* AI Goal Builder CTA */}
      <button onClick={() => setBuilderOpen(true)}
        className="card card-hover mb-4 flex w-full items-center gap-3"
        style={{ background: "var(--brand)", borderColor: "var(--brand)", color: "#fff" }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.18)" }}>
          <Sparkles size={22} />
        </span>
        <div className="flex-1 text-right">
          <p className="font-display font-bold">עזור לי לבנות מטרה</p>
          <p className="text-xs opacity-80">כמה שאלות קצרות ואבנה איתך מטרה לפי מודל SMART</p>
        </div>
      </button>

      {/* מטרות פעילות */}
      <h2 className="mb-3 font-display text-lg font-bold">המטרות הפעילות שלך</h2>
      {goals.length === 0 ? (
        <EmptyState icon="goals" title="עדיין לא הגדרת מטרות"
          text="מחקרים בפסיכולוגיה של הספורט מראים שמטרות ברורות ומדידות משפרות מוטיבציה ועקביות." />
      ) : (
        <div className="space-y-2">
          {goals.map((g) => (
            <div key={g.id} className="card flex items-start gap-3 py-3">
              <span className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }}><Icon name="goals" size={18} /></span>
              <div className="flex-1">
                <span className="pill mb-1 inline-block" style={{ background: "var(--surface-2)" }}>{g.category}</span>
                <p className="text-sm leading-relaxed">{g.title}</p>
              </div>
              <button onClick={() => removeGoal(g.id)} aria-label="הסרה" className="muted"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {/* חינוך: איך מציבים מטרות */}
      <h2 className="mb-2 mt-8 font-display text-lg font-bold">איך מציבים מטרות בצורה נכונה?</h2>
      <div className="card mb-4">
        <p className="text-sm leading-relaxed muted">
          מחקרים בפסיכולוגיה של הספורט מראים שמטרות ברורות, מדידות וממוקדות-תהליך משפרות מוטיבציה,
          עקביות וביצועים. הסוד הוא לא לקבוע יעד גדול ועמום, אלא לפרק אותו לצעדים שבשליטתך.
        </p>
      </div>

      <h3 className="mb-2 font-display font-bold">סוגי המטרות</h3>
      <div className="mb-4 space-y-2">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="card flex items-start gap-3 py-3">
            <span className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "var(--surface-2)", color: "var(--brand)" }}>
              <Icon name={c.icon} size={18} />
            </span>
            <div>
              <p className="font-display font-bold">מטרות {c.key === "מקצועית" ? "מקצועיות" : c.key === "פיזית" ? "פיזיות" : c.key === "מנטלית" ? "מנטליות" : "קבוצתיות"}</p>
              <p className="text-sm muted leading-relaxed">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 font-display font-bold">איך לנסח מטרה</h3>
      <div className="mb-4 space-y-2">
        {WRITING_TIPS.map((t) => (
          <div key={t.rule} className="card py-3">
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--brand)" }}>{t.rule}</p>
            <p className="flex items-center gap-1.5 text-sm" style={{ color: "#b45309" }}>
              <X size={15} className="shrink-0" /> {t.bad}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "#15803d" }}>
              <Check size={15} className="shrink-0" /> {t.good}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mb-2 font-display font-bold">מודל SMART</h3>
      <div className="card mb-6">
        <div className="space-y-2.5">
          {SMART.map(([letter, title, desc]) => (
            <div key={letter} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display font-extrabold text-white"
                    style={{ background: "var(--brand)" }}>{letter}</span>
              <p className="text-sm"><b>{title}</b> – <span className="muted">{desc}</span></p>
            </div>
          ))}
        </div>
      </div>

      <p className="mb-2 text-center text-xs muted">
        מבוסס על תאוריית הצבת מטרות (Goal Setting Theory) ותאוריית ההכוונה העצמית (Self-Determination Theory).
      </p>

      {builderOpen && (
        <GoalBuilder onClose={() => setBuilderOpen(false)} onSaved={() => { setBuilderOpen(false); load(); }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Goal Builder
// ---------------------------------------------------------------------------
const FOCUS_BY_CAT: Record<string, string[]> = {
  "מקצועית": ["קבלת החלטות", "מסירות", "מיקום במגרש", "סיומת"],
  "פיזית": ["מהירות", "סבולת", "כוח", "גמישות"],
  "מנטלית": ["ריכוז", "ביטחון", "תגובה לטעויות", "שליטה רגשית"],
  "קבוצתית": ["תקשורת", "מנהיגות", "עזרה לחברים", "התנהגות מקצועית"],
};
const METRIC_BY_FOCUS: Record<string, string> = {
  "קבלת החלטות": "אחוז מסירות מוצלחות באימון",
  "מסירות": "אחוז מסירות שמגיעות ליעד",
  "מיקום במגרש": "מספר כדורים שזכית בהם מהמיקום הנכון",
  "סיומת": "אחוז בעיטות למסגרת",
  "מהירות": "זמן ספרינט 20 מטר",
  "סבולת": "מרחק שאתה רץ בעצימות גבוהה",
  "כוח": "מספר חזרות / משקל בתרגיל מפתח",
  "גמישות": "טווח תנועה במתיחה מרכזית",
  "ריכוז": "מספר דקות פוקוס רצוף באימון",
  "ביטחון": "דירוג ביטחון יומי (1–5)",
  "תגובה לטעויות": "זמן חזרה לפוקוס אחרי טעות",
  "שליטה רגשית": "מספר רגעים שבהם שמרת על קור רוח",
  "תקשורת": "מספר הנחיות ברורות לחברים במשחק",
  "מנהיגות": "מספר פעמים שעודדת או הובלת בקבוצה",
  "עזרה לחברים": "מספר פעולות עזרה לחבר לקבוצה",
  "התנהגות מקצועית": "ימי הקפדה על שגרה מלאה בשבוע",
};

function GoalBuilder({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<string>("מקצועית");
  const [focus, setFocus] = useState<string>("");
  const [weeks, setWeeks] = useState<number>(8);
  const [busy, setBusy] = useState(false);

  const goalText = focus
    ? `לשפר ${focus} (${cat}) בתוך ${weeks} שבועות, נמדד לפי: ${METRIC_BY_FOCUS[focus] ?? "מדד אישי"}.`
    : "";
  const weeklyAction = focus ? `כל שבוע: תרגול ייעודי של ${focus} באימון אחד לפחות + תיעוד קצר אחרי.` : "";

  async function save() {
    if (!user || !focus) return;
    setBusy(true);
    const { error } = await supabase.from("player_goals").insert({
      user_id: user.id, category: cat, title: goalText,
    });
    if (!error) await rememberItem(user.id, "מטרה", `${cat}: ${goalText}`);
    setBusy(false);
    if (error) return toast(SAVE_ERROR, "error");
    toast(SAVE_SUCCESS, "success");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="animate-fade-up w-full max-w-md rounded-t-3xl p-5 sm:rounded-3xl"
           style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">בניית מטרה חכמה</h2>
          <button onClick={onClose} aria-label="סגירה" className="muted"><X size={20} /></button>
        </div>

        {step === 0 && (
          <div>
            <p className="label">באיזה תחום נתמקד?</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(FOCUS_BY_CAT).map((c) => (
                <button key={c} onClick={() => { setCat(c); setFocus(""); }}
                  className={`chip ${cat === c ? "chip-active" : ""}`}>{c}</button>
              ))}
            </div>
            <button className="btn btn-primary mt-4 w-full" onClick={() => setStep(1)}>המשך</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="label">מה תרצה לשפר?</p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_BY_CAT[cat].map((x) => (
                <button key={x} onClick={() => setFocus(x)}
                  className={`chip ${focus === x ? "chip-active" : ""}`}>{x}</button>
              ))}
            </div>
            <p className="label mt-4">באיזה טווח זמן?</p>
            <div className="grid grid-cols-3 gap-2">
              {[4, 8, 12].map((w) => (
                <button key={w} onClick={() => setWeeks(w)}
                  className={`chip ${weeks === w ? "chip-active" : ""}`}>{w} שבועות</button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setStep(0)}>הקודם</button>
              <button className="btn btn-primary flex-[2]" disabled={!focus} onClick={() => setStep(2)}>בנה מטרה</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-2 text-sm font-semibold">המטרה שבנינו</p>
            <div className="card mb-3" style={{ background: "var(--surface-2)" }}>
              <p className="text-sm leading-relaxed font-medium">{goalText}</p>
            </div>
            <div className="card mb-1" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-bold" style={{ color: "var(--brand)" }}>תוכנית פעולה שבועית</p>
              <p className="mt-0.5 text-sm">{weeklyAction}</p>
            </div>
            <div className="card mt-2" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-bold" style={{ color: "var(--brand)" }}>מדד הצלחה</p>
              <p className="mt-0.5 text-sm">{METRIC_BY_FOCUS[focus] ?? "מדד אישי"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setStep(1)}>שינוי</button>
              <button className="btn btn-primary flex-[2]" disabled={busy} onClick={save}>
                {busy ? "שומר…" : "שמירת המטרה"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { rememberItem } from "../lib/db";
import { Wordmark } from "../components/Logo";
import { ChipGroup, TextInput, TextArea } from "../components/Form";

const POSITIONS = ["שוער", "מגן", "בלם", "קשר הגנתי", "קשר", "כנף", "חלוץ"];
const FEET = ["ימין", "שמאל", "שתיהן"];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    team: "",
    league: "",
    main_position: "" as string,
    strong_foot: "" as string,
    shirt_number: "",
    height_cm: "",
    weight_kg: "",
    professional_goals: "",
    mental_goals: "",
    personal_goals: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = [
    {
      title: "ברוך הבא ל־PLAYERMIND",
      desc: "מערכת שמלווה אותך כשחקן וכאדם. נכיר אותך בכמה שאלות קצרות.",
      render: () => (
        <div className="space-y-4">
          <div className="rounded-3xl p-5" style={{ background: "var(--surface-2)" }}>
            <p className="text-sm leading-relaxed">
              המערכת לא מודדת אותך – היא מלווה אותך. ככל שתשתף יותר, התובנות יהיו אישיות יותר.
              אין כאן ציונים, רק הבנה והתקדמות.
            </p>
          </div>
          <div>
            <label className="label">איך קוראים לך?</label>
            <TextInput value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="שם מלא" />
          </div>
        </div>
      ),
      valid: () => form.full_name.trim().length > 1,
    },
    {
      title: "הקבוצה שלך",
      desc: "פרטי המסגרת שבה אתה משחק.",
      render: () => (
        <div className="space-y-4">
          <div>
            <label className="label">קבוצה</label>
            <TextInput value={form.team} onChange={(v) => set("team", v)} placeholder="שם הקבוצה" />
          </div>
          <div>
            <label className="label">ליגה</label>
            <TextInput value={form.league} onChange={(v) => set("league", v)} placeholder="שם הליגה" />
          </div>
          <div>
            <label className="label">מספר חולצה</label>
            <TextInput value={form.shirt_number} onChange={(v) => set("shirt_number", v)} type="number" placeholder="10" />
          </div>
        </div>
      ),
      valid: () => true,
    },
    {
      title: "התפקיד שלך",
      desc: "כדי שנבין את ההקשר המקצועי שלך.",
      render: () => (
        <div className="space-y-5">
          <div>
            <label className="label">תפקיד ראשי</label>
            <ChipGroup options={POSITIONS} value={form.main_position}
                       onChange={(v) => set("main_position", v)} columns={2} />
          </div>
          <div>
            <label className="label">רגל חזקה</label>
            <ChipGroup options={FEET} value={form.strong_foot}
                       onChange={(v) => set("strong_foot", v)} columns={3} />
          </div>
        </div>
      ),
      valid: () => !!form.main_position,
    },
    {
      title: "נתונים פיזיים",
      desc: "אופציונלי – עוזר לנו להתאים תובנות.",
      render: () => (
        <div className="space-y-4">
          <div>
            <label className="label">גובה (ס״מ)</label>
            <TextInput value={form.height_cm} onChange={(v) => set("height_cm", v)} type="number" placeholder="180" />
          </div>
          <div>
            <label className="label">משקל (ק״ג)</label>
            <TextInput value={form.weight_kg} onChange={(v) => set("weight_kg", v)} type="number" placeholder="75" />
          </div>
        </div>
      ),
      valid: () => true,
    },
    {
      title: "המטרות שלך",
      desc: "מה תרצה להשיג? אפשר לעדכן בכל זמן.",
      render: () => (
        <div className="space-y-4">
          <div>
            <label className="label">מטרה מקצועית</label>
            <TextArea value={form.professional_goals} onChange={(v) => set("professional_goals", v)}
                      placeholder="לדוגמה: להפוך לשחקן יסוד" rows={2} />
          </div>
          <div>
            <label className="label">מטרה מנטלית</label>
            <TextArea value={form.mental_goals} onChange={(v) => set("mental_goals", v)}
                      placeholder="לדוגמה: לחזור מהר יותר אחרי טעות" rows={2} />
          </div>
          <div>
            <label className="label">מטרה אישית</label>
            <TextArea value={form.personal_goals} onChange={(v) => set("personal_goals", v)}
                      placeholder="לדוגמה: לשמור על איזון עם המשפחה" rows={2} />
          </div>
        </div>
      ),
      valid: () => true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  async function finish() {
    if (!user) return;
    setBusy(true);
    await supabase.from("player_profile").upsert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      team: form.team || null,
      league: form.league || null,
      main_position: form.main_position || null,
      strong_foot: form.strong_foot || null,
      shirt_number: form.shirt_number ? Number(form.shirt_number) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      professional_goals: form.professional_goals || null,
      mental_goals: form.mental_goals || null,
      personal_goals: form.personal_goals || null,
      onboarded: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // מטרות פעילות + זיכרון אישי
    const goals = [
      { category: "מקצועית", title: form.professional_goals },
      { category: "מנטלית", title: form.mental_goals },
      { category: "אישית", title: form.personal_goals },
    ].filter((g) => g.title.trim());
    if (goals.length) {
      await supabase.from("player_goals").insert(
        goals.map((g) => ({ user_id: user.id, category: g.category, title: g.title.trim() })),
      );
      for (const g of goals) await rememberItem(user.id, "מטרה", `${g.category}: ${g.title.trim()}`);
    }

    await refreshProfile();
    setBusy(false);
    toast("הכל מוכן! ברוך הבא למסע.", "success");
    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-12" style={{ background: "var(--bg)" }}>
      <div className="mb-6 flex items-center justify-between">
        <Wordmark />
        <span className="text-sm muted">{step + 1} / {steps.length}</span>
      </div>

      <div className="mb-6 flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
               style={{ background: i <= step ? "var(--brand)" : "var(--surface-2)" }} />
        ))}
      </div>

      <div className="card animate-fade-up flex-1">
        <h1 className="font-display text-2xl font-extrabold">{current.title}</h1>
        <p className="mt-1 mb-5 text-sm muted">{current.desc}</p>
        {current.render()}
      </div>

      <div className="safe-bottom mt-5 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost flex-1">
            הקודם
          </button>
        )}
        <button
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          disabled={!current.valid() || busy}
          className="btn btn-primary flex-[2]"
        >
          {busy ? "שומר…" : isLast ? "סיום והתחלה" : "המשך"}
        </button>
      </div>
    </div>
  );
}

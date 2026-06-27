import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { rememberItem } from "../lib/db";
import { SAVE_ERROR } from "../lib/save";
import { Wordmark } from "../components/Logo";
import { ChipGroup, TextInput, TextArea } from "../components/Form";

const POSITIONS = ["שוער", "מגן", "בלם", "קשר הגנתי", "קשר", "כנף", "חלוץ"];
const FEET = ["ימין", "שמאל", "שתיהן"];

// פרופיל חובה – נחסם עד למילוי כל השדות הנדרשים
export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [f, setF] = useState({
    full_name: "", birth_date: "", height_cm: "", weight_kg: "",
    team: "", league: "", main_position: "", strong_foot: "",
    professional_goals: "", physical_goals: "", mental_goals: "", team_goals: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  // טעינת נתונים קיימים (אם המשתמש חזר להשלים)
  useEffect(() => {
    if (profile) {
      setF((p) => ({
        ...p,
        full_name: profile.full_name ?? "",
        birth_date: profile.birth_date ?? "",
        height_cm: profile.height_cm?.toString() ?? "",
        weight_kg: profile.weight_kg?.toString() ?? "",
        team: profile.team ?? "", league: profile.league ?? "",
        main_position: profile.main_position ?? "",
        strong_foot: profile.strong_foot ?? "",
        professional_goals: profile.professional_goals ?? "",
        physical_goals: profile.physical_goals ?? "",
        mental_goals: profile.mental_goals ?? "",
        team_goals: profile.team_goals ?? "",
      }));
    }
  }, [profile]);

  const required: (keyof typeof f)[] = [
    "full_name", "birth_date", "height_cm", "weight_kg", "team", "league",
    "main_position", "strong_foot", "professional_goals", "physical_goals",
    "mental_goals", "team_goals",
  ];
  const missing = required.filter((k) => !f[k].trim());
  const valid = missing.length === 0;

  async function finish() {
    if (!user) return;
    if (!valid) { setShowErrors(true); toast("יש להשלים את כל השדות.", "error"); return; }
    setBusy(true);
    const { error } = await supabase.from("player_profile").upsert({
      user_id: user.id,
      full_name: f.full_name.trim(),
      birth_date: f.birth_date || null,
      height_cm: Number(f.height_cm),
      weight_kg: Number(f.weight_kg),
      team: f.team.trim(), league: f.league.trim(),
      main_position: f.main_position, strong_foot: f.strong_foot,
      professional_goals: f.professional_goals.trim(),
      physical_goals: f.physical_goals.trim(),
      mental_goals: f.mental_goals.trim(),
      team_goals: f.team_goals.trim(),
      onboarded: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) { setBusy(false); toast(SAVE_ERROR, "error"); return; }

    // מטרות פעילות + זיכרון אישי
    await supabase.from("player_goals").delete().eq("user_id", user.id);
    const goals = [
      ["מקצועית", f.professional_goals], ["פיזית", f.physical_goals],
      ["מנטלית", f.mental_goals], ["קבוצתית", f.team_goals],
    ].filter(([, v]) => v.trim());
    if (goals.length) {
      await supabase.from("player_goals").insert(
        goals.map(([category, title]) => ({ user_id: user.id, category, title: title.trim() })),
      );
      for (const [category, title] of goals) await rememberItem(user.id, "מטרה", `${category}: ${title.trim()}`);
    }

    await refreshProfile();
    setBusy(false);
    toast("הפרופיל הושלם. ברוך הבא.", "success");
    navigate("/", { replace: true });
  }

  const err = (k: keyof typeof f) => showErrors && !f[k].trim();

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-10" style={{ background: "var(--bg)" }}>
      <div className="mb-6 flex flex-col items-center text-center">
        <Wordmark size={34} />
        <h1 className="mt-5 font-display text-2xl font-extrabold">השלמת פרופיל שחקן</h1>
        <p className="mt-1 max-w-xs text-sm muted leading-relaxed">
          הפרופיל הוא הבסיס שעליו נבנות כל התובנות והליווי האישי. מילוי חד-פעמי, דקה-שתיים.
        </p>
      </div>

      <div className="space-y-5">
        <Group title="פרטים אישיים">
          <FieldX label="שם מלא" error={err("full_name")}>
            <TextInput value={f.full_name} onChange={(v) => set("full_name", v)} placeholder="שם מלא" />
          </FieldX>
          <FieldX label="תאריך לידה" error={err("birth_date")}>
            <TextInput value={f.birth_date} onChange={(v) => set("birth_date", v)} type="date" />
          </FieldX>
          <div className="grid grid-cols-2 gap-3">
            <FieldX label="גובה (ס״מ)" error={err("height_cm")}>
              <TextInput value={f.height_cm} onChange={(v) => set("height_cm", v)} type="number" placeholder="180" />
            </FieldX>
            <FieldX label="משקל (ק״ג)" error={err("weight_kg")}>
              <TextInput value={f.weight_kg} onChange={(v) => set("weight_kg", v)} type="number" placeholder="75" />
            </FieldX>
          </div>
        </Group>

        <Group title="קבוצה ותפקיד">
          <div className="grid grid-cols-2 gap-3">
            <FieldX label="קבוצה" error={err("team")}>
              <TextInput value={f.team} onChange={(v) => set("team", v)} placeholder="שם הקבוצה" />
            </FieldX>
            <FieldX label="ליגה" error={err("league")}>
              <TextInput value={f.league} onChange={(v) => set("league", v)} placeholder="שם הליגה" />
            </FieldX>
          </div>
          <FieldX label="תפקיד ראשי" error={err("main_position")}>
            <ChipGroup options={POSITIONS} value={f.main_position} onChange={(v) => set("main_position", v)} columns={2} />
          </FieldX>
          <FieldX label="רגל חזקה" error={err("strong_foot")}>
            <ChipGroup options={FEET} value={f.strong_foot} onChange={(v) => set("strong_foot", v)} columns={3} />
          </FieldX>
        </Group>

        <Group title="מטרות">
          <FieldX label="מטרות מקצועיות" error={err("professional_goals")}>
            <TextArea value={f.professional_goals} onChange={(v) => set("professional_goals", v)} rows={2}
              placeholder="לדוגמה: לשפר קבלת החלטות תחת לחץ" />
          </FieldX>
          <FieldX label="מטרות פיזיות" error={err("physical_goals")}>
            <TextArea value={f.physical_goals} onChange={(v) => set("physical_goals", v)} rows={2}
              placeholder="לדוגמה: לשפר מהירות וסבולת" />
          </FieldX>
          <FieldX label="מטרות מנטליות" error={err("mental_goals")}>
            <TextArea value={f.mental_goals} onChange={(v) => set("mental_goals", v)} rows={2}
              placeholder="לדוגמה: לחזור מהר יותר אחרי טעות" />
          </FieldX>
          <FieldX label="מטרות קבוצתיות" error={err("team_goals")}>
            <TextArea value={f.team_goals} onChange={(v) => set("team_goals", v)} rows={2}
              placeholder="לדוגמה: תקשורת טובה יותר עם החברים" />
          </FieldX>
        </Group>
      </div>

      <div className="safe-bottom sticky bottom-0 -mx-5 mt-6 px-5 pt-3"
           style={{ background: "linear-gradient(to top, var(--bg) 75%, transparent)" }}>
        {showErrors && !valid && (
          <p className="mb-2 text-center text-xs" style={{ color: "#b91c1c" }}>
            נותרו {missing.length} שדות להשלמה
          </p>
        )}
        <button onClick={finish} disabled={busy} className="btn btn-primary w-full">
          {busy ? "שומר…" : "השלמת פרופיל והמשך"}
        </button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <h2 className="font-display font-bold">{title}</h2>
      {children}
    </div>
  );
}

function FieldX({ label, error, children }: { label: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {error && <span style={{ color: "#b91c1c" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

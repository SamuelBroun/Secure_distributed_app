import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { getInjuries, rememberItem } from "../lib/db";
import type { InjuryRecord } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { Field, TextInput, TextArea, ChipGroup } from "../components/Form";

const POSITIONS = ["שוער", "מגן", "בלם", "קשר הגנתי", "קשר", "כנף", "חלוץ"];
const FEET = ["ימין", "שמאל", "שתיהן"];

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);

  const [f, setF] = useState({
    full_name: "", birth_date: "", height_cm: "", weight_kg: "",
    strong_foot: "", shirt_number: "", team: "", league: "",
    main_position: "", secondary_position: "",
    personal_goals: "", professional_goals: "", physical_goals: "",
    mental_goals: "", team_goals: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (profile) {
      setF({
        full_name: profile.full_name ?? "",
        birth_date: profile.birth_date ?? "",
        height_cm: profile.height_cm?.toString() ?? "",
        weight_kg: profile.weight_kg?.toString() ?? "",
        strong_foot: profile.strong_foot ?? "",
        shirt_number: profile.shirt_number?.toString() ?? "",
        team: profile.team ?? "", league: profile.league ?? "",
        main_position: profile.main_position ?? "",
        secondary_position: profile.secondary_position ?? "",
        personal_goals: profile.personal_goals ?? "",
        professional_goals: profile.professional_goals ?? "",
        physical_goals: profile.physical_goals ?? "",
        mental_goals: profile.mental_goals ?? "",
        team_goals: profile.team_goals ?? "",
      });
    }
  }, [profile]);

  useEffect(() => { if (user) getInjuries(user.id).then(setInjuries); }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("player_profile").upsert({
      user_id: user.id,
      full_name: f.full_name || null,
      birth_date: f.birth_date || null,
      height_cm: f.height_cm ? Number(f.height_cm) : null,
      weight_kg: f.weight_kg ? Number(f.weight_kg) : null,
      strong_foot: f.strong_foot || null,
      shirt_number: f.shirt_number ? Number(f.shirt_number) : null,
      team: f.team || null, league: f.league || null,
      main_position: f.main_position || null,
      secondary_position: f.secondary_position || null,
      personal_goals: f.personal_goals || null,
      professional_goals: f.professional_goals || null,
      physical_goals: f.physical_goals || null,
      mental_goals: f.mental_goals || null,
      team_goals: f.team_goals || null,
      onboarded: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // סנכרון מטרות פעילות
    await supabase.from("player_goals").delete().eq("user_id", user.id);
    const goals = [
      ["אישית", f.personal_goals], ["מקצועית", f.professional_goals],
      ["פיזית", f.physical_goals], ["מנטלית", f.mental_goals],
      ["קבוצתית", f.team_goals],
    ].filter(([, v]) => v.trim());
    if (goals.length) {
      await supabase.from("player_goals").insert(
        goals.map(([category, title]) => ({ user_id: user.id, category, title: title.trim() })),
      );
      for (const [category, title] of goals) await rememberItem(user.id, "מטרה", `${category}: ${title.trim()}`);
    }

    await refreshProfile();
    setSaving(false);
    toast("הפרופיל נשמר.", "success");
  }

  return (
    <div>
      <PageHeader title="פרופיל שחקן" subtitle="הבסיס שעליו נבנות התובנות שלך." back />

      <form onSubmit={save} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-display font-bold">פרטים אישיים</h2>
          <Field label="שם מלא"><TextInput value={f.full_name} onChange={(v) => set("full_name", v)} /></Field>
          <Field label="תאריך לידה"><TextInput value={f.birth_date} onChange={(v) => set("birth_date", v)} type="date" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="גובה (ס״מ)"><TextInput value={f.height_cm} onChange={(v) => set("height_cm", v)} type="number" /></Field>
            <Field label="משקל (ק״ג)"><TextInput value={f.weight_kg} onChange={(v) => set("weight_kg", v)} type="number" /></Field>
          </div>
          <Field label="רגל חזקה"><ChipGroup options={FEET} value={f.strong_foot} onChange={(v) => set("strong_foot", v)} columns={3} /></Field>
        </div>

        <div className="card space-y-4">
          <h2 className="font-display font-bold">קבוצה ותפקיד</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="מספר חולצה"><TextInput value={f.shirt_number} onChange={(v) => set("shirt_number", v)} type="number" /></Field>
            <Field label="קבוצה"><TextInput value={f.team} onChange={(v) => set("team", v)} /></Field>
          </div>
          <Field label="ליגה"><TextInput value={f.league} onChange={(v) => set("league", v)} /></Field>
          <Field label="תפקיד ראשי"><ChipGroup options={POSITIONS} value={f.main_position} onChange={(v) => set("main_position", v)} columns={2} /></Field>
          <Field label="תפקיד משני"><ChipGroup options={POSITIONS} value={f.secondary_position} onChange={(v) => set("secondary_position", v)} columns={2} /></Field>
        </div>

        <div className="card space-y-4">
          <h2 className="font-display font-bold">מטרות</h2>
          <Field label="מטרות אישיות"><TextArea value={f.personal_goals} onChange={(v) => set("personal_goals", v)} rows={2} /></Field>
          <Field label="מטרות מקצועיות"><TextArea value={f.professional_goals} onChange={(v) => set("professional_goals", v)} rows={2} /></Field>
          <Field label="מטרות פיזיות"><TextArea value={f.physical_goals} onChange={(v) => set("physical_goals", v)} rows={2} /></Field>
          <Field label="מטרות מנטליות"><TextArea value={f.mental_goals} onChange={(v) => set("mental_goals", v)} rows={2} /></Field>
          <Field label="מטרות קבוצתיות"><TextArea value={f.team_goals} onChange={(v) => set("team_goals", v)} rows={2} /></Field>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          {saving ? "שומר…" : "שמירת פרופיל"}
        </button>
      </form>

      <InjurySection injuries={injuries} onAdded={() => user && getInjuries(user.id).then(setInjuries)} />
    </div>
  );
}

function InjurySection({ injuries, onAdded }: { injuries: InjuryRecord[]; onAdded: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [part, setPart] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function add() {
    if (!user || !title.trim()) return;
    await supabase.from("injury_history").insert({
      user_id: user.id, title: title.trim(), body_part: part || null,
      injury_date: date || null, status,
    });
    await rememberItem(user.id, "פציעה", title.trim());
    setTitle(""); setPart(""); setDate(""); setStatus(null); setOpen(false);
    toast("פציעה נוספה להיסטוריה.", "success");
    onAdded();
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">היסטוריית פציעות</h2>
        <button onClick={() => setOpen((v) => !v)} className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
          {open ? "ביטול" : "+ הוספה"}
        </button>
      </div>

      {open && (
        <div className="card mb-3 space-y-3 animate-fade-up">
          <Field label="כותרת"><TextInput value={title} onChange={setTitle} placeholder="לדוגמה: מתיחת שריר ירך" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="איבר"><TextInput value={part} onChange={setPart} /></Field>
            <Field label="תאריך"><TextInput value={date} onChange={setDate} type="date" /></Field>
          </div>
          <Field label="סטטוס"><ChipGroup options={["פעילה", "בהחלמה", "החלים"]} value={status} onChange={setStatus} columns={3} /></Field>
          <button onClick={add} className="btn btn-ghost w-full">שמירת פציעה</button>
        </div>
      )}

      {injuries.length === 0 ? (
        <p className="text-sm muted">אין פציעות מתועדות. מצוין!</p>
      ) : (
        <div className="space-y-2">
          {injuries.map((inj) => (
            <div key={inj.id} className="card flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{inj.title}</p>
                <p className="text-xs muted">{[inj.body_part, inj.injury_date].filter(Boolean).join(" · ")}</p>
              </div>
              {inj.status && (
                <span className="pill" style={{
                  background: inj.status === "החלים" ? "var(--success)" : "var(--warning)",
                  color: "#143020",
                }}>{inj.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

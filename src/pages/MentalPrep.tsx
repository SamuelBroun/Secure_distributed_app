import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { saveMentalPrep, isoDate } from "../lib/db";
import { SAVE_SUCCESS, SAVE_ERROR } from "../lib/save";
import {
  generateTrainingCard, generateMatchCard, GUIDED_ROUTINE,
  detectDistress, MENTAL_DISCLAIMER, type MentalInputs,
} from "../lib/ai/mental";
import { PageHeader } from "../components/Layout";
import { Field, TextInput, TextArea } from "../components/Form";

export default function MentalPrep() {
  const { type } = useParams<{ type: string }>();
  if (type !== "training" && type !== "match") return <Navigate to="/" replace />;
  return <Flow type={type} key={type} />;
}

function Flow({ type }: { type: "training" | "match" }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMatch = type === "match";
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<string | null>(null);
  const [routine, setRoutine] = useState(false);

  const [f, setF] = useState({
    role: "", professionalGoal: "", mentalGoal: "", firstAction: "",
    focusWord: "", obstacle: "", responsePlan: "", controllable: "", teamContribution: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function generate() {
    if (!user) return;
    const distressText = [f.mentalGoal, f.obstacle, f.responsePlan].join(" ");
    if (detectDistress(distressText)) {
      toast("שווה לדבר עם פסיכולוג ספורט או אדם שאתה סומך עליו.", "info");
    }
    const inputs: MentalInputs = {
      professionalGoal: f.professionalGoal, mentalGoal: f.mentalGoal,
      firstAction: f.firstAction, focusWord: f.focusWord,
      obstacle: f.obstacle, responsePlan: f.responsePlan,
      teamContribution: f.teamContribution,
    };
    const generated = isMatch ? generateMatchCard(inputs) : generateTrainingCard(inputs);
    setCard(generated);
    setBusy(true);
    const { error } = await saveMentalPrep({
      user_id: user.id, type, date: isoDate(new Date()),
      professional_goal: f.professionalGoal || null,
      mental_goal: f.mentalGoal || null,
      first_action: f.firstAction || null,
      focus_word: f.focusWord || null,
      obstacle: f.obstacle || null,
      response_plan: f.responsePlan || null,
      team_contribution: f.teamContribution || null,
      generated_card: generated,
    });
    setBusy(false);
    if (error) return toast(SAVE_ERROR, "error");
    toast(SAVE_SUCCESS, "success");
  }

  return (
    <div>
      <PageHeader
        title={isMatch ? "הכנה מנטלית לפני משחק" : "הכנה מנטלית לפני אימון"}
        subtitle="כמה שאלות קצרות שיכניסו אותך למצב ביצוע." back />

      <div className="mb-4 rounded-2xl px-3 py-2 text-xs leading-relaxed"
           style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
        {MENTAL_DISCLAIMER}
      </div>

      {!card ? (
        <div className="space-y-5">
          {isMatch ? (
            <>
              <Field label="מה התפקיד שלך היום?"><TextInput value={f.role} onChange={(v) => set("role", v)} /></Field>
              <Field label="מה בשליטה שלך?"><TextArea value={f.controllable} onChange={(v) => set("controllable", v)} rows={2} /></Field>
              <Field label="מה הפעולה הראשונה שלך במשחק?"><TextInput value={f.firstAction} onChange={(v) => set("firstAction", v)} /></Field>
              <Field label="איך תגיב לטעות?"><TextArea value={f.responsePlan} onChange={(v) => set("responsePlan", v)} rows={2} /></Field>
              <Field label="איזו מילה תחזיר אותך לפוקוס?"><TextInput value={f.focusWord} onChange={(v) => set("focusWord", v)} /></Field>
              <Field label="מה אתה רוצה להביא לקבוצה?"><TextInput value={f.teamContribution} onChange={(v) => set("teamContribution", v)} /></Field>
            </>
          ) : (
            <>
              <Field label="מה המטרה המקצועית שלך לאימון?"><TextInput value={f.professionalGoal} onChange={(v) => set("professionalGoal", v)} /></Field>
              <Field label="מה המטרה המנטלית שלך לאימון?"><TextInput value={f.mentalGoal} onChange={(v) => set("mentalGoal", v)} /></Field>
              <Field label="מה הפעולה הראשונה שלך באימון?"><TextInput value={f.firstAction} onChange={(v) => set("firstAction", v)} /></Field>
              <Field label="איזו מילה תחבר אותך לפוקוס?"><TextInput value={f.focusWord} onChange={(v) => set("focusWord", v)} /></Field>
              <Field label="מה עלול להפריע לך היום?"><TextInput value={f.obstacle} onChange={(v) => set("obstacle", v)} /></Field>
              <Field label="איך תגיב אם זה יקרה?"><TextArea value={f.responsePlan} onChange={(v) => set("responsePlan", v)} rows={2} /></Field>
            </>
          )}
          <button onClick={generate} disabled={busy} className="btn btn-primary w-full">
            {busy ? "בונה…" : "צור כרטיס כניסה"}
          </button>
        </div>
      ) : (
        <div className="animate-fade-up space-y-4">
          <div className="card" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
            <p className="mb-1 text-xs opacity-80">{isMatch ? "כרטיס מנטלי למשחק" : "משפט כניסה לאימון"}</p>
            <p className="whitespace-pre-line font-display text-lg font-bold leading-relaxed">{card}</p>
          </div>

          <button onClick={() => setRoutine((v) => !v)} className="btn btn-ghost w-full">
            {routine ? "הסתר שגרה מודרכת" : "שגרה מודרכת (60–90 שניות)"}
          </button>

          {routine && (
            <div className="space-y-2">
              {GUIDED_ROUTINE.map((r, i) => (
                <div key={r.step} className="card flex items-start gap-3 py-3 animate-fade-up">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display font-extrabold text-white"
                        style={{ background: "var(--brand)" }}>{i + 1}</span>
                  <div>
                    <p className="font-display font-bold">{r.step}</p>
                    <p className="text-sm muted">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setCard(null); setRoutine(false); }} className="btn btn-ghost w-full">
            עריכה מחדש
          </button>
        </div>
      )}
    </div>
  );
}

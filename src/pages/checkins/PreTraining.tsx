import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr } from "../../lib/db";
import { persist, SAVE_SUCCESS, SAVE_ERROR } from "../../lib/save";
import { PageHeader } from "../../components/Layout";
import { Field, ChipGroup, YesNo, TextArea, SaveBar } from "../../components/Form";

export default function PreTraining() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [arrival, setArrival] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [ate, setAte] = useState<string | null>(null);
  const [drank, setDrank] = useState<string | null>(null);
  const [proGoal, setProGoal] = useState("");
  const [mentalGoal, setMentalGoal] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { ok } = await persist(user.id, "training_pre", async () => {
      const r = await supabase.from("training_sessions").insert({
        user_id: user.id, log_date: todayStr(), phase: "pre",
        arrival_state: arrival, focus_today: focus,
        ate: ate === "כן", drank: drank === "כן",
        pro_goal: proGoal || null, mental_goal: mentalGoal || null,
      });
      return { error: r.error };
    });
    setSaving(false);
    if (!ok) return toast(SAVE_ERROR, "error");
    toast(SAVE_SUCCESS, "success");
    navigate("/");
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title="לפני אימון" subtitle="כיוון קצר לפני שיוצאים למגרש." back />
      <div className="space-y-5">
        <Field label="איך אתה מגיע?">
          <ChipGroup options={["מוכן", "צריך פוקוס", "עייף", "חד"]} value={arrival} onChange={setArrival} columns={4} />
        </Field>
        <Field label="מה חשוב לך היום?">
          <ChipGroup options={["ריכוז", "מנהיגות", "קבלת החלטות", "ביטחון", "אינטנסיביות"]} value={focus} onChange={setFocus} columns={2} />
        </Field>
        <Field label="האם אכלת?"><YesNo value={ate} onChange={setAte} /></Field>
        <Field label="האם שתית?"><YesNo value={drank} onChange={setDrank} /></Field>
        <Field label="מטרה מקצועית">
          <TextArea value={proGoal} onChange={setProGoal} placeholder="מה תרצה לשפר מקצועית באימון" rows={2} />
        </Field>
        <Field label="מטרה מנטלית">
          <TextArea value={mentalGoal} onChange={setMentalGoal} placeholder="על מה תעבוד מנטלית" rows={2} />
        </Field>
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr } from "../../lib/db";
import { PageHeader } from "../../components/Layout";
import { Field, ChipGroup, TextArea, SaveBar } from "../../components/Form";

export default function PreMatch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [arrival, setArrival] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [control, setControl] = useState("");
  const [firstAction, setFirstAction] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("matches").insert({
      user_id: user.id, log_date: todayStr(), phase: "pre",
      arrival_state: arrival, goal: goal || null,
      in_control: control || null, first_action: firstAction || null,
    });
    setSaving(false);
    if (error) return toast("שמירה נכשלה, נסה שוב.", "error");
    toast("ההכנה למשחק נשמרה. תיהנה מהמשחק!", "success");
    navigate("/");
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title="לפני משחק" subtitle="להיכנס למשחק עם ראש צלול." back />
      <div className="space-y-5">
        <Field label="איך אתה מגיע?">
          <ChipGroup options={["רגוע", "נרגש", "לחוץ", "בטוח"]} value={arrival} onChange={setArrival} columns={4} />
        </Field>
        <Field label="מה המטרה?"><TextArea value={goal} onChange={setGoal} rows={2} /></Field>
        <Field label="על מה יש לך שליטה?" hint="התמקדות במה שבשליטתך מפחיתה לחץ.">
          <TextArea value={control} onChange={setControl} rows={2} />
        </Field>
        <Field label="מה הפעולה הראשונה שלך?"><TextArea value={firstAction} onChange={setFirstAction} rows={2} /></Field>
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

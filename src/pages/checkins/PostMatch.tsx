import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr } from "../../lib/db";
import { persist, SAVE_SUCCESS, SAVE_ERROR } from "../../lib/save";
import { PageHeader } from "../../components/Layout";
import { Field, TextInput, TextArea, SaveBar } from "../../components/Form";

export default function PostMatch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [minutes, setMinutes] = useState("");
  const [worked, setWorked] = useState("");
  const [lessWorked, setLessWorked] = useState("");
  const [next, setNext] = useState("");
  const [lostFocus, setLostFocus] = useState("");
  const [recovered, setRecovered] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { ok } = await persist(user.id, "match_post", async () => {
      const r = await supabase.from("matches").insert({
        user_id: user.id, log_date: todayStr(), phase: "post",
        minutes_played: minutes ? Number(minutes) : null,
        what_worked: worked || null, what_less_worked: lessWorked || null,
        take_to_next: next || null, lost_focus_moment: lostFocus || null,
        how_recovered: recovered || null,
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
      <PageHeader title="אחרי משחק" subtitle="כל משחק הוא הזדמנות ללמידה." back />
      <div className="space-y-5">
        <Field label="דקות משחק">
          <TextInput value={minutes} onChange={setMinutes} type="number" placeholder="לדוגמה: 90" />
        </Field>
        <Field label="מה עבד?"><TextArea value={worked} onChange={setWorked} rows={2} /></Field>
        <Field label="מה פחות עבד?"><TextArea value={lessWorked} onChange={setLessWorked} rows={2} /></Field>
        <Field label="מה לקחת למשחק הבא?"><TextArea value={next} onChange={setNext} rows={2} /></Field>
        <Field label="היה רגע שאיבדת פוקוס?"><TextArea value={lostFocus} onChange={setLostFocus} rows={2} /></Field>
        <Field label="איך חזרת?"><TextArea value={recovered} onChange={setRecovered} rows={2} /></Field>
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

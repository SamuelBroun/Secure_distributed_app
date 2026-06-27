import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr } from "../../lib/db";
import { persist, SAVE_SUCCESS, SAVE_ERROR } from "../../lib/save";
import { PageHeader } from "../../components/Layout";
import { Field, ChipGroup, TextArea, SaveBar } from "../../components/Form";

export default function PostTraining() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [good, setGood] = useState("");
  const [learned, setLearned] = useState("");
  const [improve, setImprove] = useState("");
  const [challenge, setChallenge] = useState("");
  const [handled, setHandled] = useState("");
  const [load, setLoad] = useState<string | null>(null);
  const [pain, setPain] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { ok } = await persist(user.id, "training_post", async () => {
      const r = await supabase.from("training_sessions").insert({
        user_id: user.id, log_date: todayStr(), phase: "post",
        what_was_good: good || null, what_learned: learned || null,
        what_improve: improve || null, challenging_moment: challenge || null,
        how_handled: handled || null, load_level: load, pain_after: pain,
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
      <PageHeader title="אחרי אימון" subtitle="רגע של רפלקציה הופך אימון ללמידה." back />
      <div className="space-y-5">
        <Field label="מה היה טוב?"><TextArea value={good} onChange={setGood} rows={2} /></Field>
        <Field label="מה למדת?"><TextArea value={learned} onChange={setLearned} rows={2} /></Field>
        <Field label="מה לשפר?"><TextArea value={improve} onChange={setImprove} rows={2} /></Field>
        <Field label="היה רגע מאתגר?"><TextArea value={challenge} onChange={setChallenge} rows={2} /></Field>
        <Field label="איך התמודדת?"><TextArea value={handled} onChange={setHandled} rows={2} /></Field>
        <Field label="יש עומס?">
          <ChipGroup options={["לא", "קל", "בינוני", "גבוה"]} value={load} onChange={setLoad} columns={4} />
        </Field>
        <Field label="יש כאב?">
          <ChipGroup options={["לא", "קל", "בינוני", "משמעותי"]} value={pain} onChange={setPain} columns={4} />
        </Field>
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

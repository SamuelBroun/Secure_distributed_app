import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr } from "../../lib/db";
import { PageHeader } from "../../components/Layout";
import { Field, ChipGroup, YesNo, TextArea, SaveBar } from "../../components/Form";

export default function LifeBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [family, setFamily] = useState<string | null>(null);
  const [friends, setFriends] = useState<string | null>(null);
  const [enjoy, setEnjoy] = useState<string | null>(null);
  const [week, setWeek] = useState<string | null>(null);
  const [moment, setMoment] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("life_balance_logs").insert({
      user_id: user.id, log_date: todayStr(),
      family_time: family, met_friends: friends, did_enjoyable: enjoy,
      week_feeling: week, good_moment: moment || null,
    });
    setSaving(false);
    if (error) return toast("שמירה נכשלה, נסה שוב.", "error");
    toast("נשמר. כדורגל הוא חלק מהחיים שלך, לא כל החיים שלך.", "success");
    navigate("/");
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title="החיים מחוץ לכדורגל" subtitle="איזון הוא חלק מהביצועים שלך." back />
      <div className="space-y-5">
        <Field label="האם הקדשת זמן למשפחה?">
          <ChipGroup options={["כן", "חלקית", "לא"]} value={family} onChange={setFamily} columns={3} />
        </Field>
        <Field label="האם נפגשת עם חברים?"><YesNo value={friends} onChange={setFriends} /></Field>
        <Field label="האם עשית משהו שנהנית ממנו?"><YesNo value={enjoy} onChange={setEnjoy} /></Field>
        <Field label="איך הרגשת השבוע?">
          <ChipGroup options={["מאוזן", "טוב", "עמוס", "זקוק למנוחה"]} value={week} onChange={setWeek} columns={2} />
        </Field>
        <Field label="רגע טוב השבוע"><TextArea value={moment} onChange={setMoment} rows={2} /></Field>
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

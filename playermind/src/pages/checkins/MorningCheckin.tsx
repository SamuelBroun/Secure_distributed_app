import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { getTodayCheckin, todayStr } from "../../lib/db";
import { PageHeader } from "../../components/Layout";
import { Field, ChipGroup, TextArea, TextInput, SaveBar } from "../../components/Form";
import { Spinner } from "../../components/Loading";

export default function MorningCheckin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [wake, setWake] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [pain, setPain] = useState<string | null>(null);
  const [todayType, setTodayType] = useState<string | null>(null);
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (!user) return;
    getTodayCheckin(user.id).then((c) => {
      if (c) {
        setExistingId(c.id);
        setSleepHours(c.sleep_hours?.toString() ?? "");
        setSleepQuality(c.sleep_quality); setWake(c.wake_feeling);
        setBody(c.body_feeling); setMood(c.mood); setPain(c.pain_level);
        setTodayType(c.today_type); setGoal(c.daily_goal ?? "");
      }
      setLoading(false);
    });
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      log_date: todayStr(),
      sleep_hours: sleepHours ? Number(sleepHours) : null,
      sleep_quality: sleepQuality, wake_feeling: wake, body_feeling: body,
      mood, pain_level: pain, today_type: todayType, daily_goal: goal || null,
    };
    const q = existingId
      ? supabase.from("daily_checkins").update(payload).eq("id", existingId)
      : supabase.from("daily_checkins").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast("שמירה נכשלה, נסה שוב.", "error");
    toast("צ׳ק־אין הבוקר נשמר. שיהיה יום מצוין!", "success");
    navigate("/");
  }

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit}>
      <PageHeader title="צ׳ק־אין בוקר" subtitle="דקה אחת שמכוונת את כל היום." back />
      <div className="space-y-5">
        <Field label="כמה שעות ישנת?">
          <TextInput value={sleepHours} onChange={setSleepHours} type="number" placeholder="לדוגמה: 7.5" />
        </Field>
        <Field label="איכות שינה">
          <ChipGroup options={["טובה", "סבירה", "לא טובה"]} value={sleepQuality} onChange={setSleepQuality} columns={3} />
        </Field>
        <Field label="איך קמת?">
          <ChipGroup options={["רענן", "בסדר", "עייף", "מותש"]} value={wake} onChange={setWake} columns={4} />
        </Field>
        <Field label="איך הגוף מרגיש?">
          <ChipGroup options={["התאושש", "התאושש חלקית", "לא התאושש"]} value={body} onChange={setBody} columns={3} />
        </Field>
        <Field label="מצב רוח">
          <ChipGroup options={["רגוע", "ממוקד", "עמוס", "לחוץ"]} value={mood} onChange={setMood} columns={4} />
        </Field>
        <Field label="יש כאב?">
          <ChipGroup options={["לא", "קל", "בינוני", "משמעותי"]} value={pain} onChange={setPain} columns={4} />
        </Field>
        <Field label="מה יש היום?">
          <ChipGroup options={["אימון", "משחק", "חדר כושר", "מנוחה", "טיפול", "אחר"]} value={todayType} onChange={setTodayType} columns={3} />
        </Field>
        <Field label="מה המטרה שלך להיום?">
          <TextArea value={goal} onChange={setGoal} placeholder="המטרה שתלווה אותך היום" />
        </Field>
      </div>
      <SaveBar label="שמור והמשך" saving={saving} />
    </form>
  );
}

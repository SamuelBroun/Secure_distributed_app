import { useEffect, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import { Plus, X, Trash2, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getWeekSchedule, addScheduleBlock, deleteScheduleBlock, isoDate,
  getHabitsInRange, toggleHabitToday, habitConsistencyLabel,
} from "../lib/db";
import { SAVE_SUCCESS, SAVE_ERROR } from "../lib/save";
import type { ScheduleBlock, HabitRecord } from "../lib/types";
import { SCHEDULE_CATEGORIES, INTENSITIES, reviewSchedule, type ScheduleReviewItem } from "../lib/ai/schedule";
import { PageHeader } from "../components/Layout";
import { Icon } from "../components/Icon";
import { Field, TextInput, ChipGroup, TextArea } from "../components/Form";
import { Spinner } from "../components/Loading";
import { TONE_COLOR } from "../lib/ai/readiness";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const HABITS = [
  { key: "sleep_time", label: "שעת שינה קבועה", icon: "sleep" },
  { key: "morning_checkin", label: "צ׳ק-אין בוקר", icon: "checklist" },
  { key: "pre_train_mental", label: "הכנה מנטלית לפני אימון", icon: "mental" },
  { key: "post_match_review", label: "סיכום אחרי משחק", icon: "performance" },
  { key: "family_time", label: "זמן משפחה שבועי", icon: "life" },
  { key: "recovery", label: "התאוששות אחרי אימון", icon: "recovery" },
];

export default function Schedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState(isoDate(new Date()));
  const [review, setReview] = useState<ScheduleReviewItem[] | null>(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function load() {
    if (!user) return;
    const [b, h] = await Promise.all([
      getWeekSchedule(user.id, isoDate(days[0]), isoDate(days[6])),
      getHabitsInRange(user.id, 14),
    ]);
    setBlocks(b); setHabits(h); setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const todayISO = isoDate(new Date());

  async function removeBlock(id: string) {
    await deleteScheduleBlock(id);
    setBlocks((b) => b.filter((x) => x.id !== id));
    setReview(null);
  }

  function habitDoneToday(key: string) {
    return habits.some((h) => h.habit_type === key && h.date === todayISO && h.completed);
  }
  function habitConsistency(key: string) {
    const count = habits.filter((h) => h.habit_type === key && h.completed).length;
    return habitConsistencyLabel(count);
  }
  async function flipHabit(key: string) {
    if (!user) return;
    const done = habitDoneToday(key);
    const { error } = await toggleHabitToday(user.id, key, !done);
    if (error) return toast(SAVE_ERROR, "error");
    await load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="לו״ז שבועי" subtitle="תכנון שתומך בביצועים, התאוששות ואיזון." />

      <div className="mb-3 flex gap-2">
        <button onClick={() => { setAddDate(todayISO); setAddOpen(true); }} className="btn btn-primary flex-1">
          <Plus size={18} /> הוסף פעילות
        </button>
        <button onClick={() => setReview(reviewSchedule(blocks))} className="btn btn-ghost flex-1">
          <Sparkles size={18} /> נתח את השבוע
        </button>
      </div>

      {review && (
        <div className="card mb-4 animate-fade-up">
          <p className="mb-2 font-display font-bold">ניתוח השבוע</p>
          <div className="space-y-2">
            {review.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TONE_COLOR[r.tone] }} />
                <p className="text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* תצוגת שבוע */}
      <div className="space-y-3">
        {days.map((d, i) => {
          const di = isoDate(d);
          const dayBlocks = blocks.filter((b) => b.date === di);
          const isToday = di === todayISO;
          return (
            <div key={di} className="card" style={isToday ? { borderColor: "var(--brand)" } : undefined}>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display font-bold">
                  {DAY_NAMES[i]} <span className="text-xs muted">{format(d, "dd/MM")}</span>
                  {isToday && <span className="pill mr-2" style={{ background: "var(--brand)", color: "#fff" }}>היום</span>}
                </p>
                <button onClick={() => { setAddDate(di); setAddOpen(true); }} aria-label="הוסף"
                  className="muted" style={{ color: "var(--brand)" }}><Plus size={18} /></button>
              </div>
              {dayBlocks.length === 0 ? (
                <p className="text-xs muted">אין פעילויות מתוכננות</p>
              ) : (
                <div className="space-y-1.5">
                  {dayBlocks.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5"
                         style={{ background: "var(--surface-2)" }}>
                      <span className="shrink-0" style={{ color: "var(--brand)" }}><Icon name="calendar" size={15} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{b.title || b.category}</p>
                        <p className="text-[11px] muted">{[b.category, b.start_time, b.intensity].filter(Boolean).join(" · ")}</p>
                      </div>
                      <button onClick={() => removeBlock(b.id)} aria-label="מחיקה" className="muted"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* הרגלים */}
      <h2 className="mb-1 mt-8 font-display text-lg font-bold">בניית הרגלים</h2>
      <p className="mb-3 text-sm muted">סמן מה השלמת היום. בלי לחץ ובלי ציונים – רק עקביות עדינה.</p>
      <div className="space-y-2">
        {HABITS.map((h) => {
          const done = habitDoneToday(h.key);
          return (
            <div key={h.key} className="card flex items-center gap-3 py-3">
              <span className="shrink-0" style={{ color: "var(--brand)" }}><Icon name={h.icon} size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-medium">{h.label}</p>
                <p className="text-xs muted">{habitConsistency(h.key)}</p>
              </div>
              <button onClick={() => flipHabit(h.key)} aria-label="סימון"
                className="flex h-8 w-8 items-center justify-center rounded-xl transition"
                style={{ background: done ? "var(--brand)" : "var(--surface-2)" }}>
                {done && <Check size={16} color="#fff" strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>

      {addOpen && (
        <AddBlock date={addDate} onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); setReview(null); load(); }} />
      )}
    </div>
  );
}

function AddBlock({ date, onClose, onSaved }: { date: string; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(SCHEDULE_CATEGORIES[0]);
  const [d, setD] = useState(date);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [intensity, setIntensity] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState<string>("לא");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await addScheduleBlock({
      user_id: user.id, title: title || null, category, date: d,
      start_time: start || null, end_time: end || null,
      intensity, notes: notes || null, recurring: recurring === "כן",
    });
    setBusy(false);
    if (error) return toast(SAVE_ERROR, "error");
    toast(SAVE_SUCCESS, "success");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="animate-fade-up max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl"
           style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">פעילות חדשה</h2>
          <button onClick={onClose} aria-label="סגירה" className="muted"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <Field label="כותרת"><TextInput value={title} onChange={setTitle} placeholder="לדוגמה: אימון קבוצתי" /></Field>
          <Field label="קטגוריה">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {SCHEDULE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="תאריך"><TextInput value={d} onChange={setD} type="date" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="שעת התחלה"><TextInput value={start} onChange={setStart} type="time" /></Field>
            <Field label="שעת סיום"><TextInput value={end} onChange={setEnd} type="time" /></Field>
          </div>
          <Field label="עצימות"><ChipGroup options={INTENSITIES} value={intensity} onChange={setIntensity} columns={3} /></Field>
          <Field label="חוזר על עצמו?"><ChipGroup options={["כן", "לא"]} value={recurring} onChange={setRecurring} columns={2} /></Field>
          <Field label="הערות"><TextArea value={notes} onChange={setNotes} rows={2} /></Field>
          <button onClick={save} disabled={busy} className="btn btn-primary w-full">
            {busy ? "שומר…" : "שמירת פעילות"}
          </button>
        </div>
      </div>
    </div>
  );
}

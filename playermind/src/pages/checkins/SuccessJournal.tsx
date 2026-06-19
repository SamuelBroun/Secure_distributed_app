import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { todayStr, getJournalEntries, rememberItem } from "../../lib/db";
import type { SuccessJournalEntry } from "../../lib/types";
import { PageHeader } from "../../components/Layout";
import { Field, TextArea, SaveBar } from "../../components/Form";
import { EmptyState } from "../../components/Cards";

export default function SuccessJournal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<SuccessJournalEntry[]>([]);

  const [didWell, setDidWell] = useState("");
  const [proud, setProud] = useState("");
  const [advanced, setAdvanced] = useState("");
  const [learned, setLearned] = useState("");

  const load = () => { if (user) getJournalEntries(user.id).then(setEntries); };
  useEffect(load, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("success_journal").insert({
      user_id: user.id, log_date: todayStr(),
      did_well: didWell || null, proud_of: proud || null,
      what_advanced: advanced || null, learned_about_self: learned || null,
    });
    if (!error && learned) await rememberItem(user.id, "חוזקה", learned);
    setSaving(false);
    if (error) return toast("שמירה נכשלה, נסה שוב.", "error");
    toast("נשמר ביומן ההצלחות. כל יום נחשב.", "success");
    setDidWell(""); setProud(""); setAdvanced(""); setLearned("");
    load();
  }

  return (
    <div>
      <form onSubmit={submit}>
        <PageHeader title="יומן הצלחות" subtitle="ביטחון נבנה מהצטברות של רגעים קטנים." back />
        <div className="space-y-5">
          <Field label="מה עשית טוב היום?"><TextArea value={didWell} onChange={setDidWell} rows={2} /></Field>
          <Field label="על מה אתה גאה?"><TextArea value={proud} onChange={setProud} rows={2} /></Field>
          <Field label="מה קידם אותך?"><TextArea value={advanced} onChange={setAdvanced} rows={2} /></Field>
          <Field label="מה למדת על עצמך?"><TextArea value={learned} onChange={setLearned} rows={2} /></Field>
        </div>
        <SaveBar saving={saving} />
      </form>

      <h2 className="mb-3 mt-8 font-display text-lg font-bold">רשומות אחרונות</h2>
      {entries.length === 0 ? (
        <EmptyState icon="📔" title="היומן ריק עדיין" text="כתוב את ההצלחה הראשונה שלך היום." />
      ) : (
        <div className="space-y-3">
          {entries.map((en) => (
            <div key={en.id} className="card">
              <p className="mb-1 text-xs muted">{en.log_date}</p>
              {en.did_well && <p className="text-sm"><b>טוב:</b> {en.did_well}</p>}
              {en.proud_of && <p className="text-sm"><b>גאה:</b> {en.proud_of}</p>}
              {en.what_advanced && <p className="text-sm"><b>קידם:</b> {en.what_advanced}</p>}
              {en.learned_about_self && <p className="text-sm"><b>למדתי:</b> {en.learned_about_self}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

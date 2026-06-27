import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { getTodayRecovery, todayStr } from "../../lib/db";
import { persist, SAVE_SUCCESS, SAVE_ERROR } from "../../lib/save";
import { RECOVERY_FIELDS } from "../../lib/ai/insights";
import { PageHeader } from "../../components/Layout";
import { SaveBar } from "../../components/Form";
import { Spinner } from "../../components/Loading";
import { Icon } from "../../components/Icon";
import { Check } from "lucide-react";

export default function Recovery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    getTodayRecovery(user.id).then((r) => {
      if (r) {
        setId(r.id);
        const init: Record<string, boolean> = {};
        RECOVERY_FIELDS.forEach((f) => (init[f.key] = Boolean(r[f.key])));
        setChecked(init);
      }
      setLoading(false);
    });
  }, [user]);

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload: Record<string, unknown> = { user_id: user.id, log_date: todayStr() };
    RECOVERY_FIELDS.forEach((f) => (payload[f.key] = !!checked[f.key]));
    const { ok } = await persist(user.id, "recovery", async () => {
      const r = id
        ? await supabase.from("recovery_logs").update(payload).eq("id", id)
        : await supabase.from("recovery_logs").insert(payload);
      return { error: r.error };
    });
    setSaving(false);
    if (!ok) return toast(SAVE_ERROR, "error");
    toast(SAVE_SUCCESS, "success");
    navigate("/");
  }

  if (loading) return <Spinner />;
  const count = RECOVERY_FIELDS.filter((f) => checked[f.key]).length;

  return (
    <form onSubmit={submit}>
      <PageHeader title="התאוששות" subtitle="התאוששות היא חלק מהאימון, לא תוספת לו." back />
      <div className="card mb-4 flex items-center justify-between">
        <span className="font-semibold">הושלמו היום</span>
        <span className="font-display text-2xl font-extrabold" style={{ color: "var(--brand)" }}>
          {count}/9
        </span>
      </div>
      <div className="space-y-2.5">
        {RECOVERY_FIELDS.map((f) => {
          const on = !!checked[f.key];
          return (
            <button type="button" key={f.key} onClick={() => toggle(f.key)}
              className="card flex w-full items-center gap-3 py-3.5 transition active:scale-[0.99]"
              style={{ borderColor: on ? "var(--brand)" : "var(--border)" }}>
              <span style={{ color: on ? "var(--brand)" : "var(--text-muted)" }}>
                <Icon name={f.key} size={22} />
              </span>
              <span className="flex-1 text-right font-medium">{f.label}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg transition"
                    style={{ background: on ? "var(--brand)" : "var(--surface-2)" }}>
                {on && <Check size={16} color="#fff" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <SaveBar saving={saving} />
    </form>
  );
}

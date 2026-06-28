import { useEffect, useState } from "react";
import { EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMemory, hideMemory, memoryStrength } from "../lib/db";
import type { MemoryItem } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { EmptyState } from "../components/Cards";
import { Icon } from "../components/Icon";
import { Spinner } from "../components/Loading";

// סדר וכותרות הדומיינים
const DOMAINS: { key: string; title: string; icon: string }[] = [
  { key: "מקצועי", title: "דפוסים מקצועיים", icon: "goals" },
  { key: "פיזי", title: "דפוסים פיזיים", icon: "load" },
  { key: "מנטלי", title: "דפוסים מנטליים", icon: "mental" },
  { key: "התאוששות", title: "דפוסי התאוששות", icon: "recovery" },
  { key: "חיים", title: "דפוסי חיים אישיים", icon: "life" },
  { key: "כללי", title: "כללי", icon: "insight" },
];

// מיפוי kind ל-domain כשאין domain מפורש (פריטים ישנים)
function domainOf(it: MemoryItem): string {
  if (it.domain) return it.domain;
  if (it.kind === "מטרה") return "מקצועי";
  if (it.kind === "פציעה") return "פיזי";
  if (it.kind === "חוזקה" || it.kind === "הרגל") return "התאוששות";
  return "כללי";
}

const STRENGTH_COLOR: Record<string, string> = {
  "סימן ראשוני": "#7fa3c6",
  "מגמה מתפתחת": "#D9A441",
  "דפוס שחוזר על עצמו": "#7FAF79",
};

export default function Memory() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (!user) return;
    getMemory(user.id).then((m) => { setItems(m); setLoading(false); });
  }, [user]);

  async function remove(id: string) {
    await hideMemory(id);
    setItems((list) => list.filter((x) => x.id !== id));
  }

  const firstName = (profile?.full_name || "").split(" ")[0] || "שחקן";
  const grouped: Record<string, MemoryItem[]> = {};
  items.forEach((it) => { const d = domainOf(it); (grouped[d] ||= []).push(it); });

  return (
    <div>
      <PageHeader title="זיכרון אישי" subtitle="מה המערכת למדה עליך לאורך זמן." back />

      <div className="card mb-4" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
        <p className="text-sm leading-relaxed">
          זו תמונת הדפוסים, החוזקות והמטרות של {firstName}. המערכת מעדכנת אותה רק כשדפוס חוזר –
          לא מתגובה לאירוע בודד. אם משהו לא מדויק, אפשר להסיר אותו.
        </p>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon="memory_pattern" title="הזיכרון עוד נבנה"
          text="המשך למלא צ׳ק-אינים ולתעד מטרות – כאן יופיעו הדפוסים האישיים שלך." />
      ) : (
        <div className="space-y-6">
          {DOMAINS.filter((d) => grouped[d.key]?.length).map((d) => (
            <div key={d.key}>
              <h2 className="mb-2 flex items-center gap-2 font-display font-bold">
                <span style={{ color: "var(--brand)" }}><Icon name={d.icon} size={18} /></span> {d.title}
              </h2>
              <div className="space-y-2">
                {grouped[d.key].map((it) => {
                  const strength = it.confidence || memoryStrength(it.weight);
                  return (
                    <div key={it.id} className="card py-3">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="pill" style={{ background: `${STRENGTH_COLOR[strength] ?? "#94A3B8"}22`, color: "var(--text)" }}>
                          {strength}
                        </span>
                        <button onClick={() => remove(it.id)}
                          className="flex items-center gap-1 text-xs muted" aria-label="הסר מהזיכרון">
                          <EyeOff size={14} /> זה לא נכון לגביי
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed">{it.content}</p>
                      {it.evidence && <p className="mt-1 text-xs muted">{it.evidence}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

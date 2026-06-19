import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMemory } from "../lib/db";
import type { MemoryItem } from "../lib/types";
import { PageHeader } from "../components/Layout";
import { EmptyState } from "../components/Cards";
import { Spinner } from "../components/Loading";

const KIND_STYLE: Record<string, { icon: string; color: string }> = {
  "מטרה": { icon: "🎯", color: "#163A5F" },
  "פציעה": { icon: "🩹", color: "#D9A441" },
  "הרגל": { icon: "🌱", color: "#7FAF79" },
  "קושי": { icon: "🌧️", color: "#7fa3c6" },
  "חוזקה": { icon: "💪", color: "#7FAF79" },
  "דפוס": { icon: "🔁", color: "#a78bfa" },
};

export default function Memory() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (!user) return;
    getMemory(user.id).then((m) => { setItems(m); setLoading(false); });
  }, [user]);

  const firstName = (profile?.full_name || "").split(" ")[0] || "שחקן";
  const grouped = items.reduce<Record<string, MemoryItem[]>>((acc, it) => {
    (acc[it.kind] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="הזיכרון האישי שלך" subtitle="מה PLAYERMIND למד עליך לאורך זמן." back />

      <div className="card mb-4" style={{ background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }}>
        <p className="text-sm leading-relaxed">
          ככל שתשתף יותר, הזיכרון מתעדכן והתובנות הופכות אישיות יותר. זו תמונת הדפוסים,
          החוזקות והמטרות של {firstName}.
        </p>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon="🧠" title="הזיכרון עוד נבנה" text="המשך למלא צ׳ק־אינים ולתעד מטרות – כאן יופיעו הדפוסים האישיים שלך." />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([kind, list]) => {
            const style = KIND_STYLE[kind] ?? { icon: "•", color: "#94A3B8" };
            return (
              <div key={kind}>
                <h2 className="mb-2 flex items-center gap-2 font-display font-bold">
                  <span>{style.icon}</span> {kind}
                </h2>
                <div className="space-y-2">
                  {list.map((it) => (
                    <div key={it.id} className="card flex items-center justify-between py-3">
                      <p className="text-sm leading-relaxed">{it.content}</p>
                      {it.weight > 1 && (
                        <span className="pill shrink-0" style={{ background: `${style.color}22`, color: "var(--text)" }}>
                          ×{it.weight}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

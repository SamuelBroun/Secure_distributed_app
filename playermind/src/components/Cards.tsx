import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Insight } from "../lib/types";

export function StatCard({
  icon, title, value, sub, accent, to,
}: {
  icon: string;
  title: string;
  value: ReactNode;
  sub?: string;
  accent?: string;
  to?: string;
}) {
  const inner = (
    <div className="card card-hover h-full">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {accent && (
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        )}
      </div>
      <p className="text-sm font-medium muted">{title}</p>
      <p className="mt-1 font-display text-2xl font-extrabold" style={{ color: "var(--text)" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs muted">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const CATEGORY_STYLE: Record<string, { color: string; icon: string }> = {
  "שינה": { color: "#7fa3c6", icon: "🌙" },
  "התאוששות": { color: "#B7D8B2", icon: "♻️" },
  "עומס": { color: "#EADFCF", icon: "⚡" },
  "מנטלי": { color: "#a78bfa", icon: "🧠" },
  "חיים": { color: "#f0abfc", icon: "⚖️" },
  "כללי": { color: "#94A3B8", icon: "✨" },
};

export function InsightCard({ insight, compact = false }: { insight: Insight; compact?: boolean }) {
  const style = CATEGORY_STYLE[insight.category] ?? CATEGORY_STYLE["כללי"];
  return (
    <div className="card card-hover animate-fade-up overflow-hidden">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
          style={{ background: `${style.color}33` }}
        >
          {style.icon}
        </span>
        <div>
          <span className="pill" style={{ background: `${style.color}33`, color: "var(--text)" }}>
            {insight.category}
          </span>
        </div>
      </div>
      <h3 className="font-display text-lg font-bold">{insight.title}</h3>
      <p className="mt-1 text-sm muted leading-relaxed">{insight.detected}</p>
      {!compact && (
        <>
          <div className="my-3 h-px" style={{ background: "var(--border)" }} />
          <p className="text-xs font-semibold muted">למה זה חשוב</p>
          <p className="mt-0.5 text-sm leading-relaxed">{insight.why}</p>
        </>
      )}
      <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
        <p className="text-xs font-semibold" style={{ color: "var(--brand)" }}>פעולה אחת להיום</p>
        <p className="mt-0.5 text-sm font-medium">{insight.action}</p>
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="card flex flex-col items-center py-10 text-center">
      <span className="mb-3 text-4xl">{icon}</span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm muted">{text}</p>
    </div>
  );
}

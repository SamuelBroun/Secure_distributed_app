import type { ReactNode } from "react";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="animate-fade-up">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs muted">{hint}</p>}
    </div>
  );
}

export function ChipGroup({
  options, value, onChange, columns = 2,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={`chip ${value === opt ? "chip-active" : ""}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function YesNo({
  value, onChange, options = ["כן", "לא"],
}: {
  value: string | null;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return <ChipGroup options={options} value={value} onChange={onChange} columns={options.length} />;
}

export function TextArea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="input resize-none"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      className="input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SaveBar({ label = "שמור", saving = false }: { label?: string; saving?: boolean }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-10 -mx-4 mt-6 px-4 pt-3"
         style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
      <button type="submit" className="btn btn-primary w-full" disabled={saving}>
        {saving ? "שומר…" : label}
      </button>
    </div>
  );
}

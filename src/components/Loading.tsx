import { Logo } from "./Logo";

export function FullScreenLoader({ text = "טוען…" }: { text?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
      <div className="animate-scale-in"><Logo size={56} /></div>
      <div className="h-1 w-24 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
        <div className="h-full w-1/2 animate-[fade-up_1s_ease-in-out_infinite]" style={{ background: "var(--brand)" }} />
      </div>
      <p className="text-sm muted">{text}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
           style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
    </div>
  );
}

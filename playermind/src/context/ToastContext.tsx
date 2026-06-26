import { createContext, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType }

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex max-w-md flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id}
            className="animate-scale-in pointer-events-auto w-full rounded-2xl px-4 py-3 text-sm font-medium shadow-float"
            style={{
              background: t.type === "error" ? "#fee2e2" : t.type === "info" ? "var(--surface)" : "var(--success)",
              color: t.type === "error" ? "#991b1b" : "#143020",
              border: "1px solid var(--border)",
            }}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// PLAYERMIND – מעקב שימוש (Usage / Analytics) ומעקב שגיאות
import { supabase, isSupabaseConfigured } from "./supabase";

let currentUserId: string | null = null;
export function setTrackingUser(id: string | null) {
  currentUserId = id;
}

// --- מעקב שימוש ---
export async function track(event: string, meta?: Record<string, unknown>) {
  if (!isSupabaseConfigured || !currentUserId) return;
  try {
    await supabase.from("usage_events").insert({
      user_id: currentUserId,
      event,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      meta: meta ?? null,
    });
  } catch {
    /* מעקב לא קריטי – אין לחסום את המשתמש */
  }
}

export function trackPageView(path: string) {
  void track("page_view", { path });
}

// --- מעקב שגיאות ---
export async function logError(
  message: string,
  opts: { stack?: string; source?: string; } = {},
) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("error_logs").insert({
      user_id: currentUserId,
      message: message?.slice(0, 2000) ?? "unknown",
      stack: opts.stack?.slice(0, 6000) ?? null,
      source: opts.source ?? "manual",
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    /* התעלם */
  }
}

let installed = false;
export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => {
    void logError(e.message || "window error", {
      stack: e.error?.stack, source: "window",
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    void logError(
      typeof reason === "string" ? reason : reason?.message || "unhandled rejection",
      { stack: reason?.stack, source: "promise" },
    );
  });
}

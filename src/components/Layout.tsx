import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { Wordmark } from "./Logo";
import { BottomNav } from "./BottomNav";
import { FeedbackWidget } from "./FeedbackWidget";
import { useTheme } from "../context/ThemeContext";
import { trackPageView } from "../lib/tracking";
import { Sun, Moon, Settings as SettingsIcon, ChevronRight } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col" style={{ background: "var(--bg)" }}>
      <header className="safe-top sticky top-0 z-20 px-4 pb-2 pt-3"
              style={{ background: "var(--bg)" }}>
        <div className="flex items-center justify-between">
          <Link to="/"><Wordmark /></Link>
          <div className="flex items-center gap-1.5">
            <button onClick={toggle} aria-label="מצב תצוגה"
              className="flex h-10 w-10 items-center justify-center rounded-2xl surface"
              style={{ color: "var(--text)" }}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate("/settings")} aria-label="הגדרות"
              className="flex h-10 w-10 items-center justify-center rounded-2xl surface"
              style={{ color: "var(--text)" }}>
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28">{children}</main>

      <FeedbackWidget />
      <BottomNav />
    </div>
  );
}

export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="mb-4 mt-2 flex items-start gap-2">
      {back && (
        <button onClick={() => navigate(-1)} aria-label="חזרה"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl surface"
          style={{ color: "var(--text)" }}>
          {/* ב-RTL החץ קדימה/חזרה מצביע ימינה */}
          <ChevronRight size={20} />
        </button>
      )}
      <div>
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm muted">{subtitle}</p>}
      </div>
    </div>
  );
}

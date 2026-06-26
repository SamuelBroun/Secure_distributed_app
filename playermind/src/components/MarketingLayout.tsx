import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "./Logo";
import { useTheme } from "../context/ThemeContext";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <header className="safe-top sticky top-0 z-20" style={{ background: "var(--bg)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/welcome"><Wordmark /></Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/pricing" className="hidden text-sm font-medium muted hover:opacity-80 sm:block">תמחור</Link>
            <Link to="/waitlist" className="hidden text-sm font-medium muted hover:opacity-80 sm:block">רשימת המתנה</Link>
            <button onClick={toggle} aria-label="מצב תצוגה"
              className="flex h-9 w-9 items-center justify-center rounded-xl surface">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link to="/login" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>כניסה</Link>
            <Link to="/register" className="btn btn-primary !px-4 !py-2 text-sm">הרשמה</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-5xl px-5 py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <Wordmark />
            <p className="max-w-md text-sm muted leading-relaxed">
              כדורגל הוא חלק מהחיים שלך. הוא לא כל החיים שלך.
              PLAYERMIND מלווה אותך כשחקן וכאדם.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm muted">
              <Link to="/welcome" className="hover:opacity-80">בית</Link>
              <Link to="/pricing" className="hover:opacity-80">תמחור</Link>
              <Link to="/waitlist" className="hover:opacity-80">רשימת המתנה</Link>
              <Link to="/login" className="hover:opacity-80">כניסה</Link>
            </div>
            <p className="mt-4 text-xs muted">© {new Date().getFullYear()} PLAYERMIND · גרסת בטא</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

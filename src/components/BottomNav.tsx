import { NavLink } from "react-router-dom";
import { Home, MessagesSquare, Plus, Target, Sparkles } from "lucide-react";

const items = [
  { to: "/", label: "בית", icon: Home },
  { to: "/ai-coach", label: "מאמן AI", icon: MessagesSquare },
  { to: "/checkin/morning", label: "צ׳ק-אין", icon: Plus, primary: true },
  { to: "/goals", label: "מטרות", icon: Target },
  { to: "/insights", label: "תובנות", icon: Sparkles },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-1.5" dir="rtl">
      <div className="flex items-center justify-between rounded-3xl px-2 py-1.5 shadow-float surface"
           style={{ backdropFilter: "blur(8px)" }}>
        {items.map(({ to, label, icon: Ico, primary }) =>
          primary ? (
            <NavLink key={to} to={to} className="relative -mt-6" aria-label={label}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-float"
                    style={{ background: "var(--brand)" }}>
                <Ico size={26} />
              </span>
            </NavLink>
          ) : (
            <NavLink key={to} to={to} end={to === "/"}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition"
              style={({ isActive }) => ({ color: isActive ? "var(--brand)" : "var(--text-muted)" })}
            >
              {({ isActive }) => (
                <>
                  <Ico size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  );
}

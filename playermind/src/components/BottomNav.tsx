import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "בית", icon: HomeIcon },
  { to: "/insights", label: "תובנות", icon: SparkIcon },
  { to: "/checkin/morning", label: "צ׳ק־אין", icon: PlusIcon, primary: true },
  { to: "/reports", label: "דוחות", icon: ChartIcon },
  { to: "/knowledge", label: "ידע", icon: BookIcon },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-1.5"
         dir="rtl">
      <div className="flex items-center justify-between rounded-3xl px-2 py-1.5 shadow-float surface"
           style={{ backdropFilter: "blur(8px)" }}>
        {items.map(({ to, label, icon: Icon, primary }) =>
          primary ? (
            <NavLink key={to} to={to} className="relative -mt-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-float"
                    style={{ background: "var(--brand)" }}>
                <Icon className="h-7 w-7" />
              </span>
            </NavLink>
          ) : (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition ${
                  isActive ? "" : "muted"
                }`
              }
              style={({ isActive }) => ({ color: isActive ? "var(--brand)" : undefined })}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
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

type IconProps = { className?: string; strokeWidth?: number };

function HomeIcon({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function SparkIcon({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
    </svg>
  );
}
function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ChartIcon({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}
function BookIcon({ className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" /><path d="M19 19H6" />
    </svg>
  );
}

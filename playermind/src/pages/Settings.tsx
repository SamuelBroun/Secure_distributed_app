import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  permissionStatus, requestNotificationPermission, remindersEnabled,
  setRemindersEnabled, scheduleDailyReminder, showLocalNotification,
} from "../lib/notifications";
import { PageHeader } from "../components/Layout";

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(remindersEnabled());
  const [perm, setPerm] = useState(permissionStatus());

  useEffect(() => { setPerm(permissionStatus()); }, []);

  async function toggleReminders() {
    if (!reminders) {
      const p = await requestNotificationPermission();
      setPerm(p);
      if (p !== "granted") return toast("יש לאשר התראות בדפדפן.", "error");
      setRemindersEnabled(true);
      setReminders(true);
      scheduleDailyReminder(8);
      await showLocalNotification("התראות הופעלו", "נשלח לך תזכורת יומית לצ׳ק־אין.");
      toast("התזכורות הופעלו.", "success");
    } else {
      setRemindersEnabled(false);
      setReminders(false);
      toast("התזכורות בוטלו.", "info");
    }
  }

  async function logout() {
    await signOut();
    navigate("/login");
  }

  return (
    <div>
      <PageHeader title="הגדרות" subtitle="התאמה אישית של החוויה." back />

      {/* חשבון */}
      <div className="card mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white"
             style={{ background: "var(--brand)" }}>
          {(profile?.full_name || "?")[0]}
        </div>
        <div>
          <p className="font-bold">{profile?.full_name || "שחקן"}</p>
          <p className="text-sm muted" dir="ltr">{user?.email}</p>
        </div>
      </div>

      {/* מצב תצוגה */}
      <SettingGroup title="מצב תצוגה">
        <div className="flex gap-2">
          {([["light", "בהיר ☀️"], ["dark", "כהה 🌙"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTheme(k)}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold transition"
              style={{
                background: theme === k ? "var(--brand)" : "var(--surface-2)",
                color: theme === k ? "#fff" : "var(--text)",
              }}>
              {l}
            </button>
          ))}
        </div>
      </SettingGroup>

      {/* התראות */}
      <SettingGroup title="התראות ותזכורות">
        <Row label="תזכורת יומית לצ׳ק־אין" desc="התראה בבוקר שתזכיר לך למלא צ׳ק־אין">
          <Switch on={reminders} onClick={toggleReminders} />
        </Row>
        {perm === "denied" && (
          <p className="mt-2 text-xs" style={{ color: "#b91c1c" }}>
            ההתראות חסומות בדפדפן. יש לאפשר אותן בהגדרות הדפדפן.
          </p>
        )}
        {perm === "unsupported" && (
          <p className="mt-2 text-xs muted">הדפדפן הנוכחי אינו תומך בהתראות.</p>
        )}
      </SettingGroup>

      {/* קישורים */}
      <SettingGroup title="כללי">
        <LinkRow label="פרופיל שחקן" onClick={() => navigate("/profile")} />
        <LinkRow label="הזיכרון האישי שלי" onClick={() => navigate("/memory")} />
        <LinkRow label="מרכז ידע" onClick={() => navigate("/knowledge")} />
      </SettingGroup>

      <button onClick={logout} className="btn w-full mt-2"
              style={{ background: "var(--surface-2)", color: "#b91c1c" }}>
        התנתקות
      </button>

      <p className="mt-6 text-center text-xs muted leading-relaxed">
        PLAYERMIND מלווה אותך כשחקן וכאדם.<br />כדורגל הוא חלק מהחיים שלך – לא כל החיים שלך.
      </p>
    </div>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 px-1 text-sm font-bold muted">{title}</h2>
      <div className="card space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div>
        <p className="font-medium">{label}</p>
        {desc && <p className="text-xs muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between py-2.5 text-right">
      <span className="font-medium">{label}</span>
      <span className="muted">›</span>
    </button>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className="relative h-7 w-12 shrink-0 rounded-full transition"
      style={{ background: on ? "var(--brand)" : "var(--surface-2)" }}>
      <span className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all"
            style={{ right: on ? "0.25rem" : "1.75rem" }} />
    </button>
  );
}

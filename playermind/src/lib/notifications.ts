// PLAYERMIND – מערכת התראות (Web Push / Notifications API)
// תומך בהתראות תזכורת יומית לצ׳ק־אין ולהתאוששות.

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permissionStatus(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export async function showLocalNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: "/icons/logo-192.png",
        badge: "/icons/logo-192.png",
        dir: "rtl",
        lang: "he",
      });
    } else {
      new Notification(title, { body, dir: "rtl", lang: "he" });
    }
  } catch {
    /* התעלם משגיאות סביבת דפדפן */
  }
}

const REMINDER_KEY = "pm_reminders_enabled";

export function remindersEnabled(): boolean {
  return localStorage.getItem(REMINDER_KEY) === "1";
}

export function setRemindersEnabled(on: boolean) {
  localStorage.setItem(REMINDER_KEY, on ? "1" : "0");
}

// תזכורת יומית פשוטה מבוססת setTimeout (לשעה נבחרת)
export function scheduleDailyReminder(hour = 8) {
  if (!remindersEnabled() || permissionStatus() !== "granted") return;
  const now = new Date();
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  window.setTimeout(() => {
    void showLocalNotification(
      "צ׳ק־אין בוקר",
      "בוקר טוב! הקדש דקה למילוי צ׳ק־אין הבוקר ב־PLAYERMIND.",
    );
    scheduleDailyReminder(hour);
  }, Math.min(delay, 2_147_000_000));
}

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {
      /* PWA אופציונלי */
    }
  }
}

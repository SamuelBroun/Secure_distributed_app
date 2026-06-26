import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthShell } from "../components/AuthShell";

export default function Login() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setBusy(false);
    if (error) toast(error, "error");
    else navigate("/");
  }

  return (
    <AuthShell
      title="התחברות"
      subtitle="ברוך שובך. בוא נמשיך מאיפה שעצרת."
      footer={
        <>
          עדיין אין לך חשבון?{" "}
          <Link to="/register" className="font-semibold" style={{ color: "var(--brand)" }}>
            הרשמה
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">אימייל</label>
          <input className="input" type="email" dir="ltr" required value={email}
                 onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">סיסמה</label>
          <input className="input" type="password" required value={password}
                 onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "מתחבר…" : "התחברות"}
        </button>
      </form>

      <button onClick={() => setShowReset((v) => !v)} className="text-sm muted underline">
        שכחת סיסמה?
      </button>
      {showReset && <ResetInline onDone={() => setShowReset(false)} />}
    </AuthShell>
  );
}

function ResetInline({ onDone }: { onDone: () => void }) {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    const { error } = await resetPassword(email.trim().toLowerCase());
    setBusy(false);
    if (error) toast(error, "error");
    else { toast("אם המייל קיים, נשלח אליו קישור לאיפוס.", "success"); onDone(); }
  }

  return (
    <div className="mt-2 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
      <label className="label">שחזור סיסמה – הזן אימייל</label>
      <input className="input" type="email" dir="ltr" value={email}
             onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <button onClick={send} className="btn btn-ghost mt-3 w-full" disabled={busy}>
        {busy ? "שולח…" : "שלח קישור לאיפוס"}
      </button>
    </div>
  );
}

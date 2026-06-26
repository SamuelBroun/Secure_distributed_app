import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthShell } from "../components/AuthShell";

export default function Register() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast("הסיסמה חייבת להכיל לפחות 6 תווים.", "error");
    setBusy(true);
    const { error } = await signUp(email.trim().toLowerCase(), password, name.trim());
    setBusy(false);
    if (error) return toast(error, "error");
    toast("ברוך הבא ל־PLAYERMIND!", "success");
    navigate("/onboarding");
  }

  return (
    <AuthShell
      title="הרשמה"
      subtitle="בוא נבנה יחד את מערכת ההפעלה האישית שלך."
      footer={
        <>
          כבר רשום?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
            התחברות
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">שם מלא</label>
          <input className="input" required value={name}
                 onChange={(e) => setName(e.target.value)} placeholder="השם שלך" />
        </div>
        <div>
          <label className="label">אימייל</label>
          <input className="input" type="email" dir="ltr" required value={email}
                 onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">סיסמה</label>
          <input className="input" type="password" required value={password}
                 onChange={(e) => setPassword(e.target.value)} placeholder="לפחות 6 תווים" />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "יוצר חשבון…" : "יצירת חשבון"}
        </button>
      </form>
    </AuthShell>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthShell } from "../components/AuthShell";

// מסך זה נפתח מהקישור שנשלח למייל (Supabase מזריק session להחלפת סיסמה)
export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast("הסיסמה חייבת להכיל לפחות 6 תווים.", "error");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) return toast(error, "error");
    toast("הסיסמה עודכנה בהצלחה.", "success");
    navigate("/");
  }

  return (
    <AuthShell title="איפוס סיסמה" subtitle="בחר סיסמה חדשה לחשבון שלך.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">סיסמה חדשה</label>
          <input className="input" type="password" required value={password}
                 onChange={(e) => setPassword(e.target.value)} placeholder="לפחות 6 תווים" />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "מעדכן…" : "עדכון סיסמה"}
        </button>
      </form>
    </AuthShell>
  );
}

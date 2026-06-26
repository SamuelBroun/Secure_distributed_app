import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { AppLayout } from "./components/Layout";
import { FullScreenLoader } from "./components/Loading";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MorningCheckin from "./pages/checkins/MorningCheckin";
import PreTraining from "./pages/checkins/PreTraining";
import PostTraining from "./pages/checkins/PostTraining";
import PreMatch from "./pages/checkins/PreMatch";
import PostMatch from "./pages/checkins/PostMatch";
import Recovery from "./pages/checkins/Recovery";
import LifeBalance from "./pages/checkins/LifeBalance";
import SuccessJournal from "./pages/checkins/SuccessJournal";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";
import Memory from "./pages/Memory";
import Knowledge from "./pages/Knowledge";
import KnowledgeArticle from "./pages/KnowledgeArticle";
import Settings from "./pages/Settings";
import SetupRequired from "./pages/SetupRequired";

import Landing from "./pages/marketing/Landing";
import Pricing from "./pages/marketing/Pricing";
import Waitlist from "./pages/marketing/Waitlist";
import Admin from "./pages/dashboards/Admin";
import Analytics from "./pages/dashboards/Analytics";
import Coach from "./pages/dashboards/Coach";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (profile && !profile.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function RoleProtected({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

// שורש: ממתין לטעינה; משתמש מחובר → דאשבורד, אחרת → דף נחיתה ציבורי
function Root() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/welcome" replace />;
  return <Protected><Dashboard /></Protected>;
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupRequired />;

  return (
    <Routes>
      {/* ציבורי – שיווק */}
      <Route path="/welcome" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/waitlist" element={<Waitlist />} />

      {/* אימות */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/onboarding" element={<OnboardingGate />} />

      {/* אפליקציה */}
      <Route path="/" element={<Root />} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/checkin/morning" element={<Protected><MorningCheckin /></Protected>} />
      <Route path="/training/pre" element={<Protected><PreTraining /></Protected>} />
      <Route path="/training/post" element={<Protected><PostTraining /></Protected>} />
      <Route path="/match/pre" element={<Protected><PreMatch /></Protected>} />
      <Route path="/match/post" element={<Protected><PostMatch /></Protected>} />
      <Route path="/recovery" element={<Protected><Recovery /></Protected>} />
      <Route path="/life" element={<Protected><LifeBalance /></Protected>} />
      <Route path="/journal" element={<Protected><SuccessJournal /></Protected>} />
      <Route path="/insights" element={<Protected><Insights /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="/memory" element={<Protected><Memory /></Protected>} />
      <Route path="/knowledge" element={<Protected><Knowledge /></Protected>} />
      <Route path="/knowledge/:slug" element={<Protected><KnowledgeArticle /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />

      {/* לוחות לפי תפקיד */}
      <Route path="/admin" element={<RoleProtected roles={["admin"]}><Admin /></RoleProtected>} />
      <Route path="/analytics" element={<RoleProtected roles={["admin"]}><Analytics /></RoleProtected>} />
      <Route path="/coach" element={<RoleProtected roles={["coach", "admin"]}><Coach /></RoleProtected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function OnboardingGate() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Onboarding />;
}

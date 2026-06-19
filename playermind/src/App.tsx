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

function Protected({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  // אם המשתמש לא סיים onboarding – הפנה לאשף
  if (profile && !profile.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupRequired />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/onboarding" element={<OnboardingGate />} />

      <Route path="/" element={<Protected><Dashboard /></Protected>} />
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

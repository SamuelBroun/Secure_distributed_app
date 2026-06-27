import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { AppLayout } from "./components/Layout";
import { FullScreenLoader } from "./components/Loading";

// טעינה מיידית – מסכי כניסה ושימוש יומיומי
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SetupRequired from "./pages/SetupRequired";

// טעינה עצלה – שיפור ביצועים (כולל מסכים עם גרפים/תוכן כבד)
const Profile = lazy(() => import("./pages/Profile"));
const MorningCheckin = lazy(() => import("./pages/checkins/MorningCheckin"));
const PreTraining = lazy(() => import("./pages/checkins/PreTraining"));
const PostTraining = lazy(() => import("./pages/checkins/PostTraining"));
const PreMatch = lazy(() => import("./pages/checkins/PreMatch"));
const PostMatch = lazy(() => import("./pages/checkins/PostMatch"));
const Recovery = lazy(() => import("./pages/checkins/Recovery"));
const LifeBalance = lazy(() => import("./pages/checkins/LifeBalance"));
const SuccessJournal = lazy(() => import("./pages/checkins/SuccessJournal"));
const Insights = lazy(() => import("./pages/Insights"));
const Reports = lazy(() => import("./pages/Reports"));
const Memory = lazy(() => import("./pages/Memory"));
const Goals = lazy(() => import("./pages/Goals"));
const AICoach = lazy(() => import("./pages/AICoach"));
const Schedule = lazy(() => import("./pages/Schedule"));
const MentalPrep = lazy(() => import("./pages/MentalPrep"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const KnowledgeArticle = lazy(() => import("./pages/KnowledgeArticle"));
const Settings = lazy(() => import("./pages/Settings"));
const Landing = lazy(() => import("./pages/marketing/Landing"));
const Pricing = lazy(() => import("./pages/marketing/Pricing"));
const Waitlist = lazy(() => import("./pages/marketing/Waitlist"));
const Admin = lazy(() => import("./pages/dashboards/Admin"));
const Analytics = lazy(() => import("./pages/dashboards/Analytics"));
const Coach = lazy(() => import("./pages/dashboards/Coach"));

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
    <Suspense fallback={<FullScreenLoader />}>
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
      <Route path="/goals" element={<Protected><Goals /></Protected>} />
      <Route path="/ai-coach" element={<Protected><AICoach /></Protected>} />
      <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
      <Route path="/mental/:type" element={<Protected><MentalPrep /></Protected>} />
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
    </Suspense>
  );
}

function OnboardingGate() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Onboarding />;
}

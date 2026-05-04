import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Goals from './pages/Goals';
import Progress from './pages/Progress';
import ChildProfile from './pages/ChildProfile';
import ProfessionalPortal from './pages/ProfessionalPortal';
import Resources from './pages/Resources';
import Chat from './pages/Chat';
import MyTeam from './pages/MyTeam';
import FamilyDashboard from './pages/FamilyDashboard';
import RespiteCare from './pages/RespiteCare';
import ResourceLibrary from './pages/ResourceLibrary';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import ScheduleCreator from './pages/ScheduleCreator';
import SafetyPlan from './pages/SafetyPlan';
import Journal from './pages/Journal';
import SupportGuide from './pages/SupportGuide';
import MonthlyReport from './pages/MonthlyReport';
import Legal from './pages/Legal';
import Billing from './pages/Billing';
import OwnerDashboard from './pages/OwnerDashboard';
import BehaviorLogs from './pages/BehaviorLogs';
import CoParentPortal from './pages/CoParentPortal';
import CoParentMessaging from './pages/CoParentMessaging';
import CoParentingResources from './pages/CoParentingResources';
import Milestones from './pages/Milestones';
import CourtDashboard from './pages/CourtDashboard';
import CourtPartnershipDetail from './pages/CourtPartnershipDetail';
import CourtMessaging from './pages/CourtMessaging';
import CourtAddAppointment from './pages/CourtAddAppointment';
import HouseholdRoutine from './pages/HouseholdRoutine';
import DailyCheckIn from './pages/DailyCheckIn';
import Notifications from './pages/Notifications';
import PartnershipSafetyPlan from './pages/PartnershipSafetyPlan';
import CourtGenerateReport from './pages/CourtGenerateReport';
import Help from './pages/Help';
import MyReflections from './pages/MyReflections';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <Routes>
      <Route path="/" element={
        <motion.div key="home" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.3 }}>
          <Home />
        </motion.div>
      } />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lessons" element={<Lessons />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/child-profile" element={<ChildProfile />} />
      <Route path="/professional" element={<ProfessionalPortal />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/my-team" element={<MyTeam />} />
      <Route path="/family-dashboard" element={<FamilyDashboard />} />
      <Route path="/respite-care" element={<RespiteCare />} />
      <Route path="/resource-library" element={<ResourceLibrary />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/schedule" element={<ScheduleCreator />} />
      <Route path="/safety-plan" element={<SafetyPlan />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/support-guide" element={<SupportGuide />} />
      <Route path="/monthly-report" element={<MonthlyReport />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      <Route path="/behavior-logs" element={<BehaviorLogs />} />
      <Route path="/co-parent-portal" element={<CoParentPortal />} />
      <Route path="/co-parent-messaging/:partnershipId" element={<CoParentMessaging />} />
      <Route path="/co-parenting-resources" element={<CoParentingResources />} />
      <Route path="/milestones" element={<Milestones />} />
      <Route path="/court-dashboard" element={<CourtDashboard />} />
      <Route path="/court-partnership/:partnershipId" element={<CourtPartnershipDetail />} />
      <Route path="/court-messaging/:partnershipId" element={<CourtMessaging />} />
      <Route path="/court-add-appointment/:partnershipId" element={<CourtAddAppointment />} />
      <Route path="/household-routine" element={<HouseholdRoutine />} />
      <Route path="/daily-checkin" element={<DailyCheckIn />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/partnership-safety-plan/:partnershipId" element={<PartnershipSafetyPlan />} />
      <Route path="/court-generate-report" element={<CourtGenerateReport />} />
      <Route path="/help" element={<Help />} />
      <Route path="/my-reflections" element={<MyReflections />} />
      <Route path="*" element={
        <motion.div key="404" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.3 }}>
          <PageNotFound />
        </motion.div>
      } />
    </Routes>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
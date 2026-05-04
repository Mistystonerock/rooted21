import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    <Routes>
      <Route path="/" element={<Home />} />
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
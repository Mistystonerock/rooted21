import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LoadingFallback from '@/components/mobile/LoadingFallback';
import routes from '@/hooks/useLazyLoadRoutes';
import TabStack from '@/components/mobile/TabStack';
import ConsentGate from '@/components/ConsentGate';
import SubscriptionGate from '@/components/SubscriptionGate';
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

  // Render the main app with lazy loading
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<LoadingFallback />}>
            <motion.div key="home" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ duration: 0.3 }}>
              <routes.Home />
            </motion.div>
          </Suspense>
        } />
        {/* ── Bottom-tab routes: kept mounted for instant tab switching ── */}
        <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><routes.Dashboard /></Suspense>} />
        <Route path="/chat" element={<Suspense fallback={<LoadingFallback />}><routes.Chat /></Suspense>} />
        <Route path="/lessons" element={<Suspense fallback={<LoadingFallback />}><routes.Lessons /></Suspense>} />
        <Route path="/goals" element={<Suspense fallback={<LoadingFallback />}><routes.Goals /></Suspense>} />
        <Route path="/progress" element={<Suspense fallback={<LoadingFallback />}><routes.Progress /></Suspense>} />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <routes.Profile />
          </Suspense>
        } />
        <Route path="/help" element={
          <Suspense fallback={<LoadingFallback />}>
            <routes.Help />
          </Suspense>
        } />
        {/* Secondary routes */}
        <Route path="/child-profile" element={<Suspense fallback={<LoadingFallback />}><routes.ChildProfile /></Suspense>} />
        <Route path="/professional" element={<Suspense fallback={<LoadingFallback />}><routes.ProfessionalPortal /></Suspense>} />
        <Route path="/resources" element={<Suspense fallback={<LoadingFallback />}><routes.Resources /></Suspense>} />
        <Route path="/my-team" element={<Suspense fallback={<LoadingFallback />}><routes.MyTeam /></Suspense>} />
        <Route path="/family-dashboard" element={<Suspense fallback={<LoadingFallback />}><routes.FamilyDashboard /></Suspense>} />
        <Route path="/respite-care" element={<Suspense fallback={<LoadingFallback />}><routes.RespiteCare /></Suspense>} />
        <Route path="/resource-library" element={<Suspense fallback={<LoadingFallback />}><routes.ResourceLibrary /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<LoadingFallback />}><routes.Analytics /></Suspense>} />
        <Route path="/schedule" element={<Suspense fallback={<LoadingFallback />}><routes.ScheduleCreator /></Suspense>} />
        <Route path="/safety-plan" element={<Suspense fallback={<LoadingFallback />}><routes.SafetyPlan /></Suspense>} />
        <Route path="/journal" element={<Suspense fallback={<LoadingFallback />}><routes.Journal /></Suspense>} />
        <Route path="/support-guide" element={<Suspense fallback={<LoadingFallback />}><routes.SupportGuide /></Suspense>} />
        <Route path="/monthly-report" element={<Suspense fallback={<LoadingFallback />}><routes.MonthlyReport /></Suspense>} />
        <Route path="/legal" element={<Suspense fallback={<LoadingFallback />}><routes.Legal /></Suspense>} />
        <Route path="/billing" element={<Suspense fallback={<LoadingFallback />}><routes.Billing /></Suspense>} />
        <Route path="/owner-dashboard" element={<Suspense fallback={<LoadingFallback />}><routes.OwnerDashboard /></Suspense>} />
        <Route path="/behavior-logs" element={<Suspense fallback={<LoadingFallback />}><routes.BehaviorLogs /></Suspense>} />
        <Route path="/co-parent-portal" element={<Suspense fallback={<LoadingFallback />}><routes.CoParentPortal /></Suspense>} />
        <Route path="/co-parent-messaging/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><routes.CoParentMessaging /></Suspense>} />
        <Route path="/co-parenting-resources" element={<Suspense fallback={<LoadingFallback />}><routes.CoParentingResources /></Suspense>} />
        <Route path="/milestones" element={<Suspense fallback={<LoadingFallback />}><routes.Milestones /></Suspense>} />
        <Route path="/court-dashboard" element={<Suspense fallback={<LoadingFallback />}><routes.CourtDashboard /></Suspense>} />
        <Route path="/court-partnership/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><routes.CourtPartnershipDetail /></Suspense>} />
        <Route path="/court-messaging/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><routes.CourtMessaging /></Suspense>} />
        <Route path="/court-add-appointment/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><routes.CourtAddAppointment /></Suspense>} />
        <Route path="/household-routine" element={<Suspense fallback={<LoadingFallback />}><routes.HouseholdRoutine /></Suspense>} />
        <Route path="/daily-checkin" element={<Suspense fallback={<LoadingFallback />}><routes.DailyCheckIn /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<LoadingFallback />}><routes.Notifications /></Suspense>} />
        <Route path="/partnership-safety-plan/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><routes.PartnershipSafetyPlan /></Suspense>} />
        <Route path="/court-generate-report" element={<Suspense fallback={<LoadingFallback />}><routes.CourtGenerateReport /></Suspense>} />
        <Route path="/my-reflections" element={<Suspense fallback={<LoadingFallback />}><routes.MyReflections /></Suspense>} />
        <Route path="/local-resources" element={<Suspense fallback={<LoadingFallback />}><routes.LocalResourceFinder /></Suspense>} />
        <Route path="/weekly-habits" element={<Suspense fallback={<LoadingFallback />}><routes.WeeklyHabits /></Suspense>} />
        <Route path="/professional-directory" element={<Suspense fallback={<LoadingFallback />}><routes.ProfessionalDirectory /></Suspense>} />
        <Route path="/app-guide" element={<Suspense fallback={<LoadingFallback />}><routes.AppGuide /></Suspense>} />
        <Route path="/care-calendar" element={<Suspense fallback={<LoadingFallback />}><routes.CareCalendar /></Suspense>} />
        <Route path="/sensory-toolbox" element={<Suspense fallback={<LoadingFallback />}><routes.SensoryToolbox /></Suspense>} />
        <Route path="/child-profiles" element={<Suspense fallback={<LoadingFallback />}><routes.ChildProfiles /></Suspense>} />
        <Route path="/live-classes" element={<Suspense fallback={<LoadingFallback />}><routes.LiveClasses /></Suspense>} />
        <Route path="/class-enrollment" element={<Suspense fallback={<LoadingFallback />}><routes.ClassEnrollment /></Suspense>} />
        <Route path="/class-progress/:enrollmentId" element={<Suspense fallback={<LoadingFallback />}><routes.ClassProgress /></Suspense>} />
        <Route path="/instructor-feedback" element={<Suspense fallback={<LoadingFallback />}><routes.InstructorFeedbackDashboard /></Suspense>} />
        <Route path="/instructor-analytics" element={<Suspense fallback={<LoadingFallback />}><routes.InstructorAnalytics /></Suspense>} />
        <Route path="/case-management" element={<Suspense fallback={<LoadingFallback />}><routes.CaseManagement /></Suspense>} />
        <Route path="/legal-knowledge-base" element={<Suspense fallback={<LoadingFallback />}><routes.LegalKnowledgeBase /></Suspense>} />
        <Route path="/system-guides" element={<Suspense fallback={<LoadingFallback />}><routes.SystemGuides /></Suspense>} />
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
          <SubscriptionGate>
            <ConsentGate>
              <AuthenticatedApp />
            </ConsentGate>
          </SubscriptionGate>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
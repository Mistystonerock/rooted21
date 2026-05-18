import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import React from 'react';
import { base44 } from '@/api/base44Client';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import LoadingFallback from '@/components/mobile/LoadingFallback';
import routes from '@/hooks/useLazyLoadRoutes';
import FeatureLockGate from '@/components/rooted/FeatureLockGate';
import FounderDashboard from '@/pages/FounderDashboard.jsx';
import AppDocs from '@/pages/AppDocs';
import FounderAccessPortal from '@/pages/FounderAccessPortal';
import FounderAdminManagement from '@/pages/FounderAdminManagement';
import AppSurvey from '@/pages/AppSurvey';
import LegalPolicy from '@/pages/LegalPolicy';
import ProfessionalGate from '@/components/rooted/ProfessionalGate';
import SecureDocumentRepository from '@/pages/SecureDocumentRepository';
import CaseDetail from '@/pages/CaseDetail';
import CaseStatusReport from '@/pages/CaseStatusReport';
import ScheduleFamilyMeeting from '@/pages/ScheduleFamilyMeeting';
import PersonalizedLegalFeed from '@/pages/PersonalizedLegalFeed';
import PersonalizedChat from '@/pages/PersonalizedChat';
import GrowthInsights from '@/pages/GrowthInsights';
import EmergencyToolbox from '@/pages/EmergencyToolbox';
import AngerManagementHub from '@/pages/AngerManagementHub';
import Launch from '@/pages/Launch';
import CourtReadyExport from '@/pages/CourtReadyExport';
import CourtPreparationChecklist from '@/pages/CourtPreparationChecklist';
import CasePlanChecklist from '@/pages/CasePlanChecklist';
import ExpenseSplit from '@/pages/ExpenseSplit';
import ExpenseTracker from '@/pages/ExpenseTracker';
import DocumentScanner from '@/pages/DocumentScanner';
import CoParentingHealthDashboard from '@/pages/CoParentingHealthDashboard';
import ProfessionalPresentation from '@/pages/ProfessionalPresentation';
import ComprehensiveCaseReport from '@/pages/ComprehensiveCaseReport';
import CourtReadySummary from '@/pages/CourtReadySummary';
import MedicationManager from '@/pages/MedicationManager';
import FormHelper from '@/pages/FormHelper';
import CommunityResourceMap from '@/pages/CommunityResourceMap';
import ResourceManagement from '@/pages/ResourceManagement';
import LegalAndDisclaimers from '@/pages/LegalAndDisclaimers';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import AccessibilityStatement from '@/pages/AccessibilityStatement';
import SkipToContentLink from '@/components/accessibility/SkipToContentLink';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import CrisisDisclaimer from '@/pages/CrisisDisclaimer';
import AIDisclaimer from '@/pages/AIDisclaimer';
import DataUsePolicy from '@/pages/DataUsePolicy';
import ResourceMatcher from '@/components/resources/ResourceMatcher';
import FamilySafetyCrisisPlan from '@/pages/FamilySafetyCrisisPlan';
import CommunicationToneTool from '@/pages/CommunicationToneTool';
import Donate from '@/pages/Donate';
import SOS from '@/pages/SOS';
import LogoutButton from '@/components/auth/LogoutButton';
import BottomNav from '@/components/rooted/BottomNav';
import RequiredOnboardingFlow from '@/components/onboarding/RequiredOnboardingFlow';
import CopyrightFooter from '@/components/legal/CopyrightFooter';
import ComingSoon from '@/pages/ComingSoon';
import MoxieChatWidget from '@/components/moxie/MoxieChatWidget';
import UnalterableRecords from '@/pages/UnalterableRecords';
import BehavioralHealthRecords from '@/pages/BehavioralHealthRecords';
import ClientErrorBoundary from '@/components/system/ClientErrorBoundary';
import FakeSafeScreen from '@/pages/FakeSafeScreen';
import HiddenDocumentVault from '@/pages/HiddenDocumentVault';
import QuickExitButton from '@/components/privacy/QuickExitButton';
import { activateQuickExit, getSecureSessionTimeoutMinutes, isPrivateModeEnabled } from '@/lib/survivorMode';
import AdminRouteGate from '@/components/security/AdminRouteGate';
import OfflineStatusBanner from '@/components/system/OfflineStatusBanner';

function withStartupTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Startup timed out')), ms))
  ]);
}

function StartupErrorScreen({ onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto max-w-md rounded-3xl border border-rooted-cream bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-rooted-dark-green">Rooted 21 needs a refresh</h1>
        <p className="mt-2 text-sm text-muted-foreground">The preview session could not finish loading safely. Please refresh and try again.</p>
        <button className="mt-4 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground" onClick={onRetry}>Refresh</button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [maintenanceMode, setMaintenanceMode] = React.useState(true);
  const [bootLoading, setBootLoading] = React.useState(true);
  const [bootFailed, setBootFailed] = React.useState(false);
  const [, setBetaAccess] = React.useState(() => localStorage.getItem("rooted21_beta_access") === "true");
  const isFounder = user?.email === "misty.stonerock88@gmail.com";
  const isFounderRoute = window.location.pathname.startsWith("/founder");
  const showComingSoon = maintenanceMode && !isFounder && !isFounderRoute;
  const needsOnboarding = user && user.role === "user" && user.onboarding_completed !== true;

  React.useEffect(() => {
    let timer;
    const resetSecureTimer = () => {
      clearTimeout(timer);
      if (!isPrivateModeEnabled()) return;
      timer = setTimeout(() => activateQuickExit(), getSecureSessionTimeoutMinutes() * 60 * 1000);
    };
    ["click", "keydown", "touchstart", "mousemove", "rooted21-session-timeout-changed"].forEach(event => window.addEventListener(event, resetSecureTimer));
    resetSecureTimer();
    return () => {
      clearTimeout(timer);
      ["click", "keydown", "touchstart", "mousemove", "rooted21-session-timeout-changed"].forEach(event => window.removeEventListener(event, resetSecureTimer));
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function bootApp() {
      if (mounted) setBootFailed(false);
      try {
        const maintenanceResult = await withStartupTimeout(base44.functions.invoke("getMaintenanceMode", {}), 6000);
        if (mounted) setMaintenanceMode(maintenanceResult.data.enabled !== false);
      } catch {
        if (mounted) setMaintenanceMode(true);
      }

      try {
        const u = await withStartupTimeout(base44.auth.me(), 8000);
        if (mounted) setUser(u);
        if (u?.email) {
          try {
            await withStartupTimeout(base44.functions.invoke("initializeFounder", {}), 6000);
          } catch {
            // Keep app boot stable even if founder initialization is unavailable.
          }

          const pendingBetaCode = localStorage.getItem("pending_beta_code");
          if (pendingBetaCode) {
            await withStartupTimeout(base44.functions.invoke("redeemBetaTesterCode", { code: pendingBetaCode }), 8000);
            localStorage.removeItem("pending_beta_code");
            const refreshedUser = await withStartupTimeout(base44.auth.me(), 8000);
            if (mounted) setUser(refreshedUser);
          }

          const pendingAdminCode = localStorage.getItem("pending_admin_code");
          if (pendingAdminCode) {
            await withStartupTimeout(base44.functions.invoke("redeemAdminAccessCode", { code: pendingAdminCode }), 8000);
            localStorage.removeItem("pending_admin_code");
            const refreshedUser = await withStartupTimeout(base44.auth.me(), 8000);
            if (mounted) setUser(refreshedUser);
          }
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setBootFailed(error?.message === 'Startup timed out');
        }
      } finally {
        if (mounted) setBootLoading(false);
      }
    }

    bootApp();
    return () => { mounted = false; };
  }, []);

  return (
    <ClientErrorBoundary>
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ProfessionalGate user={user}>
        <SkipToContentLink />
        <OfflineStatusBanner />
        <AccessibilityToolbar />
        {user && !showComingSoon && <QuickExitButton />}
        {user && (
          <div className="fixed right-3 top-16 z-50" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            <LogoutButton />
          </div>
        )}
        <Router>
          {bootLoading ? (
            <LoadingFallback />
          ) : bootFailed ? (
            <StartupErrorScreen onRetry={() => window.location.reload()} />
          ) : showComingSoon ? (
            <ComingSoon onBetaAccess={() => setBetaAccess(true)} />
          ) : (
          <AnimatePresence mode="wait">
            {needsOnboarding ? (
              <RequiredOnboardingFlow user={user} onComplete={() => setUser(prev => ({ ...prev, onboarding_completed: true }))} />
            ) : (
            <Routes>
              <Route path="/" element={<Launch />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/sos" element={<Suspense fallback={<LoadingFallback />}><SOS /></Suspense>} />
              <Route path="/safe-screen" element={<Suspense fallback={<LoadingFallback />}><FakeSafeScreen /></Suspense>} />
              <Route path="/hidden-document-vault" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><HiddenDocumentVault /></FeatureLockGate></Suspense>} />
              <Route path="/home" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Home /></FeatureLockGate></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Dashboard /></FeatureLockGate></Suspense>} />
              <Route path="/wraparound-support" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.WraparoundSupport /></FeatureLockGate></Suspense>} />
              <Route path="/cps-case-navigation" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CPSCaseNavigation /></FeatureLockGate></Suspense>} />
              <Route path="/certified-legal-export" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CertifiedLegalExport /></FeatureLockGate></Suspense>} />
              <Route path="/ohio-systems-navigator" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.OhioSystemsNavigator /></FeatureLockGate></Suspense>} />
              <Route path="/family-knowledge-hub" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.FamilyKnowledgeHub /></FeatureLockGate></Suspense>} />
              <Route path="/cultural-care" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CulturalCare /></FeatureLockGate></Suspense>} />
              <Route path="/youth-zone" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.YouthZone /></FeatureLockGate></Suspense>} />
              <Route path="/family-voice-choice" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.FamilyVoiceChoice /></FeatureLockGate></Suspense>} />
              <Route path="/well-being-toolkit" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.WellBeingToolkit /></FeatureLockGate></Suspense>} />
              <Route path="/chat" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Chat /></FeatureLockGate></Suspense>} />
              <Route path="/lessons" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Lessons /></FeatureLockGate></Suspense>} />
              <Route path="/goals" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Goals /></FeatureLockGate></Suspense>} />
              <Route path="/progress" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Progress /></FeatureLockGate></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Profile /></FeatureLockGate></Suspense>} />
              <Route path="/privacy-center" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.PrivacyCenter /></FeatureLockGate></Suspense>} />
              <Route path="/help" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Help /></FeatureLockGate></Suspense>} />
              <Route path="/child-profile" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildProfile /></FeatureLockGate></Suspense>} />
              <Route path="/professional" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ProfessionalPortal /></FeatureLockGate></Suspense>} />
              <Route path="/resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Resources /></FeatureLockGate></Suspense>} />
              <Route path="/support-hub" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SupportHub /></FeatureLockGate></Suspense>} />
              <Route path="/behavior-hub" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.BehaviorHub /></FeatureLockGate></Suspense>} />
              <Route path="/substance-abuse-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SubstanceAbuseResources /></FeatureLockGate></Suspense>} />
              <Route path="/court-rights-education" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtRightsEducation /></FeatureLockGate></Suspense>} />
              <Route path="/protective-order-help" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ProtectiveOrderHelp /></FeatureLockGate></Suspense>} />
              <Route path="/training-videos" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.TrainingVideos /></FeatureLockGate></Suspense>} />
              <Route path="/my-team" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MyTeam /></FeatureLockGate></Suspense>} />
              <Route path="/family-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.FamilyDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/respite-care" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.RespiteCare /></FeatureLockGate></Suspense>} />
              <Route path="/resource-library" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ResourceLibrary /></FeatureLockGate></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Analytics /></FeatureLockGate></Suspense>} />
              <Route path="/schedule" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ScheduleCreator /></FeatureLockGate></Suspense>} />
              <Route path="/safety-plan" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SafetyPlan /></FeatureLockGate></Suspense>} />
              <Route path="/family-safety-crisis-plan" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><FamilySafetyCrisisPlan /></FeatureLockGate></Suspense>} />
              <Route path="/journal" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Journal /></FeatureLockGate></Suspense>} />
              <Route path="/support-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SupportGuide /></FeatureLockGate></Suspense>} />
              <Route path="/monthly-report" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MonthlyReport /></FeatureLockGate></Suspense>} />
              <Route path="/legal" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Legal /></FeatureLockGate></Suspense>} />
              <Route path="/billing" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Billing /></FeatureLockGate></Suspense>} />
              <Route path="/owner-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.OwnerDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/behavior-logs" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.BehaviorLogs /></FeatureLockGate></Suspense>} />
              <Route path="/co-parent-portal" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CoParentPortal /></FeatureLockGate></Suspense>} />
              <Route path="/co-parent-messaging/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CoParentMessaging /></FeatureLockGate></Suspense>} />
              <Route path="/co-parenting-health/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CoParentingHealthDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/co-parenting-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CoParentingResources /></FeatureLockGate></Suspense>} />
              <Route path="/milestones" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Milestones /></FeatureLockGate></Suspense>} />
              <Route path="/court-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/court-partnership/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtPartnershipDetail /></FeatureLockGate></Suspense>} />
              <Route path="/court-messaging/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtMessaging /></FeatureLockGate></Suspense>} />
              <Route path="/court-add-appointment/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtAddAppointment /></FeatureLockGate></Suspense>} />
              <Route path="/household-routine" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.HouseholdRoutine /></FeatureLockGate></Suspense>} />
              <Route path="/daily-checkin" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.DailyCheckIn /></FeatureLockGate></Suspense>} />
              <Route path="/notifications" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Notifications /></FeatureLockGate></Suspense>} />
              <Route path="/notification-preferences" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.NotificationPreferences /></FeatureLockGate></Suspense>} />
              <Route path="/partnership-safety-plan/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.PartnershipSafetyPlan /></FeatureLockGate></Suspense>} />
              <Route path="/court-generate-report" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtGenerateReport /></FeatureLockGate></Suspense>} />
              <Route path="/my-reflections" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MyReflections /></FeatureLockGate></Suspense>} />
              <Route path="/local-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LocalResourceFinder /></FeatureLockGate></Suspense>} />
              <Route path="/local-medical" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LocalMedical /></FeatureLockGate></Suspense>} />
              <Route path="/housing-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.HousingResources /></FeatureLockGate></Suspense>} />
              <Route path="/weekly-habits" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.WeeklyHabits /></FeatureLockGate></Suspense>} />
              <Route path="/professional-directory" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ProfessionalDirectory /></FeatureLockGate></Suspense>} />
              <Route path="/app-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.AppGuide /></FeatureLockGate></Suspense>} />
              <Route path="/care-calendar" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CareCalendar /></FeatureLockGate></Suspense>} />
              <Route path="/sensory-toolbox" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SensoryToolbox /></FeatureLockGate></Suspense>} />
              <Route path="/child-profiles" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildProfiles /></FeatureLockGate></Suspense>} />
              <Route path="/live-classes" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LiveClasses /></FeatureLockGate></Suspense>} />
              <Route path="/class-enrollment" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ClassEnrollment /></FeatureLockGate></Suspense>} />
              <Route path="/class-calendar" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ClassCalendarDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/class-progress/:enrollmentId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ClassProgress /></FeatureLockGate></Suspense>} />
              <Route path="/instructor-feedback" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.InstructorFeedbackDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/instructor-analytics" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.InstructorAnalytics /></FeatureLockGate></Suspense>} />
              <Route path="/case-management" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CaseManagement /></FeatureLockGate></Suspense>} />
              <Route path="/case-management-new" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CaseManagementNew /></FeatureLockGate></Suspense>} />
              <Route path="/case-detail/:caseId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CaseDetail /></FeatureLockGate></Suspense>} />
              <Route path="/case-status-report/:caseId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CaseStatusReport /></FeatureLockGate></Suspense>} />
              <Route path="/comprehensive-case-report/:caseId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><ComprehensiveCaseReport /></FeatureLockGate></Suspense>} />
              <Route path="/schedule-family-meeting/:caseId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><ScheduleFamilyMeeting /></FeatureLockGate></Suspense>} />
              <Route path="/personalized-legal-feed" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><PersonalizedLegalFeed /></FeatureLockGate></Suspense>} />
              <Route path="/legal-knowledge-base" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LegalKnowledgeBase /></FeatureLockGate></Suspense>} />
              <Route path="/legal-calendar" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LegalCalendar /></FeatureLockGate></Suspense>} />
              <Route path="/system-guides" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SystemGuides /></FeatureLockGate></Suspense>} />
              <Route path="/meeting-prep-chatbot" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MeetingPrepChatbot /></FeatureLockGate></Suspense>} />
              <Route path="/communications" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CommunicationsPortal /></FeatureLockGate></Suspense>} />
              <Route path="/communication-tone-tool" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CommunicationToneTool /></FeatureLockGate></Suspense>} />
              <Route path="/court-filings" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtFilingWorkflow /></FeatureLockGate></Suspense>} />
              <Route path="/compliance-risks" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ComplianceRiskDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/consent-forms" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ConsentForms /></FeatureLockGate></Suspense>} />
              <Route path="/documents" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><SecureDocumentRepository /></FeatureLockGate></Suspense>} />
              <Route path="/personalized-chat" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><PersonalizedChat /></FeatureLockGate></Suspense>} />
              <Route path="/growth-insights" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><GrowthInsights /></FeatureLockGate></Suspense>} />
              <Route path="/behavioral-trends" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.BehavioralTrends /></FeatureLockGate></Suspense>} />
              <Route path="/job-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.JobResources /></FeatureLockGate></Suspense>} />
              <Route path="/emergency-toolbox" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><EmergencyToolbox /></FeatureLockGate></Suspense>} />
              <Route path="/anger-management" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><AngerManagementHub /></FeatureLockGate></Suspense>} />
              <Route path="/court-ready-export" element={<FeatureLockGate user={user}><CourtReadyExport /></FeatureLockGate>} />
              <Route path="/unalterable-records" element={<FeatureLockGate user={user}><UnalterableRecords /></FeatureLockGate>} />
              <Route path="/court-report-generator" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildCourtReportGenerator /></FeatureLockGate></Suspense>} />
              <Route path="/court-preparation-checklist" element={<FeatureLockGate user={user}><CourtPreparationChecklist /></FeatureLockGate>} />
              <Route path="/case-prep-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CasePrepDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/expense-split" element={<FeatureLockGate user={user}><ExpenseSplit /></FeatureLockGate>} />
              <Route path="/document-scanner" element={<FeatureLockGate user={user}><DocumentScanner /></FeatureLockGate>} />
              <Route path="/case-plan-checklist" element={<FeatureLockGate user={user}><CasePlanChecklist /></FeatureLockGate>} />
              <Route path="/expense-tracker" element={<FeatureLockGate user={user}><ExpenseTracker /></FeatureLockGate>} />
              <Route path="/visitation-tracker" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.VisitationTracker /></FeatureLockGate></Suspense>} />
              <Route path="/medication-manager" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><MedicationManager /></FeatureLockGate></Suspense>} />
              <Route path="/behavioral-health-records" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><BehavioralHealthRecords /></FeatureLockGate></Suspense>} />
              <Route path="/form-helper" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><FormHelper /></FeatureLockGate></Suspense>} />
              <Route path="/community-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CommunityResourceMap /></FeatureLockGate></Suspense>} />
              <Route path="/court-ready-summary" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><CourtReadySummary /></FeatureLockGate></Suspense>} />
              <Route path="/legal-disclaimers" element={<Suspense fallback={<LoadingFallback />}><LegalAndDisclaimers /></Suspense>} />
              <Route path="/incident-reports" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.IncidentReportBuilder /></FeatureLockGate></Suspense>} />
              <Route path="/reunification-tracker" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ReunificationTracker /></FeatureLockGate></Suspense>} />
              <Route path="/team-contacts" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.TeamContacts /></FeatureLockGate></Suspense>} />
              <Route path="/education-hub" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.EducationHub /></FeatureLockGate></Suspense>} />
              <Route path="/fasd-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.FASDGuide /></FeatureLockGate></Suspense>} />
              <Route path="/attachment-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.AttachmentGuide /></FeatureLockGate></Suspense>} />
              <Route path="/grief-and-loss" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.GriefAndLoss /></FeatureLockGate></Suspense>} />
              <Route path="/caregiver-burnout" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CaregiverBurnout /></FeatureLockGate></Suspense>} />
              <Route path="/race-and-identity" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.RaceAndIdentity /></FeatureLockGate></Suspense>} />
              <Route path="/aging-out-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.AgingOutGuide /></FeatureLockGate></Suspense>} />
              <Route path="/rights-card" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.RightsCard /></FeatureLockGate></Suspense>} />
              <Route path="/life-story" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildLifeStory /></FeatureLockGate></Suspense>} />
              <Route path="/peer-support" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.PeerSupport /></FeatureLockGate></Suspense>} />
              <Route path="/suicide-prevention-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildSuicideGuide /></FeatureLockGate></Suspense>} />
              <Route path="/aces-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ACEsGuide /></FeatureLockGate></Suspense>} />
              <Route path="/professional-presentation" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><ProfessionalPresentation /></FeatureLockGate></Suspense>} />
              <Route path="/support-chat" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SupportChat /></FeatureLockGate></Suspense>} />
              <Route path="/agency-outcomes" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.AgencyOutcomeReports /></FeatureLockGate></Suspense>} />
              <Route path="/founder-dashboard" element={<Suspense fallback={<LoadingFallback />}><AdminRouteGate founderOnly><FounderDashboard /></AdminRouteGate></Suspense>} />
              <Route path="/resource-management" element={<Suspense fallback={<LoadingFallback />}><AdminRouteGate><ResourceManagement /></AdminRouteGate></Suspense>} />
              <Route path="/app-docs" element={<Suspense fallback={<LoadingFallback />}><AppDocs /></Suspense>} />
              <Route path="/founder-access" element={<Suspense fallback={<LoadingFallback />}><FounderAccessPortal /></Suspense>} />
              <Route path="/founder-admin-management" element={<Suspense fallback={<LoadingFallback />}><FounderAdminManagement /></Suspense>} />
              <Route path="/survey" element={<Suspense fallback={<LoadingFallback />}><AppSurvey /></Suspense>} />
              <Route path="/legal-policy" element={<Suspense fallback={<LoadingFallback />}><LegalPolicy /></Suspense>} />
              <Route path="/privacy-policy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense>} />
              <Route path="/terms-of-service" element={<Suspense fallback={<LoadingFallback />}><TermsOfService /></Suspense>} />
              <Route path="/crisis-disclaimer" element={<Suspense fallback={<LoadingFallback />}><CrisisDisclaimer /></Suspense>} />
              <Route path="/ai-disclaimer" element={<Suspense fallback={<LoadingFallback />}><AIDisclaimer /></Suspense>} />
              <Route path="/data-use-policy" element={<Suspense fallback={<LoadingFallback />}><DataUsePolicy /></Suspense>} />
              <Route path="/resource-matcher" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><ResourceMatcher /></FeatureLockGate></Suspense>} />
              <Route path="/accessibility" element={<Suspense fallback={<LoadingFallback />}><AccessibilityStatement /></Suspense>} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            )}
          </AnimatePresence>
          )}
          {!showComingSoon && <CopyrightFooter hasBottomNav={!!(user && !needsOnboarding)} />}
          {!showComingSoon && user && !needsOnboarding && <MoxieChatWidget />}
          {!showComingSoon && user && !needsOnboarding && <BottomNav />}
        </Router>
        </ProfessionalGate>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
    </ClientErrorBoundary>
  )
}

export default App
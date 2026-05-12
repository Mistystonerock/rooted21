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
import FounderDashboard from '@/pages/FounderDashboard';
import AppDocs from '@/pages/AppDocs';
import FounderAccessPortal from '@/pages/FounderAccessPortal';
import AppSurvey from '@/pages/AppSurvey';
import LegalPolicy from '@/pages/LegalPolicy';
import SecureDocumentRepository from '@/pages/SecureDocumentRepository';
import CaseDetail from '@/pages/CaseDetail';
import CaseStatusReport from '@/pages/CaseStatusReport';
import ScheduleFamilyMeeting from '@/pages/ScheduleFamilyMeeting';
import PersonalizedLegalFeed from '@/pages/PersonalizedLegalFeed';
import PersonalizedChat from '@/pages/PersonalizedChat';
import GrowthInsights from '@/pages/GrowthInsights';
import EmergencyToolbox from '@/pages/EmergencyToolbox';
import Launch from '@/pages/Launch';
import CourtReadyExport from '@/pages/CourtReadyExport';
import CasePlanChecklist from '@/pages/CasePlanChecklist';
import ExpenseSplit from '@/pages/ExpenseSplit';
import ExpenseTracker from '@/pages/ExpenseTracker';
import DocumentScanner from '@/pages/DocumentScanner';
import LegalCalendar from '@/pages/LegalCalendar';
import CoParentingHealthDashboard from '@/pages/CoParentingHealthDashboard';
import ProfessionalPresentation from '@/pages/ProfessionalPresentation';
import ComprehensiveCaseReport from '@/pages/ComprehensiveCaseReport';
import CourtReadySummary from '@/pages/CourtReadySummary';
import MedicationManager from '@/pages/MedicationManager';
import FormHelper from '@/pages/FormHelper';
import CommunityResourceMap from '@/pages/CommunityResourceMap';
import LegalAndDisclaimers from '@/pages/LegalAndDisclaimers';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfService from '@/pages/TermsOfService';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import CrisisDisclaimer from '@/pages/CrisisDisclaimer';
import AIDisclaimer from '@/pages/AIDisclaimer';
import DataUsePolicy from '@/pages/DataUsePolicy';
import ResourceMatcher from '@/components/resources/ResourceMatcher';
import About from '@/pages/About';

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      // Initialize founder role if this is the founder account
      if (u?.email) {
        try {
          await base44.functions.invoke("initializeFounder", {});
        } catch (e) {
          // Silently fail if function doesn't exist yet
        }
      }
    }).catch(() => setUser(null));
  }, []);

  return (
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Launch />} />
              <Route path="/home" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Home /></FeatureLockGate></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Dashboard /></FeatureLockGate></Suspense>} />
              <Route path="/chat" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Chat /></FeatureLockGate></Suspense>} />
              <Route path="/lessons" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Lessons /></FeatureLockGate></Suspense>} />
              <Route path="/goals" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Goals /></FeatureLockGate></Suspense>} />
              <Route path="/progress" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Progress /></FeatureLockGate></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Profile /></FeatureLockGate></Suspense>} />
              <Route path="/help" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Help /></FeatureLockGate></Suspense>} />
              <Route path="/child-profile" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildProfile /></FeatureLockGate></Suspense>} />
              <Route path="/professional" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ProfessionalPortal /></FeatureLockGate></Suspense>} />
              <Route path="/resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Resources /></FeatureLockGate></Suspense>} />
              <Route path="/my-team" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MyTeam /></FeatureLockGate></Suspense>} />
              <Route path="/family-dashboard" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.FamilyDashboard /></FeatureLockGate></Suspense>} />
              <Route path="/respite-care" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.RespiteCare /></FeatureLockGate></Suspense>} />
              <Route path="/resource-library" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ResourceLibrary /></FeatureLockGate></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.Analytics /></FeatureLockGate></Suspense>} />
              <Route path="/schedule" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ScheduleCreator /></FeatureLockGate></Suspense>} />
              <Route path="/safety-plan" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SafetyPlan /></FeatureLockGate></Suspense>} />
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
              <Route path="/partnership-safety-plan/:partnershipId" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.PartnershipSafetyPlan /></FeatureLockGate></Suspense>} />
              <Route path="/court-generate-report" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CourtGenerateReport /></FeatureLockGate></Suspense>} />
              <Route path="/my-reflections" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.MyReflections /></FeatureLockGate></Suspense>} />
              <Route path="/local-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LocalResourceFinder /></FeatureLockGate></Suspense>} />
              <Route path="/weekly-habits" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.WeeklyHabits /></FeatureLockGate></Suspense>} />
              <Route path="/professional-directory" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ProfessionalDirectory /></FeatureLockGate></Suspense>} />
              <Route path="/app-guide" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.AppGuide /></FeatureLockGate></Suspense>} />
              <Route path="/care-calendar" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.CareCalendar /></FeatureLockGate></Suspense>} />
              <Route path="/sensory-toolbox" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.SensoryToolbox /></FeatureLockGate></Suspense>} />
              <Route path="/child-profiles" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ChildProfiles /></FeatureLockGate></Suspense>} />
              <Route path="/live-classes" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.LiveClasses /></FeatureLockGate></Suspense>} />
              <Route path="/class-enrollment" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.ClassEnrollment /></FeatureLockGate></Suspense>} />
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
              <Route path="/documents" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><SecureDocumentRepository /></FeatureLockGate></Suspense>} />
              <Route path="/personalized-chat" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><PersonalizedChat /></FeatureLockGate></Suspense>} />
              <Route path="/growth-insights" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><GrowthInsights /></FeatureLockGate></Suspense>} />
              <Route path="/behavioral-trends" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.BehavioralTrends /></FeatureLockGate></Suspense>} />
              <Route path="/job-resources" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.JobResources /></FeatureLockGate></Suspense>} />
              <Route path="/emergency-toolbox" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><EmergencyToolbox /></FeatureLockGate></Suspense>} />
              <Route path="/court-ready-export" element={<FeatureLockGate user={user}><CourtReadyExport /></FeatureLockGate>} />
              <Route path="/expense-split" element={<FeatureLockGate user={user}><ExpenseSplit /></FeatureLockGate>} />
              <Route path="/document-scanner" element={<FeatureLockGate user={user}><DocumentScanner /></FeatureLockGate>} />
              <Route path="/case-plan-checklist" element={<FeatureLockGate user={user}><CasePlanChecklist /></FeatureLockGate>} />
              <Route path="/expense-tracker" element={<FeatureLockGate user={user}><ExpenseTracker /></FeatureLockGate>} />
              <Route path="/visitation-tracker" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><routes.VisitationTracker /></FeatureLockGate></Suspense>} />
              <Route path="/medication-manager" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><MedicationManager /></FeatureLockGate></Suspense>} />
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
              <Route path="/founder-dashboard" element={<Suspense fallback={<LoadingFallback />}><FounderDashboard /></Suspense>} />
              <Route path="/app-docs" element={<Suspense fallback={<LoadingFallback />}><AppDocs /></Suspense>} />
              <Route path="/founder-access" element={<Suspense fallback={<LoadingFallback />}><FounderAccessPortal /></Suspense>} />
              <Route path="/survey" element={<Suspense fallback={<LoadingFallback />}><AppSurvey /></Suspense>} />
              <Route path="/legal-policy" element={<Suspense fallback={<LoadingFallback />}><LegalPolicy /></Suspense>} />
              <Route path="/privacy-policy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense>} />
              <Route path="/privacy-policy-page" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicyPage /></Suspense>} />
              <Route path="/terms-of-service" element={<Suspense fallback={<LoadingFallback />}><TermsOfService /></Suspense>} />
              <Route path="/terms-of-service-page" element={<Suspense fallback={<LoadingFallback />}><TermsOfServicePage /></Suspense>} />
              <Route path="/crisis-disclaimer" element={<Suspense fallback={<LoadingFallback />}><CrisisDisclaimer /></Suspense>} />
              <Route path="/ai-disclaimer" element={<Suspense fallback={<LoadingFallback />}><AIDisclaimer /></Suspense>} />
              <Route path="/data-use-policy" element={<Suspense fallback={<LoadingFallback />}><DataUsePolicy /></Suspense>} />
              <Route path="/resource-matcher" element={<Suspense fallback={<LoadingFallback />}><FeatureLockGate user={user}><ResourceMatcher /></FeatureLockGate></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AnimatePresence>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
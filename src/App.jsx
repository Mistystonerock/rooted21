import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import LoadingFallback from '@/components/mobile/LoadingFallback';
import routes from '@/hooks/useLazyLoadRoutes';
import CaseDetail from '@/pages/CaseDetail';
import CaseStatusReport from '@/pages/CaseStatusReport';
import ScheduleFamilyMeeting from '@/pages/ScheduleFamilyMeeting';
import PersonalizedLegalFeed from '@/pages/PersonalizedLegalFeed';
import PersonalizedChat from '@/pages/PersonalizedChat';
import GrowthInsights from '@/pages/GrowthInsights';
import EmergencyToolbox from '@/pages/EmergencyToolbox';
import Launch from '@/pages/Launch';
import CourtReadyExport from '@/pages/CourtReadyExport';
import ExpenseSplit from '@/pages/ExpenseSplit';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Launch />} />
              <Route path="/home" element={<Suspense fallback={<LoadingFallback />}><routes.Home /></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><routes.Dashboard /></Suspense>} />
              <Route path="/chat" element={<Suspense fallback={<LoadingFallback />}><routes.Chat /></Suspense>} />
              <Route path="/lessons" element={<Suspense fallback={<LoadingFallback />}><routes.Lessons /></Suspense>} />
              <Route path="/goals" element={<Suspense fallback={<LoadingFallback />}><routes.Goals /></Suspense>} />
              <Route path="/progress" element={<Suspense fallback={<LoadingFallback />}><routes.Progress /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><routes.Profile /></Suspense>} />
              <Route path="/help" element={<Suspense fallback={<LoadingFallback />}><routes.Help /></Suspense>} />
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
              <Route path="/case-management-new" element={<Suspense fallback={<LoadingFallback />}><routes.CaseManagementNew /></Suspense>} />
              <Route path="/case-detail/:caseId" element={<Suspense fallback={<LoadingFallback />}><CaseDetail /></Suspense>} />
              <Route path="/case-status-report/:caseId" element={<Suspense fallback={<LoadingFallback />}><CaseStatusReport /></Suspense>} />
              <Route path="/schedule-family-meeting/:caseId" element={<Suspense fallback={<LoadingFallback />}><ScheduleFamilyMeeting /></Suspense>} />
              <Route path="/personalized-legal-feed" element={<Suspense fallback={<LoadingFallback />}><PersonalizedLegalFeed /></Suspense>} />
              <Route path="/legal-knowledge-base" element={<Suspense fallback={<LoadingFallback />}><routes.LegalKnowledgeBase /></Suspense>} />
              <Route path="/system-guides" element={<Suspense fallback={<LoadingFallback />}><routes.SystemGuides /></Suspense>} />
              <Route path="/meeting-prep-chatbot" element={<Suspense fallback={<LoadingFallback />}><routes.MeetingPrepChatbot /></Suspense>} />
              <Route path="/documents" element={<Suspense fallback={<LoadingFallback />}><routes.SecureDocumentRepository /></Suspense>} />
              <Route path="/personalized-chat" element={<Suspense fallback={<LoadingFallback />}><PersonalizedChat /></Suspense>} />
              <Route path="/growth-insights" element={<Suspense fallback={<LoadingFallback />}><GrowthInsights /></Suspense>} />
              <Route path="/behavioral-trends" element={<Suspense fallback={<LoadingFallback />}><routes.BehavioralTrends /></Suspense>} />
              <Route path="/job-resources" element={<Suspense fallback={<LoadingFallback />}><routes.JobResources /></Suspense>} />
              <Route path="/emergency-toolbox" element={<Suspense fallback={<LoadingFallback />}><EmergencyToolbox /></Suspense>} />
              <Route path="/court-ready-export" element={<CourtReadyExport />} />
              <Route path="/expense-split" element={<ExpenseSplit />} />
              <Route path="/visitation-tracker" element={<Suspense fallback={<LoadingFallback />}><routes.VisitationTracker /></Suspense>} />
              <Route path="/medication-manager" element={<Suspense fallback={<LoadingFallback />}><routes.MedicationManager /></Suspense>} />
              <Route path="/incident-reports" element={<Suspense fallback={<LoadingFallback />}><routes.IncidentReportBuilder /></Suspense>} />
              <Route path="/reunification-tracker" element={<Suspense fallback={<LoadingFallback />}><routes.ReunificationTracker /></Suspense>} />
              <Route path="/team-contacts" element={<Suspense fallback={<LoadingFallback />}><routes.TeamContacts /></Suspense>} />
              <Route path="/education-hub" element={<Suspense fallback={<LoadingFallback />}><routes.EducationHub /></Suspense>} />
              <Route path="/fasd-guide" element={<Suspense fallback={<LoadingFallback />}><routes.FASDGuide /></Suspense>} />
              <Route path="/attachment-guide" element={<Suspense fallback={<LoadingFallback />}><routes.AttachmentGuide /></Suspense>} />
              <Route path="/grief-and-loss" element={<Suspense fallback={<LoadingFallback />}><routes.GriefAndLoss /></Suspense>} />
              <Route path="/caregiver-burnout" element={<Suspense fallback={<LoadingFallback />}><routes.CaregiverBurnout /></Suspense>} />
              <Route path="/race-and-identity" element={<Suspense fallback={<LoadingFallback />}><routes.RaceAndIdentity /></Suspense>} />
              <Route path="/aging-out-guide" element={<Suspense fallback={<LoadingFallback />}><routes.AgingOutGuide /></Suspense>} />
              <Route path="/rights-card" element={<Suspense fallback={<LoadingFallback />}><routes.RightsCard /></Suspense>} />
              <Route path="/life-story" element={<Suspense fallback={<LoadingFallback />}><routes.ChildLifeStory /></Suspense>} />
              <Route path="/peer-support" element={<Suspense fallback={<LoadingFallback />}><routes.PeerSupport /></Suspense>} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AnimatePresence>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
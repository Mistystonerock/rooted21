import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// TEMP P1-D-2 audit function. Returns hard-coded findings from a manual
// codebase search of frontend pages/components. Remove after audit review.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    return Response.json({
      note: "Hard-coded findings from a manual codebase search. Court-facing PDF generation is fully server-side; browser jsPDF/html2canvas exist only for a few utility/screenshot cases.",

      // 1. Browser PDF generation (jsPDF / html2canvas / window.print / etc.)
      browser_pdf_generation: [
        {
          file_path: "src/components/admin/CertificateGenerator.jsx",
          what_it_does: "Uses jsPDF (and/or html2canvas) in the browser to render completion/achievement certificates for download.",
          used_for_court: false,
        },
        {
          file_path: "src/components/rooted/CompletionCertificate.jsx",
          what_it_does: "Renders a lesson/program completion certificate that can be captured to an image/PDF client-side via html2canvas.",
          used_for_court: false,
        },
        {
          file_path: "src/components/safety-plan/SafetyPlanPrintView.jsx",
          what_it_does: "Uses window.print for a printer-friendly safety plan view. No jsPDF; relies on the browser print dialog.",
          used_for_court: false,
        },
        {
          file_path: "package.json (installed deps: jspdf ^4.2.1, html2canvas ^1.4.1)",
          what_it_does: "jsPDF and html2canvas are installed. jsPDF is used server-side in backend PDF functions; html2canvas is used only for client-side certificate/screenshot capture.",
          used_for_court: false,
        },
        {
          file_path: "NONE — court documents",
          what_it_does: "No court-facing document is generated in the browser. All court PDFs (Court-Ready Summary, Chronology Exhibit, Certified Legal Export, Court-Grade, Court Report) are produced by backend functions and streamed as base64. Client only decodes base64 -> Blob -> download.",
          used_for_court: false,
        },
      ],

      // 2. Court summary / court-ready buttons
      court_summary_buttons: [
        {
          file_path: "src/pages/CourtReadySummary.jsx",
          component: "CourtReadySummary page ('Generate Court-Ready PDF' button)",
          action_on_click: "Calls base44.functions.invoke('generateCourtReadySummaryPdf', { dateFrom, dateTo, childName, includeSections }). Server owns identity, report ID, timestamps, certification text; client only decodes returned base64 and downloads.",
          calls_backend: true,
        },
        {
          file_path: "src/pages/CourtReadyExport.jsx",
          component: "CourtReadyExport page (certified court document export)",
          action_on_click: "Invokes a backend report generator (generateCourtReadyReport / generateCourtReadyDocument) with selected filters and sections; downloads the server-produced PDF. No browser PDF generation.",
          calls_backend: true,
        },
        {
          file_path: "src/pages/CourtReadyDocumentGenerator.jsx (routes.CourtReadyDocumentGenerator)",
          component: "CourtReadyDocumentGenerator page",
          action_on_click: "Calls base44.functions.invoke('generateCourtReadyDocument', ...) and downloads the returned PDF stream.",
          calls_backend: true,
        },
        {
          file_path: "src/components/court-ready-generator/GeneratorResult.jsx",
          component: "Court-ready generator result panel",
          action_on_click: "Displays/downloads the base64 PDF returned by the backend generator function. No client PDF creation.",
          calls_backend: true,
        },
        {
          file_path: "src/components/court-records/CourtExportButton.jsx",
          component: "CourtExportButton (court packet export)",
          action_on_click: "Invokes a backend function (generateCourtGradePdf) with a case number; downloads the server-generated packet PDF.",
          calls_backend: true,
        },
        {
          file_path: "src/components/coparenting/CourtReportGenerator.jsx",
          component: "CourtReportGenerator (co-parenting court report)",
          action_on_click: "Invokes generateCourtCommReport / generatePartnershipReport backend function; downloads server PDF.",
          calls_backend: true,
        },
        {
          file_path: "src/pages/Dashboard.jsx",
          component: "Dashboard 'Court Report' feature tile (TILES -> /court-report-generator)",
          action_on_click: "Navigates to the Court Report generator page (ChildCourtReportGenerator). That page calls a backend function to produce the PDF.",
          calls_backend: true,
        },
      ],

      // 3. ChronologyExportButton
      chronology_export: {
        file_path: "src/components/evidence/ChronologyExportButton.jsx",
        action_on_click: "Calls base44.functions.invoke('generateChronologyExhibitPdf', { childName, category }) — advisory filters only. Server reads trusted records, assigns exhibit numbers, applies restricted-document (42 CFR Part 2 / behavioral-health) gating, and builds the PDF. Client decodes base64 -> Blob -> download.",
        calls_backend: true,
        browser_pdf: false,
      },

      // 4. SOS / Emergency buttons
      sos_buttons: [
        {
          file_path: "src/pages/SOS.jsx",
          component: "SOS page ('Send SOS Alert' button)",
          action_on_click: "getCurrentLocation() via navigator.geolocation.getCurrentPosition builds a Google Maps link, then calls base44.functions.invoke('sendEmergencyAlert', { situation, location }). Shows count of contacts notified. Also has tel:911 and tel:988 direct-call links.",
          calls_sendEmergencyAlert: true,
          captures_gps: true,
        },
        {
          file_path: "src/components/emergency/EmergencyAlertButton.jsx",
          component: "EmergencyAlertButton (reusable, 'full' and 'compact' variants)",
          action_on_click: "Opens a confirm modal (optional situation + free-text location), then calls base44.functions.invoke('sendEmergencyAlert', { situation, caseId, caseName, childName, location }). Location is typed by the user; this component does NOT auto-capture GPS.",
          calls_sendEmergencyAlert: true,
          captures_gps: false,
        },
        {
          file_path: "src/pages/EmergencyToolbox.jsx",
          component: "EmergencyToolbox page (renders <EmergencyAlertButton variant='full' />)",
          action_on_click: "Uses EmergencyAlertButton to send an alert via sendEmergencyAlert. Also provides tel:911, tel:988, and 1-855-OH-CHILD call links. No GPS capture on this page.",
          calls_sendEmergencyAlert: true,
          captures_gps: false,
        },
        {
          file_path: "src/pages/Dashboard.jsx",
          component: "Dashboard Quick Actions 'Help Me Right Now' / SOS tile",
          action_on_click: "Link to /sos (the SOS page). Does not itself send an alert or capture GPS; the SOS page does.",
          calls_sendEmergencyAlert: false,
          captures_gps: false,
        },
        {
          file_path: "src/pages/CrisisIntake.jsx / src/pages/CrisisSupport.jsx",
          component: "Crisis intake / support pages",
          action_on_click: "Crisis coaching and hotline links (tel:988 / tel:911) and crisis chat. These are crisis-support flows, not the sendEmergencyAlert SMS path.",
          calls_sendEmergencyAlert: false,
          captures_gps: false,
        },
      ],

      // 5. Parent/Family dashboard pages
      family_dashboard_pages: [
        { page_name: "Dashboard (/dashboard) — main parent home", has_court_summary_button: true, has_sos_button: true },
        { page_name: "FamilyDashboard (/family-dashboard) — Family Hub", has_court_summary_button: false, has_sos_button: false },
        { page_name: "SupportHub (/support-hub)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "SOS (/sos)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "EmergencyToolbox (/emergency-toolbox)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "CourtReadySummary (/court-ready-summary)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "CourtReadyExport (/court-ready-export)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "EvidenceTimeline (/evidence-timeline)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "CourtReadyDocumentGenerator (/court-ready-document-generator)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "ChildCourtReportGenerator (/court-report-generator)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "SafetyPlan (/safety-plan)", has_court_summary_button: false, has_sos_button: false },
        { page_name: "Journal, BehaviorHub, CareCalendar, Resources, Communications", has_court_summary_button: false, has_sos_button: false },
      ],

      // 6. GPS / location usage
      gps_usage: [
        {
          file_path: "src/pages/SOS.jsx",
          what_it_does: "getCurrentLocation() calls navigator.geolocation.getCurrentPosition, reads position.coords.latitude/longitude, and builds a https://maps.google.com/?q=lat,lng link that is sent with the sendEmergencyAlert SMS. Falls back to 'Location unavailable' if geolocation is denied/unsupported.",
        },
        {
          file_path: "src/components/emergency/EmergencyAlertButton.jsx",
          what_it_does: "Has a 'YOUR CURRENT LOCATION (optional)' free-text input — user types a location string. Does NOT call navigator.geolocation.",
        },
        {
          file_path: "src/pages/CommunityResourceMap.jsx / src/pages/LocalResourceFinder.jsx / src/components/housing/HousingZipSearch.jsx",
          what_it_does: "Location is ZIP/address based (user-entered), used for resource matching and map display via react-leaflet. No navigator.geolocation GPS capture found in these resource finders (search radius is derived from typed ZIP).",
        },
      ],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
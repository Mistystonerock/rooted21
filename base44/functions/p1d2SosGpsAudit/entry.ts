import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// TEMP P1-D-2 focused audit: SOS, GPS, family dashboards, chronology export.
// Hard-coded findings from a manual codebase search. Remove after review.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    return Response.json({
      sos_buttons: [
        { file_path: "src/pages/SOS.jsx", component: "SOS page 'Send SOS Alert'", action_on_click: "Captures GPS then invokes sendEmergencyAlert with situation+location; also tel:911 / tel:988 links", calls_sendEmergencyAlert: true, captures_gps: true },
        { file_path: "src/components/emergency/EmergencyAlertButton.jsx", component: "EmergencyAlertButton (full/compact)", action_on_click: "Confirm modal (situation + typed location) then invokes sendEmergencyAlert", calls_sendEmergencyAlert: true, captures_gps: false },
        { file_path: "src/pages/EmergencyToolbox.jsx", component: "EmergencyToolbox (renders EmergencyAlertButton)", action_on_click: "Sends alert via EmergencyAlertButton; plus tel:911/988/OH-CHILD links", calls_sendEmergencyAlert: true, captures_gps: false },
        { file_path: "src/pages/Dashboard.jsx", component: "Quick Actions 'Help Me Right Now' SOS tile", action_on_click: "Link to /sos; no send/GPS itself", calls_sendEmergencyAlert: false, captures_gps: false },
        { file_path: "src/pages/CrisisIntake.jsx / src/pages/CrisisSupport.jsx", component: "Crisis intake/support", action_on_click: "Crisis coaching + hotline links (988/911), not the SMS alert path", calls_sendEmergencyAlert: false, captures_gps: false },
      ],

      gps_usage: [
        { file_path: "src/pages/SOS.jsx", what_it_does: "navigator.geolocation.getCurrentPosition reads latitude/longitude, builds maps.google.com link sent with sendEmergencyAlert; falls back to 'Location unavailable'" },
        { file_path: "src/components/emergency/EmergencyAlertButton.jsx", what_it_does: "Free-text 'current location' input typed by user; no navigator.geolocation" },
        { file_path: "src/pages/CommunityResourceMap.jsx / LocalResourceFinder.jsx / components/housing/HousingZipSearch.jsx", what_it_does: "ZIP/address-based location for resource matching + react-leaflet maps; no GPS capture" },
      ],

      family_dashboard_pages: [
        { page_name: "Dashboard (/dashboard)", has_court_summary_button: true, has_sos_button: true },
        { page_name: "FamilyDashboard (/family-dashboard)", has_court_summary_button: false, has_sos_button: false },
        { page_name: "SupportHub (/support-hub)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "SOS (/sos)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "EmergencyToolbox (/emergency-toolbox)", has_court_summary_button: false, has_sos_button: true },
        { page_name: "CourtReadySummary (/court-ready-summary)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "CourtReadyExport (/court-ready-export)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "EvidenceTimeline (/evidence-timeline)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "CourtReadyDocumentGenerator (/court-ready-document-generator)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "ChildCourtReportGenerator (/court-report-generator)", has_court_summary_button: true, has_sos_button: false },
        { page_name: "SafetyPlan (/safety-plan)", has_court_summary_button: false, has_sos_button: false },
        { page_name: "Journal / BehaviorHub / CareCalendar / Resources / Communications", has_court_summary_button: false, has_sos_button: false },
      ],

      chronology_export: {
        exists: true,
        file_path: "src/components/evidence/ChronologyExportButton.jsx",
        action_on_click: "Invokes generateChronologyExhibitPdf with childName+category advisory filters; server assigns exhibit numbers, applies restricted-doc gating, builds PDF; client decodes base64 -> download",
        calls_backend: true,
        browser_pdf: false,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
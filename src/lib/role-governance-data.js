export const ROLE_GOVERNANCE = [
  {
    role: "Parent / Caregiver",
    securityLevel: "Family-owned private access",
    purpose: "Use Rooted 21 to organize family needs, track progress, prepare for meetings, and choose what to share.",
    dashboardAccess: "Family Dashboard, child profiles, case plans, documents, resources, progress, education, Moxie AI, court-ready tools, consent dashboard.",
    permissions: "Create, edit, delete, and export their own family-owned records. Generate invitation and document access codes.",
    aiPermissions: "May use Moxie AI for organizing, reflection, plain-language explanations, preparation checklists, and supportive coaching within boundaries.",
    dataVisibilityRules: "Sees only records connected to their own account, children, family, or explicitly shared partnerships.",
    documentAccessRules: "Owns uploaded documents; can view, download, organize, delete, and share selected documents through approved access controls.",
    futureFeatures: "Subscription options, premium classes, donation-supported scholarships, grant-funded access, and deeper family progress dashboards."
  },
  {
    role: "Founder",
    securityLevel: "Highest platform governance",
    purpose: "Protect the mission, manage operations, review platform health, support funding strategy, and oversee sensitive governance decisions.",
    dashboardAccess: "Founder Dashboard, App Documentation, Project Blueprint, resource management, admin management, audits, operational panels.",
    permissions: "Platform-level oversight, admin setup, resource governance, launch controls, and compliance review workflows.",
    aiPermissions: "May use AI for planning, documentation, reporting, operational summaries, and product strategy — not to bypass privacy or consent rules.",
    dataVisibilityRules: "Uses elevated views only for platform operations, safety, moderation, support, and compliance needs.",
    documentAccessRules: "No casual access to family documents; document visibility must be tied to support, security, legal compliance, or consented workflows.",
    futureFeatures: "Grant dashboards, nonprofit reporting, organization licensing, funder outcome reports, scholarship administration, and compliance exports."
  },
  {
    role: "Admin",
    securityLevel: "Restricted operations access",
    purpose: "Help manage resources, user support, content quality, and approved operational tasks without taking ownership from families.",
    dashboardAccess: "Admin/resource management areas, approved support tools, documentation, reports, and limited operational views.",
    permissions: "Review resources, manage approved listings, support access-code workflows, and help with platform operations based on assigned permissions.",
    aiPermissions: "May use AI for resource review, documentation drafts, support summaries, and operational triage within privacy boundaries.",
    dataVisibilityRules: "Cannot browse family records by default; access should be limited to assigned support needs, audits, or explicit permission workflows.",
    documentAccessRules: "No document access unless a family-approved, support-related, or compliance-based workflow grants it.",
    futureFeatures: "Role-specific admin permissions, organization staff seats, support queues, grant reporting tools, and moderation workflows."
  },
  {
    role: "Professional / Assigned Support",
    securityLevel: "Permission-based family collaboration",
    purpose: "View family-approved progress and context so support can be coordinated without editing family-owned records.",
    dashboardAccess: "Professional portal, assigned family views, approved summaries, team communication, and read-only progress snapshots.",
    permissions: "View approved family data, add professional notes where allowed, request meetings, and communicate through approved tools.",
    aiPermissions: "May use AI to summarize approved information, prepare meeting notes, and understand patterns without generating diagnoses or legal conclusions.",
    dataVisibilityRules: "Sees only families assigned to them and only categories approved by consent or access-code rules.",
    documentAccessRules: "May view selected documents shared by the family or an approved access code; cannot delete family-owned documents.",
    futureFeatures: "Professional workspaces, organization licensing, caseload dashboards, referral management, and therapist/CPS/court-specific views."
  },
  {
    role: "CPS Caseworker",
    securityLevel: "Read-only child welfare collaboration",
    purpose: "Review family-approved case-plan progress, visitation records, documents, deadlines, and support needs.",
    dashboardAccess: "CPS-ready assigned family view, case-plan progress, approved court/CPS summaries, visitation logs, and selected documents.",
    permissions: "Read approved progress data and professional summaries; may not edit parent-owned records or rewrite family history.",
    aiPermissions: "May use AI-assisted summaries of approved progress data for preparation and review, with no automated determinations.",
    dataVisibilityRules: "Limited to consented child welfare categories and assigned families only.",
    documentAccessRules: "May view CPS-relevant documents explicitly shared by the family or granted through access code controls.",
    futureFeatures: "Agency licensing, county dashboards, reunification progress views, document request workflows, and CPS-ready outcome reports."
  },
  {
    role: "Therapist / Counselor",
    securityLevel: "Consent-based behavioral health view",
    purpose: "Understand patterns, goals, strengths, triggers, coping supports, and family-approved context for care coordination.",
    dashboardAccess: "Therapist-ready progress summaries, approved behavior logs, goals, family background, care calendar, and selected documents.",
    permissions: "Read approved behavioral and progress data; provide support notes only where permission is granted.",
    aiPermissions: "May use AI for plain-language pattern summaries and session-prep notes, not diagnosis, treatment orders, or crisis replacement.",
    dataVisibilityRules: "Limited to consented behavioral health categories; substance-use or sensitive segments require separate consent controls.",
    documentAccessRules: "Can view shared therapy/behavioral documents only when the family approves that segment.",
    futureFeatures: "Therapist portal, referral matching, appointment prep, progress snapshots, and consent-segmented clinical collaboration."
  },
  {
    role: "Court / Legal Viewer",
    securityLevel: "Review-only legal preparation access",
    purpose: "Review user-approved court-ready summaries, evidence timelines, documents, and progress packets for attorney or court preparation.",
    dashboardAccess: "Court-ready export views, evidence timeline, certified summaries, selected documents, and hearing preparation materials.",
    permissions: "Read approved materials only; cannot edit records, create evidence, or alter family-owned timelines.",
    aiPermissions: "May review AI-assisted summaries after family approval; AI must not provide legal advice or decide legal strategy.",
    dataVisibilityRules: "Limited to court/legal categories intentionally shared by the family.",
    documentAccessRules: "May view selected legal/court documents and exports through time-limited or permission-based access.",
    futureFeatures: "Attorney-review packets, court exhibit bundles, certified export logs, and hearing-prep collaboration."
  },
  {
    role: "School / Education Professional",
    securityLevel: "Education-limited collaboration",
    purpose: "View approved school-related supports, IEP context, behavior patterns, goals, and family-approved documents.",
    dashboardAccess: "Education-focused progress summaries, school documents, goals, behavior patterns, and care calendar items.",
    permissions: "Read approved education-related data and collaborate through allowed support workflows.",
    aiPermissions: "May use AI-assisted summaries for plain-language school support planning, not diagnosis or formal educational determinations.",
    dataVisibilityRules: "Limited to education categories approved by the family.",
    documentAccessRules: "Can view selected IEP, school, and support documents shared by the family.",
    futureFeatures: "School collaboration portal, IEP prep packets, meeting notes, and education progress summaries."
  },
  {
    role: "Organization / Agency",
    securityLevel: "Future licensed organization access",
    purpose: "Support teams, agencies, nonprofits, and funders with aggregate outcomes while protecting family privacy.",
    dashboardAccess: "Future organization dashboard, licensing tools, aggregate reporting, class management, grant and donation impact reporting.",
    permissions: "Manage organization seats, approved staff, aggregate dashboards, class offerings, and licensed program settings.",
    aiPermissions: "May use AI for aggregate reporting, grant narratives, class insights, and operational summaries without exposing private family records.",
    dataVisibilityRules: "Aggregate or consented views only; no unrestricted access to identifiable family records.",
    documentAccessRules: "No family document access unless explicitly shared for an approved support workflow.",
    futureFeatures: "Organizational licensing, nonprofit grant dashboards, funder reports, class revenue tools, donations, and subscription administration."
  }
];
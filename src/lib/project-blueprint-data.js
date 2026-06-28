export const blueprintSummary = [
  { label: "Support loop", value: "Organize → Prepare → Understand → Connect" },
  { label: "MVP priority", value: "Secure, calm, mobile-first family app with web portals" },
  { label: "Core boundary", value: "Preparation and organization support — not legal, medical, emergency, or therapy services" },
  { label: "Primary audience", value: "Families, kinship caregivers, foster caregivers, professionals, admins, and founder" },
];

export const blueprintSections = [
  {
    title: "Project Overview",
    intro: "Rooted 21 is a trauma-informed parenting app and support network for families navigating parenting challenges, CPS involvement, court preparation, co-parenting, school advocacy, recovery, housing, benefits, and community resources.",
    items: [
      "Convert the Base44 prototype into a secure, scalable, app-store-ready platform for iOS, Android, and web.",
      "Provide one organized hub for case plans, court dates, documents, parenting education, resources, and progress tracking.",
      "Reduce stress with calm, plain-language guidance and clearly defined professional boundaries.",
      "Support professional collaboration through permission-based access codes and family consent.",
    ],
  },
  {
    title: "User Profiles & Access",
    intro: "Each user type receives only the tools and records needed for their workflow.",
    items: [
      "Parents and family users: mobile-first access to SOS, Moxie AI, classes, case plans, court tools, behavior logs, documents, reminders, reports, and QR/professional linking.",
      "Kinship and foster caregivers: guardianship documentation, school support, resource navigation, behavior and milestone tracking, and caregiver-focused AI guidance.",
      "Professionals: web-only, read-only, consent-based access to selected family progress, reports, logs, documents, and dashboards.",
      "Admins: web-only tools for users, roles, content, resources, surveys, announcements, analytics, and access-code lifecycle management.",
      "Founder: full mobile and web access to platform controls, oversight, analytics, legal/compliance dashboards, and strategic settings.",
    ],
  },
  {
    title: "Core Platform Modules",
    intro: "The MVP centers on high-value tools that help families prepare, document, and take the next right step.",
    items: [
      "Moxie AI + SOS for trauma-informed guidance, emotional regulation, process explanations, and resource suggestions.",
      "Case Plan Tracker for uploaded plans, milestones, appointments, screenings, classes, housing, employment, mental health, recovery, and progress summaries.",
      "Court and co-parenting tools for packet preparation, communication logs, tone support, school advocacy, and exportable reports.",
      "Class and program management for 21-day parenting classes, anger management, enrollment, completion tracking, and certificates.",
      "Content and resource management for verified local, statewide, court, crisis, housing, benefits, and low-cost resources.",
      "User engagement and feedback through surveys, ratings, analytics, and continuous UX/content improvement.",
    ],
  },
  {
    title: "AI Safety Boundaries",
    intro: "AI can organize, explain, summarize, and prepare — but it must not replace professionals.",
    items: [
      "Allowed: plain-language explanations, case-plan checklists, meeting prep, document organization, tone rewrites, behavior insights, resource recommendations, class summaries, and progress summaries.",
      "Not allowed: legal advice, medical diagnosis, therapy, emergency response, guaranteed court outcomes, filing instructions, or instructions to violate court orders.",
      "All AI-generated summaries require user review before sharing externally.",
      "AI output should be trauma-informed, plain-language, supportive, and clear about professional boundaries.",
    ],
  },
  {
    title: "Security & Compliance Requirements",
    intro: "Rooted 21 handles sensitive data related to children, CPS, court records, parenting plans, medical documents, recovery, housing, and domestic violence.",
    items: [
      "Encrypt data in transit and at rest.",
      "Maintain secure document storage with role-based access control.",
      "Use consent-based sharing and professional access audit logs.",
      "Support secure file upload, database backups, activity logs, and audit-ready reporting.",
      "Apply least-privilege admin access and clear founder/admin role separation.",
      "Keep family-owned records protected from professional editing unless explicitly designed otherwise.",
    ],
  },
  {
    title: "QR Code & Professional Linking",
    intro: "Professional access must be secure, revocable, and consent-based.",
    items: [
      "Professional generates a unique QR code or access code through the web portal.",
      "Family scans the QR code in the mobile app or enters it manually.",
      "The platform verifies the code and links the family to the professional's subcategory dashboard.",
      "Families control what each professional role can see through consent settings.",
      "Codes can expire or be revoked by families or admins, with activity logged for auditability.",
    ],
  },
  {
    title: "Marketing Website Scope",
    intro: "The public website should build trust, collect leads, and support launch readiness.",
    items: [
      "Pages: Home, About, Misty's Story, Features, For Families, For Professionals, Courts/CPS/Therapists, Parenting Class, Resources, Coming Soon/Waitlist, Donation, Contact, Privacy, Terms, Disclaimers, Accessibility.",
      "Goals: communicate mission and founder journey, position Rooted 21 as trauma-informed and judgment-free, collect waitlist signups, and support credibility with investors, grants, agencies, and partners.",
      "All content should include clear disclaimers and professional boundaries.",
    ],
  },
  {
    title: "MVP vs Future Phases",
    intro: "The MVP should deliver immediate family and professional value while leaving room for scalable growth.",
    items: [
      "MVP: secure auth, family mobile app, admin dashboard, professional portal, Moxie/SOS, case plans, court prep, co-parenting tools, school advocacy, behavior logs, parenting class, verified resources, secure vault, access codes, PDF summaries, reminders, and marketing site.",
      "Future: organization licensing, SMS and in-app messaging, AI document extraction, advanced analytics, multi-language support, grant/donation dashboards, agency portals, virtual classes, custom video, government integrations, white-label portals, and payment/subscription automation.",
    ],
  },
  {
    title: "Monetization Strategy",
    intro: "The recommended launch model balances accessibility with sustainability.",
    items: [
      "Start with freemium family access plus optional donations.",
      "Keep essential support tools available while reserving advanced reports, premium modules, expert content, and analytics for paid tiers.",
      "Later phases may include professional subscriptions, agency plans, premium courses, pay-per-report exports, workshops, grants, ethical sponsorships, and organization licensing.",
      "The platform should remain flexible for for-profit, nonprofit, or hybrid operations without altering core app functionality.",
    ],
  },
  {
    title: "Out of Scope Unless Added Separately",
    intro: "These items should not be treated as MVP commitments without separate approval.",
    items: [
      "Legal representation, filing legal forms for users, medical diagnosis, therapy services, clinical intervention, or human emergency response staffing.",
      "Full nonprofit formation, grant writing, fundraising campaign management, background checks, EHR/insurance billing, or ongoing legal compliance management.",
      "Direct court/CPS/government API integrations, advanced SMS automation, custom live video infrastructure, full multi-language support, and manual verification of every resource.",
    ],
  },
];
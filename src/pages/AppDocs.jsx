import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { BookOpen, Server, Brain, ChevronDown, ChevronUp } from "lucide-react";

const DOCS = [
  {
    id: "frontend",
    icon: <BookOpen size={18} color={C.gold} />,
    label: "Frontend Agent Guide",
    subtitle: "For UI/UX developers & AI agents building screens",
    color: C.gold,
    sections: [
      {
        title: "Tech Stack",
        body: `Rooted 21 is a React + Vite app styled with Tailwind CSS and shadcn/ui components. It uses framer-motion for animations, react-router-dom v6 for routing, and @tanstack/react-query for data fetching. All pages are lazy-loaded via hooks/useLazyLoadRoutes.js.`
      },
      {
        title: "Design System",
        body: `Colors are token-based via CSS variables in index.css and mapped in tailwind.config.js. Always use semantic color names like bg-primary, text-foreground, bg-background — never hardcode hex values. Custom Rooted colors live under the 'rooted' namespace: rooted-dark-green, rooted-mid-green, rooted-light-green, rooted-brown, rooted-cream, rooted-gold, rooted-off-white. For inline styles, import C from @/lib/rooted-constants.`
      },
      {
        title: "Component Conventions",
        body: `Each page lives in /pages and each reusable piece in /components. Always export default with the same name as the file. Use MobileHeader (components/mobile/MobileHeader) for page headers with back navigation. Use BottomNav for persistent bottom navigation on authenticated pages. Min tap target is 44x44px — enforced globally in index.css.`
      },
      {
        title: "Routing",
        body: `All routes are declared in App.jsx. Most routes are wrapped in FeatureLockGate which prevents access before June 10, 2026 (unless the user has role='founder'). Public routes: /, /survey, /founder-dashboard, /founder-access, /legal-policy, /app-docs. Add new pages to App.jsx AND to hooks/useLazyLoadRoutes.js if lazy-loaded.`
      },
      {
        title: "Auth Pattern",
        body: `Use base44.auth.isAuthenticated() to check login status. Use base44.auth.me() to get the current user object (includes id, email, full_name, role). Redirect to login with base44.auth.redirectToLogin(nextUrl). The user object may include family_type, child_profiles, and other custom fields saved via base44.auth.updateMe(data).`
      },
      {
        title: "Data Fetching",
        body: `Import { base44 } from '@/api/base44Client'. Use base44.entities.EntityName.list(), .filter({field: value}), .create(data), .update(id, data), .delete(id). Use @tanstack/react-query with queryClientInstance from @/lib/query-client for caching. Real-time updates via base44.entities.EntityName.subscribe(callback).`
      },
      {
        title: "Key Pages Reference",
        body: `/ → Launch (public landing & waitlist)
/home → Main authenticated home screen
/dashboard → Feature hub dashboard
/founder-dashboard → Analytics & admin data (founder/admin only)
/founder-access → Generate admin codes
/documents → Secure Document Repository
/case-management → Case file management
/daily-checkin → Daily regulation check-in
/chat → AI parenting coach chat
/professional-directory → Therapist & professional finder
/live-classes → Live class schedule & enrollment
/emergency-toolbox → Crisis intervention guide`
      }
    ]
  },
  {
    id: "backend",
    icon: <Server size={18} color={C.midGreen} />,
    label: "Backend Technical Guide",
    subtitle: "For backend developers & function writers",
    color: C.midGreen,
    sections: [
      {
        title: "Backend Architecture",
        body: `All backend logic lives in /functions as Deno Deploy handlers. Each file exports a Deno.serve(async (req) => { ... }) handler. Functions are called from the frontend via: base44.functions.invoke('functionName', payload). The response is an Axios-style object — data lives in response.data.`
      },
      {
        title: "Authentication in Functions",
        body: `Always import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25'. Create the client: const base44 = createClientFromRequest(req). Get the current user: const user = await base44.auth.me(). Return 401 if no user. For admin-only operations check user.role === 'admin' || user.role === 'founder' and return 403 if not. Use base44.asServiceRole for elevated DB access.`
      },
      {
        title: "Entity Access",
        body: `User-scoped (respects RLS): base44.entities.EntityName.list/filter/create/update/delete
Service-role (admin, bypasses RLS): base44.asServiceRole.entities.EntityName.*

Key entities in use:
- User (built-in — auth accounts)
- WaitlistSignup — landing page signups
- ChildProfile — child data per family
- CheckIn — daily regulation check-ins
- BehaviorLog — behavior tracking
- CaseFile / CaseNote / CaseTask — case management
- SecureDocument / DocumentAccessCode — secure vault
- AdminAccessCode / AdminPermissions — admin system
- Survey — app feedback
- GrowthInsight — AI weekly reports
- LiveClass / ClassEnrollment — class system
- CoParentingPartnership / CoParentingMessage — co-parenting
- TeamContact — care team directory
- MedicationRecord — medication tracking
- VisitationLog — visitation records
- IncidentReport — critical incident logging`
      },
      {
        title: "Existing Backend Functions",
        body: `initializeFounder — elevates founder email to founder role on login
createOwnerAccessCode — generates 30-day admin access codes
redeemAdminAccessCode — redeems a code and elevates user role
generateGrowthInsight / generateWeeklyGrowthInsight — AI weekly reports
analyzeAndMatchTherapist — matches user to therapists based on check-in data
analyzeDocumentScan — AI extracts data from uploaded documents
parseCasePlanDocument — AI parses CPS/court documents into checklists
generateCourtReadyReport / generateCaseStatusReport — PDF report generation
sendEmergencyAlert — SMS emergency notifications via Twilio
sendTaskReminders / sendDocumentAlert — notification dispatchers
analyzeCoParentingHealth — partnership health scoring
generatePartnershipReport — co-parenting court report PDF
handleStripeWebhook — Stripe payment event handler`
      },
      {
        title: "Integrations & Secrets",
        body: `Available secrets: STRIPE_SECRET_KEY, TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_PHONE_NUMBER
AI calls: base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema })
File uploads: base44.asServiceRole.integrations.Core.UploadFile({ file })
Email: base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body })
SMS via Twilio: import twilio from 'npm:twilio' — use TWILIO_* secrets`
      },
      {
        title: "Error Handling Convention",
        body: `Always wrap the full handler in try/catch. Return Response.json({ error: error.message }, { status: 500 }) on failure. Do not use bare specifiers — always prefix npm packages with 'npm:packagename@version'. No local imports between function files — each is deployed independently.`
      }
    ]
  },
  {
    id: "llm",
    icon: <Brain size={18} color={C.brown} />,
    label: "LLM Context & Narrative",
    subtitle: "Full app narrative to help AI build smarter",
    color: C.brown,
    sections: [
      {
        title: "What Is Rooted 21?",
        body: `Rooted 21 Parenting Network LLC is a trauma-informed parenting support platform built for foster, adoptive, kinship, and biological families — especially those navigating the child welfare system. It was founded by Misty Stonerock, who built it from lived experience with childhood trauma and years working in behavioral health, juvenile systems, and child welfare agencies.

The "21" represents the 21 days said to form new habits. The core mission: help parents recognize trauma responses, rewire unhealthy patterns, and parent from connection rather than fear — for free, accessible to every family regardless of income.`
      },
      {
        title: "The Core User",
        body: `Primary users are caregivers of children from hard places — foster parents, adoptive parents, kinship caregivers. Many are overwhelmed, triggered, and parenting children with trauma histories including FASD, RAD, attachment disorders, ACES, and behavioral dysregulation. Secondary users include child welfare professionals (caseworkers, CASA volunteers, therapists, attorneys) who use the platform to monitor assigned families.`
      },
      {
        title: "Core Feature Modules",
        body: `1. PARENTING COACH (AI Chat) — Personalized, trauma-informed AI coach. Pulls in child profiles, behavior logs, and check-in data to give context-aware guidance. Hard boundaries: no diagnosing, no legal advice, always refer to 988 in crisis.

2. DAILY CHECK-IN — Parents log child regulation (1-5) and their own calm (1-5) daily. This data feeds AI insights, therapist matching, and growth reports.

3. BEHAVIOR LOG — Logs behavioral incidents with triggers, responses, and outcomes. Powers trend analysis and court-ready reports.

4. CASE MANAGEMENT — Full case file system for school IEPs, court cases, medical cases. Includes tasks, notes, team contacts, document vault, and court-ready PDF exports.

5. SECURE DOCUMENT VAULT — Encrypted document storage with access code sharing. Parents can share specific docs with caseworkers without giving full account access.

6. CASE PLAN CHECKLIST — AI parses uploaded CPS/court documents and extracts actionable checklists. Parents track completion with proof uploads.

7. CO-PARENTING PORTAL — For parents sharing custody. Includes secure messaging, expense splitting, visitation tracking, tension analysis, court partnership management, and health scoring.

8. LIVE CLASSES — Instructor-led parenting classes with enrollment, waitlists, attendance, feedback, and reflections.

9. PROFESSIONAL DIRECTORY — Therapists, coaches, caseworkers listed with AI matching based on family data. Includes booking calendar and review system.

10. GROWTH INSIGHTS — AI-generated weekly reports summarizing regulation trends, behavior patterns, and personalized recommendations.

11. EMERGENCY TOOLBOX — Real-time crisis intervention guide for parents in the moment of child dysregulation. Step-by-step regulation techniques.

12. EDUCATION HUB — In-depth guides on FASD, RAD, attachment, ACEs, grief/loss, caregiver burnout, race & identity, aging out of foster care, child suicide prevention.`
      },
      {
        title: "Role System",
        body: `founder — Misty Stonerock (hardcoded email in initializeFounder function). Bypasses all feature locks. Full access to Founder Dashboard with platform analytics.
admin — Team members with admin access codes. Access to admin features.
user — Standard parent/caregiver accounts (default role).
professional — Child welfare professionals with assigned family access.

FeatureLockGate blocks all routes for non-founders until June 10, 2026 launch date.`
      },
      {
        title: "Tone & Voice Guidelines",
        body: `The platform voice is: warm, trauma-informed, non-judgmental, empowering, accessible. Never clinical or cold. Never shaming. Always assume the parent is doing their best. Language should be plain, direct, and compassionate. Avoid jargon unless explaining it.`
      },
      {
        title: "Key Architectural Decisions",
        body: `- All routes are mobile-first. The app is designed as a mobile web app (not native) but published as iOS/Android via Base44.
- Lazy loading used for all main routes to keep initial bundle small.
- Entity RLS (row-level security) is enforced — users only see their own data unless they are admin/professional.
- No passwords stored in app — all auth handled by Base44 platform.
- PDF generation done server-side in backend functions using jsPDF.
- AI calls routed through Base44's Core.InvokeLLM integration for cost control.
- Twilio used for SMS — emergency alerts and reminders.
- Stripe integrated for future premium subscriptions (currently waitlisted).`
      },
      {
        title: "What the LLM Should Know When Building Features",
        body: `1. Always check existing backend functions before creating new ones — many already exist.
2. Always wrap authenticated pages in base44.auth.isAuthenticated() check.
3. The C object from @/lib/rooted-constants contains the color palette — use it for inline styles.
4. MobileHeader is the standard page header — always use it.
5. The FeatureLockGate wraps most routes — new feature routes should also be wrapped.
6. When adding pages: update BOTH App.jsx (Route) AND hooks/useLazyLoadRoutes.js (lazy import).
7. Entity field names matter — always reference the entity JSON schema before writing code.
8. Keep components small and focused. Never build a 500-line page when it can be split.
9. SMS is available via Twilio. Email is available via Core.SendEmail. AI via Core.InvokeLLM.
10. The founder email is hardcoded in initializeFounder — do not expose it in frontend code.`
      }
    ]
  }
];

function DocSection({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: C.cream }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{section.title}</p>
        {open ? <ChevronUp size={14} color={C.mutedText} /> : <ChevronDown size={14} color={C.mutedText} />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#3a3028" }}>
            {section.body}
          </p>
        </div>
      )}
    </div>
  );
}

function DocCard({ doc }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${doc.color}33` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
        style={{ background: `${doc.color}11`, border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3">
          {doc.icon}
          <div>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{doc.label}</p>
            <p className="text-[10px]" style={{ color: C.mutedText }}>{doc.subtitle}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} color={C.mutedText} /> : <ChevronDown size={16} color={C.mutedText} />}
      </button>
      {open && (
        <div style={{ background: "#fff" }}>
          {doc.sections.map(section => (
            <DocSection key={section.title} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppDocs() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="📋 App Documentation"
        subtitle="Technical guides & LLM context"
        backTo="/founder-dashboard"
      />

      <div className="max-w-[680px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-1" style={{ color: C.cream }}>Rooted 21 — Complete Technical Reference</p>
          <p className="text-xs leading-relaxed" style={{ color: C.lightGreen }}>
            Three documents covering the frontend architecture, backend functions, and a full narrative context for AI agents building new features.
          </p>
        </div>

        {DOCS.map(doc => (
          <DocCard key={doc.id} doc={doc} />
        ))}

        <div className="rounded-xl p-3 text-center" style={{ background: C.cream }}>
          <p className="text-[10px]" style={{ color: C.mutedText }}>
            Last updated: May 2026 · Rooted 21 Parenting Network LLC
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
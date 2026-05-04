import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, ChevronDown, BookOpen, Users, Shield, Zap, BarChart2, MessageSquare } from "lucide-react";

const GUIDES = {
  parents: [
    {
      title: "Getting Started",
      icon: "🚀",
      content: `
        1. Create a child profile with basic info about your child's needs and strengths
        2. Take your first daily check-in to track emotional regulation
        3. Start with the first lesson in the HALO curriculum
        4. Set up your safety plan with emergency contacts and de-escalation strategies
      `,
    },
    {
      title: "Daily Check-In",
      icon: "📊",
      content: `
        Check in once daily (or more) to rate:
        • Your child's emotional regulation (1-5)
        • Your own calm level (1-5)
        • Optional: A reflection or note

        These ratings help you spot patterns and share progress with your care team.
      `,
    },
    {
      title: "Lessons (HALO Program)",
      icon: "📚",
      content: `
        The HALO program teaches trauma-informed parenting across 3 pillars:
        • Connection & Attachment (Lessons 1-7)
        • Behavior & De-escalation (Lessons 8-14)
        • Regulation & Healing (Lessons 15-21)

        Complete all 21 lessons to earn your certificate. Each lesson takes 10-15 minutes.
      `,
    },
    {
      title: "Behavior Logs",
      icon: "📝",
      content: `
        Record daily behaviors to track patterns:
        • What behavior occurred?
        • What triggered it?
        • How did you respond?
        • What was the outcome?
        • Child's mood at the time

        This data helps your professionals understand your child better.
      `,
    },
    {
      title: "Safety Plan",
      icon: "🛡️",
      content: `
        Create a crisis response plan:
        • Warning signs your child is dysregulating
        • De-escalation strategies that work
        • Safe locations to calm down
        • Calming activities your child enjoys
        • Emergency contacts with phone numbers

        Revisit quarterly or when things change.
      `,
    },
    {
      title: "My Support Team",
      icon: "👥",
      content: `
        Securely message with your assigned professionals:
        • Therapists
        • Caseworkers
        • School staff
        • Other professionals

        All messages are private and encrypted. Share updates, ask questions, or request guidance.
      `,
    },
    {
      title: "Co-Parent Portal",
      icon: "🤝",
      content: `
        If you're co-parenting:
        • Send court-supervised messages to your co-parent
        • Share behavior updates and routines
        • Collaborate on the co-parenting safety plan
        • Court staff monitors all messages

        Keep communication respectful and child-focused.
      `,
    },
    {
      title: "Household Routine",
      icon: "📅",
      content: `
        Create visual schedules for your home:
        • Morning routine
        • After-school routine
        • Bedtime routine
        • Weekend routine

        Each step shows emoji, duration, and color coding. Use these to help your child know what's next.
      `,
    },
  ],
  professionals: [
    {
      title: "Accessing Families",
      icon: "🔑",
      content: `
        Families will give you an access code. To redeem:
        1. Go to My Team page
        2. Tap "Enter Professional Access Code"
        3. Enter the 6-character code
        4. You'll now see the family's data

        You can revoke access anytime, and families can disconnect you.
      `,
    },
    {
      title: "Family Dashboard",
      icon: "👨‍👩‍👧",
      content: `
        Once linked, you can view:
        • Child profile
        • Daily check-in trends
        • Behavior logs with patterns
        • Lesson progress
        • Goals and milestones
        • Household routines
        • Safety plan

        All data is updated in real-time as families log information.
      `,
    },
    {
      title: "Secure Messaging",
      icon: "💬",
      content: `
        Send encrypted messages to families:
        • Ask follow-up questions
        • Provide guidance
        • Share resources
        • Celebrate progress

        Messages are threaded by professional-family pair and are private.
      `,
    },
    {
      title: "Case Notes",
      icon: "📄",
      content: `
        Document your observations:
        • Add professional notes after each interaction
        • Reference specific check-ins or behavior patterns
        • Track interventions and outcomes
        • Notes are visible to other assigned professionals

        Keep notes objective and focused on observable behaviors.
      `,
    },
    {
      title: "Recommendations",
      icon: "💡",
      content: `
        Based on family data, you can:
        • Suggest specific lessons to focus on
        • Recommend goals based on behavior patterns
        • Advise on de-escalation techniques
        • Flag concerning patterns for follow-up

        Share recommendations via secure message.
      `,
    },
  ],
  court_staff: [
    {
      title: "Court Dashboard",
      icon: "⚖️",
      content: `
        Manage co-parenting partnerships:
        • View all active cases
        • Track partnership status
        • Access partnership details
        • Generate reports

        Only court staff can access this dashboard.
      `,
    },
    {
      title: "Partnership Details",
      icon: "👨‍👩‍👧",
      content: `
        For each partnership, view:
        • Messages between co-parents
        • All behavior logs from both households
        • Household routines
        • Court appointments
        • Safety plan agreement status

        Use this to monitor compliance and family health.
      `,
    },
    {
      title: "Co-Parenting Messages",
      icon: "💬",
      content: `
        All messages between co-parents are monitored:
        • View full message history
        • See message topics (schedule, health, behavior, etc.)
        • Monitor for healthy communication
        • Send messages to parents when needed

        Messages are categorized by topic for easy review.
      `,
    },
    {
      title: "Court Appointments",
      icon: "📅",
      content: `
        Manage court-related events:
        1. Add new appointments (hearings, check-ins, mediations)
        2. Set date, time, location
        3. Optionally notify both parents
        4. Parents receive calendar notifications

        Appointments appear in both parents' family dashboards.
      `,
    },
    {
      title: "Safety Plan",
      icon: "🛡️",
      content: `
        Review co-authored safety plans:
        • Warning signs and triggers
        • De-escalation strategies both parents agreed to
        • Emergency contacts and safe locations
        • Calming activities for the child
        • Track parent agreement status

        Plans must be agreed to by both parents.
      `,
    },
    {
      title: "Generate Reports",
      icon: "📊",
      content: `
        Create comprehensive partnership reports:
        1. Select a partnership
        2. Choose date range
        3. Download HTML report with:
           - Message summary
           - Behavior analysis
           - Regulation trends
           - Routine adherence
           - Statistics

        Use for case documentation and court filings.
      `,
    },
  ],
};

function GuideSection({ title, icon, content, isOpen, onToggle }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 transition-all hover:opacity-90"
        style={{ background: isOpen ? C.cream : C.white, border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span className="text-base">{icon}</span>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
            {title}
          </p>
        </div>
        <ChevronDown
          size={16}
          color={C.mutedText}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
        />
      </button>

      {isOpen && (
        <div className="px-4 py-3 border-t" style={{ borderColor: C.cream }}>
          <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.darkText }}>
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const [role, setRole] = useState("parents");
  const [openSection, setOpenSection] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <BookOpen size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Help & Guide</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>How to use Rooted 21</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5">
        {/* Role selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: "parents", label: "For Parents", icon: Users },
            { id: "professionals", label: "For Professionals", icon: Zap },
            { id: "court_staff", label: "For Court Staff", icon: Shield },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  setOpenSection(0);
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  background: role === r.id ? C.darkGreen : C.cream,
                  color: role === r.id ? C.cream : C.darkGreen,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={13} />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Guide sections */}
        <div className="space-y-2">
          {GUIDES[role].map((section, i) => (
            <GuideSection
              key={i}
              title={section.title}
              icon={section.icon}
              content={section.content}
              isOpen={openSection === i}
              onToggle={() => setOpenSection(openSection === i ? -1 : i)}
            />
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-8 space-y-2">
          <p className="text-xs font-bold" style={{ color: C.mutedText }}>QUICK LINKS</p>
          <Link
            to="/legal"
            className="block rounded-lg px-4 py-3 text-xs font-bold transition-all hover:shadow-sm"
            style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none", color: C.darkGreen }}
          >
            📋 Legal Documents & Consent
          </Link>
          <Link
            to="/resources"
            className="block rounded-lg px-4 py-3 text-xs font-bold transition-all hover:shadow-sm"
            style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none", color: C.darkGreen }}
          >
            📚 Resource Library
          </Link>
        </div>

        {/* Crisis banner */}
        <div className="rounded-lg p-3 mt-6 flex gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <span style={{ fontSize: "16px" }}>⚠️</span>
          <p className="text-[10px]" style={{ color: "#B84C2A" }}>
            <strong>In crisis?</strong> Call or text <strong>988</strong> anytime. In danger, call <strong>911</strong>.
          </p>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
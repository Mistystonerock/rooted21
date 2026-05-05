import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    emoji: "🌳",
    title: "What is Rooted 21?",
    color: C.darkGreen,
    content: `Rooted 21 is a parenting support community built to help parents, families, and communities thrive together. Whether you're navigating tough moments at home, building stronger connections with your children, or looking for support from others who get it — you're in the right place.

Our mission is simple: help parents feel seen, supported, and equipped — and strengthen the communities around every child.`,
  },
  {
    emoji: "🧠",
    title: "Parenting Support Chat",
    color: C.midGreen,
    content: `The AI-powered chat gives you immediate, compassionate guidance when you're in a hard parenting moment. Describe what's happening — meltdown, behavior challenge, defiance, fear — and get practical scripts and strategies you can use right now.

You can start a new conversation anytime or browse your past sessions. The chat is powered by advanced AI with a system built specifically for parenting support.`,
    link: "/chat",
    linkLabel: "Open Chat →",
  },
  {
    emoji: "📚",
    title: "21-Lesson Curriculum",
    color: C.brown,
    content: `The Lessons section contains the complete Rooted 21 parenting curriculum — 21 structured lessons organized into 3 weeks. Each lesson includes:

• A video or reading topic
• Key parenting principles explained simply
• A reflection worksheet question
• Quizzes to reinforce learning
• Activities to practice with your child

Progress is tracked automatically and you can earn a completion certificate when all 21 lessons are done.`,
    link: "/lessons",
    linkLabel: "Go to Lessons →",
  },
  {
    emoji: "🎯",
    title: "Goals & Progress",
    color: C.gold,
    content: `Set meaningful parenting goals and track your progress over time. Goals can be tied to connection-building, behavior patterns, or personal growth areas.

The Progress dashboard shows your regulation trends (child and parent calm scores), lesson completion, behavior log patterns, and more — all visualized in easy-to-read charts.`,
    link: "/goals",
    linkLabel: "See Goals →",
  },
  {
    emoji: "📅",
    title: "Daily Check-In",
    color: C.midGreen,
    content: `Each day, log two simple scores:
• Child regulation (1–5): How emotionally regulated was your child today?
• Your calm level (1–5): How calm and regulated were you as a parent?

Over time, this builds a powerful picture of trends, triggers, and progress. You can use your check-in data to generate a Monthly Report PDF to share with your care team or support network.`,
    link: "/daily-checkin",
    linkLabel: "Daily Check-In →",
  },
  {
    emoji: "✅",
    title: "Weekly Habits Tracker",
    color: C.darkGreen,
    content: `Seven daily parenting habits to check off each day — things like "Regulate myself first," "Connection before correction," and "Checked HALT signals."

Track your streak, view a 30-day habit calendar, and generate a personalized AI Growth Insight that analyzes your habit data and journal reflections to give you a coaching-style summary for the week.`,
    link: "/weekly-habits",
    linkLabel: "Weekly Habits →",
  },
  {
    emoji: "📓",
    title: "Reflection Journal",
    color: C.brown,
    content: `A private daily journal with structured prompts designed for trauma-informed parenting growth:

• Regulation Reflection — How did you manage your own emotions?
• Wins of the Day — What went well?
• Gratitude — What are you thankful for?
• What I Learned — Insights and growth areas

Entries are private to you. You can also view your Lesson Reflections — answers to worksheet questions from each curriculum lesson.`,
    link: "/journal",
    linkLabel: "Open Journal →",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Family Dashboard & Calendar",
    color: C.midGreen,
    content: `A shared family hub where you and your professional support team can coordinate. Features include:

• Family calendar — Add appointments, court dates, therapy sessions, and school events
• Messaging inbox — Secure messages with your assigned professionals
• Event notifications — Professionals can add events directly to your calendar`,
    link: "/family-dashboard",
    linkLabel: "Family Dashboard →",
  },
  {
    emoji: "👥",
    title: "My Support Team",
    color: C.darkGreen,
    content: `Connect with the professionals assigned to your family. Share secure messages, coordinate care, and keep everyone on the same page.

Professionals can be invited via an Access Code (you enter theirs) or an Invitation Code (you generate one to share with them). Once connected, they can see relevant progress data and communicate with you through the secure messaging system.`,
    link: "/my-team",
    linkLabel: "My Team →",
  },
  {
    emoji: "🔍",
    title: "Professional Directory",
    color: C.midGreen,
    content: `Browse verified therapists, parenting coaches, caseworkers, counselors, and community advocates.

Each card shows their specialty, rating, experience, and available services (virtual, insurance, sliding scale). You can:
• 📅 Book a consultation slot directly (picks a date + time, sends email confirmation to both parties)
• ✉️ Send a consultation request with a message
• ⭐ Leave a rating and review after your session

You can also search 13 national referral directories filtered by your ZIP code.`,
    link: "/professional-directory",
    linkLabel: "Find a Professional →",
  },
  {
    emoji: "🛡️",
    title: "Safety Plan",
    color: "#B84C2A",
    content: `Build a personalized crisis safety plan for your child. The plan includes:

• Warning signs — Observable signs your child is dysregulating
• Emergency contacts — Who to call and when
• Safe locations — Places your child can go during a crisis
• Calming activities — Specific strategies that help your child regulate
• Crisis resources — Hotlines and emergency services

The plan can be printed or shared with your care team.`,
    link: "/safety-plan",
    linkLabel: "Safety Plan →",
  },
  {
    emoji: "📊",
    title: "Behavior Logs & Analytics",
    color: C.gold,
    content: `Log specific behavior incidents with details about what happened, what triggered it, how you responded, and how it resolved. Over time, patterns emerge that help you and your care team understand your child's needs better.

The Analytics dashboard transforms all your data — check-ins, behavior logs, lessons, goals — into visual trend reports with AI-generated insights.`,
    link: "/behavior-logs",
    linkLabel: "Behavior Logs →",
  },
  {
    emoji: "🏡",
    title: "Household Routine & Schedule Builder",
    color: C.midGreen,
    content: `Build visual daily schedules for your household — morning routines, after-school routines, bedtime routines, and more. Drag and drop task blocks, set durations, add emojis and colors, and create a consistent, predictable structure that helps children from hard places feel safe.`,
    link: "/household-routine",
    linkLabel: "Routine Builder →",
  },
  {
    emoji: "⚖️",
    title: "Co-Parent Portal",
    color: C.brown,
    content: `For families in court-supervised co-parenting arrangements. The portal provides:

• Court-supervised messaging between both parents (court staff can view messages)
• A shared co-parenting safety plan for crisis moments
• A log of court appointments and important dates
• Access to co-parenting educational resources

Court staff have their own dashboard to manage partnerships, review messages, schedule appointments, and generate reports.`,
    link: "/co-parent-portal",
    linkLabel: "Co-Parent Portal →",
  },
  {
    emoji: "🤝",
    title: "Respite Care Directory",
    color: "#B84C2A",
    content: `Find vetted respite care providers in your area. Browse by specialty, read bios and ratings, and connect directly. Respite care gives parents critical time to rest and recharge — which is essential for sustainable, healthy parenting.`,
    link: "/respite-care",
    linkLabel: "Respite Care →",
  },
  {
    emoji: "📖",
    title: "Resource Library",
    color: C.darkGreen,
    content: `A curated library of 30+ mental health resources organized by topic:

• Trauma Basics · Sensory Regulation · Attachment
• Self-Care for Caregivers · Behavior Tools · Grief & Loss
• Navigating Child Welfare Systems · Recommended Books

Filter by category or resource type (article, PDF, video, podcast, book). Also includes fillable digital worksheets and a local resource finder for crisis lines near you.`,
    link: "/resource-library",
    linkLabel: "Resource Library →",
  },
  {
    emoji: "🏅",
    title: "Milestones & Badges",
    color: C.gold,
    content: `Earn badges as you make progress through the Rooted 21 program. Badges are awarded for completing lessons, maintaining check-in streaks, finishing the curriculum, and more.

Milestones celebrate your growth and give you visible proof of the hard work you're doing as a parent.`,
    link: "/milestones",
    linkLabel: "My Milestones →",
  },
  {
    emoji: "📄",
    title: "Monthly Report",
    color: C.brown,
    content: `Generate a PDF summary of your month's activity — regulation trends, completed lessons, goal progress, and check-in data. The report is formatted to share with your care team, family, or support network.`,
    link: "/monthly-report",
    linkLabel: "Monthly Report →",
  },
  {
    emoji: "🏫",
    title: "School Support Tools",
    color: "#5B8DB8",
    content: `Navigating school can be one of the hardest parts of parenting a child from a hard place. Rooted 21 provides tools to help you show up prepared and confident:

• Guidance for handling behaviors in the classroom — supportive strategies you can share with teachers and school staff
• Tools to prepare for IEP and behavior meetings — know your rights, what to bring, and how to advocate for your child
• Ways for teachers and parents to stay aligned instead of working against each other — scripts, talking points, and frameworks for productive school partnerships`,
  },
  {
    emoji: "🎓",
    title: "Live Parenting Classes",
    color: C.darkGreen,
    content: `Rooted 21 offers live, virtual 6-week parenting classes taught by a certified facilitator. Classes are held weekly via Teams or Zoom and are open to all parents and caregivers in the community.\n\n**Current class offerings:**\n• Parenting for Positive Self Worth (PPSW)\n• Making Sense of Your Worth Training (MSOYW)\n\n**What to expect:**\n- 6 weekly live sessions per course\n- Facilitated group learning — come ready to participate\n- No curriculum materials or handouts distributed\n- Certificate of completion available upon finishing all 6 sessions\n\n**How to join:**\nVisit the Live Classes page to see the current schedule and grab the Teams or Zoom link when available. Classes are posted as soon as they are scheduled.`,
    link: "/live-classes",
    linkLabel: "View Live Classes →",
  },
  {
    emoji: "📞",
    title: "Crisis Resources",
    color: "#B84C2A",
    content: `Crisis support is woven throughout the app. The Local Resource Finder lets you find mental health crisis lines, support centers, and emergency resources near you using your device location.

Key national numbers:
• 988 — Suicide & Crisis Lifeline (call or text, 24/7)
• 911 — Immediate danger
• 1-855-427-2736 — National Parent Helpline
• Text HOME to 741741 — Crisis Text Line`,
    link: "/local-resources",
    linkLabel: "Find Local Resources →",
  },
];

function GuideSection({ section, isOpen, onToggle }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${C.cream}` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ background: isOpen ? C.darkGreen : "#fff", border: "none", cursor: "pointer" }}
      >
        <span className="text-xl flex-shrink-0">{section.emoji}</span>
        <p className="flex-1 font-bold text-sm" style={{ color: isOpen ? C.cream : C.darkGreen }}>
          {section.title}
        </p>
        {isOpen
          ? <ChevronUp size={16} color={C.lightGreen} />
          : <ChevronDown size={16} color={C.mutedText} />}
      </button>

      {isOpen && (
        <div className="px-4 py-4 space-y-3" style={{ background: "#fff" }}>
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#3a3028" }}>
            {section.content}
          </p>
          {section.link && (
            <Link
              to={section.link}
              className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-lg"
              style={{ background: section.color, color: "#fff", textDecoration: "none" }}
            >
              {section.linkLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function AppGuide() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="App Guide"
        subtitle="Everything Rooted 21 can do for you"
        backTo="/dashboard"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-3">
        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🌳</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Welcome to Rooted 21
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            A complete parenting support community — built for every family that just needs a little more help.
            Tap any section below to learn what it does.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <GuideSection
            key={i}
            section={section}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}

        {/* Crisis footer */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>
            In crisis? Call or text <strong>988</strong>. In immediate danger, call <strong>911</strong>.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
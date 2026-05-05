import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

const GUIDES = [
  {
    title: "IEP Meeting Preparation & Navigation",
    emoji: "🏫",
    color: "#5B8DB8",
    steps: [
      "Review your child's current IEP and recent test results",
      "Document specific concerns, behaviors, and academic struggles",
      "List desired accommodations and services (small group, extended time, etc.)",
      "Bring a support person (advocate, therapist, or trusted friend)",
      "Request a copy of the IEP in writing after the meeting",
      "Timeline: Follow up within 10 school days with written feedback",
    ]
  },
  {
    title: "Court Hearing Preparation",
    emoji: "⚖️",
    color: C.brown,
    steps: [
      "Understand the type of hearing (custody, dependency, protective order)",
      "Gather all relevant documents (receipts, photos, written communications)",
      "Organize your timeline of events with dates",
      "Practice your testimony — stay calm, answer only what's asked",
      "Dress professionally and arrive 15 minutes early",
      "If you disagree with a ruling, ask about appeal options",
    ]
  },
  {
    title: "Medical Appointment Advocacy",
    emoji: "🏥",
    color: C.midGreen,
    steps: [
      "Write down symptoms, concerns, and medications before the appointment",
      "Bring your child's complete medical history",
      "Take notes during the appointment (ask the provider's permission)",
      "Ask for diagnoses and treatment plans in writing",
      "Request a copy of medical records before leaving",
      "Request a follow-up appointment if needed, and get it in writing",
    ]
  },
  {
    title: "Working with CPS or Child Welfare",
    emoji: "🛡️",
    color: "#B84C2A",
    steps: [
      "You have the right to have an attorney present during interviews",
      "You can ask for a copy of any report written about your family",
      "Keep a record of all communications with caseworkers (dates, times, topics)",
      "Request services in writing, and keep a copy for your records",
      "Know your right to family preservation services and reunification plans",
      "Ask for an independent evaluation of your home if you disagree with findings",
    ]
  },
  {
    title: "School Discipline & Due Process",
    emoji: "📋",
    color: C.darkGreen,
    steps: [
      "Request written notice of disciplinary charges and evidence against your child",
      "Ask for a hearing before suspension or expulsion (your right to due process)",
      "Bring evidence of your child's disability if relevant to the behavior",
      "Request the school's discipline data to show possible bias or disparities",
      "Document all communications with school staff",
      "Consider requesting a manifestation determination review if your child has an IEP",
    ]
  },
  {
    title: "504 Plan vs. IEP: Which Do You Need?",
    emoji: "📑",
    color: C.gold,
    steps: [
      "504 Plan: For students with disabilities who don't need special ed",
      "IEP: For students who need specialized instruction and accommodations",
      "You can have both a 504 plan and an IEP",
      "Start with a written request to your school for evaluation",
      "If denied, you can request a due process hearing",
      "Review and update plans every year (you have the right to request meetings)",
    ]
  },
];

export default function SystemGuides() {
  const [expandedIdx, setExpandedIdx] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="System Navigation Guides" subtitle="How-to guides for key situations" backTo="/case-management" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🗺️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Navigate Key Systems
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Step-by-step guides for schools, courts, hospitals, and child welfare
          </p>
        </div>

        {/* Guides */}
        <div className="space-y-3">
          {GUIDES.map((guide, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="w-full flex items-center gap-3 px-4 py-3"
                style={{ background: expandedIdx === idx ? guide.color : C.white, border: "none", cursor: "pointer" }}
              >
                <span className="text-lg">{guide.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm" style={{ color: expandedIdx === idx ? "#fff" : C.darkGreen }}>
                    {guide.title}
                  </p>
                </div>
                {expandedIdx === idx
                  ? <ChevronUp size={16} color="#fff" />
                  : <ChevronDown size={16} color={C.mutedText} />}
              </button>

              {expandedIdx === idx && (
                <div className="px-4 py-4 space-y-3" style={{ background: C.white }}>
                  {guide.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                        style={{ background: guide.color, color: "#fff" }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#3a3028", paddingTop: "2px" }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
            Need more help? Talk to our Meeting Prep Assistant.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
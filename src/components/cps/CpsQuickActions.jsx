import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const ACTIONS = [
  { to: "/case-plan-checklist", icon: ClipboardCheck, title: "Case-plan checklist", description: "Track services, tasks, proof, and next steps." },
  { to: "/visitation-tracker", icon: ShieldCheck, title: "Visitation log", description: "Document visits, cancellations, observations, and patterns." },
  { to: "/legal-calendar", icon: FileText, title: "Court + deadline calendar", description: "Keep hearings, reviews, and document dates together." },
  { to: "/court-report-generator", icon: FileText, title: "Court-ready report", description: "Summarize progress and supporting documentation." },
  { to: "/certified-legal-export", icon: FileText, title: "Certified legal export", description: "Create tamper-evident thread and document packets for attorney, GAL/CASA, or court review." },
  { to: "/reunification-tracker", icon: ShieldCheck, title: "Reunification milestones", description: "Track progress toward safe return and permanency." },
  { to: "/support-chat", icon: MessageSquare, title: "Ask a mentor", description: "Get support preparing questions for CPS, court, or meetings." },
];

export default function CpsQuickActions() {
  return (
    <section className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="mb-3 text-sm font-black" style={{ color: C.darkGreen }}>What do you need to do next?</p>
      <div className="grid gap-3">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to} className="rounded-2xl p-3.5 no-underline" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.white }}><Icon size={16} color={C.midGreen} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black" style={{ color: C.darkGreen }}>{action.title}</span>
                  <span className="block text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{action.description}</span>
                </span>
                <ArrowRight size={14} color={C.gold} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
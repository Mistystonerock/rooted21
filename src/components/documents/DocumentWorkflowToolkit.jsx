import { Link } from "react-router-dom";
import { CalendarClock, CheckSquare, FileSignature, FileText, PenLine } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const TOOLS = [
  {
    title: "Guided form filling",
    description: "Answer plain-language questions and get help preparing paperwork.",
    to: "/form-helper",
    icon: FileText,
  },
  {
    title: "E-sign consent forms",
    description: "Prepare release forms and signature-ready consent documents.",
    to: "/consent-forms",
    icon: FileSignature,
  },
  {
    title: "Court task checklist",
    description: "Track next steps, missing documents, and case-plan items.",
    to: "/case-plan-checklist",
    icon: CheckSquare,
  },
  {
    title: "Deadline reminders",
    description: "Add court dates, appointments, and important due dates.",
    to: "/legal-calendar",
    icon: CalendarClock,
  },
];

export default function DocumentWorkflowToolkit() {
  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
          <PenLine size={20} color={C.midGreen} />
        </div>
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Document Workflow Tools</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Fill forms, collect signatures, track tasks, and remember court deadlines.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <Link key={tool.to} to={tool.to} className="rounded-2xl p-3 no-underline" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <div className="flex items-start gap-2.5">
                <Icon size={17} color={C.gold} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black" style={{ color: C.darkGreen }}>{tool.title}</p>
                  <p className="mt-1 text-[10px] leading-snug" style={{ color: C.mutedText }}>{tool.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
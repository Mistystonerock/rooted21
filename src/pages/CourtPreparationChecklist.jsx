import { Link } from "react-router-dom";
import { ChevronLeft, Printer, CheckCircle2 } from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const CREAM = "#f5ede2";
const BORDER = "rgba(120,85,60,0.2)";
const GREEN = "#6b9d6e";
const GOLD = "#a67c52";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";

const SECTIONS = [
  {
    title: "Documents to bring",
    items: [
      "Court notice, case number, and hearing date",
      "Case plan or reunification plan",
      "Visitation logs, medication notes, behavior logs, and appointment records",
      "School records, IEP/504 documents, progress reports, and attendance records",
      "Receipts, messages, photos, or written proof related to the child’s care",
    ],
  },
  {
    title: "Questions to prepare",
    items: [
      "What is the goal of today’s hearing?",
      "What tasks or services are required before the next date?",
      "Who is responsible for each next step?",
      "What documentation should I keep from now until the next hearing?",
      "Who should I contact if something changes before court?",
    ],
  },
  {
    title: "Support plan",
    items: [
      "Confirm transportation, childcare, and arrival time",
      "Bring a calm support person if allowed",
      "Write down your top 3 concerns before entering court",
      "Keep answers short, factual, and child-focused",
      "Ask for clarification before agreeing to anything you do not understand",
    ],
  },
  {
    title: "After court",
    items: [
      "Write down the judge’s orders and next court date",
      "Save all paperwork in your secure documents",
      "Add deadlines and appointments to your calendar",
      "Send updates to your support team or attorney",
      "Start tracking proof for any new requirements immediately",
    ],
  },
];

export default function CourtPreparationChecklist() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "var(--font-sans)" }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10 print:hidden" style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <Link to="/resource-library" aria-label="Back to resources" className="rounded-xl flex items-center justify-center" style={{ width: 44, height: 44, background: CREAM }}>
          <ChevronLeft size={20} color={TEXT} />
        </Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-base" style={{ color: TEXT }}>Court Preparation Checklist</p>
          <p className="text-[11px]" style={{ color: MUTED }}>Rooted 21 printable court prep</p>
        </div>
        <button onClick={() => window.print()} className="rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1.5" style={{ background: GREEN, color: "#ffffff", border: "none" }}>
          <Printer size={13} /> Print
        </button>
      </div>

      <main className="max-w-[720px] mx-auto px-4 py-5 space-y-4">
        <section className="rounded-3xl p-5" style={{ background: CARD, border: `1.5px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: GREEN }}>Rooted 21 Program</p>
          <h1 className="font-serif font-black text-3xl leading-tight mb-3" style={{ color: TEXT }}>Court Preparation Checklist for Families</h1>
          <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
            Use this before every hearing to organize documents, questions, supports, and next steps. This is not legal advice; it is a planning tool to help you stay prepared and child-focused.
          </p>
        </section>

        {SECTIONS.map(section => (
          <section key={section.title} className="rounded-2xl p-4" style={{ background: CARD, border: `1.5px solid ${BORDER}` }}>
            <h2 className="font-serif font-bold text-lg mb-3" style={{ color: TEXT }}>{section.title}</h2>
            <div className="space-y-2">
              {section.items.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} color={GOLD} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed" style={{ color: TEXT }}>{item}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
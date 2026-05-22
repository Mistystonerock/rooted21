import ReactMarkdown from "react-markdown";
import { C } from "@/lib/rooted-constants";
import { Copy, Printer } from "lucide-react";

export default function BriefingResult({ briefing, evidenceCount, documentCount }) {
  if (!briefing) return null;

  const copyDraft = () => navigator.clipboard?.writeText(briefing.draft_markdown || "");

  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>{briefing.briefing_type}</p>
          <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>{briefing.title}</h2>
          <p className="mt-1 text-xs" style={{ color: C.mutedText }}>{evidenceCount} evidence items · {documentCount} court/document records reviewed</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={copyDraft} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}><Copy size={14} className="mr-1" /> Copy</button>
          <button type="button" onClick={() => window.print()} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}><Printer size={14} className="mr-1" /> Print</button>
        </div>
      </div>

      <div className="prose prose-sm mt-4 max-w-none rounded-2xl p-4" style={{ background: C.offWhite, color: C.darkText }}>
        <ReactMarkdown>{briefing.draft_markdown}</ReactMarkdown>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoList title="Exhibit cross-references" items={briefing.exhibit_cross_references} />
        <InfoList title="Document cross-references" items={briefing.document_cross_references} />
        <InfoList title="Questions to verify" items={briefing.questions_to_verify} />
        <InfoList title="Filing readiness notes" items={briefing.filing_readiness_notes} />
      </div>
    </section>
  );
}

function InfoList({ title, items = [] }) {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: C.cream }}>
      <p className="mb-2 text-xs font-black" style={{ color: C.darkGreen }}>{title}</p>
      {items.length ? <ul className="space-y-1 text-xs leading-5" style={{ color: C.darkText }}>{items.map(item => <li key={item}>• {item}</li>)}</ul> : <p className="text-xs" style={{ color: C.mutedText }}>None listed.</p>}
    </div>
  );
}
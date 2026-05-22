import { Link } from "react-router-dom";
import { CalendarDays, FileText, Gavel } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CourtVaultMetadataPanel({ documents = [] }) {
  if (!documents.length) return null;

  return (
    <section className="space-y-3 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: C.offWhite }}><Gavel size={20} color={C.darkGreen} /></div>
        <div>
          <p className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>Auto-filled from Document Vault</p>
          <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Scanned court documents with extracted court dates, case numbers, and judge information appear here.</p>
        </div>
      </div>

      {documents.slice(0, 5).map(doc => (
        <article key={doc.id} className="rounded-2xl border p-3" style={{ background: C.offWhite, borderColor: C.cream }}>
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>{doc.title}</p>
          <div className="mt-2 grid gap-1 text-xs" style={{ color: C.darkText }}>
            {doc.court_case_number && <p><strong>Case #:</strong> {doc.court_case_number}</p>}
            {doc.judge_name && <p><strong>Judge/Magistrate:</strong> {doc.judge_name}</p>}
            {doc.court_name && <p><strong>Court:</strong> {doc.court_name}</p>}
            {doc.hearing_type && <p><strong>Hearing:</strong> {doc.hearing_type}</p>}
          </div>
          {doc.extracted_court_dates?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.extracted_court_dates.slice(0, 4).map((item, index) => (
                <span key={`${item.date}-${index}`} className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: C.cream, color: C.darkGreen }}>
                  <CalendarDays size={11} className="mr-1" /> {item.date}{item.time ? ` · ${item.time}` : ""}
                </span>
              ))}
            </div>
          )}
        </article>
      ))}

      <div className="flex flex-wrap gap-2">
        <Link to="/documents" className="rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.darkGreen, color: C.cream }}><FileText size={13} className="mr-1" /> Open Document Vault</Link>
        <Link to="/care-calendar" className="rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: C.cream, color: C.darkGreen }}>View Care Calendar</Link>
      </div>
    </section>
  );
}
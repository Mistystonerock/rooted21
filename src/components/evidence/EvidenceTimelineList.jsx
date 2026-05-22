import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Download, FileText, Trash2 } from "lucide-react";

export default function EvidenceTimelineList({ items, courtDocuments, onDelete }) {
  const docsById = Object.fromEntries(courtDocuments.map(doc => [doc.id, doc]));

  async function openEvidence(item) {
    if (!item.private_file_uri) return;
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: item.private_file_uri, expires_in: 300 });
    window.open(signed_url, "_blank", "noopener,noreferrer");
  }

  if (!items.length) {
    return <section className="rounded-3xl border bg-white p-8 text-center shadow-sm" style={{ borderColor: C.cream }}><p className="text-sm font-bold" style={{ color: C.darkGreen }}>No timeline evidence yet</p><p className="mt-1 text-xs" style={{ color: C.mutedText }}>Add your first evidence item above.</p></section>;
  }

  return (
    <section className="space-y-3">
      {items.map((item, index) => {
        const linkedDocs = (item.related_document_ids || []).map(id => docsById[id]).filter(Boolean);
        return (
          <article key={item.id} className="relative rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
            <div className="absolute -left-1 top-5 h-4 w-4 rounded-full" style={{ background: C.gold }} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Exhibit {index + 1} · {item.event_date}{item.event_time ? ` at ${item.event_time}` : ""}</p>
                <h3 className="mt-1 font-serif text-lg font-black" style={{ color: C.darkGreen }}>{item.title}</h3>
              </div>
              <button type="button" onClick={() => onDelete(item.id)} className="rounded-xl p-2" style={{ background: C.offWhite, color: "#9a3412", border: `1px solid ${C.cream}` }} aria-label="Delete evidence"><Trash2 size={15} /></button>
            </div>

            <p className="mt-3 text-sm leading-6" style={{ color: C.darkText }}>{item.summary}</p>
            {item.message_text && <p className="mt-3 rounded-2xl p-3 text-xs leading-5" style={{ background: C.offWhite, color: C.darkText }}>{item.message_text}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>{item.evidence_type}</span>
              {(item.case_categories || []).map(category => <span key={category} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#F0F7F2", color: C.darkGreen }}>{category}</span>)}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {item.private_file_uri && <button type="button" onClick={() => openEvidence(item)} className="rounded-xl px-3 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}><Download size={14} className="mr-1" /> Open evidence</button>}
              {linkedDocs.map(doc => <div key={doc.id} className="rounded-xl p-2 text-xs" style={{ background: C.offWhite, color: C.darkGreen }}><FileText size={13} className="mr-1 inline" /> Cross-ref: {doc.title}</div>)}
            </div>
          </article>
        );
      })}
    </section>
  );
}
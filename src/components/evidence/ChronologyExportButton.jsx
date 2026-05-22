import { jsPDF } from "jspdf";
import { C } from "@/lib/rooted-constants";
import { FileDown } from "lucide-react";

function wrap(doc, text, x, y, width, lineHeight = 6) {
  const lines = doc.splitTextToSize(text || "", width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export default function ChronologyExportButton({ items, courtDocuments }) {
  function exportPdf() {
    const doc = new jsPDF();
    const docsById = Object.fromEntries(courtDocuments.map(item => [item.id, item]));
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Chronology Exhibit", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y = wrap(doc, "Prepared from Rooted 21 Evidence Timeline. Verify all documents, filing requirements, admissibility rules, and exhibit formatting with the court clerk, attorney, legal aid, or official court website before filing.", 14, y, 180, 5);
    y += 4;

    items.forEach((item, index) => {
      if (y > 260) {
        doc.addPage();
        y = 18;
      }
      const linkedDocs = (item.related_document_ids || []).map(id => docsById[id]).filter(Boolean);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Exhibit ${index + 1}: ${item.title}`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Date: ${item.event_date}${item.event_time ? ` · Time: ${item.event_time}` : ""} · Type: ${item.evidence_type}`, 14, y);
      y += 5;
      doc.text(`Categories: ${(item.case_categories || []).join(", ") || "None"}`, 14, y);
      y += 5;
      y = wrap(doc, `Summary: ${item.summary || ""}`, 14, y, 180, 5);
      if (item.message_text) y = wrap(doc, `Message/Text: ${item.message_text}`, 14, y + 1, 180, 5);
      if (item.file_name) {
        doc.text(`Evidence file: ${item.file_name}`, 14, y + 1);
        y += 6;
      }
      if (linkedDocs.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Cross-referenced court documents:", 14, y + 1);
        y += 6;
        doc.setFont("helvetica", "normal");
        linkedDocs.forEach(ref => {
          y = wrap(doc, `• ${ref.title}${ref.category ? ` (${ref.category})` : ""}${ref.court_case_number ? ` · Case ${ref.court_case_number}` : ""}`, 18, y, 172, 5);
        });
      }
      y += 7;
    });

    doc.save(`chronology-exhibit-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <button type="button" onClick={exportPdf} disabled={!items.length} className="w-full rounded-2xl px-4 py-3 text-sm font-black" style={{ background: items.length ? C.darkGreen : C.cream, color: C.cream, border: "none" }}>
      <FileDown size={16} className="mr-2" /> Export Chronology Exhibit PDF
    </button>
  );
}
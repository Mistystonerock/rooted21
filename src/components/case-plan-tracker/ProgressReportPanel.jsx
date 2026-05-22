import { jsPDF } from "jspdf";
import { C } from "@/lib/rooted-constants";
import { FileDown } from "lucide-react";

function pct(requirements, status) {
  if (!requirements.length) return 0;
  return Math.round((requirements.filter(item => item.status === status).length / requirements.length) * 100);
}

function wrap(doc, text, x, y, width) {
  const lines = doc.splitTextToSize(text || "", width);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}

export default function ProgressReportPanel({ requirements, evidenceItems }) {
  const completed = pct(requirements, "completed");
  const inProgress = pct(requirements, "in_progress");
  const evidenceLinked = requirements.filter(item => item.evidence_item_ids?.length).length;
  const evidenceById = Object.fromEntries(evidenceItems.map(item => [item.id, item]));

  function exportReport() {
    const doc = new jsPDF();
    let y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Progress vs. Requirements Report", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y = wrap(doc, "This report helps visualize how current caregiver actions align with CPS or court case plan requirements. Review with your attorney, legal aid, caseworker, or court before filing or sharing.", 14, y, 180);
    y += 5;
    doc.text(`Requirements: ${requirements.length} · Completed: ${completed}% · In Progress: ${inProgress}% · Evidence linked: ${evidenceLinked}`, 14, y);
    y += 8;

    requirements.forEach((item, index) => {
      if (y > 260) { doc.addPage(); y = 18; }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${item.title}`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Status: ${item.status?.replaceAll("_", " ")} · Category: ${item.category?.replaceAll("_", " ") || "other"}${item.due_date ? ` · Due: ${item.due_date}` : ""}`, 14, y);
      y += 5;
      if (item.legal_source) { y = wrap(doc, `Requirement source: ${item.legal_source}`, 14, y, 180); }
      if (item.description) { y = wrap(doc, `Requirement: ${item.description}`, 14, y, 180); }
      if (item.progress_notes) { y = wrap(doc, `Progress notes: ${item.progress_notes}`, 14, y, 180); }
      const linked = (item.evidence_item_ids || []).map(id => evidenceById[id]).filter(Boolean);
      if (linked.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Attached evidence:", 14, y + 1);
        y += 6;
        doc.setFont("helvetica", "normal");
        linked.forEach(evidence => { y = wrap(doc, `• ${evidence.event_date}: ${evidence.title} (${(evidence.case_categories || []).join(", ") || evidence.evidence_type})`, 18, y, 172); });
      }
      y += 7;
    });

    doc.save(`progress-vs-requirements-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Progress vs. Requirements</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="Completed" value={`${completed}%`} />
        <Metric label="In progress" value={`${inProgress}%`} />
        <Metric label="Evidence linked" value={`${evidenceLinked}/${requirements.length || 0}`} />
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: C.offWhite }}>
        <div className="h-full" style={{ width: `${completed}%`, background: C.darkGreen }} />
      </div>
      <button type="button" onClick={exportReport} disabled={!requirements.length} className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black" style={{ background: requirements.length ? C.darkGreen : C.cream, color: C.cream, border: "none" }}><FileDown size={16} className="mr-2" /> Export Progress Report PDF</button>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-2xl p-3" style={{ background: C.offWhite }}><p className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>{value}</p><p className="text-[10px] font-bold uppercase" style={{ color: C.mutedText }}>{label}</p></div>;
}
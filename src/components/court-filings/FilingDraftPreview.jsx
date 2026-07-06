import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { ClipboardList, Download, FileSignature } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import SignaturePad from "@/components/legal/SignaturePad";

export default function FilingDraftPreview({ draft, includeDeclaration, signature, setSignature, agreed, setAgreed, onSign, signing, onBackToReview }) {
  function downloadPdf() {
    const doc = new jsPDF();
    const margin = 18;
    const maxWidth = 174;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(draft.title || "Court-ready document", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(draft.draft_markdown || "", maxWidth);
    lines.forEach(line => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    if (signature) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Signature", margin, y + 8);
      doc.addImage(signature, "PNG", margin, y + 12, 70, 25);
    }

    doc.save(`${(draft.title || "court-document").replace(/[^a-z0-9]+/gi, "-")}.pdf`);
  }

  if (!draft) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
        <ClipboardList size={32} color={C.gold} className="mx-auto mb-3" />
        <p className="font-serif font-bold" style={{ color: C.darkGreen }}>No filing drafted yet</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Generate a draft to preview and sign the official document.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
      <div className="p-4 flex items-center justify-between" style={{ background: C.darkGreen }}>
        <div>
          <p className="font-serif font-bold text-base" style={{ color: "#fff" }}>{draft.title}</p>
          <p className="text-[11px] mt-1" style={{ color: C.cream }}>Preview the official filing draft before signing.</p>
        </div>
        {onBackToReview && (
          <button onClick={onBackToReview} className="text-[11px] font-bold underline" style={{ color: C.cream, background: "none", border: "none", cursor: "pointer" }}>
            Back to edit
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        <div className="rounded-xl p-4 prose prose-sm max-w-none" style={{ background: C.offWhite, color: C.darkText }}>
          <ReactMarkdown>{draft.draft_markdown}</ReactMarkdown>
          {includeDeclaration && (
            <p className="mt-4 text-xs font-bold" style={{ color: C.darkText }}>
              I declare under penalty of perjury under the laws of my state that the foregoing is true and correct to the best of my knowledge.
            </p>
          )}
        </div>

        {draft.preparation_tasks?.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "#FEF9EC", border: `1px solid ${C.gold}55` }}>
            <p className="text-xs font-bold mb-2" style={{ color: C.brown }}>Before filing, prepare:</p>
            <ul className="space-y-1">
              {draft.preparation_tasks.map((task, index) => <li key={index} className="text-xs" style={{ color: C.darkText }}>• {task}</li>)}
            </ul>
          </div>
        )}

        <button onClick={downloadPdf} className="w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
          <Download size={15} /> Download PDF
        </button>

        <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <SignaturePad onSignatureChange={setSignature} />
          <label className="flex items-start gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" style={{ accentColor: C.darkGreen }} />
            <span className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
              I reviewed this draft and understand it is a prepared document for my records. I will consult legal counsel before filing with the court.
            </span>
          </label>
          <button onClick={onSign} disabled={!signature || !agreed || signing} className="w-full mt-4 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2" style={{ background: signature && agreed ? C.darkGreen : C.cream, color: signature && agreed ? "#fff" : C.mutedText, border: "none" }}>
            <FileSignature size={15} /> {signing ? "Saving signed filing…" : "Sign & save official document"}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2 } from "lucide-react";

export default function CourtExportButton({ caseNumber }) {
  const [exporting, setExporting] = useState(false);

  async function exportPdf() {
    setExporting(true);
    const response = await base44.functions.invoke("generateCourtGradePdf", { case_number: caseNumber || "" });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rooted-21-court-packet-${Date.now()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={exporting}
      className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-green-950"
    >
      {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {exporting ? "Preparing PDF..." : "Secure PDF export"}
    </button>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { FileDown, Loader2 } from "lucide-react";

export default function ChronologyExportButton({ items, childName, category }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function exportPdf() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Only advisory filters are sent. The server reads all evidence,
      // assigns exhibit numbers, applies restricted-document gating, and
      // builds the PDF from trusted records.
      const response = await base44.functions.invoke("generateChronologyExhibitPdf", {
        childName: childName || "",
        category: category || "",
      });
      if (response.data?.success && response.data?.base64) {
        const { base64, fileName } = response.data;
        const byteChars = atob(base64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError(response.data?.error || "Failed to generate exhibit PDF.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate exhibit PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={exportPdf} disabled={loading || !items?.length} className="w-full rounded-2xl px-4 py-3 text-sm font-black inline-flex items-center justify-center" style={{ background: items?.length ? C.darkGreen : C.cream, color: C.cream, border: "none" }}>
        {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileDown size={16} className="mr-2" />}
        {loading ? "Generating…" : "Export Chronology Exhibit PDF"}
      </button>
      {error && <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>}
    </div>
  );
}
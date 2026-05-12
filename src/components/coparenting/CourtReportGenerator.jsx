import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download, Loader2, AlertCircle } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CourtReportGenerator({ partnershipId, childName, messagesCount, callsCount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function generateReport() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await base44.functions.invoke("generateCourtCommReport", {
        partnership_id: partnershipId,
      });

      if (response.data?.base64) {
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
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="flex items-start gap-3 mb-3">
        <FileText size={16} color={C.midGreen} />
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Court-Ready Communication Report</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>
            Compile all messages, calls, transcripts, and tension analysis into a tamper-proof PDF
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="rounded-lg p-2" style={{ background: C.offWhite }}>
          <p style={{ color: C.mutedText }}>Messages</p>
          <p className="font-bold text-lg" style={{ color: C.darkGreen }}>{messagesCount}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: C.offWhite }}>
          <p style={{ color: C.mutedText }}>Calls</p>
          <p className="font-bold text-lg" style={{ color: C.darkGreen }}>{callsCount}</p>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 p-2 rounded-lg mb-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <AlertCircle size={14} color="#B84C2A" />
          <p className="text-xs" style={{ color: "#B84C2A" }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-2 p-2 rounded-lg mb-3" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>✓ Report generated and downloaded</p>
        </div>
      )}

      <button
        onClick={generateReport}
        disabled={loading || (messagesCount === 0 && callsCount === 0)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-sm transition-all"
        style={{
          background: loading || (messagesCount === 0 && callsCount === 0) ? `${C.midGreen}40` : C.midGreen,
          color: C.white,
          border: "none",
          cursor: loading || (messagesCount === 0 && callsCount === 0) ? "default" : "pointer",
          opacity: loading || (messagesCount === 0 && callsCount === 0) ? 0.6 : 1,
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {loading ? "Generating…" : "Generate & Download"}
      </button>

      <p className="text-[10px] mt-2 text-center" style={{ color: C.mutedText }}>
        🔒 Tamper-proof, court-admissible, audit-logged
      </p>
    </div>
  );
}
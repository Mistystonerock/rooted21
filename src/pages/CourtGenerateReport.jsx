import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Download, Calendar } from "lucide-react";

export default function CourtGenerateReport() {
  const [user, setUser] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      if (currentUser?.role !== "court_staff") {
        setLoading(false);
        return;
      }
      setUser(currentUser);

      const allPartnerships = await base44.entities.CoParentingPartnership.list(
        "-created_date",
        100
      );
      setPartnerships(allPartnerships);

      // Set default date range (past 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);

      setLoading(false);
    };

    init();
  }, []);

  async function handleGenerateReport() {
    setError("");
    if (!selectedPartnership || !startDate || !endDate) {
      setError("Please select a partnership and date range");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke("generatePartnershipReport", {
        partnership_id: selectedPartnership,
        start_date: startDate,
        end_date: endDate,
      });

      const { html, summary } = response.data;

      // Convert HTML to downloadable file
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Partnership-Report-${summary.child_name}-${startDate}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  if (!user || user.role !== "court_staff") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.offWhite }}>
        <div className="text-center">
          <p className="font-bold" style={{ color: C.darkGreen }}>Access Denied</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>
            Only court staff can generate partnership reports
          </p>
          <Link
            to="/court-dashboard"
            className="mt-4 inline-block text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: C.midGreen, color: C.white, textDecoration: "none" }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedPartnershipData = partnerships.find(p => p.id === selectedPartnership);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link
          to="/court-dashboard"
          className="rounded-lg p-1.5"
          style={{ background: "#ffffff18", border: "none" }}
        >
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <Download size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
            Generate Partnership Report
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            Messages, behaviors & routines
          </p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Partnership Selection */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <label className="block text-xs font-bold mb-2" style={{ color: C.mutedText }}>
            SELECT PARTNERSHIP
          </label>
          <select
            value={selectedPartnership || ""}
            onChange={(e) => setSelectedPartnership(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          >
            <option value="">— Choose a partnership —</option>
            {partnerships.map((p) => (
              <option key={p.id} value={p.id}>
                {p.child_name} • {p.parent_1_name} & {p.parent_2_name}
              </option>
            ))}
          </select>
        </div>

        {/* Partnership Info */}
        {selectedPartnershipData && (
          <div className="rounded-2xl p-4" style={{ background: C.cream, border: `1px solid ${C.midGreen}` }}>
            <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>
              Partnership Details
            </p>
            <p className="text-xs mb-1" style={{ color: C.darkText }}>
              <strong>Child:</strong> {selectedPartnershipData.child_name}
            </p>
            <p className="text-xs mb-1" style={{ color: C.darkText }}>
              <strong>Parents:</strong> {selectedPartnershipData.parent_1_name} &amp;{" "}
              {selectedPartnershipData.parent_2_name}
            </p>
            <p className="text-xs mb-1" style={{ color: C.darkText }}>
              <strong>Status:</strong> {selectedPartnershipData.status}
            </p>
            {selectedPartnershipData.court_case_number && (
              <p className="text-xs" style={{ color: C.darkText }}>
                <strong>Case:</strong> {selectedPartnershipData.court_case_number}
              </p>
            )}
          </div>
        )}

        {/* Date Range */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <label className="block text-xs font-bold mb-3" style={{ color: C.mutedText }}>
            <Calendar size={13} className="inline mr-1.5" />
            DATE RANGE
          </label>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold block mb-1" style={{ color: C.mutedText }}>
                END DATE
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>
          </div>
        </div>

        {/* Quick Range Buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Last 7 days", days: 7 },
            { label: "Last 30 days", days: 30 },
            { label: "Last 90 days", days: 90 },
          ].map((opt) => (
            <button
              key={opt.days}
              onClick={() => {
                const today = new Date();
                const ago = new Date(today.getTime() - opt.days * 24 * 60 * 60 * 1000);
                setStartDate(ago.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div
            className="rounded-lg p-3 text-xs"
            style={{ background: "#FEF3EE", border: "1px solid #F4C9B8", color: "#B84C2A" }}
          >
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={generating || !selectedPartnership}
          className="w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: selectedPartnership ? C.darkGreen : C.cream,
            color: selectedPartnership ? C.white : C.mutedText,
            border: "none",
            cursor: selectedPartnership ? "pointer" : "default",
            opacity: generating ? 0.7 : 1,
          }}
        >
          <Download size={16} />
          {generating ? "Generating..." : "Generate & Download Report"}
        </button>

        {/* Info */}
        <div className="rounded-lg p-3" style={{ background: C.cream }}>
          <p className="text-[10px]" style={{ color: C.darkGreen }}>
            <strong>Report includes:</strong> Co-parenting messages, behavior logs with mood analysis, household
            routines, check-in trends, and regulation statistics for the selected date range.
          </p>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
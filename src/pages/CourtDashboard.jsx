import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Users, MessageSquare, Calendar, Shield, Download } from "lucide-react";

export default function CourtDashboard() {
  const [user, setUser] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      // Verify user is court staff
      if (u?.role !== "court_staff") {
        setLoading(false);
        return;
      }
      setUser(u);

      const all = await base44.entities.CoParentingPartnership.list("-created_date", 100);
      setPartnerships(all);
      setLoading(false);
    });
  }, []);

  if (!loading && user?.role !== "court_staff") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: C.offWhite }}>
        <div className="text-center space-y-3">
          <Shield size={32} color={C.mutedText} />
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Access Denied</p>
          <p className="text-xs" style={{ color: C.mutedText }}>This dashboard is for court staff only.</p>
          <Link to="/dashboard" className="text-xs font-bold" style={{ color: C.midGreen }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <Shield size={16} color={C.gold} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Court Dashboard</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Co-parenting case management</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{partnerships.length}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Active Cases</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{partnerships.filter(p => p.status === "active").length}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Active</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{partnerships.filter(p => p.status === "pending").length}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>Pending</p>
          </div>
        </div>

        {/* Quick actions */}
        <Link
          to="/court-generate-report"
          className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
          style={{ background: C.darkGreen, border: `1.5px solid ${C.darkGreen}`, textDecoration: "none" }}
        >
          <Download size={18} color={C.gold} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: C.cream }}>Generate Partnership Report</p>
            <p className="text-[11px]" style={{ color: C.lightGreen }}>Messages, behaviors & routines</p>
          </div>
        </Link>

        {/* Cases list */}
        <div>
          <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Co-Parenting Cases</p>
          {partnerships.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
              <p className="text-xs" style={{ color: C.mutedText }}>No partnerships yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partnerships.map(p => (
                <Link
                  key={p.id}
                  to={`/court-partnership/${p.id}`}
                  className="rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all"
                  style={{ background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" }}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>🧒 {p.child_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users size={12} color={C.mutedText} />
                      <p className="text-xs truncate" style={{ color: C.mutedText }}>
                        {p.parent_1_name} & {p.parent_2_name}
                      </p>
                    </div>
                    {p.court_case_number && (
                      <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Case: {p.court_case_number}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: `${C.midGreen}20`, color: C.midGreen }}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Users, BookOpen, MessageCircle, ChevronRight } from "lucide-react";

export default function CoParentPortal() {
  const [user, setUser] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      // Get partnerships where user is either parent
      const allPartnerships = await base44.entities.CoParentingPartnership.filter({}, "-created_date", 50);
      const userPartnerships = allPartnerships.filter(
        p => p.parent_1_email === u.email || p.parent_2_email === u.email
      );
      setPartnerships(userPartnerships);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <span style={{ color: C.cream, fontSize: "14px" }}>←</span>
        </Link>
        <Users size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Co-Parent Portal</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Court-supervised parenting partnership</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-4 border-t-transparent rounded-full mx-auto animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        )}

        {!loading && partnerships.length === 0 && (
          <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <Users size={32} color={C.cream} className="mx-auto" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No co-parenting partnerships yet</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Court staff will link you with your co-parent. Once linked, you'll be able to send and receive messages about your child's care.
            </p>
          </div>
        )}

        {partnerships.length > 0 && (
          <>
            {/* Quick info */}
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Active Partnerships</p>
              <p className="text-xs" style={{ color: C.mutedText }}>
                All messages in this portal are reviewed by court staff to ensure healthy co-parenting communication.
              </p>
            </div>

            {/* Partnership cards */}
            {partnerships.map(p => {
              const coparent = p.parent_1_email === user?.email ? p.parent_2_name : p.parent_1_name;
              return (
                <div key={p.id} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>🧒 {p.child_name}</p>
                      <p className="text-xs mt-1" style={{ color: C.mutedText }}>Co-parenting with {coparent}</p>
                      {p.court_case_number && (
                        <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>Case: {p.court_case_number}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${C.midGreen}20`, color: C.midGreen }}>
                      {p.status}
                    </span>
                  </div>
                  
                  <Link
                    to={`/co-parent-messaging/${p.id}`}
                    className="flex items-center gap-2 text-sm font-bold p-3 rounded-lg transition-all hover:shadow-md"
                    style={{ background: C.offWhite, border: `1px solid ${C.cream}`, color: C.darkGreen, textDecoration: "none" }}
                  >
                    <MessageCircle size={14} />
                    Send Message
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                </div>
              );
            })}

            {/* Resources section */}
            <Link
              to="/co-parenting-resources"
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:shadow-md"
              style={{ background: C.darkGreen, border: `1.5px solid ${C.darkGreen}`, textDecoration: "none" }}
            >
              <BookOpen size={18} color={C.gold} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: C.cream }}>Co-Parenting Resources</p>
                <p className="text-[11px]" style={{ color: C.lightGreen }}>Learn healthy communication strategies</p>
              </div>
              <ChevronRight size={16} color={C.gold} />
            </Link>
          </>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}
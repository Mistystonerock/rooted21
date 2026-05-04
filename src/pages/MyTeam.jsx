import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Users, MessageCircle, ChevronRight, QrCode } from "lucide-react";
import SecureMessageThread from "@/components/messaging/SecureMessageThread";
import RedeemInvitationModal from "@/components/rooted/RedeemInvitationModal";

export default function MyTeam() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null); // AssignedFamily record
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const assignments = await base44.entities.AssignedFamily.filter(
        { family_email: u.email },
        "-created_date",
        50
      );
      setTeam(assignments);
      setLoading(false);
    });
  }, []);

  // ── MESSAGE THREAD VIEW ──
  if (activeThread && user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
        <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10 flex-shrink-0" style={{ background: C.darkGreen }}>
          <button onClick={() => setActiveThread(null)} className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
            <ChevronLeft size={18} color={C.cream} />
          </button>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
              {activeThread.professional_email.split("@")[0]}
            </p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>
              {activeThread.professional_role} · Secure Message
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col" style={{ minHeight: 0, height: "calc(100vh - 60px)" }}>
          <SecureMessageThread
            familyEmail={user.email}
            professionalEmail={activeThread.professional_email}
            currentUser={user}
            senderRole="Parent"
          />
        </div>
      </div>
    );
  }

  // ── TEAM LIST VIEW ──
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <Users size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>My Support Team</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Secure messaging with your professionals</p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-3">
        {loading && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full mx-auto animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        )}

        {!loading && team.length === 0 && (
          <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <Users size={32} color={C.cream} className="mx-auto" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No families linked yet</p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              Enter an invitation code from a parent to link your account and access their family data.
            </p>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
              style={{ background: C.darkGreen, color: C.white, border: 'none', cursor: 'pointer' }}
            >
              <QrCode size={13} /> Enter Code
            </button>
          </div>
        )}

        {/* REDEEM MODAL */}
        {showRedeemModal && (
          <RedeemInvitationModal
            onClose={() => setShowRedeemModal(false)}
            onSuccess={() => {
              setShowRedeemModal(false);
              // Refresh team list
              base44.auth.me().then(async (u) => {
                const assignments = await base44.entities.AssignedFamily.filter(
                  { family_email: u.email },
                  "-created_date",
                  50
                );
                setTeam(assignments);
              });
            }}
          />
        )}

        {team.length > 0 && (
          <>
            {team.map(member => (
              <button
                key={member.id}
                onClick={() => setActiveThread(member)}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md"
                style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: C.cream, color: C.darkGreen }}
                >
                  {member.professional_email?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: C.darkGreen }}>
                    {member.professional_email}
                  </p>
                  <p className="text-[11px]" style={{ color: C.mutedText }}>
                    {member.professional_role} · {member.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} color={C.midGreen} />
                  <ChevronRight size={14} color={C.mutedText} />
                </div>
              </button>
            ))}

            <button
              onClick={() => setShowRedeemModal(true)}
              className="w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2"
              style={{ background: C.cream, color: C.darkGreen, border: 'none', cursor: 'pointer' }}
            >
              <QrCode size={13} /> Add Another Professional
            </button>
          </>
        )}

        {!loading && team.length > 0 && (
          <p className="text-center text-[11px] pt-2" style={{ color: C.mutedText }}>
            All messages are private and secure. Only you and your assigned professional can see them.
          </p>
        )}
      </div>
    </div>
  );
}
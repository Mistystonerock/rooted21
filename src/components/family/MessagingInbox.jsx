import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { MessageCircle, ChevronRight, ChevronLeft, Lock } from "lucide-react";
import SecureMessageThread from "@/components/messaging/SecureMessageThread";

export default function MessagingInbox({ team, currentUser, senderRole }) {
  const [activeThread, setActiveThread] = useState(null);

  if (activeThread) {
    return (
      <div className="flex flex-col" style={{ height: 480 }}>
        <button
          onClick={() => setActiveThread(null)}
          className="flex items-center gap-1.5 text-xs font-bold px-1 py-2 mb-2"
          style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}
        >
          <ChevronLeft size={14} /> Back to inbox
        </button>
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.cream}`, minHeight: 0 }}>
          <SecureMessageThread
            familyEmail={activeThread.family_email}
            professionalEmail={activeThread.professional_email}
            currentUser={currentUser}
            senderRole={senderRole}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Secure Inbox</p>
        <div className="flex items-center gap-1" style={{ color: C.midGreen }}>
          <Lock size={10} />
          <span className="text-[10px] font-bold">HIPAA-aligned</span>
        </div>
      </div>

      {team.length === 0 && (
        <div className="rounded-xl p-5 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
          <p className="text-2xl mb-1">💬</p>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No team members yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>When a professional is assigned to you, you can message them here.</p>
        </div>
      )}

      {team.map(member => (
        <button
          key={member.id}
          onClick={() => setActiveThread(member)}
          className="w-full text-left rounded-2xl p-3.5 flex items-center gap-3 transition-all hover:shadow-md"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: C.cream, color: C.darkGreen }}
          >
            {member.professional_email?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: C.darkGreen }}>
              {member.professional_email}
            </p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>
              {member.professional_role}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={15} color={C.midGreen} />
            <ChevronRight size={13} color={C.mutedText} />
          </div>
        </button>
      ))}
    </div>
  );
}
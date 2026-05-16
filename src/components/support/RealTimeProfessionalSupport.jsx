import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Video, ShieldCheck, X, Users } from "lucide-react";
import SecureMessageThread from "@/components/messaging/SecureMessageThread";
import { C } from "@/lib/rooted-constants";

async function hashBody(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function RealTimeProfessionalSupport() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.ProfessionalFamilyAccess.list("-created_date", 50),
    ]).then(([me, rows]) => {
      setUser(me);
      setConnections(rows.filter(row => row.status === "active"));
    });
  }, []);

  const activeThread = useMemo(() => {
    if (!user || !activeConnection) return null;
    const isProfessional = activeConnection.professional_email === user.email || activeConnection.professional_user_id === user.id;
    return {
      familyEmail: activeConnection.parent_email,
      professionalEmail: activeConnection.professional_email,
      senderRole: isProfessional ? activeConnection.professional_role || "professional" : "parent",
      name: isProfessional ? activeConnection.parent_name || activeConnection.parent_email : activeConnection.professional_name || activeConnection.professional_email,
    };
  }, [user, activeConnection]);

  async function requestVideoSupport(connection) {
    if (!user || requestingId) return;
    setRequestingId(connection.id);
    const isProfessional = connection.professional_email === user.email || connection.professional_user_id === user.id;
    const familyEmail = connection.parent_email;
    const professionalEmail = connection.professional_email;
    const recipientEmail = isProfessional ? familyEmail : professionalEmail;
    const body = isProfessional
      ? "Video support offered. Please reply here with a time that works for a secure video visit."
      : "Video support requested. Please reply here with a safe time or video visit link.";
    const msg = await base44.entities.SecureMessage.create({
      family_email: familyEmail,
      professional_email: professionalEmail,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      sender_role: isProfessional ? connection.professional_role || "professional" : "parent",
      body,
      read: false,
    });
    const hash = await hashBody(body);
    await base44.entities.MessageAuditLog.create({
      message_id: msg.id,
      thread_type: "secure_message",
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      recipient_email: recipientEmail,
      body_preview: body.substring(0, 120),
      content_hash: hash,
      sent_at: new Date().toISOString(),
      topic: "video_support_request",
    });
    setActiveConnection(connection);
    setRequestingId(null);
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
          <ShieldCheck size={20} color={C.midGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Real-Time Professional Support</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Secure chat and video-support requests are timestamped and saved to the audit trail.</p>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: C.offWhite, border: `1px dashed ${C.cream}` }}>
          <Users size={22} color={C.gold} className="mx-auto" />
          <p className="mt-2 text-sm font-bold" style={{ color: C.darkGreen }}>No connected professionals yet</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Link a therapist, caseworker, counselor, or support professional to start secure messaging.</p>
          <Link to="/my-team" className="mt-3 inline-flex rounded-2xl px-4 py-2 text-xs font-black no-underline" style={{ background: C.darkGreen, color: C.cream }}>
            Manage Support Team
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {connections.map(connection => {
            const isProfessional = user && (connection.professional_email === user.email || connection.professional_user_id === user.id);
            const displayName = isProfessional ? connection.parent_name || connection.parent_email : connection.professional_name || connection.professional_email;
            const displayRole = isProfessional ? "Family" : connection.professional_role || "Professional";
            return (
              <div key={connection.id} className="rounded-2xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ background: `${C.gold}18` }}>🤝</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black truncate" style={{ color: C.darkGreen }}>{displayName}</p>
                    <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{displayRole}{connection.child_name ? ` · ${connection.child_name}` : ""}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setActiveConnection(connection)} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
                    <MessageCircle size={13} className="mr-1" /> Secure Chat
                  </button>
                  <button onClick={() => requestVideoSupport(connection)} disabled={requestingId === connection.id} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.gold, color: C.darkGreen, border: "none", opacity: requestingId === connection.id ? 0.7 : 1 }}>
                    <Video size={13} className="mr-1" /> {requestingId === connection.id ? "Sending…" : "Video Request"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="h-[86vh] w-full max-w-[560px] overflow-hidden rounded-t-3xl sm:rounded-3xl" style={{ background: C.white }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: C.darkGreen }}>
              <div>
                <p className="text-sm font-black" style={{ color: C.cream }}>Secure Support Chat</p>
                <p className="text-[10px]" style={{ color: C.lightGreen }}>{activeThread.name}</p>
              </div>
              <button onClick={() => setActiveConnection(null)} className="rounded-full" style={{ width: 36, height: 36, background: "rgba(255,255,255,0.12)", border: "none" }}>
                <X size={18} color={C.cream} />
              </button>
            </div>
            <SecureMessageThread
              familyEmail={activeThread.familyEmail}
              professionalEmail={activeThread.professionalEmail}
              currentUser={user}
              senderRole={activeThread.senderRole}
            />
          </div>
        </div>
      )}
    </section>
  );
}
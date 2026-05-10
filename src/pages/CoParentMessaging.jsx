import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Send, ShieldCheck, Download, Loader2 } from "lucide-react";
import CoParentMessageConsentModal, { hasCoParentMessageConsent } from "@/components/legal/CoParentMessageConsentModal";

const TOPICS = ["schedule", "health", "education", "behavior", "finances", "general"];

const TOPIC_COLORS = {
  schedule:  { bg: "#E8F4FF", text: "#1A5FAD" },
  health:    { bg: "#FFF0F0", text: "#B84C2A" },
  education: { bg: "#EAF4EA", text: "#2E7D60" },
  behavior:  { bg: "#FFF8E6", text: "#7A5200" },
  finances:  { bg: "#F3EDFF", text: "#5C3D9E" },
  general:   { bg: "#F5F5F5", text: "#555555" },
};

async function hashBody(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function CoParentMessaging() {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("general");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (!hasCoParentMessageConsent()) {
        setShowConsentModal(true);
      }
      const ps = await base44.entities.CoParentingPartnership.list();
      const p = ps.find(x => x.id === partnershipId);
      setPartnership(p);
      const msgs = await base44.entities.CoParentingMessage.filter(
        { partnership_id: partnershipId }, "created_date", 500
      );
      setMessages(msgs);
      setLoading(false);
    });
  }, [partnershipId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const txt = input.trim();
    if (!txt || sending) return;
    setSending(true);
    setInput("");

    const sentAt = new Date().toISOString();
    const hash = await hashBody(txt);

    const msgData = {
      partnership_id: partnershipId,
      sender_email: user.email,
      sender_name: user.full_name,
      body: txt,
      topic,
    };

    const created = await base44.entities.CoParentingMessage.create(msgData);

    // Immutable audit log
    base44.entities.MessageAuditLog.create({
      message_id: created.id,
      thread_type: "coparenting",
      sender_email: user.email,
      sender_name: user.full_name,
      body_preview: txt.substring(0, 120),
      content_hash: hash,
      sent_at: sentAt,
      partnership_id: partnershipId,
      topic,
    });

    setMessages(prev => [...prev, { ...created, _hash: hash }]);
    setSending(false);
  }

  async function handleExport() {
    setExporting(true);
    const response = await base44.functions.invoke("exportMessageThread", {
      partnershipId,
      threadType: "coparenting",
    });
    if (response.data?.base64) {
      const { base64, fileName } = response.data;
      const byteChars = atob(base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  if (showConsentModal) {
    return (
      <CoParentMessageConsentModal
        user={user}
        onAccept={() => setShowConsentModal(false)}
        onDecline={() => navigate("/co-parent-portal")}
      />
    );
  }

  const coparent = partnership?.parent_1_email === user?.email
    ? partnership?.parent_2_name
    : partnership?.parent_1_name;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <Link to="/co-parent-portal" className="rounded-lg p-1.5 flex items-center justify-center"
          style={{ background: "#ffffff18", border: "none", width: 36, height: 36 }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{coparent}</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>🧒 {partnership?.child_name}</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)", color: C.cream, border: "none", cursor: "pointer" }}
        >
          {exporting ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
      </div>

      {/* Tamper-proof banner */}
      <div className="flex items-center gap-2 px-4 py-2"
        style={{ background: "#F0F6F0", borderBottom: `1px solid ${C.midGreen}25` }}>
        <ShieldCheck size={11} color={C.midGreen} />
        <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>
          All messages are timestamped, audit-logged, and tamper-evident
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-2">💬</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No messages yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>All messages are securely saved and court-admissible.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_email === user?.email;
            const tc = TOPIC_COLORS[msg.topic] || TOPIC_COLORS.general;
            const fullTs = new Date(msg.created_date).toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            });
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <p className="text-[9px] font-bold mb-0.5 px-1" style={{ color: C.midGreen }}>
                    {msg.sender_name}
                  </p>
                )}
                <div
                  className="rounded-2xl px-3.5 py-2.5 max-w-[78%]"
                  style={{
                    background: isOwn ? C.darkGreen : C.white,
                    border: isOwn ? "none" : `1px solid ${C.cream}`,
                  }}
                >
                  <p className="text-sm break-words leading-relaxed"
                    style={{ color: isOwn ? C.cream : C.darkGreen }}>
                    {msg.body}
                  </p>
                  {/* Topic badge */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                      style={{ background: isOwn ? "rgba(255,255,255,0.15)" : tc.bg, color: isOwn ? C.lightGreen : tc.text }}>
                      {msg.topic || "general"}
                    </span>
                    {msg.read_by_court && (
                      <span className="text-[8px] font-bold" style={{ color: isOwn ? C.lightGreen : C.midGreen }}>
                        ✓ Court reviewed
                      </span>
                    )}
                  </div>
                  {/* Full timestamp */}
                  <p className="text-[8px] font-mono mt-1.5" style={{ color: isOwn ? `${C.lightGreen}cc` : C.mutedText }}>
                    🕐 {fullTs} ET
                  </p>
                  {/* Tamper indicator */}
                  <p className="text-[7px] font-mono mt-0.5" style={{ color: isOwn ? `${C.lightGreen}77` : `${C.midGreen}66` }}>
                    🔒 audit-logged · immutable
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 items-end"
        style={{ background: C.white, borderTop: `1px solid ${C.cream}` }}>
        <div className="flex-1 space-y-1.5">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg capitalize"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          >
            {TOPICS.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Your message… (timestamped & saved)"
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() ? C.darkGreen : C.cream,
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          {sending
            ? <Loader2 size={14} className="animate-spin" color={C.white} />
            : <Send size={14} color={input.trim() ? C.white : C.mutedText} />
          }
        </button>
      </div>
    </div>
  );
}
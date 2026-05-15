import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Send, ShieldCheck, Download, Loader2, ShieldAlert } from "lucide-react";
import CoParentMessageConsentModal, { hasCoParentMessageConsent } from "@/components/legal/CoParentMessageConsentModal";
import ConflictLanguageChecker from "@/components/messaging/ConflictLanguageChecker";
import TensionAlert from "@/components/messaging/TensionAlert";
import IncomingMessageToneCoach from "@/components/messaging/IncomingMessageToneCoach";
import VoiceCallButton from "@/components/coparenting/VoiceCallButton";
import CoParentingCallHistory from "@/components/coparenting/CoParentingCallHistory";
import CourtReportGenerator from "@/components/coparenting/CourtReportGenerator";

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
  const [calls, setCalls] = useState([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("general");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showConflictCheck, setShowConflictCheck] = useState(false);
  const [tensionAnalysis, setTensionAnalysis] = useState(null);
  const [analyzingTension, setAnalyzingTension] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [recordingCall, setRecordingCall] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (!hasCoParentMessageConsent()) {
        setShowConsentModal(true);
      }
      const matches = await base44.entities.CoParentingPartnership.filter({ id: partnershipId }, "", 1);
      const p = matches[0];
      if (!p || (p.parent_1_email !== u.email && p.parent_2_email !== u.email && p.court_email !== u.email)) {
        navigate("/co-parent-portal");
        return;
      }
      setPartnership(p);
      const msgs = await base44.entities.CoParentingMessage.filter(
        { partnership_id: partnershipId }, "created_date", 500
      );
      const callsData = await base44.entities.CoParentingCall.filter(
        { partnership_id: partnershipId }, "-start_time", 100
      );
      setMessages(msgs);
      setCalls(callsData);
      setLoading(false);
    });
  }, [partnershipId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Analyze tension when messages change
  useEffect(() => {
    if (messages.length >= 3) {
      analyzeTension();
    }
  }, [messages]);

  async function doSend(txt) {
    if (!txt || sending) return;
    setSending(true);
    setInput("");
    setShowConflictCheck(false);

    const sentAt = new Date().toISOString();
    const hash = await hashBody(txt);

    const recipientEmail = partnership?.parent_1_email === user.email ? partnership?.parent_2_email : partnership?.parent_1_email;
    const msgData = {
      partnership_id: partnershipId,
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: recipientEmail,
      court_email: partnership?.court_email,
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

  function handleSend() {
    const txt = input.trim();
    if (!txt || sending) return;
    setShowConflictCheck(true);
  }

  async function analyzeTension() {
    setAnalyzingTension(true);
    const response = await base44.functions.invoke("analyzeThreadTension", {
      partnershipId,
      threadType: "coparenting",
      lastN: Math.min(messages.length, 15),
    });
    if (response.data?.success) {
      setTensionAnalysis(response.data);
    }
    setAnalyzingTension(false);
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

  async function handleCallStart(twilioData) {
    const callRecord = await base44.entities.CoParentingCall.create({
      partnership_id: partnershipId,
      initiator_email: user.email,
      initiator_name: user.full_name,
      recipient_email: partnership?.parent_1_email === user?.email ? partnership?.parent_2_email : partnership?.parent_1_email,
      recipient_name: partnership?.parent_1_email === user?.email ? partnership?.parent_2_name : partnership?.parent_1_name,
      court_email: partnership?.court_email,
      start_time: new Date().toISOString(),
      status: "answered",
      child_name: partnership?.child_name,
      topic: topic,
    });
    setRecordingCall({ ...callRecord, twilioToken: twilioData?.token });
  }

  async function handleCallEnd(duration) {
    if (!recordingCall) return;
    
    const updatedCall = await base44.entities.CoParentingCall.update(recordingCall.id, {
      end_time: new Date().toISOString(),
      duration_seconds: Math.round(duration),
      status: "ended",
    });

    // Audit log for call completion
    await base44.entities.AuditLog.create({
      action: 'coparenting_call_ended',
      user_email: user.email,
      resource_type: 'coparenting_call',
      resource_id: recordingCall.id,
      timestamp: new Date().toISOString(),
      status: 'success',
      details: `Call duration: ${Math.round(duration)}s`,
    });

    setCalls(prev => [updatedCall, ...prev]);
    setRecordingCall(null);
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
  const latestIncomingMessage = [...messages].reverse().find(msg => msg.sender_email !== user?.email);

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
        <VoiceCallButton 
          partnership={partnership}
          user={user}
          onCallStart={handleCallStart}
          onCallEnd={handleCallEnd}
          callId={recordingCall?.id}
          disabled={recordingCall !== null}
        />
        <button
          onClick={handleExport}
          disabled={exporting || (activeTab === "messages" && messages.length === 0) || (activeTab === "calls" && calls.length === 0)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)", color: C.cream, border: "none", cursor: "pointer" }}
        >
          {exporting ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 sticky top-[56px] z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        <button
          onClick={() => setActiveTab("messages")}
          className="flex-1 py-2 text-xs font-bold border-b-2 transition-colors"
          style={{
            borderColor: activeTab === "messages" ? C.darkGreen : "transparent",
            color: activeTab === "messages" ? C.darkGreen : C.mutedText,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          💬 Messages
        </button>
        <button
          onClick={() => setActiveTab("calls")}
          className="flex-1 py-2 text-xs font-bold border-b-2 transition-colors"
          style={{
            borderColor: activeTab === "calls" ? C.darkGreen : "transparent",
            color: activeTab === "calls" ? C.darkGreen : C.mutedText,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☎️ Calls
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

      {/* Tension alert */}
      {tensionAnalysis && (
        <div className="px-4 py-3" style={{ background: "#fff", borderBottom: `1px solid ${C.cream}` }}>
          <TensionAlert
            alert={tensionAnalysis.alert}
            tensionLevel={tensionAnalysis.tensionLevel}
            suggestions={tensionAnalysis.suggestions}
            onDismiss={() => setTensionAnalysis(null)}
          />
        </div>
      )}

      {/* Court Report Generator */}
      {activeTab === "calls" && (
        <div className="px-4 py-3 sticky top-[56px] z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
          <CourtReportGenerator 
            partnershipId={partnershipId}
            childName={partnership?.child_name}
            messagesCount={messages.length}
            callsCount={calls.length}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {activeTab === "messages" ? (
          <>
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
          </>
        ) : (
          <div className="pt-4">
            <CoParentingCallHistory 
              calls={calls}
              onExport={handleExport}
              exporting={exporting}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {activeTab === "messages" && latestIncomingMessage && (
        <IncomingMessageToneCoach
          message={latestIncomingMessage}
          onUseSuggestion={(text) => setInput(text)}
        />
      )}

      {/* Conflict checker modal */}
      {showConflictCheck && (
        <ConflictLanguageChecker
          message={input}
          onSendOriginal={(txt) => doSend(txt)}
          onSendRevised={(txt) => doSend(txt)}
          onCancel={() => setShowConflictCheck(false)}
        />
      )}

      {/* Input (only show for messages tab) */}
      {activeTab === "messages" && (
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
            <div className="flex items-center gap-1.5 px-1 mb-1">
              <ShieldAlert size={10} color={C.midGreen} />
              <p className="text-[9px] font-bold" style={{ color: C.midGreen }}>AI tone check before sending</p>
            </div>
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
      )}
    </div>
  );
}
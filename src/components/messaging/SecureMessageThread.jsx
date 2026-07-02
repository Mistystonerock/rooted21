import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Send, Lock, ShieldCheck, Download, Loader2 } from "lucide-react";

export default function SecureMessageThread({ familyEmail, professionalEmail, currentUser, senderRole }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadMessages(); }, [familyEmail, professionalEmail]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    setLoading(true);
    const msgs = await base44.entities.SecureMessage.filter(
      { family_email: familyEmail, professional_email: professionalEmail },
      "created_date", 200
    );
    setMessages(msgs);
    setLoading(false);
    const unread = msgs.filter(m => !m.read && m.sender_email !== currentUser.email);
    await Promise.all(unread.map(m => base44.entities.SecureMessage.update(m.id, { read: true })));
  }

  async function handleSend() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput("");

    // Identity, recipient resolution, hashing, and audit logging happen
    // server-side in sendCommunicationMessage.
    const response = await base44.functions.invoke("sendCommunicationMessage", {
      thread_type: "secure_message",
      family_email: familyEmail,
      professional_email: professionalEmail,
      sender_role: senderRole,
      body,
    });

    if (response.data?.success && response.data.message) {
      setMessages(prev => [...prev, response.data.message]);
    } else {
      alert(response.data?.error || "Your message could not be sent.");
      setInput(body);
    }
    setSending(false);
  }

  async function handleExport() {
    setExporting(true);
    const response = await base44.functions.invoke("exportMessageThread", {
      familyEmail,
      professionalEmail,
      threadType: "secure_message",
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

  const isMe = (msg) => msg.sender_email === currentUser.email;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Secure banner + Export */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0"
        style={{ background: "#F0F6F0", borderBottom: `1px solid ${C.midGreen}30` }}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={11} color={C.midGreen} />
          <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>
            Timestamped · Tamper-Evident · Audit-Logged
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || messages.length === 0}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer", opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? <Loader2 size={9} className="animate-spin" /> : <Download size={9} />}
          {exporting ? "…" : "Export PDF"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ minHeight: 0 }}>
        {loading && (
          <div className="text-center py-8">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full mx-auto animate-spin"
              style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No messages yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Start a secure conversation below.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const me = isMe(msg);
          const fullTimestamp = new Date(msg.created_date).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          });
          return (
            <div key={msg.id} className={`flex flex-col ${me ? "items-end" : "items-start"}`}>
              {/* Sender label for others */}
              {!me && (
                <p className="text-[9px] font-bold mb-0.5 px-1" style={{ color: C.midGreen }}>
                  {msg.sender_name}{msg.sender_role ? ` · ${msg.sender_role}` : ""}
                </p>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
                style={{
                  background: me ? C.darkGreen : C.white,
                  border: me ? "none" : `1px solid ${C.cream}`,
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: me ? C.cream : C.darkGreen }}>
                  {msg.body}
                </p>
                {/* Full timestamp */}
                <p className="text-[8px] mt-1.5 font-mono" style={{ color: me ? `${C.lightGreen}cc` : C.mutedText }}>
                  🕐 {fullTimestamp} ET
                </p>
                {/* Tamper indicator */}
                <div className="flex items-center gap-1 mt-0.5">
                  <Lock size={7} color={me ? `${C.lightGreen}99` : `${C.midGreen}88`} />
                  <p className="text-[7px] font-mono" style={{ color: me ? `${C.lightGreen}88` : `${C.midGreen}66` }}>
                    audit-logged · immutable
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${C.cream}`, background: C.white }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a secure message… (all messages are timestamped and saved)"
          rows={1}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
          style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, maxHeight: 80 }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: input.trim() ? C.darkGreen : C.cream, border: "none", cursor: input.trim() ? "pointer" : "default" }}
        >
          {sending ? <Loader2 size={13} className="animate-spin" color={C.white} /> : <Send size={14} color={input.trim() ? C.white : C.mutedText} />}
        </button>
      </div>
    </div>
  );
}
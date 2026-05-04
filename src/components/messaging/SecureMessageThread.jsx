import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Send, Lock } from "lucide-react";

export default function SecureMessageThread({ familyEmail, professionalEmail, currentUser, senderRole }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [familyEmail, professionalEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    const msgs = await base44.entities.SecureMessage.filter(
      { family_email: familyEmail, professional_email: professionalEmail },
      "created_date",
      200
    );
    setMessages(msgs);
    setLoading(false);

    // Mark unread messages as read
    const unread = msgs.filter(m => !m.read && m.sender_email !== currentUser.email);
    await Promise.all(unread.map(m => base44.entities.SecureMessage.update(m.id, { read: true })));
  }

  async function handleSend() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput("");

    const msg = await base44.entities.SecureMessage.create({
      family_email: familyEmail,
      professional_email: professionalEmail,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email,
      sender_role: senderRole,
      body,
      read: false,
    });

    setMessages(prev => [...prev, msg]);
    setSending(false);
  }

  const isMe = (msg) => msg.sender_email === currentUser.email;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Secure banner */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 flex-shrink-0" style={{ background: "#F0F6F0", borderBottom: `1px solid ${C.midGreen}30` }}>
        <Lock size={10} color={C.midGreen} />
        <p className="text-[10px] font-bold" style={{ color: C.midGreen }}>Secure · Private · HIPAA-aligned communication</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ minHeight: 0 }}>
        {loading && (
          <div className="text-center py-8">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full mx-auto animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No messages yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Start a secure conversation below.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${isMe(msg) ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
              style={{
                background: isMe(msg) ? C.darkGreen : C.white,
                border: isMe(msg) ? "none" : `1px solid ${C.cream}`,
              }}
            >
              {!isMe(msg) && (
                <p className="text-[10px] font-bold mb-0.5" style={{ color: C.midGreen }}>
                  {msg.sender_name || msg.sender_email}
                  {msg.sender_role ? ` · ${msg.sender_role}` : ""}
                </p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: isMe(msg) ? C.cream : C.darkGreen }}>
                {msg.body}
              </p>
              <p className="text-[9px] mt-1" style={{ color: isMe(msg) ? `${C.lightGreen}99` : C.mutedText }}>
                {new Date(msg.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${C.cream}`, background: C.white }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a secure message…"
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
          <Send size={14} color={input.trim() ? C.white : C.mutedText} />
        </button>
      </div>
    </div>
  );
}
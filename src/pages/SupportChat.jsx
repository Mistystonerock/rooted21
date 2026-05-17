import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Send, Loader2, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SupportChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function init() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin("/support-chat");
        return;
      }
      const conv = await base44.agents.createConversation({
        agent_name: "support_chat",
        metadata: { name: "Support Chat" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending || !conversation) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    await base44.agents.addMessage(conversation, { role: "user", content: text });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <Loader2 size={24} color={C.midGreen} className="animate-spin" />
      </div>
    );
  }

  const visibleMessages = messages.filter(m => m.role === "user" || (m.role === "assistant" && m.content));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      <MobileHeader
        title="💬 Support Chat"
        subtitle="How can we help you today?"
        backTo="/dashboard"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: "80px" }}>
        {visibleMessages.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ background: C.cream }}>
              <MessageCircle size={26} color={C.darkGreen} />
            </div>
            <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
              Hi, I’m Moxie. How can I help today?
            </p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              I can help with check-ins, documents, court prep, visitation logs, and crisis resources.
            </p>
            {/* Quick prompts */}
            <div className="flex flex-col gap-2 mt-4 max-w-[280px] mx-auto">
              {[
                "Help me log today’s behavior or mood",
                "What should I bring to my case-plan task?",
                "Help me document a visitation",
                "Show me crisis and safety resources",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-left"
                  style={{ background: "#fff", border: `1px solid ${C.cream}`, color: C.darkGreen, cursor: "pointer" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[82%] rounded-2xl px-4 py-2.5 text-sm"
              style={{
                background: msg.role === "user" ? C.darkGreen : "#fff",
                color: msg.role === "user" ? C.cream : C.darkGreen,
                border: msg.role === "assistant" ? `1px solid ${C.cream}` : "none",
              }}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: C.midGreen, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 flex gap-2 items-center"
        style={{ background: C.offWhite, borderTop: `1px solid ${C.cream}`, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type your question..."
          className="flex-1 rounded-xl px-4 py-2.5 text-sm border outline-none"
          style={{ borderColor: C.cream, background: "#fff" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: input.trim() && !sending ? C.darkGreen : C.cream,
            border: "none",
            cursor: input.trim() && !sending ? "pointer" : "default",
          }}
        >
          <Send size={16} color={input.trim() && !sending ? C.cream : C.mutedText} />
        </button>
      </div>
    </div>
  );
}
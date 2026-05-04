import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Send } from "lucide-react";

const TOPICS = ["schedule", "health", "education", "behavior", "finances", "general"];

export default function CoParentMessaging() {
  const { partnershipId } = useParams();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const p = await base44.entities.CoParentingPartnership.list().then(
        ps => ps.find(x => x.id === partnershipId)
      );
      setPartnership(p);

      const msgs = await base44.entities.CoParentingMessage.filter(
        { partnership_id: partnershipId },
        "-created_date",
        200
      );
      setMessages(msgs);
      setLoading(false);
    });
  }, [partnershipId]);

  async function handleSend() {
    const txt = input.trim();
    if (!txt) return;

    const msg = {
      partnership_id: partnershipId,
      sender_email: user.email,
      sender_name: user.full_name,
      body: txt,
      topic,
    };

    await base44.entities.CoParentingMessage.create(msg);
    setMessages(prev => [{ ...msg, id: Date.now() }, ...prev]);
    setInput("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  const coparent = partnership?.parent_1_email === user?.email ? partnership?.parent_2_name : partnership?.parent_1_name;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/co-parent-portal" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{coparent}</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>🧒 {partnership?.child_name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: C.mutedText }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.sender_email === user?.email;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className="rounded-2xl px-3 py-2 max-w-[70%]"
                  style={{
                    background: isOwn ? C.darkGreen : C.white,
                    border: isOwn ? "none" : `1px solid ${C.cream}`,
                    color: isOwn ? C.cream : C.darkGreen,
                  }}
                >
                  <p className="text-xs font-bold mb-0.5">{msg.sender_name}</p>
                  <p className="text-sm break-words">{msg.body}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px]" style={{ color: isOwn ? C.lightGreen : C.mutedText }}>
                      {msg.topic}
                    </span>
                    {msg.read_by_court && !isOwn && (
                      <span className="text-[9px]" style={{ color: C.mutedText }}>✓ Court reviewed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 items-end" style={{ background: C.white, borderTop: `1px solid ${C.cream}` }}>
        <div className="flex-1 space-y-1">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs px-2 py-1 rounded-lg"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          >
            {TOPICS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Your message..."
            rows="2"
            className="w-full rounded-lg px-2 py-2 text-sm font-sans resize-none"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() ? C.darkGreen : C.cream,
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          <Send size={14} color={input.trim() ? C.white : C.mutedText} />
        </button>
      </div>
    </div>
  );
}
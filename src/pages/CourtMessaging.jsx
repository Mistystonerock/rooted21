import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react";

const TOPICS = ["schedule", "health", "education", "behavior", "finances", "general"];

export default function CourtMessaging() {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("general");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (u?.role !== "court_staff") {
        navigate("/dashboard");
        return;
      }
      setUser(u);

      const p = await base44.entities.CoParentingPartnership.list().then(
        ps => ps.find(x => x.id === partnershipId)
      );
      setPartnership(p);
    });
  }, [partnershipId, navigate]);

  async function handleSend() {
    if (!input.trim()) return;

    setSending(true);
    try {
      // Create message to each parent from court
      await Promise.all([
        base44.entities.CoParentingMessage.create({
          partnership_id: partnershipId,
          sender_email: user.email,
          sender_name: `${user.full_name} (Court)`,
          body: input,
          topic,
        }),
      ]);

      setSent(true);
      setInput("");
      setTimeout(() => {
        navigate(`/court-partnership/${partnershipId}`);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  if (!partnership) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to={`/court-partnership/${partnershipId}`} className="rounded-lg p-1.5 inline-block mb-2" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Message {partnership.child_name}'s Parents</p>
        <p className="text-[10px]" style={{ color: C.lightGreen }}>As Court Staff</p>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4">
        {sent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <CheckCircle2 size={40} color={C.midGreen} />
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Message Sent</p>
              <p className="text-xs" style={{ color: C.mutedText }}>Both parents will see this message</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-2" style={{ color: C.mutedText }}>TO:</p>
              <p className="text-sm" style={{ color: C.darkGreen }}>{partnership.parent_1_name} & {partnership.parent_2_name}</p>
              <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>Regarding: {partnership.child_name}</p>
            </div>

            <div className="flex-1 flex flex-col space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>TOPIC</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg"
                  style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                >
                  {TOPICS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>MESSAGE</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Compose your message..."
                  className="w-full h-full rounded-lg px-3 py-2 text-sm font-sans resize-none"
                  style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {!sent && (
        <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: C.cream, background: C.white }}>
          <button
            onClick={() => navigate(`/court-partnership/${partnershipId}`)}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm"
            style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: C.darkGreen,
              color: C.cream,
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
              opacity: sending ? 0.7 : 1,
            }}
          >
            <Send size={14} />
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
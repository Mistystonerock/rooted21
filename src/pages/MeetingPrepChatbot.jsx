import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Send, Download, RotateCcw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MeetingPrepChatbot() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("case-select"); // case-select | chatting
  const [conversationContext, setConversationContext] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.CaseFile.filter({ parent_email: u.email }, "-created_date").then(caseFiles => {
          setCases(caseFiles);
        });
      }
    });
  }, []);

  async function handleSelectCase(caseId) {
    const selectedCaseData = cases.find(c => c.id === caseId);
    setSelectedCaseId(caseId);
    setSelectedCase(selectedCaseData);

    // Fetch case notes for context
    const notes = await base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 20);
    
    const contextSummary = `Case: ${selectedCaseData.child_name}
Type: ${selectedCaseData.case_type}
Status: ${selectedCaseData.status}
Key Issues: ${selectedCaseData.key_issues?.join(", ") || "Not specified"}
Next Milestone: ${selectedCaseData.next_milestone || "Not set"}
Team Members: ${selectedCaseData.team_members?.map(m => `${m.name} (${m.role})`).join(", ") || "None"}
Recent Notes: ${notes.slice(0, 3).map(n => `${n.title}: ${n.body.substring(0, 100)}`).join(" | ") || "No notes yet"}`;

    setConversationContext(contextSummary);
    setPhase("chatting");
    setMessages([
      {
        role: "assistant",
        content: `I'm here to help you prepare for meetings about ${selectedCaseData.child_name}'s case. I can help you:\n\n1. **Simulate the meeting** - I'll play the role of school staff, court officials, or doctors\n2. **Practice tough questions** - Get comfortable with challenging questions\n3. **Generate talking points** - Create a cheat sheet of key points to make\n\nWhat type of meeting are you preparing for? (e.g., IEP meeting, court hearing, therapy session, school discipline meeting)`
      }
    ]);
  }

  async function handleSendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke("generateMeetingPrepResponse", {
        userMessage,
        caseContext: conversationContext,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        childName: selectedCase.child_name,
        caseType: selectedCase.case_type,
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function downloadTalkingPoints() {
    if (!selectedCase || messages.length === 0) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke("generateMeetingTalkingPoints", {
        caseContext: conversationContext,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        childName: selectedCase.child_name,
        caseType: selectedCase.case_type,
      });

      // Create download
      const element = document.createElement("a");
      const file = new Blob([response.data.talkingPoints], { type: "text/markdown" });
      element.href = URL.createObjectURL(file);
      element.download = `Meeting-Prep-${selectedCase.child_name}-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Meeting Prep Assistant" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  // Case selection phase
  if (phase === "case-select") {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Meeting Prep Assistant" subtitle="Simulate & prepare" backTo="/dashboard" />

        <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

          {/* Hero */}
          <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
            <p className="text-3xl mb-2">💬</p>
            <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
              Meeting Prep Assistant
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
              Simulate meetings, practice tough questions, and generate talking points
            </p>
          </div>

          {/* Start without a case */}
          <button
            onClick={() => {
              setSelectedCase(null);
              setConversationContext("No specific case selected. Help the parent prepare for a meeting.");
              setPhase("chatting");
              setMessages([{
                role: "assistant",
                content: "I'm your Meeting Prep Assistant! I can help you:\n\n1. **Simulate a meeting** — I'll roleplay as school staff, court officials, or doctors\n2. **Practice tough questions** — get comfortable before the real thing\n3. **Generate talking points** — a cheat sheet to bring with you\n\nWhat type of meeting are you preparing for? (e.g., IEP meeting, court hearing, therapy session)"
              }]);
            }}
            className="w-full rounded-2xl p-4 text-left transition-all hover:shadow-md"
            style={{ background: C.darkGreen, border: "none", cursor: "pointer" }}
          >
            <p className="font-bold text-sm" style={{ color: C.cream }}>💬 Start General Meeting Prep</p>
            <p className="text-xs mt-0.5" style={{ color: C.lightGreen }}>No case needed — just start chatting</p>
          </button>

          {/* Select case */}
          {cases.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-3" style={{ color: C.mutedText }}>OR PREP FOR A SPECIFIC CASE</p>
              <div className="space-y-2">
                {cases.map(caseFile => (
                  <button
                    key={caseFile.id}
                    onClick={() => handleSelectCase(caseFile.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all hover:shadow-md"
                    style={{ background: C.white, border: `1.5px solid ${C.cream}`, cursor: "pointer" }}
                  >
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
                      {caseFile.child_name}
                    </p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: C.mutedText }}>
                      {caseFile.case_type} case · {caseFile.status}
                    </p>
                    {caseFile.next_milestone && (
                      <p className="text-[10px] mt-1" style={{ color: C.gold }}>
                        Next: {caseFile.next_milestone}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pb-8" />
        </div>
      </div>
    );
  }

  // Chat phase
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Meeting Prep"
        subtitle={selectedCase?.child_name}
        backTo="/dashboard"
        rightSlot={
          <button
            onClick={() => { setPhase("case-select"); setMessages([]); setInput(""); }}
            className="rounded-lg flex items-center justify-center"
            style={{ width: 40, height: 40, background: "#ffffff18", border: "none", cursor: "pointer", color: C.cream }}
          >
            <RotateCcw size={16} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3"
              style={{
                background: msg.role === "user" ? C.darkGreen : C.white,
                color: msg.role === "user" ? "#fff" : "#3a3028",
                border: msg.role === "user" ? "none" : `1px solid ${C.cream}`,
              }}
            >
              <ReactMarkdown className="text-xs leading-relaxed prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} color={C.midGreen} className="animate-spin" />
                <p className="text-xs" style={{ color: C.mutedText }}>Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: C.cream, background: C.white }}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question or describe the meeting..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSendMessage()}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="rounded-xl p-2.5 flex items-center justify-center"
            style={{
              background: input.trim() && !loading ? C.darkGreen : C.cream,
              color: input.trim() && !loading ? "#fff" : C.mutedText,
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              opacity: input.trim() && !loading ? 1 : 0.6,
            }}
          >
            <Send size={14} />
          </button>
        </div>

        {messages.length > 3 && (
          <button
            onClick={downloadTalkingPoints}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all"
            style={{
              background: C.midGreen,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Download size={13} />
            {loading ? "Generating..." : "Download Talking Points"}
          </button>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { FOLLOW_UP_DEFAULTS } from "@/lib/rooted-constants";
import { buildMilestoneContext, getMilestonesForAge } from "@/lib/developmental-milestones";
import { ChevronLeft, Send, RefreshCw, AlertTriangle, Brain, ChevronDown, ChevronUp } from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import ChatMessage from "@/components/rooted/ChatMessage";
import AIConsentModal, { hasAIConsent } from "@/components/legal/AIConsentModal";

function parseFollowUps(text) {
  try {
    const match = text.match(/FOLLOWUPS:(\[.*?\])/s);
    if (match) return JSON.parse(match[1]);
  } catch {}
  return null;
}

function stripFollowUps(text) {
  return text.replace(/\nFOLLOWUPS:\[.*?\]/s, "").trim();
}

function buildPersonalizedSystemPrompt(user, children, cases, recentBehaviors, recentCheckins) {
  let context = "";

  // Child profiles
  if (children.length > 0) {
    context += "\n\n--- CHILD PROFILES ---";
    children.forEach(child => {
      context += `\nChild: ${child.first_name}${child.last_name ? " " + child.last_name : ""}, Age: ${child.age || "unknown"}, Placement: ${child.placement_type || "not specified"}`;
      if (child.strengths) context += `\n  Strengths: ${child.strengths}`;
      if (child.concerns) context += `\n  Current concerns: ${child.concerns}`;
      if (child.triggers) context += `\n  Known triggers: ${child.triggers}`;
      if (child.coping_tools) context += `\n  Coping tools that help: ${child.coping_tools}`;
      if (child.behavior_patterns) context += `\n  Behavior patterns: ${child.behavior_patterns}`;
      if (child.school_notes) context += `\n  School notes: ${child.school_notes}`;
      if (child.care_goals?.length > 0) context += `\n  Care goals: ${child.care_goals.join(", ")}`;
    });
  }

  // Active cases
  const activeCases = cases.filter(c => c.status === "active" || c.status === "pending");
  if (activeCases.length > 0) {
    context += "\n\n--- ACTIVE CASES ---";
    activeCases.forEach(c => {
      context += `\nCase: ${c.child_name} — ${c.case_type} case (${c.status})`;
      if (c.description) context += `\n  Overview: ${c.description}`;
      if (c.key_issues?.length > 0) context += `\n  Key issues: ${c.key_issues.join("; ")}`;
      if (c.next_milestone) {
        const days = c.next_milestone_date
          ? Math.ceil((new Date(c.next_milestone_date) - new Date()) / (1000 * 60 * 60 * 24))
          : null;
        context += `\n  Next milestone: ${c.next_milestone}${days !== null ? ` (in ${days} days)` : ""}`;
      }
    });
  }

  // Recent behavior logs
  if (recentBehaviors.length > 0) {
    context += "\n\n--- RECENT BEHAVIOR LOGS (last 7 days) ---";
    recentBehaviors.slice(0, 5).forEach(b => {
      context += `\n- ${b.behavior_type || "behavior"}: ${b.description || ""}`;
      if (b.trigger) context += ` | Trigger: ${b.trigger}`;
      if (b.response) context += ` | Response used: ${b.response}`;
    });
  }

  // Recent check-ins
  if (recentCheckins.length > 0) {
    const avg = (arr, key) => Math.round(arr.reduce((s, i) => s + (i[key] || 0), 0) / arr.length * 10) / 10;
    context += `\n\n--- RECENT CHECK-INS (last 7 days) ---`;
    context += `\nAverage child regulation score: ${avg(recentCheckins, "child_regulation")}/5`;
    context += `\nAverage parent calm score: ${avg(recentCheckins, "parent_calm")}/5`;
  }

  const BASE_PROMPT = `You are a warm, expert parenting support coach for the Rooted 21 Parenting Network — a trauma-informed educational program grounded in attachment science and Trust-Based Relational Intervention (TBRI®) principles.

CRITICAL LEGAL BOUNDARIES — YOU MUST FOLLOW THESE WITHOUT EXCEPTION:
1. You are NOT a licensed therapist, psychologist, psychiatrist, physician, or attorney.
2. You MUST NOT diagnose any mental health condition (RAD, PTSD, FASD, ADHD, ODD, or any other). Instead say: "That sounds like it could be worth discussing with [child's name]'s therapist or pediatrician."
3. You MUST NOT recommend, adjust, or comment on any specific medication, dosage, or prescribing decision. If medication is mentioned, say: "Medication decisions should always be made with their prescribing doctor."
4. You MUST NOT provide specific legal strategy, advise on court filings, or tell a parent what to do in an active CPS investigation. Say: "For legal questions, I'd strongly encourage you to speak with a family law attorney."
5. You MUST NOT tell a parent that any behavior is or isn't abuse, neglect, or a crime. Say: "That's something to bring to their caseworker or a licensed professional."
6. ALWAYS route clinical, legal, and diagnostic questions to appropriate professionals.
7. ALWAYS end any message involving a safety risk with: "If there is immediate danger, call 911. Mental health crisis: call or text 988."

WHAT YOU CAN DO FULLY:
- Help parents understand TBRI® concepts and how to apply them at home
- Give practical, in-the-moment co-regulation strategies
- Help organize thoughts before a caseworker, school, or court meeting
- Explain what behaviors might mean through a trauma lens (without diagnosing)
- Suggest general coping strategies from the parenting curriculum
- Help draft messages to co-parents, school staff, or care team
- Provide emotional validation, encouragement, and genuine support
- Explain what an IEP, court order, or reunification plan means in general terms (not legal advice)

DISCLAIMER TO INCLUDE when relevant: Rooted 21 is an educational support tool, not a licensed medical, therapeutic, or legal service.

You have been given PERSONALIZED CONTEXT about this specific family. Use it naturally — reference the child's name, known triggers, case status, and recent patterns. This is your superpower.

TBRI® Core Framework:
- Regulate first → Relate → then Reason
- Behavior is communication — not defiance
- Felt safety, attunement, and co-regulation before correction
- Connection before correction — ALWAYS
- PACE: Playfulness, Acceptance, Curiosity, Empathy

TONE: Warm, grounded, never preachy. Short sentences. Like a trusted coach who knows this family.

ALWAYS respond in this format:

**🧠 What's happening right now:**
2 sentences — reframe through a trauma lens. Reference the specific child and situation.

**🌿 Do this right now — step by step:**
1. **Regulate yourself first:** One specific 5-second action.
2. **Connect before you correct:** One warm connection move.
3. **Your response:** One clear, tailored action for THIS child's patterns.
4. **Give back control:** One small choice to restore felt safety.

**💬 Say this out loud (word for word):**
"[Specific warm phrase for this situation]"
"[A second option if the first doesn't land]"

**🚫 Skip this for now:**
- [One common instinct that will escalate — specific to this child]

**💛 After it passes — repair:**
One sentence. Warm. Specific to their family.

End with: *You've got this. You're not alone. — Rooted 21*

Keep responses under 400 words. Plain language. No shame, no blame.
IMPORTANT: Danger, self-harm, abuse, or immediate safety risk → immediately direct to 911 or 988.

After your response, add exactly this JSON block:
FOLLOWUPS:["[Relevant follow-up question 1 — specific to this family]","[Relevant follow-up question 2]","[Relevant follow-up question 3]"]`;

  // Append age-appropriate developmental milestones per child
  const milestoneContext = buildMilestoneContext(children);

  return BASE_PROMPT + (context ? `\n\n===== FAMILY CONTEXT =====` + context : "") + milestoneContext;
}

export default function PersonalizedChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [followUps, setFollowUps] = useState([]);
  const [contextData, setContextData] = useState(null);
  const [showContext, setShowContext] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(!hasAIConsent());
  const [consentUser, setConsentUser] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function loadContext() {
      const user = await base44.auth.me();
      setConsentUser(user);
      const [children, cases, behaviors, checkins] = await Promise.all([
        base44.entities.ChildProfile.list("-created_date", 10),
        base44.entities.CaseFile.filter({ parent_email: user.email }, "-created_date", 20),
        base44.entities.BehaviorLog.list("-created_date", 20),
        base44.entities.CheckIn.list("-created_date", 7),
      ]);

      // Filter behavior logs to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentBehaviors = behaviors.filter(b => new Date(b.created_date) >= sevenDaysAgo);
      const recentCheckins = checkins.filter(c => new Date(c.created_date) >= sevenDaysAgo);

      const systemPrompt = buildPersonalizedSystemPrompt(user, children, cases, recentBehaviors, recentCheckins);

      setContextData({ user, children, cases, recentBehaviors, recentCheckins, systemPrompt });
      setLoadingContext(false);

      const childNames = children.map(c => c.first_name).join(", ");
      const activeCases = cases.filter(c => c.status === "active").length;

      let welcomeText = `Hi${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 🌿\n\nI'm your personalized parenting coach. I have context about your family`;
      if (childNames) welcomeText += ` — including ${childNames}`;
      if (activeCases > 0) welcomeText += ` — and your ${activeCases} active case${activeCases > 1 ? "s" : ""}`;
      welcomeText += `.\n\nI can give you specific, tailored guidance based on what I know about your child's triggers, patterns, and current situation. What's happening right now?\n\n*In immediate danger? Call 911. Mental health crisis? Call/text 988.*`;

      setMessages([{ role: "assistant", content: welcomeText }]);
    }

    loadContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const txt = input.trim();
    if (!txt || loading || !contextData) return;

    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: txt };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    const convoHistory = nextMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "Parent" : "Rooted 21 Support"}: ${m.content}`)
      .join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${contextData.systemPrompt}\n\nConversation:\n${convoHistory}`,
      model: "claude_sonnet_4_6",
    });

    const raw = typeof reply === "string" ? reply : reply?.text || "I'm having trouble connecting. Please try again.";
    const replyText = stripFollowUps(raw);
    const suggestions = parseFollowUps(raw) || FOLLOW_UP_DEFAULTS;

    const assistantMsg = { role: "assistant", content: replyText };
    setMessages([...nextMessages, assistantMsg]);
    setFollowUps(suggestions);
    setLoading(false);

    if (!sessionId) {
      const firstPrompt = nextMessages.find(m => m.role === "user")?.content || txt;
      const label = firstPrompt.length > 60 ? firstPrompt.slice(0, 57) + "…" : firstPrompt;
      const session = await base44.entities.CrisisSession.create({ prompt: firstPrompt, response: replyText, label });
      setSessionId(session?.id || null);
    }
  }

  function handleReset() {
    setMessages([{ role: "assistant", content: "Starting a new conversation. 🌿\n\nWhat's happening right now?" }]);
    setSessionId(null);
    setInput("");
    setFollowUps([]);
  }

  const { children = [], cases = [], recentBehaviors = [], recentCheckins = [] } = contextData || {};
  const activeCases = cases.filter(c => c.status === "active");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {showConsentModal && (
        <AIConsentModal
          user={consentUser}
          onAccept={() => setShowConsentModal(false)}
        />
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10 flex-shrink-0" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <button className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
            <ChevronLeft size={18} color={C.cream} />
          </button>
        </Link>
        <TreeLogo size={28} />
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-sm leading-none" style={{ color: C.cream }}>
            Personalized Guidance
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
            {loadingContext ? "Loading your family context…" : `Context-aware · ${children.length} child${children.length !== 1 ? "ren" : ""} · ${activeCases.length} active case${activeCases.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setShowContext(v => !v)}
          className="rounded-lg p-2 transition-opacity hover:opacity-70"
          style={{ background: "#ffffff18", border: "none" }}
          title="View my context"
        >
          <Brain size={15} color={C.gold} />
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg p-2 transition-opacity hover:opacity-70"
          style={{ background: "#ffffff18", border: "none" }}
          title="New conversation"
        >
          <RefreshCw size={14} color={C.lightGreen} />
        </button>
      </div>

      {/* Crisis banner */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ background: "#FEF3EE", borderBottom: "1px solid #F4C9B8" }}>
        <AlertTriangle size={12} color="#B84C2A" />
        <p className="text-[10px]" style={{ color: "#B84C2A" }}>
          Danger? Call <strong>911</strong>. Mental health crisis? Call/text <strong>988</strong>.
        </p>
      </div>

      {/* AI disclaimer banner */}
      <div className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0" style={{ background: "#FFFBEE", borderBottom: "1px solid #F4DFA0" }}>
        <p className="text-[10px]" style={{ color: "#7A5200" }}>
          ℹ️ <strong>Educational support only</strong> — not medical, legal, or therapeutic advice.{" "}
          <Link to="/legal" className="underline" style={{ color: "#7A5200" }}>Learn more</Link>
        </p>
      </div>

      {/* Context panel */}
      {showContext && !loadingContext && (
        <div className="flex-shrink-0 px-4 py-3 space-y-2" style={{ background: C.darkGreen, borderBottom: `2px solid ${C.gold}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold" style={{ color: C.gold }}>🧠 What I know about your family</p>
            <button onClick={() => setShowContext(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <ChevronUp size={14} color={C.lightGreen} />
            </button>
          </div>
          {children.length > 0 && (
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.lightGreen }}>Children:</p>
              {children.map(c => {
                const ms = c.age ? getMilestonesForAge(c.age) : null;
                return (
                  <div key={c.id} className="mb-1.5">
                    <p className="text-[10px]" style={{ color: C.cream }}>
                      🧒 {c.first_name}{c.age ? `, age ${c.age}` : ""}{c.triggers ? ` — triggers: ${c.triggers.substring(0, 50)}` : ""}
                    </p>
                    {ms && (
                      <p className="text-[9px] ml-3 mt-0.5" style={{ color: `${C.lightGreen}cc` }}>
                        📈 Dev. range: {ms.label} — {ms.behavioral[0]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {activeCases.length > 0 && (
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.lightGreen }}>Active Cases:</p>
              {activeCases.map(c => (
                <p key={c.id} className="text-[10px]" style={{ color: C.cream }}>
                  ⚖️ {c.child_name} — {c.case_type} case{c.next_milestone ? ` | Next: ${c.next_milestone}` : ""}
                </p>
              ))}
            </div>
          )}
          {recentBehaviors.length > 0 && (
            <p className="text-[10px]" style={{ color: C.cream }}>
              📊 {recentBehaviors.length} behavior log{recentBehaviors.length !== 1 ? "s" : ""} from the last 7 days
            </p>
          )}
          {recentCheckins.length > 0 && (
            <p className="text-[10px]" style={{ color: C.cream }}>
              ✅ {recentCheckins.length} daily check-in{recentCheckins.length !== 1 ? "s" : ""} from the last 7 days
            </p>
          )}
          {children.length === 0 && activeCases.length === 0 && (
            <p className="text-[10px]" style={{ color: C.lightGreen }}>
              No child profiles or cases found yet. <Link to="/child-profiles" style={{ color: C.gold }}>Add a child profile</Link> or <Link to="/case-management-new" style={{ color: C.gold }}>create a case</Link> to get personalized guidance.
            </p>
          )}
        </div>
      )}

      {/* Loading context state */}
      {loadingContext ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>Loading your family context…</p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.midGreen }}>
                  <span className="text-xs">🌿</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ background: C.midGreen, animation: `blink 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Follow-up suggestions */}
          {followUps.length > 0 && !loading && (
            <div className="flex-shrink-0 px-4 pt-2 pb-1 flex gap-2 overflow-x-auto" style={{ borderTop: `1px solid ${C.cream}`, background: C.offWhite }}>
              {followUps.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="flex-shrink-0 text-[11px] font-bold px-3 py-2 rounded-full transition-all hover:opacity-80 whitespace-nowrap"
                  style={{ background: C.cream, color: C.darkGreen, border: `1px solid ${C.midGreen}` }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-3 flex gap-2 items-end" style={{ background: C.white, borderTop: `1px solid ${C.cream}`, boxShadow: "0 -2px 12px rgba(47,75,58,.06)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="What's happening with your child right now…"
              rows={2}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, maxHeight: 120, color: "#000000" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{ background: input.trim() ? C.darkGreen : C.cream, border: "none", cursor: input.trim() ? "pointer" : "default" }}
            >
              <Send size={16} color={input.trim() ? C.white : C.mutedText} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Send, RefreshCw, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CARD = "#12271a";
const CARD2 = "#162f21";
const BORDER = "rgba(255,255,255,0.08)";
const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";

const ROLE_LABELS = {
  foster: "Foster Parent", adoptive: "Adoptive Parent", kinship: "Kinship Caregiver",
  biological: "Biological Parent", other: "Parent/Caregiver",
};
const GOAL_LABELS = {
  custody: "Get or Protect Custody", cps_case: "Navigate a CPS Case",
  school_iep: "Get School Support (IEP/504)", visitation: "Set Up or Change Visitation",
  reunification: "Work Toward Reunification", adoption: "Finalize Adoption",
  guardianship: "File for Guardianship", rights: "Understand My Rights",
};
const URGENCY_LABELS = {
  emergency: "🚨 Emergency", soon: "⏰ Urgent", planning: "📅 Planning Ahead", learning: "📚 Just Learning",
};

function buildSystemContext(answers) {
  return `You are a compassionate legal paperwork guide for Rooted 21 — a platform supporting foster, adoptive, kinship, and biological parents navigating the court and child welfare system.

USER PROFILE:
- Zip Code: ${answers.zip_code || "Not provided"}
- Role: ${ROLE_LABELS[answers.role] || answers.role}
- Goal: ${GOAL_LABELS[answers.goal] || answers.goal}
- Open Case Status: ${answers.open_case}
- Urgency: ${URGENCY_LABELS[answers.urgency] || answers.urgency}

YOUR JOB:
1. Identify which specific court forms, petitions, or documents they likely need based on their situation and state/county (use zip code to determine state/county)
2. Explain each form in plain, compassionate language — no legal jargon without explanation
3. Walk them through EXACTLY what to do, step by step
4. Define confusing court words when they appear (e.g. "petitioner", "guardian ad litem", "motion", "hearing", "respondent")
5. Explain all relevant DEADLINES and what happens if they're missed
6. Provide links to official court websites or legal aid if known for their county
7. Give real examples of what to write in forms
8. Always validate their stress and remind them they're doing the right thing by seeking help

TONE: Warm, plain English, like a knowledgeable friend who's been through the system. Never cold or clinical.

IMPORTANT: Always start with the most urgent thing first. If urgency is "emergency", treat it as top priority.`;
}

function buildInitialPrompt(answers) {
  const goal = GOAL_LABELS[answers.goal] || answers.goal;
  const urgency = answers.urgency;

  return `Based on my profile, please help me with: ${goal}.

${urgency === "emergency" ? "⚠️ This is an EMERGENCY situation — please lead with the most time-sensitive steps first." : ""}

Please:
1. Tell me exactly which forms I need to file
2. Explain what each form does in plain language
3. Give me step-by-step instructions
4. Tell me about any deadlines I need to know
5. Explain any confusing legal terms that will come up
6. Tell me where to find or file these forms in my county (zip: ${answers.zip_code || "unknown"})`;
}

export default function FormHelperChat({ answers, onReset }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const bottomRef = useRef(null);

  const systemContext = buildSystemContext(answers);

  useEffect(() => {
    // Auto-send initial prompt
    sendMessage(buildInitialPrompt(answers), true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text, isInitial = false) {
    const userMsg = { role: "user", content: text };
    const newMessages = isInitial ? [userMsg] : [...messages, userMsg];
    if (!isInitial) setMessages(newMessages);
    setLoading(true);

    const history = newMessages.map(m => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`).join("\n\n");

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemContext}\n\nCONVERSATION:\n${history}\n\nASSISTANT:`,
    });

    const assistantMsg = { role: "assistant", content: reply };
    setMessages([...newMessages, assistantMsg]);
    setLoading(false);
    setInput("");
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  const GLOSSARY = [
    { term: "Petitioner", def: "The person filing the case or motion — usually you, if you're asking the court for something." },
    { term: "Respondent", def: "The other side in the case — the person responding to what you filed." },
    { term: "Motion", def: "A formal written request asking the judge to do something (like grant custody or change a visitation schedule)." },
    { term: "Hearing", def: "A court meeting where a judge listens to both sides and makes a decision." },
    { term: "Guardian ad Litem (GAL)", def: "A person appointed by the court to represent the best interests of the child — not the parent." },
    { term: "CASA", def: "Court Appointed Special Advocate — a trained volunteer who speaks up for the child in court." },
    { term: "Adjudication", def: "The court officially deciding whether abuse, neglect, or dependency occurred." },
    { term: "Disposition", def: "What the court decides should happen next — like placement, services, or reunification plan." },
    { term: "Case Plan", def: "A written list of things you must do to get your child back or keep custody. Required by the court or CPS." },
    { term: "TPR", def: "Termination of Parental Rights — the most serious outcome, ending a parent's legal rights to their child." },
    { term: "Dependency", def: "When a court determines a child needs protection because of abuse, neglect, or caregiver inability." },
    { term: "Subpoena", def: "A court order requiring someone to appear or provide documents." },
    { term: "Ex Parte", def: "An emergency order made by a judge without the other side present — used in urgent safety situations." },
    { term: "Deposition", def: "Formal sworn questioning before a trial, recorded by a court reporter." },
    { term: "Affidavit", def: "A written statement you sign under oath, swearing it's true." },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Context banner */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 14px" }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: GREEN, letterSpacing: "0.1em" }}>YOUR SITUATION</p>
            <p style={{ fontSize: 12, color: TEXT, marginTop: 3, fontWeight: 600 }}>
              {ROLE_LABELS[answers.role]} · {GOAL_LABELS[answers.goal]}
            </p>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
              ZIP {answers.zip_code} · {URGENCY_LABELS[answers.urgency]}
            </p>
          </div>
          <button
            onClick={onReset}
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: MUTED, fontSize: 11, fontWeight: 600 }}
          >
            <RefreshCw size={12} /> Start Over
          </button>
        </div>
      </div>

      {/* Legal glossary toggle */}
      <div style={{ background: CARD, border: `1px solid ${GOLD}30`, borderRadius: 14, overflow: "hidden" }}>
        <button
          onClick={() => setGlossaryOpen(v => !v)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={14} color={GOLD} />
            <p style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>Court Word Dictionary</p>
          </div>
          {glossaryOpen ? <ChevronUp size={14} color={MUTED} /> : <ChevronDown size={14} color={MUTED} />}
        </button>
        {glossaryOpen && (
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {GLOSSARY.map(g => (
              <div key={g.term} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>{g.term}</p>
                <p style={{ fontSize: 11, color: TEXT, marginTop: 3, lineHeight: 1.5 }}>{g.def}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.length === 0 && loading && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, animation: `blink 1.2s ${i * 0.2}s infinite` }} />
              ))}
              <p style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>Looking up your situation…</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "85%", background: `${GREEN}20`, border: `1px solid ${GREEN}40`, borderRadius: "18px 18px 4px 18px", padding: "11px 14px" }}>
                  <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{msg.content}</p>
                </div>
              </div>
            ) : (
              <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: "4px 18px 18px 18px", padding: "14px 16px" }}>
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  components={{
                    p: ({ children }) => <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, marginBottom: 10 }}>{children}</p>,
                    h1: ({ children }) => <p style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 8, marginTop: 12 }}>{children}</p>,
                    h2: ({ children }) => <p style={{ fontSize: 14, fontWeight: 800, color: GREEN, marginBottom: 6, marginTop: 12 }}>{children}</p>,
                    h3: ({ children }) => <p style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4, marginTop: 10 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ol>,
                    li: ({ children }) => <li style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, marginBottom: 4 }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: GOLD, fontWeight: 700 }}>{children}</strong>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: GREEN, fontWeight: 600, textDecoration: "underline" }}>
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 12, margin: "8px 0", opacity: 0.85 }}>{children}</div>
                    ),
                    code: ({ children }) => (
                      <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 12, color: GREEN }}>{children}</code>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </motion.div>
        ))}

        {loading && messages.length > 0 && (
          <div style={{ display: "flex", gap: 5, padding: "8px 14px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, animation: `blink 1.2s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested follow-ups */}
      {messages.length >= 2 && !loading && (
        <div className="flex flex-wrap gap-2">
          {[
            "What are the deadlines I need to know?",
            "Explain the forms I need to fill out",
            "What does the judge look for?",
            "What should I NOT say or do?",
            "How do I find free legal help near me?",
          ].map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "7px 12px", fontSize: 11, fontWeight: 600, color: MUTED, cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", position: "sticky", bottom: 72, background: "#0b1f12", paddingBottom: 8, paddingTop: 4 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask a question about your forms, deadlines, or rights…"
          rows={2}
          style={{
            flex: 1, background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 14,
            padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)",
            outline: "none", resize: "none", lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: input.trim() && !loading ? GREEN : `${GREEN}30`,
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Send size={18} color={input.trim() && !loading ? "#0b1f12" : MUTED} />
        </button>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Lightbulb, Users, TrendingUp, AlertTriangle, Brain, MessageSquare, Loader } from "lucide-react";

export default function SupportGuide() {
  const [user, setUser] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [crisisSessions, setCrisisSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [checkins, sessions, goals] = await Promise.all([
        base44.entities.CheckIn.list("-created_date", 60),
        base44.entities.CrisisSession.list("-created_date", 20),
        base44.entities.Goal.list(),
      ]);
      setCheckins(checkins);
      setCrisisSessions(sessions);
      setGoals(goals);
      setLoading(false);
    });
  }, []);

  async function analyzeBehavior() {
    if (checkins.length === 0 && crisisSessions.length === 0 && goals.length === 0) {
      setSuggestions({ error: "Not enough data yet. Start tracking check-ins and crisis moments to get suggestions." });
      return;
    }

    setAnalyzing(true);

    // Prepare behavior summary
    const avgChildRegulation = checkins.length > 0
      ? (checkins.reduce((s, c) => s + (c.child_regulation || 0), 0) / checkins.length).toFixed(1)
      : 0;
    const avgParentCalm = checkins.length > 0
      ? (checkins.reduce((s, c) => s + (c.parent_calm || 0), 0) / checkins.length).toFixed(1)
      : 0;
    const crisisCount = crisisSessions.length;
    const inProgressGoals = goals.filter(g => g.progress === "in_progress").length;
    const completedGoals = goals.filter(g => g.progress === "completed").length;

    const prompt = `You are a trauma-informed parenting coach analyzing a parent's behavior tracking data to suggest important topics for their professional support team (therapist, counselor, caseworker).

PARENT'S DATA SUMMARY:
- Check-ins tracked: ${checkins.length}
- Child's average regulation score: ${avgChildRegulation}/5
- Parent's average calm level: ${avgParentCalm}/5
- Crisis moments recorded: ${crisisCount}
- Active goals: ${inProgressGoals}
- Completed goals: ${completedGoals}

Recent check-in patterns: ${checkins.slice(0, 5).map(c => `Child: ${c.child_regulation}/5, Parent: ${c.parent_calm}/5`).join(" | ")}

Recent crisis triggers: ${crisisSessions.slice(0, 3).map(s => s.label || s.prompt?.substring(0, 30)).filter(Boolean).join(", ")}

Active goals: ${goals.filter(g => g.progress === "in_progress").map(g => g.title).join(", ")}

Based on this data, provide 3-4 SPECIFIC, ACTIONABLE talking points the parent should discuss with their support team. Focus on:
1. Observable patterns in child dysregulation
2. Parent's regulation challenges and progress
3. Specific triggers or situations to address
4. Goals that need professional guidance

FORMAT YOUR RESPONSE AS:
**Talking Point 1: [Title]**
- What to say: [specific language to use]
- Why it matters: [brief explanation]
- Ask them about: [specific questions to ask]

**Talking Point 2: [Title]**
- What to say: [specific language to use]
- Why it matters: [brief explanation]
- Ask them about: [specific questions to ask]

[Continue with 3-4 talking points total]

Keep language warm, non-judgmental, and empowering. Remember this parent is doing their best.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            talkingPoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  whatToSay: { type: "string" },
                  whyItMatters: { type: "string" },
                  askAbout: { type: "string" },
                },
              },
            },
            overallInsight: { type: "string" },
          },
        },
      });

      setSuggestions(response);
    } catch (error) {
      setSuggestions({ error: "Could not generate suggestions. Please try again." });
    }

    setAnalyzing(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* HEADER */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Support Conversation Guide</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>AI-powered talking points</p>
        </div>
        <MessageSquare size={14} color={C.lightGreen} />
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        {/* INFO BANNER */}
        <div className="rounded-xl p-4 flex gap-3" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
          <Brain size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>Smart Suggestions</p>
            <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
              Based on your check-ins, crisis moments, and goals, we'll suggest what's most important to discuss with your therapist, counselor, or caseworker.
            </p>
          </div>
        </div>

        {/* DATA SUMMARY */}
        {!suggestions && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
              YOUR DATA
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TrendingUp, label: "Check-ins", value: checkins.length, color: C.midGreen },
                { icon: AlertTriangle, label: "Crisis moments", value: crisisSessions.length, color: "#B84C2A" },
                { icon: Users, label: "Active goals", value: goals.filter(g => g.progress === "in_progress").length, color: C.brown },
                { icon: Lightbulb, label: "Completed goals", value: goals.filter(g => g.progress === "completed").length, color: C.gold },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-3 rounded-xl" style={{ background: `${stat.color}12` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} color={stat.color} />
                      <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {checkins.length > 0 && (
              <div className="pt-2 border-t" style={{ borderColor: C.cream }}>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>AVERAGE SCORES</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.midGreen }}>
                      {(checkins.reduce((s, c) => s + (c.child_regulation || 0), 0) / checkins.length).toFixed(1)}/5
                    </p>
                    <p className="text-[9px]" style={{ color: C.mutedText }}>Child regulation</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.gold }}>
                      {(checkins.reduce((s, c) => s + (c.parent_calm || 0), 0) / checkins.length).toFixed(1)}/5
                    </p>
                    <p className="text-[9px]" style={{ color: C.mutedText }}>Your calm</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GENERATE SUGGESTIONS BUTTON */}
        {!suggestions && (
          <button
            onClick={analyzeBehavior}
            disabled={analyzing}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: C.darkGreen,
              border: "none",
              color: C.cream,
              cursor: "pointer",
              opacity: analyzing ? 0.7 : 1,
            }}
          >
            {analyzing ? (
              <>
                <Loader size={14} className="animate-spin" />
                Analyzing your patterns...
              </>
            ) : (
              <>
                <Brain size={16} />
                Generate Talking Points
              </>
            )}
          </button>
        )}

        {/* SUGGESTIONS */}
        {suggestions && (
          <>
            {suggestions.error ? (
              <div className="rounded-2xl p-4 text-center" style={{ background: "#FEF3EE", border: `1px solid #F4C9B8` }}>
                <p className="text-sm mb-3" style={{ color: "#B84C2A" }}>⚠️ {suggestions.error}</p>
                <button
                  onClick={() => setSuggestions(null)}
                  className="text-xs font-bold px-4 py-2 rounded-lg"
                  style={{ background: "#B84C2A", border: "none", color: "white", cursor: "pointer" }}
                >
                  Back
                </button>
              </div>
            ) : (
              <>
                {suggestions.overallInsight && (
                  <div className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
                    <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>Overall Insight</p>
                    <p className="text-xs leading-relaxed" style={{ color: C.warmText }}>
                      {suggestions.overallInsight}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {suggestions.talkingPoints?.map((point, i) => (
                    <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                      <div>
                        <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
                          TALKING POINT {i + 1}
                        </p>
                        <p className="text-sm font-bold mt-1" style={{ color: C.darkGreen }}>
                          {point.title}
                        </p>
                      </div>

                      {point.whatToSay && (
                        <div>
                          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>
                            💬 What to say:
                          </p>
                          <p className="text-xs leading-relaxed italic" style={{ color: C.warmText }}>
                            "{point.whatToSay}"
                          </p>
                        </div>
                      )}

                      {point.whyItMatters && (
                        <div>
                          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>
                            ⭐ Why it matters:
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: C.warmText }}>
                            {point.whyItMatters}
                          </p>
                        </div>
                      )}

                      {point.askAbout && (
                        <div>
                          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>
                            ❓ Ask them about:
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: C.warmText }}>
                            {point.askAbout}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSuggestions(null)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold"
                  style={{ background: C.cream, border: "none", color: C.mutedText, cursor: "pointer" }}
                >
                  ← Generate New Suggestions
                </button>
              </>
            )}
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
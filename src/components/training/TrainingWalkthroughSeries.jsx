import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { DEFAULT_TUTORIALS, mergeTutorialOverrides } from "@/lib/tutorial-content";
import InteractiveTutorialPlayer from "@/components/training/InteractiveTutorialPlayer";
import TutorialScriptEditor from "@/components/training/TutorialScriptEditor";
import { ArrowRight, CheckCircle2, Headphones, PenLine, PlayCircle, RotateCcw } from "lucide-react";

export default function TrainingWalkthroughSeries({ compact = false }) {
  const [tutorials, setTutorials] = useState(DEFAULT_TUTORIALS);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [me, scripts] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.TutorialScript.list("-updated_date", 100).catch(() => []),
    ]);
    setUser(me);
    setTutorials(mergeTutorialOverrides(scripts));
    if (me?.email) {
      const records = await base44.entities.TutorialProgress.filter({ user_email: me.email }, "-updated_date", 1).catch(() => []);
      setProgress(records[0] || { user_email: me.email, completed_section_ids: [] });
    }
  }

  const visibleTutorials = useMemo(() => compact ? tutorials.slice(0, 3) : tutorials, [compact, tutorials]);
  const completed = progress?.completed_section_ids || [];
  const completionPct = tutorials.length ? Math.round((completed.length / tutorials.length) * 100) : 0;

  async function markComplete(sectionId) {
    if (!user?.email) return;
    const nextCompleted = Array.from(new Set([...(progress?.completed_section_ids || []), sectionId]));
    const payload = { user_email: user.email, completed_section_ids: nextCompleted, last_section_id: sectionId, last_step_index: 0, updated_at: new Date().toISOString() };
    const updated = progress?.id
      ? await base44.entities.TutorialProgress.update(progress.id, payload)
      : await base44.entities.TutorialProgress.create(payload);
    setProgress(updated);
  }

  return (
    <div className="rounded-[28px] p-4 space-y-4" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 18px 48px rgba(61,40,23,0.10)", backdropFilter: "blur(18px)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: C.midGreen }}>START HERE</p>
          <h2 className="font-serif font-bold text-xl mt-1" style={{ color: C.darkGreen }}>Interactive App Walkthroughs</h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.mutedText }}>Calming voice-guided tutorials with click prompts, button glow, replay, and progress tracking.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.midGreen}18` }}>
          <Headphones size={24} color={C.midGreen} />
        </div>
      </div>

      <div className="rounded-2xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <div className="flex justify-between text-[10px] font-bold mb-2" style={{ color: C.mutedText }}><span>Your tutorial progress</span><span>{completionPct}%</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: C.cream }}><div className="h-full rounded-full transition-all" style={{ background: C.midGreen, width: `${completionPct}%` }} /></div>
      </div>

      <div className="space-y-2">
        {visibleTutorials.map(tutorial => {
          const isDone = completed.includes(tutorial.section_id);
          return (
            <div key={tutorial.section_id} className="rounded-2xl p-3 flex gap-3 items-start" style={{ background: "rgba(250,246,241,0.86)", border: `1px solid ${isDone ? C.midGreen : C.cream}` }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: isDone ? `${C.midGreen}20` : "#fff" }}>{tutorial.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{tutorial.title}</p>
                  {isDone && <CheckCircle2 size={14} color={C.midGreen} />}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.mutedText }}>{tutorial.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => setSelected(tutorial)} className="rounded-xl px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>
                    {isDone ? <RotateCcw size={12} /> : <PlayCircle size={12} />} {isDone ? "Replay tutorial" : "Start tutorial"}
                  </button>
                  {user?.role === "founder" && (
                    <button onClick={() => setEditing(editing === tutorial.section_id ? null : tutorial.section_id)} className="rounded-xl px-3 py-2 text-[11px] font-bold flex items-center gap-1.5" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>
                      <PenLine size={12} /> Edit script
                    </button>
                  )}
                </div>
                {editing === tutorial.section_id && <div className="mt-3"><TutorialScriptEditor tutorial={tutorial} onSaved={load} /></div>}
              </div>
            </div>
          );
        })}
      </div>

      {compact && (
        <Link to="/training-videos" className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2" style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
          View all interactive walkthroughs <ArrowRight size={13} />
        </Link>
      )}

      {selected && <InteractiveTutorialPlayer tutorial={selected} onClose={() => setSelected(null)} onComplete={markComplete} />}
    </div>
  );
}
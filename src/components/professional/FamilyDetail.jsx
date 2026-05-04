import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, CheckCircle2, Circle, FileText, Plus, Save } from "lucide-react";
import { LESSONS } from "@/lib/lessons-data";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

function fmt(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export default function FamilyDetail({ family, checkins, lessons, goals, notes: initialNotes, onBack, onNoteSaved }) {
  const [tab, setTab] = useState("overview");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ note: "", recommendation: "" });
  const [notes, setNotes] = useState(initialNotes || []);
  const [saving, setSaving] = useState(false);

  const completedLessons = lessons.filter(l => l.completed).length;
  const progressPct = Math.round((completedLessons / 21) * 100);
  const completedGoals = goals.filter(g => g.progress === "completed").length;

  const chartData = checkins.slice(-20).map(c => ({
    date: fmt(c.created_date),
    "Child Reg.": c.child_regulation,
    "Parent Calm": c.parent_calm,
  }));

  const avgReg = checkins.length
    ? (checkins.reduce((a, c) => a + (c.child_regulation || 0), 0) / checkins.length).toFixed(1)
    : "–";
  const avgCalm = checkins.length
    ? (checkins.reduce((a, c) => a + (c.parent_calm || 0), 0) / checkins.length).toFixed(1)
    : "–";

  async function handleAddNote() {
    if (!noteForm.note.trim()) return;
    setSaving(true);
    const n = await base44.entities.ProfessionalNote.create({
      family_email: family.family_email,
      child_name: family.child_name || "",
      note: noteForm.note,
      recommendation: noteForm.recommendation,
      professional_name: "",
      professional_role: family.professional_role || "",
    });
    setNotes(prev => [n, ...prev]);
    setNoteForm({ note: "", recommendation: "" });
    setShowNoteForm(false);
    setSaving(false);
    onNoteSaved?.();
  }

  const TABS = ["overview", "trends", "lessons", "notes"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10 flex-shrink-0" style={{ background: C.darkGreen }}>
        <button onClick={onBack} className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-sm truncate" style={{ color: C.cream }}>
            {family.family_name || family.family_email}
          </p>
          {family.child_name && (
            <p className="text-[10px]" style={{ color: C.lightGreen }}>🧒 {family.child_name}</p>
          )}
        </div>
        <button
          onClick={() => setShowNoteForm(true)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-bold"
          style={{ background: C.gold, border: "none", color: C.darkGreen }}
        >
          <Plus size={12} /> Note
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex flex-shrink-0" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-[11px] font-bold capitalize transition-all"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? `2.5px solid ${C.darkGreen}` : "2.5px solid transparent",
              color: tab === t ? C.darkGreen : C.mutedText,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-[600px] mx-auto w-full">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Lessons Done", value: `${completedLessons}/21`, sub: `${progressPct}% complete`, color: C.midGreen },
                { label: "Goals Completed", value: `${completedGoals}/${goals.length}`, sub: "total goals", color: C.brown },
                { label: "Avg Child Reg.", value: avgReg, sub: "out of 5", color: avgReg >= 3.5 ? C.midGreen : avgReg >= 2.5 ? C.gold : "#B84C2A" },
                { label: "Avg Parent Calm", value: avgCalm, sub: `${checkins.length} check-ins`, color: C.gold },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <p className="text-2xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: C.darkGreen }}>{s.label}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Lesson progress bar */}
            <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex justify-between mb-1.5">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Program Progress</p>
                <p className="text-xs font-bold" style={{ color: C.midGreen }}>{progressPct}%</p>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: C.midGreen }} />
              </div>
            </div>

            {/* Active goals */}
            {goals.filter(g => g.progress === "in_progress").length > 0 && (
              <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>Active Goals</p>
                {goals.filter(g => g.progress === "in_progress").map(g => (
                  <div key={g.id} className="flex items-start gap-2 py-1.5 border-b last:border-b-0" style={{ borderColor: C.cream }}>
                    <Circle size={12} color={C.gold} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{g.title}</p>
                      {g.who_is_helping && <p className="text-[10px]" style={{ color: C.mutedText }}>👤 {g.who_is_helping}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Latest reflections */}
            {checkins.filter(c => c.note).length > 0 && (
              <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>Recent Reflections</p>
                {checkins.filter(c => c.note).slice(0, 3).map(c => (
                  <div key={c.id} className="rounded-lg px-3 py-2 mb-1.5" style={{ background: C.cream, borderLeft: `3px solid ${C.brown}` }}>
                    <p className="text-xs italic" style={{ color: C.darkGreen }}>"{c.note}"</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>{fmt(c.created_date)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TRENDS TAB ── */}
        {tab === "trends" && (
          <>
            {checkins.length < 2 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-2xl mb-2">🌱</p>
                <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No check-in data yet</p>
                <p className="text-xs mt-1" style={{ color: C.mutedText }}>Check-in trends will appear here once the family completes sessions.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>Regulation Trends ({checkins.length} sessions)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} />
                      <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: C.mutedText }} />
                      <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.cream}`, borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="Child Reg." stroke={C.midGreen} strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Parent Calm" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* All check-in records */}
                <div className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>All Check-Ins</p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {checkins.map(c => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: C.offWhite }}>
                        <span className="text-[10px]" style={{ color: C.mutedText }}>{fmt(c.created_date)}</span>
                        <span className="text-xs font-bold" style={{ color: C.midGreen }}>🧒 {c.child_regulation}/5</span>
                        <span className="text-xs font-bold" style={{ color: C.gold }}>🌿 {c.parent_calm}/5</span>
                        {c.note && <span className="text-[10px] italic truncate flex-1" style={{ color: C.mutedText }}>"{c.note}"</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── LESSONS TAB ── */}
        {tab === "lessons" && (
          <div className="space-y-1.5">
            {LESSONS.map(lesson => {
              const done = lessons.find(l => l.lesson_id === lesson.id && l.completed);
              return (
                <div key={lesson.id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                  style={{ background: done ? "#F0F6F0" : C.white, border: `1px solid ${done ? C.midGreen : C.cream}` }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? C.midGreen : C.cream }}>
                    {done
                      ? <CheckCircle2 size={14} color="white" />
                      : <span className="text-xs">{lesson.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px]" style={{ color: C.mutedText }}>Week {lesson.week} · Lesson {lesson.id}</p>
                    <p className="text-xs font-bold truncate" style={{ color: C.darkGreen }}>{lesson.title}</p>
                  </div>
                  {done && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.midGreen, color: "white" }}>Done</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── NOTES TAB ── */}
        {tab === "notes" && (
          <>
            {showNoteForm && (
              <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
                <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>New Note for {family.family_name || family.family_email}</p>
                <textarea
                  value={noteForm.note}
                  onChange={e => setNoteForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Observation, concern, or session note *"
                  rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none mb-2"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                />
                <textarea
                  value={noteForm.recommendation}
                  onChange={e => setNoteForm(f => ({ ...f, recommendation: e.target.value }))}
                  placeholder="Recommendation (optional)"
                  rows={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none mb-3"
                  style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowNoteForm(false)} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.cream, color: C.mutedText }}>Cancel</button>
                  <button onClick={handleAddNote} disabled={saving || !noteForm.note.trim()} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}>
                    {saving ? "Saving…" : "Save Note"}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 && !showNoteForm && (
              <div className="text-center py-10 rounded-2xl" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <FileText size={28} color={C.cream} className="mx-auto mb-2" />
                <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No notes yet</p>
                <button onClick={() => setShowNoteForm(true)} className="mt-3 text-xs font-bold px-4 py-2 rounded-lg border-none" style={{ background: C.darkGreen, color: C.white }}>
                  + Add First Note
                </button>
              </div>
            )}

            {notes.map(n => (
              <div key={n.id} className="rounded-xl p-3.5" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-sm leading-relaxed" style={{ color: C.darkGreen }}>{n.note}</p>
                {n.recommendation && (
                  <div className="mt-2 rounded-lg px-3 py-2" style={{ background: C.offWhite, borderLeft: `3px solid ${C.gold}` }}>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: C.brown }}>Recommendation</p>
                    <p className="text-xs" style={{ color: C.darkGreen }}>{n.recommendation}</p>
                  </div>
                )}
                <p className="text-[10px] mt-2" style={{ color: C.mutedText }}>{new Date(n.created_date).toLocaleDateString()}</p>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
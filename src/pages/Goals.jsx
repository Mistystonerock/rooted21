import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Plus, Target, CheckCircle2, Circle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: C.mutedText, bg: C.cream, icon: Circle },
  in_progress: { label: "In Progress", color: C.brown, bg: "#FDF3E8", icon: Clock },
  completed: { label: "Completed", color: C.midGreen, bg: "#E8F4EA", icon: CheckCircle2 },
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", who_is_helping: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Goal.list("-created_date", 50).then(setGoals);
  }, []);

  async function handleAdd() {
    if (!form.title.trim()) return;
    setSaving(true);
    const g = await base44.entities.Goal.create({ ...form, progress: "not_started" });
    setGoals(prev => [g, ...prev]);
    setForm({ title: "", description: "", who_is_helping: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleStatusChange(goal, progress) {
    await base44.entities.Goal.update(goal.id, { progress });
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, progress } : g));
  }

  async function handleDelete(id) {
    await base44.entities.Goal.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  const active = goals.filter(g => g.progress !== "completed");
  const done = goals.filter(g => g.progress === "completed");

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <p className="font-serif font-bold" style={{ color: C.cream }}>My Goals</p>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: C.gold, border: "none", color: C.darkGreen }}
        >
          <Plus size={13} /> New Goal
        </button>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-3">
        {showForm && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm mb-3" style={{ color: C.darkGreen }}>New Goal</p>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Goal title *"
              className="w-full rounded-xl px-3 py-2.5 text-sm mb-2 font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              rows={2}
              className="w-full rounded-xl px-3 py-2.5 text-sm mb-2 font-sans resize-none"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
            <input
              value={form.who_is_helping}
              onChange={e => setForm(f => ({ ...f, who_is_helping: e.target.value }))}
              placeholder="Who is helping? (e.g. therapist, caseworker)"
              className="w-full rounded-xl px-3 py-2.5 text-sm mb-3 font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.cream, color: C.mutedText }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 rounded-xl border-none font-bold text-sm" style={{ background: C.darkGreen, color: C.white, cursor: "pointer" }}>
                {saving ? "Saving…" : "Add Goal"}
              </button>
            </div>
          </div>
        )}

        {active.length === 0 && !showForm && (
          <div className="text-center py-12 rounded-2xl" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
            <Target size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No active goals yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add a goal to start tracking your growth.</p>
          </div>
        )}

        {active.map(goal => {
          const cfg = STATUS_CONFIG[goal.progress];
          const Icon = cfg.icon;
          return (
            <div key={goal.id} className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{goal.title}</p>
                  {goal.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.mutedText }}>{goal.description}</p>}
                  {goal.who_is_helping && <p className="text-[11px] mt-1" style={{ color: C.midGreen }}>👤 {goal.who_is_helping}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {["not_started", "in_progress", "completed"].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(goal, s)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: goal.progress === s ? STATUS_CONFIG[s].bg : C.offWhite,
                      border: `1.5px solid ${goal.progress === s ? STATUS_CONFIG[s].color : C.cream}`,
                      color: goal.progress === s ? STATUS_CONFIG[s].color : C.mutedText,
                    }}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {done.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-2 pt-2" style={{ color: C.mutedText }}>COMPLETED ({done.length})</p>
            {done.map(goal => (
              <div key={goal.id} className="rounded-xl p-3 mb-2 flex items-center gap-3" style={{ background: "#E8F4EA", border: `1px solid ${C.midGreen}` }}>
                <CheckCircle2 size={16} color={C.midGreen} />
                <p className="text-sm line-through flex-1" style={{ color: C.mutedText }}>{goal.title}</p>
                <button onClick={() => handleDelete(goal.id)} className="text-[11px]" style={{ color: C.mutedText }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
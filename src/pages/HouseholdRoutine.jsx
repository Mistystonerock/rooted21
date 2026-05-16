import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import ChildSelector from "@/components/children/ChildSelector";
import { filterRecordsForChild, getChildDisplayName, withChildLink } from "@/lib/child-selection";

const ROUTINE_TYPES = ["morning", "after_school", "bedtime", "weekend"];
const EMOJIS = ["🛏️", "🍳", "🚿", "🎒", "📚", "🎮", "🍽️", "🧸", "🌙", "⏰"];

export default function HouseholdRoutine() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [allRoutines, setAllRoutines] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    routine_type: "morning",
    tasks: [],
    applies_to_all_children: false,
  });
  const [newTask, setNewTask] = useState({ label: "", emoji: "🛏️", duration_min: 15 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const myRoutines = await base44.entities.DailySchedule.list("-created_date", 200);
      setAllRoutines(myRoutines);
      setRoutines(myRoutines);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = formData.applies_to_all_children ? allRoutines : filterRecordsForChild(allRoutines, child).filter(r => r.applies_to_all_children || !r.child_id || r.child_id === child?.id);
    setRoutines(child ? filtered : allRoutines);
  }, [allRoutines, child]);

  const handleAddTask = () => {
    if (newTask.label.trim()) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { id: Date.now(), ...newTask }],
      });
      setNewTask({ label: "", emoji: "🛏️", duration_min: 15 });
    }
  };

  const handleRemoveTask = (taskId) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter(t => t.id !== taskId),
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      await base44.entities.DailySchedule.update(editingId, {
        name: formData.name,
        routine_type: formData.routine_type,
        tasks: formData.tasks,
        ...withChildLink({}, formData.applies_to_all_children ? null : child),
        child_name: formData.applies_to_all_children ? "All children" : getChildDisplayName(child),
        applies_to_all_children: formData.applies_to_all_children,
      });
    } else {
      await base44.entities.DailySchedule.create({
        name: formData.name,
        routine_type: formData.routine_type,
        tasks: formData.tasks,
        ...withChildLink({}, formData.applies_to_all_children ? null : child),
        child_name: formData.applies_to_all_children ? "All children" : getChildDisplayName(child),
        applies_to_all_children: formData.applies_to_all_children,
        is_active: true,
      });
    }

    const myRoutines = await base44.entities.DailySchedule.list("-created_date", 200);
    setAllRoutines(myRoutines);
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", routine_type: "morning", tasks: [], applies_to_all_children: false });
  };

  const handleDelete = async (id) => {
    await base44.entities.DailySchedule.delete(id);
    setAllRoutines(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = (routine) => {
    setFormData({
      name: routine.name,
      routine_type: routine.routine_type,
      tasks: routine.tasks || [],
      applies_to_all_children: !!routine.applies_to_all_children,
    });
    setEditingId(routine.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>My Household Routine</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Your household schedules</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        <ChildSelector selectedChild={child} onChange={setChild} />

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>ROUTINE NAME</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Morning Routine, Bedtime..."
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>TYPE</label>
              <select
                value={formData.routine_type}
                onChange={(e) => setFormData({...formData, routine_type: e.target.value})}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
              >
                {ROUTINE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>

            <label className="flex items-center gap-2 rounded-xl p-3 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>
              <input type="checkbox" checked={formData.applies_to_all_children} onChange={e => setFormData({ ...formData, applies_to_all_children: e.target.checked })} />
              Apply this routine to all children
            </label>

            {/* Tasks */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: C.darkGreen }}>TASKS</p>
              <div className="space-y-2 mb-3">
                {formData.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{task.emoji}</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{task.label}</p>
                        <p className="text-[10px]" style={{ color: C.mutedText }}>{task.duration_min} min</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveTask(task.id)} className="p-1" style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} color={C.mutedText} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-lg p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <input
                  type="text"
                  value={newTask.label}
                  onChange={(e) => setNewTask({...newTask, label: e.target.value})}
                  placeholder="Task name"
                  className="w-full rounded-lg px-2 py-1.5 text-xs"
                  style={{ border: `1px solid ${C.cream}`, background: C.white }}
                />
                <div className="flex gap-2">
                  <select
                    value={newTask.emoji}
                    onChange={(e) => setNewTask({...newTask, emoji: e.target.value})}
                    className="flex-1 rounded-lg px-2 py-1.5 text-xs"
                    style={{ border: `1px solid ${C.cream}`, background: C.white }}
                  >
                    {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input
                    type="number"
                    value={newTask.duration_min}
                    onChange={(e) => setNewTask({...newTask, duration_min: parseInt(e.target.value) || 15})}
                    placeholder="min"
                    min="1"
                    className="w-16 rounded-lg px-2 py-1.5 text-xs"
                    style={{ border: `1px solid ${C.cream}`, background: C.white }}
                  />
                </div>
                <button
                  onClick={handleAddTask}
                  className="w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
                >
                  <Plus size={12} /> Add Task
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", routine_type: "morning", tasks: [], applies_to_all_children: false });
                }}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold"
                style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold"
                style={{
                  background: C.darkGreen,
                  color: C.cream,
                  border: "none",
                  cursor: formData.name.trim() ? "pointer" : "default",
                  opacity: formData.name.trim() ? 1 : 0.5,
                }}
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        )}

        {/* Routines list */}
        {!showForm && (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: C.midGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              <Plus size={14} /> Add Routine
            </button>

            {routines.length === 0 ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <p className="text-sm" style={{ color: C.mutedText }}>No routines yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map(routine => (
                  <div key={routine.id} className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{routine.name}</p>
                        <p className="text-[10px]" style={{ color: C.mutedText }}>{routine.routine_type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(routine)} className="p-1.5 rounded-lg" style={{ background: C.offWhite, border: "none", cursor: "pointer" }}>
                          <Edit2 size={12} color={C.midGreen} />
                        </button>
                        <button onClick={() => handleDelete(routine.id)} className="p-1.5 rounded-lg" style={{ background: C.offWhite, border: "none", cursor: "pointer" }}>
                          <Trash2 size={12} color={C.brown} />
                        </button>
                      </div>
                    </div>
                    {routine.tasks && routine.tasks.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {routine.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-2 text-xs" style={{ color: C.mutedText }}>
                            <span>{task.emoji}</span>
                            <span>{task.label}</span>
                            <span className="ml-auto text-[9px]">{task.duration_min}m</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}
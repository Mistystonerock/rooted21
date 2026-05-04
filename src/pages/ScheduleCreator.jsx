import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { C } from "@/lib/rooted-constants";
import { ROUTINE_META } from "@/lib/schedule-tasks";
import {
  ChevronLeft, Plus, Save, Trash2, Eye, EyeOff, PencilLine,
  CheckCircle2, LayoutList, Sparkles
} from "lucide-react";
import TaskBlock from "@/components/schedule/TaskBlock";
import TaskLibraryPanel from "@/components/schedule/TaskLibraryPanel";
import SchedulePreview from "@/components/schedule/SchedulePreview";
import CustomTaskForm from "@/components/schedule/CustomTaskForm";

let idCounter = 1;
function uid() { return `task_${Date.now()}_${idCounter++}`; }

const ROUTINE_TYPES = Object.entries(ROUTINE_META).map(([key, v]) => ({ key, ...v }));

const DEFAULT_SCHEDULE = {
  name: "",
  routine_type: "morning",
  tasks: [],
  child_name: "",
  is_active: true,
};

export default function ScheduleCreator() {
  const [schedules, setSchedules] = useState([]);
  const [editing, setEditing] = useState(null); // schedule object being edited
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "edit"
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    base44.entities.DailySchedule.list("-created_date", 50).then(s => {
      setSchedules(s);
      setLoading(false);
    });
  }, []);

  // ── CREATE NEW ──
  function startNew() {
    setEditing({ ...DEFAULT_SCHEDULE, tasks: [] });
    setShowPreview(false);
    setView("edit");
  }

  function openEdit(schedule) {
    setEditing({ ...schedule, tasks: schedule.tasks ? [...schedule.tasks] : [] });
    setView("edit");
    setShowPreview(false);
  }

  // ── DRAG END ──
  function onDragEnd(result) {
    if (!result.destination) return;
    const tasks = Array.from(editing.tasks);
    const [moved] = tasks.splice(result.source.index, 1);
    tasks.splice(result.destination.index, 0, moved);
    setEditing(prev => ({ ...prev, tasks }));
  }

  // ── MOVE UP/DOWN ──
  function moveTask(index, dir) {
    const tasks = [...editing.tasks];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= tasks.length) return;
    [tasks[index], tasks[newIdx]] = [tasks[newIdx], tasks[index]];
    setEditing(prev => ({ ...prev, tasks }));
  }

  // ── ADD FROM LIBRARY ──
  function addFromLibrary(task) {
    const newTask = { ...task, id: uid() };
    setEditing(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  }

  // ── ADD CUSTOM ──
  function addCustomTask(task) {
    setEditing(prev => ({ ...prev, tasks: [...prev.tasks, { ...task, id: uid() }] }));
    setShowCustomForm(false);
  }

  // ── DELETE TASK ──
  function deleteTask(id) {
    setEditing(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }

  // ── SAVE ──
  async function handleSave() {
    if (!editing.name.trim()) return;
    setSaving(true);
    const data = { ...editing };
    let result;
    if (editing.id) {
      result = await base44.entities.DailySchedule.update(editing.id, data);
      setSchedules(prev => prev.map(s => s.id === editing.id ? result : s));
    } else {
      result = await base44.entities.DailySchedule.create(data);
      setSchedules(prev => [result, ...prev]);
    }
    setEditing(result);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── DELETE SCHEDULE ──
  async function handleDelete(id) {
    await base44.entities.DailySchedule.delete(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    if (editing?.id === id) { setEditing(null); setView("list"); }
    setDeleteId(null);
  }

  const meta = editing ? (ROUTINE_META[editing.routine_type] || ROUTINE_META.custom) : null;
  const totalMin = editing?.tasks?.reduce((s, t) => s + (t.duration_min || 0), 0) || 0;

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
          <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Visual Schedule Creator</p>
            <p className="text-[10px]" style={{ color: C.lightGreen }}>Build daily routines with visual cues</p>
          </div>
          <button
            onClick={startNew}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
            style={{ background: C.gold, border: "none", color: C.darkGreen, cursor: "pointer" }}
          >
            <Plus size={13} /> New
          </button>
        </div>

        <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
          {/* Intro banner */}
          <div className="rounded-xl p-3.5 flex gap-3" style={{ background: "#FFF8E8", border: `1px solid ${C.gold}` }}>
            <Sparkles size={16} color={C.gold} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: C.warmText }}>
              Predictable routines build <strong>felt safety</strong> for children from hard places.
              Visual schedules reduce anxiety about what comes next.
            </p>
          </div>

          {loading && (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full mx-auto animate-spin"
                style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
            </div>
          )}

          {!loading && schedules.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
              <p className="text-3xl mb-3">🗓️</p>
              <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>No schedules yet</p>
              <p className="text-xs mb-4" style={{ color: C.mutedText }}>
                Create your first visual routine to help your child know what to expect each day.
              </p>
              <button onClick={startNew}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: C.darkGreen, border: "none", color: C.white, cursor: "pointer" }}>
                <Plus size={13} /> Create First Schedule
              </button>
            </div>
          )}

          <div className="space-y-3">
            {schedules.map(s => {
              const m = ROUTINE_META[s.routine_type] || ROUTINE_META.custom;
              const mins = s.tasks?.reduce((a, t) => a + (t.duration_min || 0), 0) || 0;
              return (
                <div key={s.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1.5px solid ${m.color}40` }}
                >
                  {/* Color header bar */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ background: m.color }}>
                    <span className="text-xl">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-sm" style={{ color: "white" }}>{s.name}</p>
                      <p className="text-[10px] opacity-75" style={{ color: "white" }}>
                        {s.child_name ? `For ${s.child_name} · ` : ""}{s.tasks?.length || 0} steps · {mins} min
                      </p>
                    </div>
                    <button onClick={() => openEdit(s)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold"
                      style={{ background: "#ffffff25", border: "none", color: "white", cursor: "pointer" }}>
                      <PencilLine size={11} /> Edit
                    </button>
                  </div>

                  {/* Task emoji strip */}
                  {s.tasks?.length > 0 && (
                    <div className="px-3 py-2.5 flex items-center gap-1.5 overflow-x-auto" style={{ background: C.white }}>
                      {s.tasks.map((t, i) => (
                        <div key={t.id || i} className="flex flex-col items-center flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: `${t.color}20` }}>
                            {t.emoji}
                          </div>
                          <p className="text-[8px] mt-0.5 text-center max-w-[40px] leading-tight"
                            style={{ color: C.mutedText }}>{t.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="px-3 pb-2.5 flex gap-2" style={{ background: C.white }}>
                    <button
                      onClick={() => setDeleteId(deleteId === s.id ? null : s.id)}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                      style={{ background: "#B84C2A12", border: "none", color: "#B84C2A", cursor: "pointer" }}>
                      <Trash2 size={10} /> Delete
                    </button>
                    {deleteId === s.id && (
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ background: "#B84C2A", border: "none", color: "white", cursor: "pointer" }}>
                        Confirm Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pb-6" />
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={20} color={C.cream} />
        </button>
        <div className="flex-1 min-w-0">
          {editing?.name ? (
            <p className="font-serif font-bold text-sm truncate" style={{ color: C.cream }}>
              {meta?.emoji} {editing.name}
            </p>
          ) : (
            <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>New Schedule</p>
          )}
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            {editing?.tasks?.length || 0} tasks · {totalMin} min
          </p>
        </div>
        <button
          onClick={() => setShowPreview(p => !p)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold"
          style={{ background: "#ffffff18", border: "none", color: C.lightGreen, cursor: "pointer" }}
        >
          {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
          {showPreview ? "Edit" : "Preview"}
        </button>
        <button
          onClick={handleSave}
          disabled={!editing?.name?.trim() || saving}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
          style={{ background: saved ? C.midGreen : C.gold, border: "none", color: C.darkGreen, cursor: "pointer" }}
        >
          {saved ? <><CheckCircle2 size={12} /> Saved!</> : <><Save size={12} /> {saving ? "Saving…" : "Save"}</>}
        </button>
      </div>

      {/* PREVIEW MODE */}
      {showPreview ? (
        <div className="max-w-[540px] mx-auto px-4 py-5">
          <SchedulePreview schedule={editing} />
          <div className="pb-6" />
        </div>
      ) : (
        <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">

          {/* ── SCHEDULE META ── */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            {/* Routine type */}
            <div>
              <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
                ROUTINE TYPE
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROUTINE_TYPES.map(rt => (
                  <button
                    key={rt.key}
                    onClick={() => setEditing(p => ({ ...p, routine_type: rt.key }))}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      background: editing?.routine_type === rt.key ? rt.color : `${rt.color}15`,
                      color: editing?.routine_type === rt.key ? "white" : rt.color,
                      border: "none", cursor: "pointer",
                    }}
                  >
                    <span className="text-lg">{rt.emoji}</span>
                    <span className="leading-tight text-center">{rt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <input
              value={editing?.name || ""}
              onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
              placeholder={`Schedule name (e.g. ${meta?.label})`}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-bold"
              style={{ border: `1.5px solid ${meta?.color || C.cream}40`, background: C.offWhite, outline: "none", color: C.darkGreen }}
            />

            {/* Child name */}
            <input
              value={editing?.child_name || ""}
              onChange={e => setEditing(p => ({ ...p, child_name: e.target.value }))}
              placeholder="Child's name (optional)"
              className="w-full rounded-xl px-3 py-2.5 text-sm"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
            />
          </div>

          {/* ── DRAG-DROP TASK LIST ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>
                SCHEDULE STEPS — DRAG TO REORDER
              </p>
              {editing?.tasks?.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${meta?.color}15`, color: meta?.color }}>
                  {editing.tasks.length} steps
                </span>
              )}
            </div>

            {editing?.tasks?.length === 0 ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
                <p className="text-3xl mb-2">📋</p>
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No tasks yet</p>
                <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add tasks from the library below or create your own.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {editing.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <TaskBlock
                                task={task}
                                index={index}
                                total={editing.tasks.length}
                                onDelete={() => deleteTask(task.id)}
                                onMoveUp={() => moveTask(index, -1)}
                                onMoveDown={() => moveTask(index, 1)}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* ── CUSTOM TASK FORM ── */}
          {showCustomForm ? (
            <CustomTaskForm
              onAdd={addCustomTask}
              onCancel={() => setShowCustomForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold"
              style={{ background: C.white, border: `1.5px dashed ${C.midGreen}`, color: C.midGreen, cursor: "pointer" }}
            >
              <Plus size={13} /> Create Custom Task
            </button>
          )}

          {/* ── TASK LIBRARY ── */}
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <button
              onClick={() => setShowLibrary(p => !p)}
              className="w-full flex items-center justify-between"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <LayoutList size={14} color={C.midGreen} />
                <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Task Library</p>
              </div>
              <span className="text-[10px] font-bold" style={{ color: C.midGreen }}>
                {showLibrary ? "Hide ▲" : "Show ▼"}
              </span>
            </button>

            {showLibrary && (
              <div className="mt-3">
                <TaskLibraryPanel
                  routineType={editing?.routine_type || "morning"}
                  onAdd={addFromLibrary}
                />
              </div>
            )}
          </div>

          <div className="pb-8" />
        </div>
      )}
    </div>
  );
}
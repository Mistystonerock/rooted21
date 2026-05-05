import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2, Loader2 } from "lucide-react";

const PRIORITY_COLORS = {
  low: { bg: "#E8F5E9", text: C.midGreen },
  medium: { bg: C.cream, text: C.brown },
  high: { bg: "#FFE8D6", text: "#D97706" },
  urgent: { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_COLORS = {
  open: { bg: "#E0E7FF", text: "#4F46E5" },
  in_progress: { bg: "#FEF3C7", text: "#D97706" },
  completed: { bg: "#D1FAE5", text: C.midGreen },
  cancelled: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function TaskManager({ caseId, caseFile, user, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to_email: "",
    assigned_to_name: "",
    due_date: "",
    due_time: "2:00 PM",
    priority: "medium",
    task_type: "other",
  });

  const loadTasks = async () => {
    if (tasksLoaded) return;
    try {
      const fetchedTasks = await base44.entities.CaseTask.filter({ case_id: caseId }, "-due_date");
      setTasks(fetchedTasks);
      setTasksLoaded(true);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  if (!tasksLoaded) {
    setTimeout(loadTasks, 0);
  }

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assigned_to_email || !form.due_date) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const newTask = await base44.entities.CaseTask.create({
        case_id: caseId,
        case_name: caseFile.child_name,
        title: form.title,
        description: form.description,
        assigned_to_email: form.assigned_to_email,
        assigned_to_name: form.assigned_to_name,
        assigned_to_role: caseFile.team_members?.find(m => m.email === form.assigned_to_email)?.role,
        assigned_by_email: user.email,
        assigned_by_name: user.full_name,
        due_date: form.due_date,
        due_time: form.due_time,
        priority: form.priority,
        task_type: form.task_type,
        status: "open",
      });

      setTasks(prev => [newTask, ...prev]);
      setForm({
        title: "",
        description: "",
        assigned_to_email: "",
        assigned_to_name: "",
        due_date: "",
        due_time: "2:00 PM",
        priority: "medium",
        task_type: "other",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await base44.entities.CaseTask.update(taskId, {
        status: newStatus,
        ...(newStatus === "completed" && {
          completed_by_email: user.email,
          completed_date: new Date().toISOString(),
        }),
      });

      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Delete this task?")) {
      try {
        await base44.entities.CaseTask.delete(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const openTasks = tasks.filter(t => t.status === "open" || t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-4">
      {/* Create task button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> Assign Task
        </button>
      )}

      {/* Task form */}
      {showForm && (
        <form onSubmit={handleCreateTask} className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.midGreen}` }}>
          <input
            type="text"
            placeholder="Task title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none"
            style={{ borderColor: C.cream, background: C.offWhite, minHeight: 60 }}
          />

          {/* Assign to team member */}
          {caseFile.team_members && caseFile.team_members.length > 0 ? (
            <select
              value={form.assigned_to_email}
              onChange={e => {
                const member = caseFile.team_members.find(m => m.email === e.target.value);
                setForm({
                  ...form,
                  assigned_to_email: e.target.value,
                  assigned_to_name: member?.name || "",
                });
              }}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              <option value="">Select team member *</option>
              {caseFile.team_members.map(member => (
                <option key={member.email} value={member.email}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs" style={{ color: C.mutedText }}>No team members to assign to</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
            <input
              type="time"
              value={form.due_time}
              onChange={e => setForm({ ...form, due_time: e.target.value })}
              className="px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={form.task_type}
              onChange={e => setForm({ ...form, task_type: e.target.value })}
              className="px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              <option value="other">General Task</option>
              <option value="document">Document</option>
              <option value="meeting">Meeting</option>
              <option value="follow_up">Follow-up</option>
              <option value="review">Review</option>
              <option value="approval">Approval</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-bold text-xs transition-opacity"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2 px-4 rounded-lg font-bold text-xs"
              style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Open tasks */}
      {openTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>OPEN TASKS ({openTasks.length})</p>
          {openTasks.map(task => {
            const daysUntil = Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntil < 0;
            const colors = STATUS_COLORS[task.status];
            const priority = PRIORITY_COLORS[task.priority];

            return (
              <div key={task.id} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
                <div className="px-4 py-3 flex items-start gap-3" style={{ background: colors.bg }}>
                  <button
                    onClick={() => handleUpdateStatus(task.id, task.status === "in_progress" ? "open" : "in_progress")}
                    className="p-1 flex-shrink-0"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Clock size={16} color={colors.text} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs" style={{ color: C.darkGreen }}>{task.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                      {task.assigned_to_name} • {task.task_type}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={priority}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 flex-shrink-0"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={12} color={C.mutedText} />
                  </button>
                </div>

                <div className="p-3 space-y-2" style={{ background: "#fff" }}>
                  {task.description && (
                    <p className="text-[10px]" style={{ color: C.mutedText }}>{task.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} color={isOverdue ? "#DC2626" : C.midGreen} />
                    <span className="text-[10px]" style={{ color: isOverdue ? "#DC2626" : C.midGreen }}>
                      {isOverdue ? `OVERDUE ${Math.abs(daysUntil)} days` : `Due in ${daysUntil} days`} ({task.due_date})
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(task.id, "completed")}
                    className="w-full py-2 rounded-lg font-bold text-xs transition-opacity hover:opacity-80"
                    style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>COMPLETED ({completedTasks.length})</p>
          {completedTasks.map(task => (
            <div key={task.id} className="rounded-2xl p-3 flex items-start gap-3" style={{ background: "#fff", border: `1.5px solid #D1FAE5` }}>
              <CheckCircle2 size={16} color={C.midGreen} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs line-through" style={{ color: C.mutedText }}>{task.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                  Completed {new Date(task.completed_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 flex-shrink-0"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Trash2 size={12} color={C.mutedText} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !showForm && (
        <div className="rounded-2xl p-6 text-center" style={{ background: C.cream }}>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No tasks yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Create action items to track team progress</p>
        </div>
      )}
    </div>
  );
}
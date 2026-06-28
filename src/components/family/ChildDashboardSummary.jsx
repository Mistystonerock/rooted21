import { Link } from "react-router-dom";
import { Activity, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import { getChildDisplayName } from "@/lib/child-selection";

function isRecentLog(log) {
  if (!log.entry_date) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return new Date(log.entry_date) >= cutoff;
}

function formatDate(date) {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChildDashboardSummary({ child, behaviorLogs, caseTasks, requirements, goals }) {
  const childName = getChildDisplayName(child);
  const activeLogs = behaviorLogs.filter(isRecentLog);
  const pendingTasks = [
    ...caseTasks.filter(task => !["completed", "cancelled"].includes(task.status)).map(task => ({ title: task.title, due: task.due_date, type: "Case task", to: "/case-management", priority: task.priority })),
    ...requirements.filter(item => item.status !== "completed").map(item => ({ title: item.title, due: item.due_date, type: "Case plan", to: "/case-plan-tracker", priority: item.priority })),
    ...goals.filter(goal => goal.progress !== "completed").map(goal => ({ title: goal.title, due: "", type: "Goal", to: "/goals", priority: "medium" })),
  ].sort((a, b) => (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31"));
  const highPriority = pendingTasks.filter(task => ["high", "urgent"].includes(task.priority)).length;
  const latestLogs = activeLogs.slice().sort((a, b) => (b.entry_date || "").localeCompare(a.entry_date || "")).slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.midGreen }}>Selected child</p>
        <h2 className="mt-1 font-serif text-xl font-bold" style={{ color: C.darkGreen }}>{childName}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <Activity size={18} color={C.midGreen} />
          <p className="mt-2 text-2xl font-black" style={{ color: C.darkGreen }}>{activeLogs.length}</p>
          <p className="text-[11px]" style={{ color: C.mutedText }}>Active behavior logs</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <CheckSquare size={18} color={C.gold} />
          <p className="mt-2 text-2xl font-black" style={{ color: C.darkGreen }}>{pendingTasks.length}</p>
          <p className="text-[11px]" style={{ color: C.mutedText }}>Pending tasks</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}33` }}>
          <TrendingUp size={15} color={C.midGreen} />
          <p className="mt-1 text-xs font-bold" style={{ color: C.darkGreen }}>{latestLogs[0]?.child_mood || "No recent mood"}</p>
        </div>
        <div className="rounded-2xl p-3" style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}33` }}>
          <Clock size={15} color={C.gold} />
          <p className="mt-1 text-xs font-bold" style={{ color: C.darkGreen }}>{highPriority} high priority</p>
        </div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>Recent behavior</p>
          <Link to="/behavior-logs" className="text-xs font-bold no-underline" style={{ color: C.midGreen }}>Open logs</Link>
        </div>
        <div className="mt-3 space-y-2">
          {latestLogs.length ? latestLogs.map(log => (
            <div key={log.id} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{log.behavior_description}</p>
              <p className="mt-1 text-[10px]" style={{ color: C.mutedText }}>{formatDate(log.entry_date)} · {log.child_mood || "Mood not set"}</p>
            </div>
          )) : <p className="text-xs" style={{ color: C.mutedText }}>No active behavior logs for this child.</p>}
        </div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Pending child tasks</p>
        <div className="mt-3 space-y-2">
          {pendingTasks.slice(0, 5).map((task, index) => (
            <Link key={`${task.type}-${task.title}-${index}`} to={task.to} className="block rounded-xl p-3 no-underline" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{task.title}</p>
              <p className="mt-1 text-[10px]" style={{ color: C.mutedText }}>{task.type} · {formatDate(task.due)}</p>
            </Link>
          ))}
          {!pendingTasks.length && <p className="text-xs" style={{ color: C.mutedText }}>No pending tasks for this child.</p>}
        </div>
      </div>
    </section>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, LayoutGrid, MessageCircle, Calendar } from "lucide-react";
import TreeLogo from "@/components/rooted/TreeLogo";
import FamilyCalendar from "@/components/family/FamilyCalendar";
import MessagingInbox from "@/components/family/MessagingInbox";
import ChildSelector from "@/components/children/ChildSelector";
import ChildDashboardSummary from "@/components/family/ChildDashboardSummary";
import { filterRecordsForChild, getChildDisplayName } from "@/lib/child-selection";

const TABS = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function FamilyDashboard() {
  const [user, setUser] = useState(null);
  const [child, setChild] = useState(null);
  const [team, setTeam] = useState([]);
  const [events, setEvents] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [caseTasks, setCaseTasks] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("calendar");

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [children, assignments, evts, logs, tasks, reqs, userGoals] = await Promise.all([
        base44.entities.ChildProfile.list("-created_date", 100),
        base44.entities.AssignedFamily.filter({ family_email: u.email }, "-created_date", 50),
        base44.entities.FamilyEvent.filter({ family_email: u.email }, "date", 100),
        base44.entities.BehaviorLog.list("-entry_date", 100),
        base44.entities.CaseTask.list("due_date", 100),
        base44.entities.CasePlanRequirement.filter({ owner_email: u.email }, "due_date", 100),
        base44.entities.Goal.list("-created_date", 100),
      ]);
      setChild(children[0] || null);
      setTeam(assignments);
      setEvents(evts);
      setBehaviorLogs(logs);
      setCaseTasks(tasks);
      setRequirements(reqs);
      setGoals(userGoals);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  const selectedEvents = filterRecordsForChild(events, child);
  const selectedLogs = filterRecordsForChild(behaviorLogs, child);
  const selectedTasks = caseTasks.filter(task => {
    if (!child) return true;
    if (!task.case_name) return true;
    return task.case_name === child.first_name || task.case_name === getChildDisplayName(child);
  });
  const selectedRequirements = filterRecordsForChild(requirements, child);
  const selectedGoals = filterRecordsForChild(goals, child);
  const activeLogCount = selectedLogs.filter(log => {
    if (!log.entry_date) return true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return new Date(log.entry_date) >= cutoff;
  }).length;
  const pendingTaskCount = selectedTasks.filter(task => !["completed", "cancelled"].includes(task.status)).length + selectedRequirements.filter(item => item.status !== "completed").length + selectedGoals.filter(goal => goal.progress !== "completed").length;
  const upcomingCount = selectedEvents.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).length;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <TreeLogo size={28} />
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-sm leading-none" style={{ color: C.cream }}>
            Family Dashboard
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>
            {child ? `${getChildDisplayName(child)}'s Family` : user?.full_name || "My Family"} · {team.length} professional{team.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/dashboard">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ffffff18" }}>
            <LayoutGrid size={15} color={C.cream} />
          </div>
        </Link>
      </div>

      {/* Summary strip */}
      <div className="flex gap-0 border-b" style={{ background: C.white, borderColor: C.cream }}>
        <div className="flex-1 px-4 py-2.5 text-center border-r" style={{ borderColor: C.cream }}>
          <p className="text-lg font-extrabold leading-none" style={{ color: C.darkGreen }}>{activeLogCount}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Active logs</p>
        </div>
        <div className="flex-1 px-4 py-2.5 text-center border-r" style={{ borderColor: C.cream }}>
          <p className="text-lg font-extrabold leading-none" style={{ color: C.midGreen }}>{pendingTaskCount}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Pending tasks</p>
        </div>
        <div className="flex-1 px-4 py-2.5 text-center">
          <p className="text-lg font-extrabold leading-none" style={{ color: C.brown }}>{upcomingCount}</p>
          <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>Upcoming</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex sticky top-[60px] z-10" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t.id ? `2.5px solid ${C.darkGreen}` : "2.5px solid transparent",
                color: tab === t.id ? C.darkGreen : C.mutedText,
                cursor: "pointer",
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-[600px] mx-auto px-4 py-5 space-y-5">
        <ChildSelector selectedChild={child} onChange={setChild} />

        <ChildDashboardSummary
          child={child}
          behaviorLogs={selectedLogs}
          caseTasks={selectedTasks}
          requirements={selectedRequirements}
          goals={selectedGoals}
        />

        {tab === "calendar" && (
          <FamilyCalendar
            events={selectedEvents}
            familyEmail={user?.email}
            currentUser={user}
            senderRole="Parent"
            onEventAdded={evt => setEvents(prev => [...prev, evt])}
            onEventDeleted={id => setEvents(prev => prev.filter(e => e.id !== id))}
          />
        )}

        {tab === "messages" && (
          <MessagingInbox
            team={team}
            currentUser={user}
            senderRole="Parent"
          />
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
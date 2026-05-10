import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import CalendarEventCard from "@/components/calendar/CalendarEventCard";
import { Calendar, Share2, Bell, Filter, ChevronLeft, ChevronRight, RefreshCw, Check } from "lucide-react";

export default function LegalCalendar() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState({ court: true, visitation: true, tasks: true });
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | success | error
  const [notificationStatus, setNotificationStatus] = useState("idle");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      await aggregateAllEvents(u);
      setLoading(false);
    });
  }, []);

  async function aggregateAllEvents(u) {
    // Fetch all relevant entities
    const [
      caseFiles,
      caseTasks,
      courtAppointments,
      visitationLogs,
      secureDocuments,
      caseNotes,
    ] = await Promise.all([
      base44.entities.CaseFile.filter({ parent_email: u.email }, "-created_date", 50),
      base44.entities.CaseTask.filter({ assigned_by_email: u.email }, "-due_date", 100),
      base44.entities.CourtAppointment.filter({ parent_email: u.email }, "-created_date", 50),
      base44.entities.VisitationLog.filter({ parent_email: u.email }, "-visit_date", 100),
      base44.entities.SecureDocument.filter({ owner_email: u.email }, "-created_date", 50),
      base44.entities.CaseNote.filter({ author_email: u.email }, "-created_date", 100),
    ]);

    const aggregated = [];

    // Court deadlines from case files
    caseFiles.forEach(cf => {
      if (cf.next_milestone_date) {
        aggregated.push({
          id: `case-${cf.id}`,
          event_type: "court_deadline",
          title: `${cf.child_name} — ${cf.next_milestone}`,
          date: cf.next_milestone_date,
          case_name: cf.child_name,
          case_id: cf.id,
          description: cf.description,
        });
      }
    });

    // Court appointments
    courtAppointments.forEach(ca => {
      aggregated.push({
        id: `court-${ca.id}`,
        event_type: "court_deadline",
        title: ca.case_name ? `Court Hearing — ${ca.case_name}` : "Court Appointment",
        date: ca.court_date,
        time: ca.time,
        location: ca.location,
        case_name: ca.case_name,
        case_id: ca.case_id,
      });
    });

    // Case tasks with due dates
    caseTasks.forEach(t => {
      if (t.due_date) {
        aggregated.push({
          id: `task-${t.id}`,
          event_type: "task",
          title: `${t.title} — Due for ${t.case_name}`,
          date: t.due_date,
          time: t.due_time,
          case_name: t.case_name,
          case_id: t.case_id,
          priority: t.priority,
          status: t.status,
        });
      }
    });

    // Visitation schedules
    visitationLogs.forEach(v => {
      aggregated.push({
        id: `visit-${v.id}`,
        event_type: "visitation",
        title: `Visitation with ${v.visitor_name}`,
        date: v.visit_date,
        time: v.visit_time,
        location: v.location,
        attendees: v.visitor_name,
        case_name: v.child_name,
        supervised: v.supervised,
      });
    });

    // Document deadlines
    secureDocuments.forEach(d => {
      if (d.expiry_date) {
        const daysUntil = Math.ceil((new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        aggregated.push({
          id: `doc-${d.id}`,
          event_type: daysUntil <= 30 ? "court_deadline" : "task",
          title: `Review: ${d.title}`,
          date: d.expiry_date,
          case_name: d.child_name,
          description: `Document expires — may need renewal or court submission`,
        });
      }
    });

    // Sort by date
    aggregated.sort((a, b) => new Date(a.date) - new Date(b.date));
    setAllEvents(aggregated);
    filterEvents(aggregated, filters);
  }

  function filterEvents(eventList, activeFilters) {
    const filtered = eventList.filter(e => {
      if (activeFilters.court && e.event_type === "court_deadline") return true;
      if (activeFilters.visitation && e.event_type === "visitation") return true;
      if (activeFilters.tasks && e.event_type === "task") return true;
      return false;
    });
    setEvents(filtered);
  }

  function toggleFilter(key) {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    filterEvents(allEvents, newFilters);
  }

  async function syncWithGoogleCalendar() {
    setSyncStatus("syncing");
    try {
      const response = await base44.functions.invoke("syncLegalCalendarToGoogle", {
        events: events.map(e => ({
          title: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          event_type: e.event_type,
        })),
      });
      if (response.data?.success) {
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 3000);
      } else {
        setSyncStatus("error");
      }
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("error");
    }
  }

  async function enableNotifications() {
    setNotificationStatus("syncing");
    try {
      // Request notification permission (browser native)
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationStatus("success");
          setTimeout(() => setNotificationStatus("idle"), 3000);
        }
      } else if (Notification.permission === "granted") {
        setNotificationStatus("success");
        setTimeout(() => setNotificationStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Notification setup failed:", error);
      setNotificationStatus("error");
    }
  }

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    return eventDate >= today;
  }).slice(0, 10);

  const overdueEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    return eventDate < today && e.event_type !== "visitation";
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Legal Calendar" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Legal Calendar" subtitle="Court dates, visitations & tasks" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={syncWithGoogleCalendar}
            disabled={syncStatus === "syncing"}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all"
            style={{
              background: syncStatus === "success" ? C.midGreen : syncStatus === "error" ? "#C0392B" : C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: syncStatus === "syncing" ? "default" : "pointer",
              opacity: syncStatus === "syncing" ? 0.7 : 1,
            }}
          >
            {syncStatus === "syncing" ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Syncing…
              </>
            ) : syncStatus === "success" ? (
              <>
                <Check size={14} /> Synced!
              </>
            ) : syncStatus === "error" ? (
              "Sync Failed"
            ) : (
              <>
                <RefreshCw size={14} /> Sync Google Cal
              </>
            )}
          </button>

          <button
            onClick={enableNotifications}
            disabled={notificationStatus === "syncing"}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all"
            style={{
              background: notificationStatus === "success" ? C.midGreen : notificationStatus === "error" ? "#C0392B" : C.gold,
              color: "#fff",
              border: "none",
              cursor: notificationStatus === "syncing" ? "default" : "pointer",
              opacity: notificationStatus === "syncing" ? 0.7 : 1,
            }}
          >
            {notificationStatus === "syncing" ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : notificationStatus === "success" ? (
              <>
                <Check size={14} /> Enabled
              </>
            ) : (
              <>
                <Bell size={14} /> Notifications
              </>
            )}
          </button>
        </div>

        {/* Overdue alert */}
        {overdueEvents.length > 0 && (
          <div className="rounded-xl p-3.5 flex gap-2" style={{ background: "#FDECEC", border: "1.5px solid #F5BEBE" }}>
            <span className="text-base flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-xs" style={{ color: "#C0392B" }}>
                {overdueEvents.length} overdue deadline{overdueEvents.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                These require immediate attention
              </p>
            </div>
          </div>
        )}

        {/* Filter toggles */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "court", label: "⚖️ Court", color: "#C0392B" },
            { key: "visitation", label: "👥 Visitation", color: C.midGreen },
            { key: "tasks", label: "✓ Tasks", color: C.gold },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
              style={{
                background: filters[f.key] ? f.color : C.cream,
                color: filters[f.key] ? "#fff" : C.darkGreen,
                border: "none",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase" style={{ color: C.mutedText }}>
              📅 UPCOMING ({upcomingEvents.length})
            </p>
            {upcomingEvents.map(event => {
              const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
              return <CalendarEventCard key={event.id} event={event} daysUntil={daysUntil} />;
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ fontSize: 32 }}>✅</p>
            <p className="font-bold text-sm mt-2" style={{ color: C.darkGreen }}>
              No upcoming events
            </p>
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
              Your legal calendar is clear for the next 90 days
            </p>
          </div>
        )}

        {/* Info banner */}
        <div className="rounded-xl p-3.5 flex gap-2" style={{ background: "#EEF4FB", border: "1px solid #BDD0E8" }}>
          <span className="text-sm flex-shrink-0">ℹ️</span>
          <p className="text-[10px]" style={{ color: "#5B8DB8" }}>
            Events are pulled from court appointments, case deadlines, visitation schedules, task reminders, and document expiry dates. Sync with Google Calendar to get automatic reminders on your phone.
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
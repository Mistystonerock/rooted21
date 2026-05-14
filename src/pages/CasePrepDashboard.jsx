import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import DeadlineSummaryCard from "@/components/case-prep/DeadlineSummaryCard";
import PrepSourceList from "@/components/case-prep/PrepSourceList";
import AIPrepPlan from "@/components/case-prep/AIPrepPlan";
import { Sparkles, ChevronRight } from "lucide-react";

function toDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(dateString) {
  const date = toDate(dateString);
  if (!date) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / 86400000);
}

function formatDate(dateString) {
  const date = toDate(dateString);
  if (!date) return "No date";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function CasePrepDashboard() {
  const [user, setUser] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [plan, setPlan] = useState("");

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const [casePlans, calendarEvents] = await Promise.all([
        base44.entities.CasePlanChecklist.filter({ parent_email: me.email, status: "active" }, "-created_date", 50),
        base44.entities.CareCalendarEvent.filter({ family_email: me.email }, "date", 100),
      ]);
      setChecklists(casePlans);
      setEvents(calendarEvents);
      setLoading(false);
    });
  }, []);

  const upcomingTasks = useMemo(() => {
    return checklists.flatMap(plan => (plan.items || [])
      .filter(item => !item.completed && item.due_date && daysUntil(item.due_date) >= 0 && daysUntil(item.due_date) <= 45)
      .map(item => ({
        id: `${plan.id}-${item.id}`,
        title: item.text,
        source: plan.title,
        date: item.due_date,
        dateLabel: `${formatDate(item.due_date)} · ${plan.title}`,
        category: item.category || "other",
      })))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [checklists]);

  const upcomingCourtEvents = useMemo(() => {
    return events
      .filter(event => event.date && daysUntil(event.date) >= 0 && daysUntil(event.date) <= 45)
      .filter(event => event.event_type === "court_date" || /court|hearing|case|cps|meeting/i.test(`${event.title} ${event.notes}`))
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        dateLabel: `${formatDate(event.date)}${event.time ? ` · ${event.time}` : ""}`,
        notes: event.notes || "",
        location: event.location || "",
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const urgentTasks = upcomingTasks.filter(item => daysUntil(item.date) <= 14);
  const nextDate = [...upcomingTasks, ...upcomingCourtEvents].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;

  async function generatePrepPlan() {
    setAiLoading(true);
    const context = {
      parent: user?.full_name || user?.email,
      upcoming_case_plan_tasks: upcomingTasks.slice(0, 12),
      upcoming_court_appointments: upcomingCourtEvents.slice(0, 8),
      active_case_plans: checklists.map(plan => ({ title: plan.title, child_name: plan.child_name, summary: plan.ai_summary })),
    };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a trauma-informed family court preparation assistant for Rooted 21. Analyze this parent's upcoming case plan checklist deadlines and Care Calendar court appointments. Create a proactive preparation dashboard response.

Data:
${JSON.stringify(context, null, 2)}

Return markdown with:
1. **What is coming up soon** — summarize the highest-priority deadlines and appointments.
2. **Meeting talking points** — 5-7 specific, respectful talking points the parent can bring to court/CPS/team meetings.
3. **Preparation tasks** — concrete checklist-style tasks, grouped by this week, before the meeting, and day-of.
4. **Documents to gather** — specific proof or records based on the checklist/calendar data.
5. **Questions to ask** — clear questions for the caseworker, attorney, provider, or court.

Do not provide legal advice. Keep it practical, calm, and parent-friendly.`,
      response_json_schema: {
        type: "object",
        properties: {
          prepPlan: { type: "string" }
        }
      }
    });

    setPlan(response.prepPlan);
    setAiLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Case Prep Dashboard" subtitle="Deadlines, court dates, and AI prep" backTo="/dashboard" />

      <div className="max-w-[760px] mx-auto px-4 py-5 space-y-5">
        <div className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: C.cream }}>AI-driven preparation</p>
          <h1 className="font-serif font-bold text-2xl mt-2" style={{ color: "#fff" }}>Know what to prepare before your next case deadline.</h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.cream }}>
            This dashboard reviews your active case plan checklist and Care Calendar to suggest talking points, tasks, and documents to gather.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DeadlineSummaryCard label="Next date" value={nextDate ? formatDate(nextDate) : "None"} detail="Closest deadline or court event" tone="date" />
              <DeadlineSummaryCard label="Urgent tasks" value={urgentTasks.length} detail="Due within 14 days" tone="urgent" />
              <DeadlineSummaryCard label="Court items" value={upcomingCourtEvents.length} detail="Next 45 days" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PrepSourceList title="Upcoming Case Plan Tasks" type="checklist" items={upcomingTasks} />
              <PrepSourceList title="Court & CPS Calendar Items" type="calendar" items={upcomingCourtEvents} />
            </div>

            <button
              onClick={generatePrepPlan}
              disabled={aiLoading || (upcomingTasks.length === 0 && upcomingCourtEvents.length === 0)}
              className="w-full rounded-2xl py-4 px-5 flex items-center justify-center gap-2 font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", opacity: aiLoading ? 0.75 : 1 }}
            >
              <Sparkles size={16} />
              {aiLoading ? "Analyzing your case timeline…" : "Generate Talking Points & Prep Tasks"}
            </button>

            <AIPrepPlan loading={aiLoading} plan={plan} />

            <Link to="/case-plan-checklist" className="flex items-center justify-between rounded-2xl p-4" style={{ background: C.cream, textDecoration: "none" }}>
              <div>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Update your case plan checklist</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Add tasks or proof so AI has better context</p>
              </div>
              <ChevronRight size={16} color={C.mutedText} />
            </Link>
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Plus, Filter, CalendarDays, CheckCircle, Clock, AlertCircle } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import EventCard from "@/components/care-calendar/EventCard";
import EventForm from "@/components/care-calendar/EventForm";

const TYPE_FILTERS = [
  { value: "all",           label: "All",           emoji: "📋" },
  { value: "school_meeting",label: "School",        emoji: "🏫" },
  { value: "medication",    label: "Meds",          emoji: "💊" },
  { value: "therapy",       label: "Therapy",       emoji: "🧠" },
  { value: "court_date",    label: "Court",         emoji: "⚖️" },
  { value: "appointment",   label: "Appointments",  emoji: "📅" },
  { value: "activity",      label: "Activities",    emoji: "🎯" },
];

export default function CareCalendar() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | confirmed | pending
  const [viewMode, setViewMode] = useState("upcoming"); // upcoming | past | all

  async function load(u) {
    const email = u?.email;
    if (!email) return;
    const all = await base44.entities.CareCalendarEvent.filter({ family_email: email }, "date", 200);
    setEvents(all);
  }

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      load(u).finally(() => setLoading(false));
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (typeFilter !== "all" && e.event_type !== typeFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (viewMode === "upcoming" && e.date < today) return false;
      if (viewMode === "past" && e.date >= today) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [events, typeFilter, statusFilter, viewMode, today]);

  // Stats
  const upcoming = events.filter(e => e.date >= today);
  const confirmed = upcoming.filter(e => e.status === "confirmed").length;
  const pending = upcoming.filter(e => e.status === "pending").length;

  async function handleSave(form) {
    if (editingEvent) {
      await base44.entities.CareCalendarEvent.update(editingEvent.id, form);
    } else {
      await base44.entities.CareCalendarEvent.create({
        ...form,
        family_email: user.email,
        added_by_email: user.email,
        added_by_name: user.full_name || user.email,
      });
    }
    setShowForm(false);
    setEditingEvent(null);
    await load(user);
  }

  async function handleDelete(id) {
    await base44.entities.CareCalendarEvent.delete(id);
    await load(user);
  }

  function handleEdit(event) {
    setEditingEvent(event);
    setShowForm(true);
  }

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Care Calendar"
        subtitle="Family & professional coordination"
        backTo="/dashboard"
        rightSlot={
          <button
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: C.midGreen, border: "none", cursor: "pointer" }}
          >
            <Plus size={20} color="#fff" />
          </button>
        }
      />

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: C.darkGreen }}>
            <p className="text-xl font-extrabold" style={{ color: C.cream }}>{upcoming.length}</p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: C.lightGreen }}>UPCOMING</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
            <p className="text-xl font-extrabold" style={{ color: C.midGreen }}>{confirmed}</p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: C.midGreen }}>CONFIRMED</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: "#FFF8E6", border: "1px solid #B8860B33" }}>
            <p className="text-xl font-extrabold" style={{ color: "#B8860B" }}>{pending}</p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: "#B8860B" }}>PENDING</p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          {[
            { v: "upcoming", label: "Upcoming" },
            { v: "past",     label: "Past" },
            { v: "all",      label: "All" },
          ].map(tab => (
            <button
              key={tab.v}
              onClick={() => setViewMode(tab.v)}
              className="flex-1 py-2.5 text-[11px] font-bold"
              style={{
                background: viewMode === tab.v ? C.darkGreen : "#fff",
                color: viewMode === tab.v ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: typeFilter === f.value ? C.darkGreen : C.cream,
                color: typeFilter === f.value ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {[
            { v: "all",       label: "All Statuses",  icon: <Filter size={10} /> },
            { v: "confirmed", label: "✅ Confirmed",   icon: null },
            { v: "pending",   label: "⏳ Pending",     icon: null },
          ].map(s => (
            <button
              key={s.v}
              onClick={() => setStatusFilter(s.v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                background: statusFilter === s.v ? C.midGreen : C.cream,
                color: statusFilter === s.v ? "#fff" : C.mutedText,
                border: "none", cursor: "pointer",
              }}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Event list grouped by date */}
        {grouped.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.cream}` }}>
            <CalendarDays size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No events yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: C.mutedText }}>
              Tap the + button to add your first event.
            </p>
            <button
              onClick={() => { setEditingEvent(null); setShowForm(true); }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Add Event
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([date, dayEvents]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="rounded-xl px-3 py-1.5"
                    style={{
                      background: date === today ? C.darkGreen : C.cream,
                      color: date === today ? C.cream : C.darkGreen,
                    }}
                  >
                    <p className="text-[10px] font-extrabold">
                      {date === today ? "TODAY" : new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex-1 h-px" style={{ background: C.cream }} />
                  <span className="text-[9px] font-bold" style={{ color: C.mutedText }}>
                    {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {dayEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      canEdit={event.added_by_email === user?.email || user?.role === "admin"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pb-8" />
      </div>

      {/* Event form modal */}
      {showForm && (
        <EventForm
          initial={editingEvent}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
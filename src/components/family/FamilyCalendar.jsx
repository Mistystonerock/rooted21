import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Plus, X, Calendar, MapPin, Clock, Trash2 } from "lucide-react";

const EVENT_TYPES = [
  { value: "appointment", label: "Appointment", color: C.midGreen, emoji: "🏥" },
  { value: "court_date", label: "Court Date", color: "#B84C2A", emoji: "⚖️" },
  { value: "meeting", label: "Meeting", color: C.brown, emoji: "🤝" },
  { value: "therapy", label: "Therapy", color: C.gold, emoji: "💛" },
  { value: "school", label: "School", color: "#5B8DB8", emoji: "🏫" },
  { value: "sports", label: "Sports / Activity", color: "#E07B39", emoji: "⚽" },
  { value: "other", label: "Other", color: C.mutedText, emoji: "📅" },
];

function getTypeInfo(type) {
  return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

export default function FamilyCalendar({ events, familyEmail, currentUser, senderRole, onEventAdded, onEventDeleted, readonly = false }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", event_type: "appointment", date: "", time: "", location: "", notes: "" });

  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter(e => new Date(e.date) >= new Date(new Date().toDateString()));
  const past = sorted.filter(e => new Date(e.date) < new Date(new Date().toDateString()));

  async function handleAdd() {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    const evt = await base44.entities.FamilyEvent.create({
      ...form,
      family_email: familyEmail,
      added_by_email: currentUser.email,
      added_by_name: currentUser.full_name || currentUser.email,
      added_by_role: senderRole,
    });
    onEventAdded(evt);
    setForm({ title: "", event_type: "appointment", date: "", time: "", location: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(evt) {
    await base44.entities.FamilyEvent.delete(evt.id);
    onEventDeleted(evt.id);
  }

  function EventCard({ evt, dimmed }) {
    const info = getTypeInfo(evt.event_type);
    const canDelete = !readonly || evt.added_by_email === currentUser.email;
    return (
      <div
        className="rounded-xl p-3.5 flex gap-3"
        style={{
          background: dimmed ? C.offWhite : C.white,
          border: `1.5px solid ${dimmed ? C.cream : info.color}22`,
          opacity: dimmed ? 0.65 : 1,
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: `${info.color}18` }}>
          {info.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{evt.title}</p>
            {canDelete && (
              <button onClick={() => handleDelete(evt)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                <Trash2 size={13} color={C.mutedText} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${info.color}18`, color: info.color }}>{info.label}</span>
            <span className="text-[11px] flex items-center gap-1" style={{ color: C.mutedText }}>
              <Calendar size={9} /> {new Date(evt.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            {evt.time && <span className="text-[11px] flex items-center gap-1" style={{ color: C.mutedText }}><Clock size={9} /> {evt.time}</span>}
            {evt.location && <span className="text-[11px] flex items-center gap-1 truncate" style={{ color: C.mutedText }}><MapPin size={9} /> {evt.location}</span>}
          </div>
          {evt.notes && <p className="text-[11px] mt-1 italic" style={{ color: C.mutedText }}>{evt.notes}</p>}
          {evt.added_by_name && (
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>Added by {evt.added_by_name}{evt.added_by_role ? ` · ${evt.added_by_role}` : ""}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Family Calendar</p>
        {!readonly && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: showForm ? C.cream : C.darkGreen, color: showForm ? C.mutedText : C.white, border: "none", cursor: "pointer" }}
          >
            {showForm ? <><X size={12} /> Cancel</> : <><Plus size={12} /> Add Event</>}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl p-4 space-y-2.5" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Event title *"
            className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative rounded-xl" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}>
              <select
                value={form.event_type}
                onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm font-sans appearance-none rounded-xl"
                style={{ border: "none", background: "transparent" }}
              >
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select>
            </div>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              placeholder="Time (e.g. 2:30 PM)"
              className="rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Location (optional)"
              className="rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !form.title.trim() || !form.date}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{ background: C.darkGreen, color: C.white, border: "none", cursor: "pointer" }}
          >
            {saving ? "Saving…" : "Add Event"}
          </button>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length === 0 && past.length === 0 && (
        <div className="rounded-xl p-5 text-center" style={{ background: C.white, border: `1.5px dashed ${C.cream}` }}>
          <p className="text-2xl mb-1">📅</p>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No events yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add appointments, court dates, or meetings.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>UPCOMING</p>
          {upcoming.map(evt => <EventCard key={evt.id} evt={evt} dimmed={false} />)}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold tracking-wider mt-2" style={{ color: C.mutedText }}>PAST</p>
          {past.slice(0, 5).map(evt => <EventCard key={evt.id} evt={evt} dimmed={true} />)}
        </div>
      )}
    </div>
  );
}
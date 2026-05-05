import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, CheckCircle2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BookingCalendarModal({ pro, user, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionType, setSessionType] = useState("virtual");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function isDisabled(day) {
    const d = toDateStr(viewYear, viewMonth, day);
    const dow = new Date(viewYear, viewMonth, day).getDay();
    return d < todayStr || dow === 0 || dow === 6; // no past, no weekends
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime) return;
    setSaving(true);
    const booking = await base44.entities.ConsultationBooking.create({
      professional_id: pro.id,
      professional_name: pro.full_name,
      professional_email: pro.email || "",
      parent_email: user.email,
      parent_name: user.full_name || user.email,
      date: selectedDate,
      time_slot: selectedTime,
      session_type: sessionType,
      reason: reason.trim(),
      status: "pending",
    });
    setBookingId(booking.id);

    // Send confirmation emails
    await base44.functions.invoke("sendBookingConfirmation", { booking_id: booking.id });

    setDone(true);
    setSaving(false);
  }

  const canBook = selectedDate && selectedTime;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-t-3xl"
        style={{ background: "#fff", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              📅 Book a Consultation
            </p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>with {pro.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        {done ? (
          <div className="text-center px-5 pb-8 pt-4">
            <CheckCircle2 size={48} color={C.midGreen} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-base mb-1" style={{ color: C.darkGreen }}>
              Booking Requested!
            </p>
            <p className="text-xs mb-1" style={{ color: C.mutedText }}>
              {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}
            </p>
            <p className="text-xs mb-4" style={{ color: C.mutedText }}>
              A confirmation email has been sent to <strong>{user.email}</strong>.
              {pro.email && " The professional has also been notified."}
            </p>
            <div className="rounded-xl p-3 mb-4 text-left" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
              <p className="text-[11px] font-bold" style={{ color: C.midGreen }}>Status: Pending Confirmation</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                {pro.full_name} will confirm or reschedule directly with you by email.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 pb-6 space-y-4">

            {/* Calendar */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
              {/* Month nav */}
              <div className="flex items-center justify-between px-4 py-2.5" style={{ background: C.darkGreen }}>
                <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <ChevronLeft size={18} color={C.cream} />
                </button>
                <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>{monthLabel}</p>
                <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <ChevronRight size={18} color={C.cream} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 text-center py-1.5" style={{ background: C.offWhite }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} className="text-[9px] font-extrabold" style={{ color: C.mutedText }}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-0.5 p-2" style={{ background: "#fff" }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const disabled = isDisabled(day);
                  const selected = selectedDate === dateStr;
                  return (
                    <button
                      key={day}
                      disabled={disabled}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                      className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: selected ? C.darkGreen : disabled ? "transparent" : C.offWhite,
                        color: selected ? "#fff" : disabled ? "#ccc" : C.darkGreen,
                        border: selected ? "none" : `1px solid ${disabled ? "transparent" : C.cream}`,
                        cursor: disabled ? "default" : "pointer",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[9px] pb-2" style={{ color: C.mutedText }}>
                Weekdays only · Select a date to see available times
              </p>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
                  SELECT A TIME SLOT
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className="py-2 rounded-lg text-[10px] font-bold transition-all"
                      style={{
                        background: selectedTime === slot ? C.darkGreen : C.cream,
                        color: selectedTime === slot ? "#fff" : C.mutedText,
                        border: "none", cursor: "pointer",
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Session type */}
            {selectedTime && (
              <>
                <div>
                  <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
                    SESSION TYPE
                  </p>
                  <div className="flex gap-2">
                    {[
                      { value: "virtual", label: "💻 Virtual" },
                      { value: "in_person", label: "📍 In-Person" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSessionType(opt.value)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                        style={{
                          background: sessionType === opt.value ? C.darkGreen : C.cream,
                          color: sessionType === opt.value ? "#fff" : C.mutedText,
                          border: "none", cursor: "pointer",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-[10px] font-extrabold tracking-wider block mb-1" style={{ color: C.mutedText }}>
                    REASON FOR CONSULTATION (OPTIONAL)
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Briefly describe what you'd like to discuss…"
                    rows={3}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
                    style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
                  />
                </div>

                {/* Summary */}
                <div className="rounded-xl p-3" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
                  <p className="text-[10px] font-bold mb-1" style={{ color: C.darkGreen }}>📋 Booking Summary</p>
                  <p className="text-xs" style={{ color: C.darkGreen }}>
                    <strong>{pro.full_name}</strong> · {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {selectedTime}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                    {sessionType === "virtual" ? "💻 Virtual session" : "📍 In-person session"} · Confirmation email will be sent to {user.email}
                  </p>
                </div>

                <button
                  onClick={handleBook}
                  disabled={saving || !canBook}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: canBook ? C.darkGreen : C.cream,
                    color: canBook ? "#fff" : C.mutedText,
                    border: "none", cursor: canBook ? "pointer" : "default",
                  }}
                >
                  {saving ? "Booking…" : "✅ Confirm Booking"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
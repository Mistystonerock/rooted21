import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, MessageSquare, Calendar, AlertTriangle, Eye } from "lucide-react";

export default function CourtPartnershipDetail() {
  const { partnershipId } = useParams();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [messages, setMessages] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (u?.role !== "court_staff") {
        setLoading(false);
        return;
      }
      setUser(u);

      const p = await base44.entities.CoParentingPartnership.list().then(
        ps => ps.find(x => x.id === partnershipId)
      );
      setPartnership(p);

      if (p) {
        const [msgs, behav, scheds, appts] = await Promise.all([
          base44.entities.CoParentingMessage.filter({ partnership_id: partnershipId }, "-created_date", 100),
          base44.entities.BehaviorLog.filter({ created_by: p.parent_1_email }, "-created_date", 50).then(r1 =>
            r1.concat(
              base44.entities.BehaviorLog.filter({ created_by: p.parent_2_email }, "-created_date", 50)
            )
          ),
          base44.entities.DailySchedule.filter({ child_name: p.child_name }, "-created_date", 10),
          base44.entities.CourtAppointment.filter({ partnership_id: partnershipId }, "-created_date", 20),
        ]);
        setMessages(msgs);
        setBehaviors(behav);
        setSchedules(scheds);
        setAppointments(appts);
      }

      setLoading(false);
    });
  }, [partnershipId]);

  if (!loading && user?.role !== "court_staff") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <p style={{ color: C.darkGreen }}>Access Denied</p>
      </div>
    );
  }

  if (loading || !partnership) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-4 py-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/court-dashboard" className="rounded-lg p-1.5 inline-block mb-3" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>🧒 {partnership.child_name}</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            {partnership.parent_1_name} & {partnership.parent_2_name}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b overflow-x-auto" style={{ borderColor: C.cream, background: C.white }}>
        {[
          { id: "overview", label: "Overview", icon: "📋" },
          { id: "messages", label: "Messages", icon: "💬" },
          { id: "behavior", label: "Behavior", icon: "📊" },
          { id: "schedules", label: "Schedules", icon: "📅" },
          { id: "appointments", label: "Appointments", icon: "🗓️" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              background: tab === t.id ? C.darkGreen : "transparent",
              color: tab === t.id ? C.cream : C.mutedText,
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="font-bold text-sm mb-2" style={{ color: C.darkGreen }}>Case Info</p>
              {partnership.court_case_number && <p className="text-xs" style={{ color: C.mutedText }}>Case: {partnership.court_case_number}</p>}
              <p className="text-xs" style={{ color: C.mutedText }}>Status: {partnership.status}</p>
              <p className="text-xs mt-1" style={{ color: C.mutedText }}>Court: {partnership.court_staff_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{messages.length}</p>
                <p className="text-xs" style={{ color: C.mutedText }}>Messages</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{behaviors.length}</p>
                <p className="text-xs" style={{ color: C.mutedText }}>Behavior Logs</p>
              </div>
            </div>

            <Link
              to={`/court-messaging/${partnershipId}`}
              className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-sm transition-all"
              style={{ background: C.darkGreen, color: C.cream, border: "none", textDecoration: "none" }}
            >
              <MessageSquare size={14} />
              Send Message to Parents
            </Link>

            <Link
              to={`/court-add-appointment/${partnershipId}`}
              className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-sm transition-all"
              style={{ background: C.midGreen, color: C.white, border: "none", textDecoration: "none" }}
            >
              <Calendar size={14} />
              Add Court Appointment
            </Link>
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-center text-xs" style={{ color: C.mutedText }}>No messages yet</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{msg.sender_name}</p>
                    <span className="text-[9px]" style={{ color: C.mutedText }}>{msg.topic}</span>
                  </div>
                  <p className="text-xs" style={{ color: C.darkText }}>{msg.body}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* BEHAVIOR */}
        {tab === "behavior" && (
          <div className="space-y-2">
            {behaviors.length === 0 ? (
              <p className="text-center text-xs" style={{ color: C.mutedText }}>No behavior logs yet</p>
            ) : (
              behaviors.map(b => (
                <div key={b.id} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{b.behavior_description}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${C.brown}20`, color: C.brown }}>
                      {b.child_mood}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Trigger: {b.trigger}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>Response: {b.parent_response}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* SCHEDULES */}
        {tab === "schedules" && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: C.cream, border: `1px solid ${C.midGreen}` }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Household Routines</p>
              <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>Each parent manages their own household schedule</p>
            </div>

            {schedules.length === 0 ? (
              <p className="text-center text-xs" style={{ color: C.mutedText }}>No routines added yet</p>
            ) : (
              <div className="space-y-2">
                {schedules.map(s => {
                  const createdByParent = s.created_by === partnership.parent_1_email ? partnership.parent_1_name : partnership.parent_2_name;
                  return (
                    <div key={s.id} className="rounded-2xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{s.name}</p>
                          <p className="text-[10px]" style={{ color: C.mutedText }}>
                            {createdByParent}'s Household
                          </p>
                        </div>
                        <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: `${C.midGreen}20`, color: C.midGreen }}>
                          {s.routine_type}
                        </span>
                      </div>
                      {s.tasks && s.tasks.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {s.tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 text-[10px]" style={{ color: C.mutedText }}>
                              <span>{task.emoji}</span>
                              <span>{task.label}</span>
                              <span className="ml-auto">{task.duration_min}m</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS */}
        {tab === "appointments" && (
          <div className="space-y-2">
            {appointments.length === 0 ? (
              <p className="text-center text-xs" style={{ color: C.mutedText }}>No appointments scheduled</p>
            ) : (
              appointments.map(a => (
                <div key={a.id} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{a.title}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>{a.date} at {a.time}</p>
                  {a.location && <p className="text-[10px]" style={{ color: C.mutedText }}>📍 {a.location}</p>}
                </div>
              ))
            )}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}
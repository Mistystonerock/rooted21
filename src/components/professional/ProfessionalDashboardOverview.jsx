import { AlertTriangle, MessageCircle, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function avg(rows, field) {
  const values = rows.map(row => Number(row[field])).filter(Boolean);
  return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : "–";
}

function isFlaggedLog(log) {
  const text = `${log.behavior_description || ""} ${log.trigger || ""} ${log.outcome || ""}`.toLowerCase();
  return ["dysregulated", "angry"].includes(log.child_mood) || ["crisis", "unsafe", "self-harm", "harm", "911", "988"].some(word => text.includes(word));
}

export default function ProfessionalDashboardOverview({ families, familyData, onOpenFamily, onMessageFamily }) {
  const activeFamilies = families.filter(family => family.status === "active");
  const allCheckins = families.flatMap(family => familyData[family.family_email]?.checkins || []);
  const completedLessons = families.reduce((sum, family) => sum + (familyData[family.family_email]?.lessons || []).filter(lesson => lesson.completed).length, 0);
  const possibleLessons = Math.max(families.length * 21, 1);
  const lessonPct = Math.round((completedLessons / possibleLessons) * 100);

  const flaggedFamilies = families.flatMap(family => {
    const data = familyData[family.family_email] || {};
    const flaggedLogs = (data.behaviorLogs || []).filter(isFlaggedLog);
    const lowCheckins = (data.checkins || []).filter(checkin => Number(checkin.child_regulation) <= 2);
    return [...flaggedLogs.slice(0, 2), ...lowCheckins.slice(0, 2)].map(event => ({ family, event, type: event.behavior_description ? "Behavior flag" : "Low regulation" }));
  }).slice(0, 5);

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${C.midGreen}18` }}>
          <ShieldCheck size={20} color={C.midGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Connected Family Dashboard</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>Aggregate progress, crisis flags, and secure case-focused messaging.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: "Active Families", value: activeFamilies.length, icon: Users, color: C.darkGreen },
          { label: "Avg Regulation", value: avg(allCheckins, "child_regulation"), icon: TrendingUp, color: C.midGreen },
          { label: "Lesson Progress", value: `${lessonPct}%`, icon: ShieldCheck, color: C.gold },
          { label: "Crisis Flags", value: flaggedFamilies.length, icon: AlertTriangle, color: flaggedFamilies.length ? "#B84C2A" : C.midGreen },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl p-3" style={{ background: C.offWhite }}>
              <Icon size={15} color={item.color} />
              <p className="mt-2 text-xl font-black leading-none" style={{ color: item.color }}>{item.value}</p>
              <p className="mt-1 text-[10px] font-bold" style={{ color: C.mutedText }}>{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: C.gold }}>Flagged Crisis Events</p>
        {flaggedFamilies.length === 0 ? (
          <div className="mt-2 rounded-2xl p-3" style={{ background: `${C.midGreen}10`, border: `1px solid ${C.midGreen}30` }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>No urgent crisis flags in the latest shared records.</p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {flaggedFamilies.map(({ family, event, type }, index) => (
              <div key={`${family.id}-${event.id || index}`} className="rounded-2xl p-3" style={{ background: "rgba(184,76,42,0.08)", border: "1px solid rgba(184,76,42,0.25)" }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} color="#B84C2A" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black" style={{ color: C.darkGreen }}>{family.family_name || family.family_email}</p>
                    <p className="mt-0.5 text-[10px] leading-snug" style={{ color: C.mutedText }}>
                      {type}: {event.behavior_description || event.note || `Child regulation ${event.child_regulation}/5`}
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={() => onOpenFamily(family)} className="rounded-xl px-3 py-2 text-[10px] font-black" style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
                    View Case
                  </button>
                  <button onClick={() => onMessageFamily(family)} className="rounded-xl px-3 py-2 text-[10px] font-black" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>
                    <MessageCircle size={12} className="mr-1" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
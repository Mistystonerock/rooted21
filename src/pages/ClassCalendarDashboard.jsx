import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { CalendarDays, CheckCircle2, ChevronRight, Clock, Video } from "lucide-react";

function parseClassDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export default function ClassCalendarDashboard() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const [enrollmentList, classList] = await Promise.all([
        base44.entities.ClassEnrollment.filter({ user_email: u.email }, "enrollment_date", 200),
        base44.entities.LiveClass.list("date", 500),
      ]);
      setEnrollments(enrollmentList);
      setClasses(classList);
      setLoading(false);
    });
  }, []);

  const enrolledClasses = useMemo(() => {
    const enrolledIds = new Set(enrollments.filter(e => e.status !== "dropped").map(e => e.class_id));
    return classes
      .filter(cls => enrolledIds.has(cls.id))
      .map(cls => ({ ...cls, parsedDate: parseClassDate(cls.date) }))
      .filter(cls => cls.parsedDate)
      .sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));
  }, [classes, enrollments]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = enrolledClasses.filter(cls => cls.parsedDate >= today);
  const nextClass = upcoming[0];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Class Calendar" subtitle="Your enrolled parenting classes" backTo="/class-enrollment" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(245,230,200,0.14)" }}>
              <CalendarDays size={24} color={C.cream} />
            </div>
            <div>
              <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Upcoming Class Dashboard</p>
              <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Synced from your class enrollments</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.cream}` }}>
            <CalendarDays size={32} color={C.cream} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>No upcoming classes yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: C.mutedText }}>Enroll in a class to see it here and in your Care Calendar.</p>
            <Link to="/live-classes" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
              Browse Classes
            </Link>
          </div>
        ) : (
          <>
            {nextClass && (
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.midGreen}` }}>
                <p className="text-[10px] font-extrabold tracking-wider mb-2" style={{ color: C.midGreen }}>NEXT CLASS</p>
                <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>{nextClass.title}</p>
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: C.mutedText }}>
                  <CalendarDays size={14} color={C.midGreen} />
                  {new Date(nextClass.parsedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                {nextClass.time && <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: C.mutedText }}><Clock size={14} color={C.gold} />{nextClass.time}</div>}
                {nextClass.join_url && <a href={nextClass.join_url} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}><Video size={15} /> Join Class</a>}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>ALL UPCOMING CLASSES</p>
              {upcoming.map(cls => (
                <div key={cls.id} className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{cls.title}</p>
                      <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{new Date(cls.parsedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{cls.time ? ` · ${cls.time}` : ""}</p>
                    </div>
                    <CheckCircle2 size={18} color={C.midGreen} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Link to="/care-calendar" className="flex items-center justify-between rounded-2xl p-4" style={{ background: C.cream, textDecoration: "none" }}>
          <div>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>View full Care Calendar</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Class dates sync there automatically</p>
          </div>
          <ChevronRight size={16} color={C.mutedText} />
        </Link>

        <div className="pb-8" />
      </div>
    </div>
  );
}
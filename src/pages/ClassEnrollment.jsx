import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Check, X, Loader2, ChevronRight, Bell } from "lucide-react";

function EnrollmentCard({ cls, isEnrolled, isOnWaitlist, enrollmentCount, onEnroll, onJoinWaitlist, loading }) {
  const isFull = enrollmentCount >= (cls.max_capacity || 30);
  
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
      <div className="px-4 py-3" style={{ background: C.darkGreen }}>
        <p className="font-serif font-bold text-sm" style={{ color: "#fff" }}>{cls.title}</p>
        {cls.abbr && (
          <p className="text-[10px] mt-0.5" style={{ color: C.lightGreen }}>{cls.abbr}</p>
        )}
      </div>

      <div className="p-4 space-y-3" style={{ background: "#fff" }}>
        {cls.description && (
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{cls.description}</p>
        )}
        
        <div className="flex items-center gap-2">
          <span style={{ color: C.midGreen, fontSize: "18px" }}>📅</span>
          <p className="text-xs" style={{ color: C.mutedText }}>{cls.date || "Date TBA"}</p>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span style={{ color: C.mutedText }}>👥</span>
          <p style={{ color: C.mutedText }}>{enrollmentCount}/{cls.max_capacity || 30} spots filled</p>
        </div>

        {isEnrolled ? (
          <div className="flex items-center gap-2 py-3 px-4 rounded-lg" style={{ background: "#EAF4EA" }}>
            <Check size={16} color={C.midGreen} />
            <p className="text-xs font-bold" style={{ color: C.midGreen }}>You're enrolled!</p>
          </div>
        ) : isOnWaitlist ? (
          <div className="flex items-center gap-2 py-3 px-4 rounded-lg" style={{ background: C.cream }}>
            <p className="text-xs font-bold" style={{ color: C.brown }}>✓ On waitlist</p>
          </div>
        ) : isFull ? (
          <button
            onClick={() => onJoinWaitlist(cls)}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: C.cream,
              color: C.brown,
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-1">
                <Loader2 size={14} className="animate-spin" /> Adding to waitlist...
              </span>
            ) : (
              "Join Waitlist"
            )}
          </button>
        ) : (
          <button
            onClick={() => onEnroll(cls)}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-1">
                <Loader2 size={14} className="animate-spin" /> Enrolling...
              </span>
            ) : (
              "Enroll Now"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClassEnrollment() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState({});

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.LiveClass.list("-created_date"),
    ]).then(([u, cls]) => {
      setUser(u);
      setClasses(cls);

      if (u) {
        Promise.all([
          base44.entities.ClassEnrollment.filter({ user_email: u.email }),
          base44.entities.ClassWaitlist.filter({ user_email: u.email }),
        ]).then(([enr, wait]) => {
          setEnrollments(enr);
          setWaitlist(wait);
        });
      }

      // Count enrollments per class
      base44.entities.ClassEnrollment.list("-created_date", 1000).then(allEnr => {
        const counts = {};
        allEnr.forEach(e => {
          counts[e.class_id] = (counts[e.class_id] || 0) + 1;
        });
        setEnrollmentCounts(counts);
      });

      setLoading(false);
    });
  }, []);

  async function handleEnroll(cls) {
    if (!user) return;
    setEnrollingId(cls.id);

    try {
      const newEnrollment = await base44.entities.ClassEnrollment.create({
        user_email: user.email,
        user_name: user.full_name || "Unknown",
        class_id: cls.id,
        class_title: cls.title,
        enrollment_date: new Date().toISOString().slice(0, 10),
        status: "active",
        sessions_attended: 0,
      });

      setEnrollments(prev => [...prev, newEnrollment]);
      setEnrollmentCounts(prev => ({
        ...prev,
        [cls.id]: (prev[cls.id] || 0) + 1,
      }));
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setEnrollingId(null);
    }
  }

  async function handleJoinWaitlist(cls) {
    if (!user) return;
    setEnrollingId(cls.id);

    try {
      const currentWaitlistCount = waitlist.filter(w => w.class_id === cls.id).length;
      const position = currentWaitlistCount + 1;

      const newWaitlistEntry = await base44.entities.ClassWaitlist.create({
        class_id: cls.id,
        user_email: user.email,
        user_name: user.full_name || "Unknown",
        position: position,
        waitlist_date: new Date().toISOString(),
      });

      setWaitlist(prev => [...prev, newWaitlistEntry]);
    } catch (err) {
      console.error("Waitlist join failed:", err);
    } finally {
      setEnrollingId(null);
    }
  }

  const enrolledClassIds = new Set(enrollments.map(e => e.class_id));
  const waitlistedClassIds = new Set(waitlist.map(w => w.class_id));
  const publishedClasses = classes.filter(c => c.is_published !== false);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Class Enrollment"
        subtitle="Sign up for 6-week parenting classes"
        backTo="/live-classes"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🎓</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
            Join a Parenting Class
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            6 weeks of live, facilitated learning with certificate of completion upon finishing all sessions.
          </p>
        </div>

        {/* My Enrollments */}
        {enrollments.length > 0 && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>My Classes</p>
            {enrollments.map(enr => (
              <Link
                key={enr.id}
                to={`/class-progress/${enr.id}`}
                className="flex items-center justify-between pb-3 border-b transition-all hover:opacity-80"
                style={{ borderColor: C.cream, textDecoration: "none" }}
              >
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{enr.class_title}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>
                    {enr.sessions_attended}/6 sessions attended
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {enr.status === "completed" && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.midGreen, color: "#fff" }}>
                      ✓ Completed
                    </span>
                  )}
                  <ChevronRight size={14} color={C.mutedText} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Available Classes */}
        <div>
          <p className="text-[10px] font-extrabold tracking-wider mb-3" style={{ color: C.mutedText }}>
            AVAILABLE CLASSES
          </p>
          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
            </div>
          ) : publishedClasses.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <p className="text-2xl mb-2">📅</p>
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No classes available</p>
              <p className="text-xs mt-1" style={{ color: C.mutedText }}>Check back soon for upcoming class offerings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedClasses.map(cls => (
                <EnrollmentCard
                  key={cls.id}
                  cls={cls}
                  isEnrolled={enrolledClassIds.has(cls.id)}
                  isOnWaitlist={waitlistedClassIds.has(cls.id)}
                  enrollmentCount={enrollmentCounts[cls.id] || 0}
                  onEnroll={handleEnroll}
                  onJoinWaitlist={handleJoinWaitlist}
                  loading={enrollingId === cls.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
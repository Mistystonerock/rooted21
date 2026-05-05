import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, CheckCircle2, Star } from "lucide-react";

export default function InstructorAnalytics() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      
      if (u?.role === "admin") {
        Promise.all([
          base44.entities.LiveClass.list("-created_date"),
          base44.entities.ClassEnrollment.list("-created_date", 1000),
          base44.entities.ClassAttendance.list("-created_date", 1000),
          base44.entities.ClassFeedback.list("-feedback_date", 1000),
        ]).then(([cls, enr, att, fb]) => {
          setClasses(cls);
          setEnrollments(enr);
          setAttendance(att);
          setFeedback(fb);
          if (cls.length > 0) setSelectedClass(cls[0].id);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Class Analytics" backTo="/dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Class Analytics" backTo="/dashboard" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Admin only</p>
        </div>
      </div>
    );
  }

  const classData = classes.find(c => c.id === selectedClass);
  const classEnrollments = enrollments.filter(e => e.class_id === selectedClass);
  const classAttendance = attendance.filter(a => a.class_id === selectedClass);
  const classFeedback = feedback.filter(f => f.class_id === selectedClass);

  // Attendance by session
  const sessionAttendanceData = [1, 2, 3, 4, 5, 6].map(sessionNum => {
    const sessionAttendees = classAttendance.filter(a => a.session_number === sessionNum && a.attended);
    return {
      session: `Session ${sessionNum}`,
      attended: sessionAttendees.length,
      total: classEnrollments.length,
      rate: classEnrollments.length ? Math.round((sessionAttendees.length / classEnrollments.length) * 100) : 0,
    };
  });

  // Completion metrics
  const totalEnrolled = classEnrollments.length;
  const completedCount = classEnrollments.filter(e => e.status === "completed").length;
  const completionRate = totalEnrolled ? Math.round((completedCount / totalEnrolled) * 100) : 0;

  // Satisfaction metrics
  const avgInstructorRating = classFeedback.length > 0
    ? (classFeedback.reduce((sum, f) => sum + (f.instructor_rating || 0), 0) / classFeedback.length).toFixed(1)
    : 0;
  const avgContentRating = classFeedback.length > 0
    ? (classFeedback.reduce((sum, f) => sum + (f.content_rating || 0), 0) / classFeedback.length).toFixed(1)
    : 0;
  const recommendRate = classFeedback.length > 0
    ? Math.round((classFeedback.filter(f => f.would_recommend).length / classFeedback.length) * 100)
    : 0;

  // Enrollment status breakdown
  const enrollmentStatus = [
    { name: "Active", value: classEnrollments.filter(e => e.status === "active").length, fill: C.midGreen },
    { name: "Completed", value: classEnrollments.filter(e => e.status === "completed").length, fill: C.gold },
    { name: "Dropped", value: classEnrollments.filter(e => e.status === "dropped").length, fill: "#ddd" },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Class Analytics" subtitle="Attendance & performance trends" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Class selector */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-xs font-bold mb-2" style={{ color: C.mutedText }}>SELECT CLASS</p>
          <select
            value={selectedClass || ""}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.title} ({cls.abbr})
              </option>
            ))}
          </select>
        </div>

        {/* Key metrics cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>ENROLLED</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: C.darkGreen }}>{totalEnrolled}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} color={C.midGreen} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>COMPLETED</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: C.darkGreen }}>{completionRate}%</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} color={C.gold} fill={C.gold} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>INSTRUCTOR</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: C.darkGreen }}>{avgInstructorRating}/5</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} color={C.brown} />
              <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>RECOMMEND</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: C.darkGreen }}>{recommendRate}%</p>
          </div>
        </div>

        {/* Attendance trend chart */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="font-bold text-sm mb-4" style={{ color: C.darkGreen }}>Attendance by Session</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sessionAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.cream} />
              <XAxis dataKey="session" stroke={C.mutedText} style={{ fontSize: "12px" }} />
              <YAxis stroke={C.mutedText} style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.cream}` }} />
              <Legend />
              <Line type="monotone" dataKey="attended" stroke={C.midGreen} strokeWidth={2} name="Attended" />
              <Line type="monotone" dataKey="rate" stroke={C.gold} strokeWidth={2} name="Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment status */}
        {enrollmentStatus.some(s => s.value > 0) && (
          <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
            <p className="font-bold text-sm mb-4" style={{ color: C.darkGreen }}>Enrollment Status</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={enrollmentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {enrollmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              {enrollmentStatus.map((status, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: status.fill }} />
                  <span style={{ color: C.mutedText }}>{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content quality metrics */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Quality Metrics</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: C.cream }}>
              <p className="text-xs" style={{ color: C.mutedText }}>Instructor Rating</p>
              <p className="font-bold" style={{ color: C.gold }}>{avgInstructorRating} / 5</p>
            </div>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: C.cream }}>
              <p className="text-xs" style={{ color: C.mutedText }}>Content Quality</p>
              <p className="font-bold" style={{ color: C.gold }}>{avgContentRating} / 5</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs" style={{ color: C.mutedText }}>Would Recommend</p>
              <p className="font-bold" style={{ color: C.gold }}>{recommendRate}%</p>
            </div>
          </div>
        </div>

        {classFeedback.length === 0 && (
          <div className="rounded-2xl p-4 text-center" style={{ background: C.cream }}>
            <p className="text-xs font-bold" style={{ color: C.brown }}>No feedback collected yet</p>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
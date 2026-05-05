import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { CheckCircle2, Circle, Download, Award } from "lucide-react";

export default function ClassProgress() {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.ClassEnrollment.filter({ id: enrollmentId }),
    ]).then(([u, enr]) => {
      setUser(u);
      if (enr.length > 0) {
        setEnrollment(enr[0]);
        
        base44.entities.ClassAttendance.filter(
          { enrollment_id: enr[0].id }
        ).then(att => {
          setAttendance(att.sort((a, b) => a.session_number - b.session_number));
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [enrollmentId]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Class Progress" backTo="/live-classes" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Class Progress" backTo="/live-classes" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm" style={{ color: C.darkGreen }}>Class not found</p>
        </div>
      </div>
    );
  }

  const attendedCount = enrollment.sessions_attended || 0;
  const isCompleted = attendedCount >= 6;
  const progressPct = Math.round((attendedCount / 6) * 100);

  function downloadCertificate() {
    if (!isCompleted) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
          body { font-family: Georgia, serif; margin: 0; padding: 40px; background: #fafafa; }
          .certificate { 
            background: white; 
            border: 3px solid #3a5444; 
            padding: 60px; 
            max-width: 800px; 
            margin: 0 auto;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { font-size: 24px; color: #3a5444; margin-bottom: 30px; font-weight: bold; }
          .title { font-size: 32px; color: #2d4435; margin: 40px 0; font-style: italic; }
          .name { font-size: 24px; color: #3a5444; margin: 30px 0; font-weight: bold; text-decoration: underline; }
          .footer { font-size: 14px; color: #666; margin-top: 40px; }
          .date { font-size: 12px; color: #999; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">Rooted 21 Parenting Network</div>
          <div class="title">Certificate of Completion</div>
          <p style="font-size: 16px; margin: 20px 0;">This certifies that</p>
          <div class="name">${user?.full_name || "Participant"}</div>
          <p style="font-size: 16px; margin: 20px 0;">has successfully completed the</p>
          <p style="font-size: 18px; color: #3a5444; margin: 20px 0;"><strong>${enrollment.class_title}</strong></p>
          <p style="font-size: 14px; margin: 30px 0;">6-Week Parenting Class</p>
          <p style="font-size: 14px; margin: 30px 0;">Attended all 6 sessions with dedication and engagement</p>
          <div class="footer">
            <p>In witness whereof, this certificate is presented this day</p>
            <div class="date">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rooted21-Certificate-${user?.full_name?.replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Class Progress"
        subtitle={enrollment.class_title}
        backTo="/live-classes"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Progress ring */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke={C.cream} strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke={isCompleted ? C.midGreen : C.gold}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-extrabold" style={{ color: C.darkGreen }}>{attendedCount}/6</p>
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              {isCompleted ? "🎉 Completed!" : "In Progress"}
            </p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>
              {attendedCount} of 6 sessions attended
            </p>
            <p className="text-[11px] mt-2 font-bold" style={{ color: progressPct === 100 ? C.midGreen : C.gold }}>
              {progressPct}% Complete
            </p>
          </div>
        </div>

        {/* Session tracking */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Session Attendance</p>
          
          {attendance.length === 0 ? (
            <p className="text-xs" style={{ color: C.mutedText }}>No sessions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {attendance.map(att => (
                <div key={att.id} className="flex items-center gap-3">
                  {att.attended ? (
                    <CheckCircle2 size={18} color={C.midGreen} />
                  ) : (
                    <Circle size={18} color={C.cream} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: att.attended ? C.midGreen : C.mutedText }}>
                      Session {att.session_number}
                    </p>
                    <p className="text-[10px]" style={{ color: C.mutedText }}>
                      {new Date(att.session_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {att.attended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EAF4EA", color: C.midGreen }}>
                      ✓ Attended
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion info */}
        {isCompleted && (
          <>
            <div className="rounded-2xl p-5 text-center" style={{ background: C.midGreen }}>
              <Award size={32} color="#fff" className="mx-auto mb-3" />
              <p className="font-serif font-bold text-base mb-2" style={{ color: "#fff" }}>
                You've Completed the Course!
              </p>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
                You attended all 6 sessions. Download your certificate below.
              </p>
              <button
                onClick={downloadCertificate}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: "#fff", color: C.midGreen, border: "none", cursor: "pointer" }}
              >
                <Download size={14} />
                Download Certificate
              </button>
            </div>
          </>
        )}

        {/* Status message */}
        {!isCompleted && attendance.length > 0 && (
          <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
              Keep going! {6 - attendedCount} more session{6 - attendedCount !== 1 ? "s" : ""} to earn your certificate.
            </p>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
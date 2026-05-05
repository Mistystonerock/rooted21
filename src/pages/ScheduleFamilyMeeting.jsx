import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Calendar, Clock, MapPin, Video, Users, Send, Loader2 } from "lucide-react";

export default function ScheduleFamilyMeeting() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseFile, setCaseFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    meeting_type: "team_check_in",
    requested_date: "",
    requested_time: "2:00 PM",
    duration_minutes: 60,
    meeting_format: "virtual",
    agenda: "",
    meeting_link: "",
    meeting_location: "",
    notes: "",
    selected_members: new Set(),
  });

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.CaseFile.filter({ id: caseId }),
    ]).then(([u, cases]) => {
      setUser(u);
      if (cases.length > 0) {
        setCaseFile(cases[0]);
        // Pre-select all team members
        if (cases[0].team_members) {
          setForm(prev => ({
            ...prev,
            selected_members: new Set(cases[0].team_members.map(m => m.email)),
          }));
        }
      }
      setLoading(false);
    });
  }, [caseId]);

  const toggleMember = (email) => {
    const newSet = new Set(form.selected_members);
    if (newSet.has(email)) {
      newSet.delete(email);
    } else {
      newSet.add(email);
    }
    setForm(prev => ({ ...prev, selected_members: newSet }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.requested_date || form.selected_members.size === 0) {
      alert("Please select a date and at least one team member");
      return;
    }

    setSubmitting(true);
    try {
      const invitedMembers = caseFile.team_members.filter(m => form.selected_members.has(m.email));

      await base44.entities.MeetingRequest.create({
        case_id: caseId,
        case_name: caseFile.child_name,
        parent_email: user.email,
        parent_name: user.full_name,
        meeting_type: form.meeting_type,
        requested_date: form.requested_date,
        requested_time: form.requested_time,
        duration_minutes: form.duration_minutes,
        meeting_format: form.meeting_format,
        agenda: form.agenda,
        meeting_link: form.meeting_link,
        meeting_location: form.meeting_location,
        invited_team_members: invitedMembers,
        notes: form.notes,
        status: "requested",
      });

      navigate(`/case-detail/${caseId}`);
    } catch (err) {
      console.error("Error submitting meeting request:", err);
      alert("Failed to submit meeting request");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Schedule Family Meeting" backTo={`/case-detail/${caseId}`} />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!caseFile) return null;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Family Team Meeting" subtitle={`For ${caseFile.child_name}'s case`} backTo={`/case-detail/${caseId}`} />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Info */}
        <div className="rounded-2xl p-4 text-center" style={{ background: C.midGreen }}>
          <Users size={24} color="#fff" className="mx-auto mb-2" />
          <p className="font-serif font-bold text-sm" style={{ color: "#fff" }}>Request a Team Meeting</p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            Bring everyone together to discuss {caseFile.child_name}'s case
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meeting Type */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>MEETING TYPE</p>
            <select
              value={form.meeting_type}
              onChange={e => setForm(prev => ({ ...prev, meeting_type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              <option value="team_check_in">Team Check-In</option>
              <option value="strategic_planning">Strategic Planning</option>
              <option value="crisis_response">Crisis Response</option>
              <option value="progress_review">Progress Review</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>DATE</p>
              <input
                type="date"
                value={form.requested_date}
                onChange={e => setForm(prev => ({ ...prev, requested_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>TIME</p>
              <input
                type="time"
                value={form.requested_time}
                onChange={e => setForm(prev => ({ ...prev, requested_time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>DURATION (MINUTES)</p>
            <select
              value={form.duration_minutes}
              onChange={e => setForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
              style={{ borderColor: C.cream, background: C.offWhite }}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Format */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>MEETING FORMAT</p>
            <div className="space-y-2">
              {["virtual", "in_person", "hybrid"].map(fmt => (
                <label key={fmt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={form.meeting_format === fmt}
                    onChange={e => setForm(prev => ({ ...prev, meeting_format: e.target.value }))}
                    style={{ accentColor: C.darkGreen }}
                  />
                  <span className="text-xs" style={{ color: C.darkGreen }}>
                    {fmt === "virtual" ? "Virtual" : fmt === "in_person" ? "In-Person" : "Hybrid"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Meeting Link / Location */}
          {(form.meeting_format === "virtual" || form.meeting_format === "hybrid") && (
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>MEETING LINK</p>
              <input
                type="url"
                placeholder="Zoom, Teams, or Google Meet link"
                value={form.meeting_link}
                onChange={e => setForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
          )}

          {(form.meeting_format === "in_person" || form.meeting_format === "hybrid") && (
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>LOCATION</p>
              <input
                type="text"
                placeholder="Address or venue"
                value={form.meeting_location}
                onChange={e => setForm(prev => ({ ...prev, meeting_location: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
            </div>
          )}

          {/* Agenda */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>AGENDA</p>
            <textarea
              placeholder="What would you like to discuss?"
              value={form.agenda}
              onChange={e => setForm(prev => ({ ...prev, agenda: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 80 }}
            />
          </div>

          {/* Team Members */}
          {caseFile.team_members && caseFile.team_members.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>INVITE TEAM MEMBERS</p>
              <div className="space-y-2">
                {caseFile.team_members.map(member => (
                  <label key={member.email} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:opacity-80">
                    <input
                      type="checkbox"
                      checked={form.selected_members.has(member.email)}
                      onChange={() => toggleMember(member.email)}
                      style={{ accentColor: C.darkGreen, marginTop: 3 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{member.name}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>{member.role}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>{member.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-[10px] mt-2 font-bold" style={{ color: C.midGreen }}>
                {form.selected_members.size} member{form.selected_members.size !== 1 ? "s" : ""} invited
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>ADDITIONAL NOTES</p>
            <textarea
              placeholder="Any special requests or notes?"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none"
              style={{ borderColor: C.cream, background: C.offWhite, minHeight: 60 }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: C.darkGreen,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send size={18} />
                Request Meeting
              </>
            )}
          </button>
        </form>

        <div className="pb-8" />
      </div>
    </div>
  );
}
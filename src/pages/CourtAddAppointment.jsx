import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

export default function CourtAddAppointment() {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    notify_parents: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (u?.role !== "court_staff") {
        navigate("/dashboard");
        return;
      }
      setUser(u);

      const p = await base44.entities.CoParentingPartnership.list().then(
        ps => ps.find(x => x.id === partnershipId)
      );
      setPartnership(p);
    });
  }, [partnershipId, navigate]);

  async function handleSave() {
    if (!form.title || !form.date) return;

    setSaving(true);
    try {
      await base44.entities.CourtAppointment.create({
        partnership_id: partnershipId,
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        description: form.description,
        court_staff_email: user.email,
        notify_parents: form.notify_parents,
      });

      setSaved(true);
      setTimeout(() => {
        navigate(`/court-partnership/${partnershipId}`);
      }, 1500);
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setSaving(false);
    }
  }

  if (!partnership) {
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
        <Link to={`/court-partnership/${partnershipId}`} className="rounded-lg p-1.5 inline-block mb-2" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Schedule Court Appointment</p>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <CheckCircle2 size={40} color={C.midGreen} />
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>Appointment Scheduled</p>
            <p className="text-xs text-center" style={{ color: C.mutedText }}>
              {form.notify_parents ? "Parents have been notified" : "No notification sent"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-1" style={{ color: C.mutedText }}>FOR:</p>
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{partnership.child_name}</p>
              <p className="text-xs" style={{ color: C.mutedText }}>{partnership.parent_1_name} & {partnership.parent_2_name}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>TITLE *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Court Hearing, Check-in, Mediation..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>DATE *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full rounded-lg px-3 py-2.5 text-sm"
                    style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>TIME</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({...form, time: e.target.value})}
                    className="w-full rounded-lg px-3 py-2.5 text-sm"
                    style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>LOCATION</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  placeholder="Courtroom address or Zoom link..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: C.darkGreen }}>DESCRIPTION</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Additional details for parents..."
                  rows="3"
                  className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
                  style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg px-3 py-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                <input
                  type="checkbox"
                  id="notify"
                  checked={form.notify_parents}
                  onChange={(e) => setForm({...form, notify_parents: e.target.checked})}
                  style={{ accentColor: C.midGreen }}
                />
                <label htmlFor="notify" className="text-xs font-bold flex-1" style={{ color: C.darkGreen, cursor: "pointer" }}>
                  Notify parents
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!form.title || !form.date || saving}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all"
              style={{
                background: C.darkGreen,
                color: C.cream,
                border: "none",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
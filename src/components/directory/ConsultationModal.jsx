import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, CheckCircle2 } from "lucide-react";

export default function ConsultationModal({ pro, user, onClose }) {
  const [form, setForm] = useState({
    message: "",
    preferred_contact: "email",
    preferred_time: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!form.message.trim()) return;
    setSaving(true);
    await base44.entities.ConsultationRequest.create({
      professional_id: pro.id,
      professional_name: pro.full_name,
      parent_email: user.email,
      parent_name: user.full_name || user.email,
      message: form.message,
      preferred_contact: form.preferred_contact,
      preferred_time: form.preferred_time,
      status: "pending",
    });
    setDone(true);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[520px] rounded-t-3xl p-5 space-y-4"
        style={{ background: "#fff", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              Request Consultation
            </p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>with {pro.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color={C.mutedText} />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 size={44} color={C.midGreen} className="mx-auto mb-3" />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Request Sent!</p>
            <p className="text-xs mt-1 mb-4" style={{ color: C.mutedText }}>
              {pro.full_name} will receive your consultation request and be in touch soon.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Message */}
            <div>
              <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>
                What brings you to seek support? *
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Briefly describe your situation and what you're looking for help with…"
                rows={4}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans resize-none"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>

            {/* Preferred contact */}
            <div>
              <label className="text-[11px] font-bold block mb-1.5" style={{ color: C.darkGreen }}>
                Preferred contact method
              </label>
              <div className="flex gap-2">
                {["email", "phone", "either"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setForm(f => ({ ...f, preferred_contact: opt }))}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold capitalize"
                    style={{
                      background: form.preferred_contact === opt ? C.darkGreen : C.cream,
                      color: form.preferred_contact === opt ? "#fff" : C.mutedText,
                      border: "none", cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred time */}
            <div>
              <label className="text-[11px] font-bold block mb-1" style={{ color: C.darkGreen }}>
                Preferred time window (optional)
              </label>
              <input
                value={form.preferred_time}
                onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))}
                placeholder="e.g. Weekday mornings, weekends…"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
                style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !form.message.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{
                background: form.message.trim() ? C.darkGreen : C.cream,
                color: form.message.trim() ? "#fff" : C.mutedText,
                border: "none", cursor: form.message.trim() ? "pointer" : "default",
              }}
            >
              {saving ? "Sending…" : "Send Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
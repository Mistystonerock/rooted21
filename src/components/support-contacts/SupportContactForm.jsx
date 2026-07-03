import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Loader2, AlertTriangle } from "lucide-react";

const METHODS = [
  { value: "in_app", label: "In-App" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];

function Toggle({ checked, onChange, label, warning }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.offWhite, border: `1.5px solid ${C.cream}` }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex w-full items-center justify-between"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span className="text-sm font-bold" style={{ color: C.darkGreen }}>{label}</span>
        <span
          className="flex items-center rounded-full transition-all"
          style={{ width: 46, height: 26, background: checked ? C.midGreen : "#cfc6ba", padding: 3 }}
        >
          <span className="rounded-full transition-all" style={{ width: 20, height: 20, background: "#fff", marginLeft: checked ? 20 : 0 }} />
        </span>
      </button>
      {warning && <p className="mt-1.5 text-[11px] font-bold" style={{ color: "#B84C2A" }}>{warning}</p>}
    </div>
  );
}

export default function SupportContactForm({ userId, contact, onClose, onSaved }) {
  const editing = !!contact;
  const [form, setForm] = useState({
    contact_name: contact?.contact_name || "",
    contact_relationship: contact?.contact_relationship || "",
    phone_number: contact?.phone_number || "",
    email: contact?.email || "",
    preferred_contact_method: contact?.preferred_contact_method || "in_app",
    can_receive_sos_alerts: editing ? !!contact.can_receive_sos_alerts : true,
    can_receive_gps: editing ? !!contact.can_receive_gps : false,
    can_receive_message_details: editing ? !!contact.can_receive_message_details : false,
    safe_word: contact?.safe_word || "",
    active: editing ? contact.active !== false : true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.contact_name.trim()) {
      setError("Please enter a contact name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, contact_name: form.contact_name.trim(), user_id: userId, updated_by: userId };
      if (editing) {
        await base44.entities.SupportContact.update(contact.id, payload);
      } else {
        await base44.entities.SupportContact.create({ ...payload, is_deleted: false });
      }
      onSaved();
    } catch (e) {
      setError(e.message || "Could not save this contact.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-3xl" style={{ background: "#fff" }}>
        <div className="sticky top-0 flex items-center justify-between px-5 py-4" style={{ background: C.darkGreen }}>
          <p className="font-serif text-base font-black" style={{ color: "#fff" }}>{editing ? "Edit Support Contact" : "Add Support Contact"}</p>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Close">
            <X size={20} color="rgba(255,255,255,0.85)" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>CONTACT NAME *</label>
            <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="e.g. Maria Lopez"
              className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>RELATIONSHIP / ROLE</label>
            <input value={form.contact_relationship} onChange={(e) => set("contact_relationship", e.target.value)} placeholder="e.g. Sponsor, Friend, Mother, Therapist"
              className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>PHONE</label>
              <input value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder="(555) 123-4567"
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>EMAIL</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@email.com"
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>PREFERRED CONTACT METHOD</label>
            <select value={form.preferred_contact_method} onChange={(e) => set("preferred_contact_method", e.target.value)}
              className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <Toggle label="Can receive SOS alerts" checked={form.can_receive_sos_alerts} onChange={(v) => set("can_receive_sos_alerts", v)} />
            <Toggle label="Can receive GPS location" checked={form.can_receive_gps} onChange={(v) => set("can_receive_gps", v)}
              warning="Only enable if you trust this person with your real-time location." />
            <Toggle label="Can receive message details" checked={form.can_receive_message_details} onChange={(v) => set("can_receive_message_details", v)}
              warning="Only enable if you want this person to read your SOS message content." />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black" style={{ color: C.mutedText }}>SAFE WORD OR CONTACT INSTRUCTION (optional)</label>
            <textarea value={form.safe_word} onChange={(e) => set("safe_word", e.target.value)} rows={2} placeholder="e.g. If I text 'sunflower', please call me right away."
              className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }} />
          </div>

          <Toggle label="Active" checked={form.active} onChange={(v) => set("active", v)} />

          <div className="rounded-2xl p-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
            <p className="flex items-start gap-2 text-[11px] font-bold" style={{ color: "#B84C2A" }}>
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
              No co-parents or professionals are notified by default. You must explicitly add them here.
            </p>
          </div>

          {error && <p className="text-center text-xs font-bold" style={{ color: "#C0392B" }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-black"
              style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: saving ? "default" : "pointer" }}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editing ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
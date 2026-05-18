import { useState } from "react";
import { C } from "@/lib/rooted-constants";

export default function BehavioralHealthConsentPanel({ user, releases, onCreate }) {
  const [form, setForm] = useState({ recipient_name: "", recipient_role: "behavioral_health", recipient_contact: "", purpose: "", allowed_segments: ["behavioral_health"], expires_at: "" });

  async function submit(e) {
    e.preventDefault();
    await onCreate({
      ...form,
      owner_email: user.email,
      starts_at: new Date().toISOString().slice(0, 10),
      signed_at: new Date().toISOString(),
      signature_name: user.full_name || user.email,
      status: "active"
    });
    setForm({ recipient_name: "", recipient_role: "behavioral_health", recipient_contact: "", purpose: "", allowed_segments: ["behavioral_health"], expires_at: "" });
  }

  function toggleSegment(segment) {
    setForm(prev => ({
      ...prev,
      allowed_segments: prev.allowed_segments.includes(segment) ? prev.allowed_segments.filter(s => s !== segment) : [...prev.allowed_segments, segment]
    }));
  }

  return (
    <section className="rounded-3xl border p-4 space-y-4" style={{ background: C.white, borderColor: C.cream }}>
      <div>
        <p className="font-serif font-bold text-lg" style={{ color: C.darkText }}>Consent management</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Share only the segments you choose, for the purpose you name.</p>
      </div>

      <form onSubmit={submit} className="space-y-2">
        <input required placeholder="Recipient name" value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input placeholder="Contact email or phone" value={form.recipient_contact} onChange={e => setForm({ ...form, recipient_contact: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input required placeholder="Purpose for sharing" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <input required type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        <div className="flex flex-wrap gap-2">
          {["behavioral_health", "substance_use", "safety", "medical"].map(segment => (
            <button key={segment} type="button" onClick={() => toggleSegment(segment)} className="rounded-full px-3 py-1 text-xs font-bold" style={{ border: `1px solid ${C.cream}`, background: form.allowed_segments.includes(segment) ? C.darkGreen : C.offWhite, color: form.allowed_segments.includes(segment) ? "#fff" : C.darkText }}>{segment}</button>
          ))}
        </div>
        <button className="w-full rounded-xl px-3 py-2 text-sm font-bold" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Create consent release</button>
      </form>

      <div className="space-y-2">
        {releases.map(release => (
          <div key={release.id} className="rounded-xl p-3 text-xs" style={{ background: C.offWhite, color: C.darkText }}>
            <strong>{release.recipient_name}</strong> · {release.status}<br />
            Segments: {(release.allowed_segments || []).join(", ")}<br />
            Expires: {release.expires_at || "not set"}
          </div>
        ))}
      </div>
    </section>
  );
}
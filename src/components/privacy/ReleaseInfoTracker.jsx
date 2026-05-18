import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { FileSignature } from "lucide-react";

export default function ReleaseInfoTracker({ user }) {
  const [releases, setReleases] = useState([]);
  const [form, setForm] = useState({ recipient_name: "", purpose: "", recipient_role: "other", starts_at: new Date().toISOString().slice(0, 10), expires_at: "" });

  useEffect(() => {
    if (user?.email) base44.entities.ReleaseOfInformation.filter({ owner_email: user.email }, "-signed_at", 20).then(setReleases);
  }, [user?.email]);

  async function addRelease(e) {
    e.preventDefault();
    const created = await base44.entities.ReleaseOfInformation.create({ ...form, owner_email: user.email, allowed_segments: ["general"], status: "active", signature_name: user.full_name || user.email, signed_at: new Date().toISOString() });
    setReleases(prev => [created, ...prev]);
    setForm(prev => ({ ...prev, recipient_name: "", purpose: "", expires_at: "" }));
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="flex items-center gap-2 font-serif text-base font-bold" style={{ color: C.darkGreen }}><FileSignature size={16} /> Release of information</p>
      <p className="mt-1 text-xs" style={{ color: C.mutedText }}>Track who you gave permission to share information with and why.</p>
      <form onSubmit={addRelease} className="mt-3 grid gap-2">
        <input required value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} placeholder="Recipient name" className="rounded-xl px-3 py-2 text-sm" />
        <input required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose" className="rounded-xl px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className="rounded-xl px-3 py-2 text-sm" />
          <input required type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="rounded-xl px-3 py-2 text-sm" />
        </div>
        <button className="rounded-xl py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}>Add release</button>
      </form>
      <div className="mt-3 space-y-2">
        {releases.map(item => <div key={item.id} className="rounded-xl p-2 text-xs" style={{ background: C.offWhite, color: C.darkGreen }}><b>{item.recipient_name}</b> · {item.status} · expires {item.expires_at}</div>)}
      </div>
    </section>
  );
}
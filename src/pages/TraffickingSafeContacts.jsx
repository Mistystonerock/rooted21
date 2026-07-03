import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Users, Plus, Loader2, Lock, ShieldCheck } from "lucide-react";
import TraffickingHeader from "@/components/trafficking/TraffickingHeader";
import SupportContactCard from "@/components/support-contacts/SupportContactCard";
import SupportContactForm from "@/components/support-contacts/SupportContactForm";

export default function TraffickingSafeContacts() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async (uid) => {
    const rows = await base44.entities.SupportContact.filter({ user_id: uid, is_deleted: false }, "-created_date");
    setContacts(rows);
  }, []);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await load(u.id);
      setLoading(false);
    })();
  }, [load]);

  function openAdd() { setEditing(null); setShowForm(true); }
  function openEdit(c) { setEditing(c); setShowForm(true); }
  async function handleSaved() { setShowForm(false); setEditing(null); if (user) await load(user.id); }

  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <TraffickingHeader title="Safe Contact Plan" subtitle="You choose who is safe" backTo="/human-trafficking-support" />

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}40` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
              <Lock size={18} color="#fff" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              These are the people you decide are safe to reach when you need help. For each person you choose whether they get SOS alerts,
              can see your location, and can read your message. No one is contacted unless you add them — nothing is shared automatically.
            </p>
          </div>
        </section>

        <button type="button" onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black shadow-lg"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          <Plus size={20} /> Add a safe contact
        </button>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin" color={C.darkGreen} /></div>
        ) : contacts.length === 0 ? (
          <section className="rounded-3xl p-6 text-center" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.cream }}>
              <Users size={26} color={C.darkGreen} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              You haven't added any safe contacts yet. You can add someone you trust, or reach out anytime through the hotline and secure SOS instead.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <SupportContactCard key={c.id} contact={c} userId={user?.id} onEdit={openEdit} onChanged={() => load(user.id)} />
            ))}
          </div>
        )}

        <Link to="/trafficking-emergency" className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black no-underline"
          style={{ background: "#fff", color: C.darkGreen, border: `2px solid ${C.darkGreen}` }}>
          <ShieldCheck size={18} /> Go to Get help now
        </Link>
      </main>

      {showForm && user && (
        <SupportContactForm userId={user.id} contact={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />
      )}
    </div>
  );
}
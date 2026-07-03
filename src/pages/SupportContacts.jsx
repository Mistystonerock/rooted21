import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, X, Plus, Users, ShieldCheck, Loader2 } from "lucide-react";
import { activateQuickExit } from "@/lib/survivorMode";
import SupportContactCard from "@/components/support-contacts/SupportContactCard";
import SupportContactForm from "@/components/support-contacts/SupportContactForm";

export default function SupportContacts() {
  const navigate = useNavigate();
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

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(contact) {
    setEditing(contact);
    setShowForm(true);
  }

  async function handleSaved() {
    setShowForm(false);
    setEditing(null);
    if (user) await load(user.id);
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[520px] items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="rounded-xl p-2"
            style={{ background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer" }} aria-label="Go back">
            <ChevronLeft size={22} color="#fff" />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>My Support Contacts</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>You control who is contacted when you need help.</p>
          </div>
          <button type="button" onClick={() => activateQuickExit()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "none", cursor: "pointer" }}
            aria-label="Quick exit to a safe screen">
            <X size={16} color="#fff" /> Quick exit
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}40` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              These are the people you trust to be notified when you send an SOS. You choose who gets alerted, who sees your location, and who reads your message. No one is notified unless you add them here.
            </p>
          </div>
        </section>

        <button type="button" onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black shadow-lg"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          <Plus size={20} /> Add Support Contact
        </button>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={28} className="animate-spin" color={C.darkGreen} /></div>
        ) : contacts.length === 0 ? (
          <section className="rounded-3xl p-6 text-center" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.cream }}>
              <Users size={26} color={C.darkGreen} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mutedText }}>
              You haven't added any support contacts yet. Your SOS will still be saved and emergency resources will still be shown, but no one will be automatically notified. Add a trusted person to get alerts when you need help.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <SupportContactCard key={c.id} contact={c} userId={user?.id} onEdit={openEdit} onChanged={() => load(user.id)} />
            ))}
          </div>
        )}
      </main>

      {showForm && user && (
        <SupportContactForm userId={user.id} contact={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />
      )}
    </div>
  );
}
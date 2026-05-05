import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Calendar, Video, Clock, Users, ExternalLink, Bell, Plus, Pencil, Trash2, X, Check } from "lucide-react";

function ClassForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: "", abbr: "", date: "", time: "", description: "", join_url: "", is_published: true
  });

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.midGreen}` }}>
      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{initial ? "Edit Class" : "Add New Class"}</p>
      {[
        { key: "title", label: "Class Title", placeholder: "e.g. Parenting for Positive Self Worth" },
        { key: "abbr", label: "Abbreviation", placeholder: "e.g. PPSW" },
        { key: "date", label: "Date", placeholder: "e.g. Friday, June 6, 2025" },
        { key: "time", label: "Time", placeholder: "e.g. 6:00 PM EST" },
        { key: "join_url", label: "Teams / Zoom Link", placeholder: "https://..." },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>{label.toUpperCase()}</p>
          <input
            className="w-full rounded-xl px-3 py-2 text-xs border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
            placeholder={placeholder}
            value={form[key] || ""}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          />
        </div>
      ))}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DESCRIPTION</p>
        <textarea
          className="w-full rounded-xl px-3 py-2 text-xs border outline-none resize-none"
          style={{ borderColor: C.cream, background: C.offWhite, minHeight: 72 }}
          placeholder="Brief description of the class..."
          value={form.description || ""}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!form.is_published}
          onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
          style={{ accentColor: C.darkGreen }}
        />
        <span className="text-xs" style={{ color: C.darkGreen }}>Published (visible to users)</span>
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Check size={13} /> Save Class
        </button>
        <button
          onClick={onCancel}
          className="py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

function ClassCard({ cls, isAdmin, onEdit, onDelete }) {
  const [interested, setInterested] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
      <div className="px-4 py-3" style={{ background: C.darkGreen }}>
        <div className="flex items-center justify-between">
          {cls.abbr && (
            <span className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full" style={{ background: "#ffffff22", color: "#fff" }}>
              {cls.abbr}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "#ffffff22", color: "#fff" }}>
            LIVE CLASS
          </span>
        </div>
        <p className="font-serif font-bold text-sm mt-2" style={{ color: "#fff" }}>{cls.title}</p>
        {isAdmin && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => onEdit(cls)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "#ffffff22", color: "#fff", border: "none", cursor: "pointer" }}>
              <Pencil size={10} /> Edit
            </button>
            <button onClick={() => onDelete(cls)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "#ff000033", color: "#ffaaaa", border: "none", cursor: "pointer" }}>
              <Trash2 size={10} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3" style={{ background: "#fff" }}>
        <div className="flex items-center gap-2">
          <Calendar size={14} color={C.midGreen} />
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{cls.date || "Date TBA"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} color={C.gold} />
          <p className="text-xs" style={{ color: C.mutedText }}>{cls.time || "Time TBA"}</p>
        </div>
        {cls.description && (
          <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{cls.description}</p>
        )}

        {cls.join_url ? (
          <a
            href={cls.join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
            style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}
          >
            <Video size={15} /> Join Live Class <ExternalLink size={12} />
          </a>
        ) : (
          <button
            onClick={() => setInterested(!interested)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: interested ? C.midGreen : C.cream,
              color: interested ? "#fff" : C.darkGreen,
              border: "none", cursor: "pointer",
            }}
          >
            <Bell size={14} />
            {interested ? "✓ We'll notify you when the link is ready" : "Notify Me When Link is Available"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.LiveClass.list("-created_date"),
    ]).then(([u, cls]) => {
      setUser(u);
      setClasses(cls);
      setLoading(false);
    });
  }, []);

  async function handleSave(form) {
    if (editingClass) {
      const updated = await base44.entities.LiveClass.update(editingClass.id, form);
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...form } : c));
    } else {
      const created = await base44.entities.LiveClass.create(form);
      setClasses(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditingClass(null);
  }

  async function handleDelete(cls) {
    if (!confirm(`Delete "${cls.title}"?`)) return;
    await base44.entities.LiveClass.delete(cls.id);
    setClasses(prev => prev.filter(c => c.id !== cls.id));
  }

  const visibleClasses = isAdmin ? classes : classes.filter(c => c.is_published !== false);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Live Classes" subtitle="Join a parenting class or group" backTo="/dashboard" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🎓</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Live Parenting Classes</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
            Join live, facilitated parenting classes taught by a certified Rooted 21 facilitator. Classes meet virtually via Teams or Zoom.
          </p>
        </div>

        {/* Notice */}
        <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#F0F6F0", border: `1px solid ${C.midGreen}` }}>
          <span className="text-base flex-shrink-0">📋</span>
          <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
            <strong>Please note:</strong> These are facilitated group classes. No training materials or curriculum documents will be shared. All learning happens live during the session.
          </p>
        </div>

        {/* Admin: Add class button */}
        {isAdmin && !showForm && !editingClass && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
            style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            <Plus size={15} /> Add New Class
          </button>
        )}

        {/* Add/Edit form */}
        {(showForm || editingClass) && (
          <ClassForm
            initial={editingClass}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingClass(null); }}
          />
        )}

        {/* Classes list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent` }} />
          </div>
        ) : visibleClasses.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="text-2xl mb-2">📅</p>
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No classes scheduled yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Check back soon — classes will be posted here when scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleClasses.map(cls => (
              <ClassCard
                key={cls.id}
                cls={cls}
                isAdmin={isAdmin}
                onEdit={c => { setEditingClass(c); setShowForm(false); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>How It Works</p>
          {[
            ["🔗", "A Teams or Zoom link will be shared before each class"],
            ["👥", "Open to all parents and caregivers in the Rooted 21 community"],
            ["🎓", "Taught by a certified facilitator — come ready to participate"],
            ["🔒", "No materials are distributed — learning happens live in the group"],
          ].map(([emoji, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">{emoji}</span>
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream }}>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Questions about upcoming classes?</p>
          <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>
            Contact us at{" "}
            <a href="mailto:mstonerock@rooted21parenting.com" style={{ color: C.midGreen, fontWeight: "bold" }}>
              mstonerock@rooted21parenting.com
            </a>
          </p>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Plus } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileHeader";
import ChildProfileCard from "@/components/children/ChildProfileCard";
import ChildProfileForm from "@/components/children/ChildProfileForm";
import ChildDataConsentModal, { hasChildDataConsent } from "@/components/legal/ChildDataConsentModal";

const MAX_CHILDREN = 10;

export default function ChildProfiles() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [user, setUser] = useState(null);
  const [showDataConsent, setShowDataConsent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
    loadChildren();
    if (!hasChildDataConsent()) setShowDataConsent(true);
  }, []);

  async function loadChildren() {
    const list = await base44.entities.ChildProfile.list("-created_date", 50);
    setChildren(list);
    setLoading(false);
  }

  async function handleSave(data) {
    if (!editing && children.length >= MAX_CHILDREN) return;
    setSaving(true);
    if (editing) {
      await base44.entities.ChildProfile.update(editing.id, data);
    } else {
      await base44.entities.ChildProfile.create(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    loadChildren();
  }

  async function handleDelete(child) {
    await base44.entities.ChildProfile.delete(child.id);
    setDeleteConfirm(null);
    loadChildren();
  }

  function openEdit(child) {
    setEditing(child);
    setShowForm(true);
  }

  function openNew() {
    if (children.length >= MAX_CHILDREN) return;
    setEditing(null);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {showDataConsent && (
        <ChildDataConsentModal
          user={user}
          onAccept={() => setShowDataConsent(false)}
        />
      )}
      <MobileHeader
        title="Child Profiles"
        subtitle="Personalize AI insights for each child"
        backTo="/dashboard"
        rightSlot={
          !showForm && children.length < MAX_CHILDREN && (
            <button
              onClick={openNew}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "#ffffff22", border: "none", cursor: "pointer" }}
            >
              <Plus size={20} color={C.cream} />
            </button>
          )
        }
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        <div className="rounded-xl p-3.5" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{children.length}/{MAX_CHILDREN} child profiles added</p>
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-4" style={{ color: C.darkGreen }}>
              {editing ? `Edit ${editing.first_name}'s Profile` : "Add a Child Profile"}
            </p>
            <ChildProfileForm
              initial={editing}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />
          </div>
        )}

        {/* Empty state */}
        {!showForm && children.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "#fff", border: `1.5px dashed ${C.midGreen}` }}
          >
            <p className="text-4xl mb-3">🧒</p>
            <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>
              No child profiles yet
            </p>
            <p className="text-xs mb-4" style={{ color: C.mutedText }}>
              Add a profile for each child so Rooted 21 can personalize AI-generated growth insights, habits, and recommendations just for them.
            </p>
            <button
              onClick={openNew}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
            >
              + Add First Child
            </button>
          </div>
        )}

        {/* Info banner */}
        {!showForm && children.length > 0 && (
          <div className="rounded-xl p-3.5" style={{ background: `${C.midGreen}12`, border: `1px solid ${C.midGreen}30` }}>
            <p className="text-[11px] leading-relaxed" style={{ color: C.darkGreen }}>
              🌱 <strong>Care goals</strong> you set here are used to personalize your AI parenting insights, weekly habit reflections, and growth suggestions for each child.
            </p>
          </div>
        )}

        {/* Child cards */}
        {!showForm && children.map(child => (
          <ChildProfileCard
            key={child.id}
            child={child}
            onEdit={openEdit}
            onDelete={setDeleteConfirm}
          />
        ))}

        {/* Add another button */}
        {!showForm && children.length > 0 && children.length < MAX_CHILDREN && (
          <button
            onClick={openNew}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "#fff", border: `1.5px dashed ${C.midGreen}`, color: C.darkGreen, cursor: "pointer" }}
          >
            <Plus size={16} color={C.midGreen} /> Add Another Child
          </button>
        )}

        {!showForm && children.length >= MAX_CHILDREN && (
          <div className="rounded-xl p-3.5 text-center" style={{ background: C.cream, border: `1px solid ${C.midGreen}30` }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>You’ve reached the 10-child profile limit.</p>
          </div>
        )}

        <div className="pb-8" />
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div className="w-full max-w-[340px] rounded-2xl p-5 space-y-4" style={{ background: "#fff" }}>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              Remove {deleteConfirm.first_name}'s profile?
            </p>
            <p className="text-xs" style={{ color: C.mutedText }}>
              This will permanently delete this child's profile and all their care goals. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: C.cream, color: C.mutedText, border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "#B84C2A", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { rememberSelectedChild } from "@/lib/child-selection";
import { createFamilyLinkedChild } from "@/lib/family-hub";
import ChildProfileForm from "@/components/children/ChildProfileForm";

export default function QuickAddChildCard({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(data) {
    setSaving(true);
    const user = await base44.auth.me();
    const child = await createFamilyLinkedChild(data, user);
    rememberSelectedChild(child);
    setSaving(false);
    setOpen(false);
    onCreated?.(child);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl p-3 text-left"
        style={{ background: C.white, border: `1.5px dashed ${C.midGreen}`, cursor: "pointer" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${C.midGreen}18` }}>
            <Plus size={20} color={C.midGreen} />
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Add a Child</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>Create a separate profile for tracking</p>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-3xl p-5" style={{ background: C.white }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Add a Child</p>
                <p className="text-[11px]" style={{ color: C.mutedText }}>Their data will stay separate across the app.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2" style={{ background: C.cream, border: "none", cursor: "pointer" }}>
                <X size={16} color={C.mutedText} />
              </button>
            </div>
            <ChildProfileForm onSave={handleSave} onCancel={() => setOpen(false)} saving={saving} />
          </div>
        </div>
      )}
    </>
  );
}
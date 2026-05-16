import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft } from "lucide-react";
import { SELECTED_CHILD_KEY, rememberSelectedChild } from "@/lib/child-selection";
import ChildProfileForm from "@/components/children/ChildProfileForm";

export default function ChildProfile() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedChildId = urlParams.get("childId") || localStorage.getItem(SELECTED_CHILD_KEY);

    base44.entities.ChildProfile.list("-created_date", 100).then(children => {
      const selectedChild = children.find(item => item.id === requestedChildId || item.child_uid === requestedChildId) || null;
      setChild(selectedChild);
      setLoading(false);
    });
  }, []);

  async function handleSave(data) {
    setSaving(true);
    if (child?.id) {
      const updated = await base44.entities.ChildProfile.update(child.id, data);
      rememberSelectedChild(updated || { ...child, ...data });
    } else {
      const created = await base44.entities.ChildProfile.create(data);
      rememberSelectedChild(created);
    }
    setSaving(false);
    navigate("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard" aria-label="Back to dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div>
          <p className="font-serif font-bold" style={{ color: C.cream }}>{child ? `Edit ${child.first_name}` : "Add Child Profile"}</p>
          <p className="text-[11px]" style={{ color: C.lightGreen }}>{child ? "Update this specific child profile" : "Create a separate profile for tracking"}</p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        <div className="rounded-xl p-3.5" style={{ background: C.darkGreen }}>
          <p className="text-xs" style={{ color: C.lightGreen }}>
            This profile helps personalize support for each child. Every profile is saved and opened by its unique child ID.
          </p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <ChildProfileForm
            initial={child}
            onSave={handleSave}
            onCancel={() => navigate("/dashboard")}
            saving={saving}
          />
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
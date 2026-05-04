import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Plus, Trash2, Check, AlertTriangle } from "lucide-react";

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function PartnershipSafetyPlan() {
  const { partnershipId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const partnerships = await base44.entities.CoParentingPartnership.filter({
        id: partnershipId,
      });
      const p = partnerships[0];
      setPartnership(p);

      if (!p) {
        setLoading(false);
        return;
      }

      // Check if user is one of the parents
      const isParent =
        currentUser.email === p.parent_1_email ||
        currentUser.email === p.parent_2_email;
      if (!isParent) {
        setLoading(false);
        return;
      }

      // Fetch or create safety plan
      const plans = await base44.entities.PartnershipSafetyPlan.filter({
        partnership_id: partnershipId,
      });

      if (plans.length > 0) {
        setPlan(plans[0]);
      } else {
        // Create new plan
        const newPlan = await base44.entities.PartnershipSafetyPlan.create({
          partnership_id: partnershipId,
          child_name: p.child_name,
          emergency_contacts: [],
          safe_locations: [],
          calming_activities: [],
          parent1_agreed: false,
          parent2_agreed: false,
        });
        setPlan(newPlan);
      }

      setLoading(false);
    };

    loadData();
  }, [partnershipId]);

  async function handleSave() {
    if (!plan) return;
    setSaving(true);

    const isParent1 = user?.email === partnership?.parent_1_email;
    const updatedPlan = {
      ...plan,
      [isParent1 ? "parent1_agreed" : "parent2_agreed"]: true,
      last_reviewed_date: new Date().toISOString().split("T")[0],
    };

    await base44.entities.PartnershipSafetyPlan.update(plan.id, updatedPlan);
    setPlan(updatedPlan);
    setSaving(false);
  }

  function addContact() {
    const contacts = plan.emergency_contacts || [];
    contacts.push({
      id: generateId(),
      name: "",
      role: "",
      phone: "",
      when_to_call: "",
    });
    setPlan({ ...plan, emergency_contacts: contacts });
  }

  function removeContact(id) {
    setPlan({
      ...plan,
      emergency_contacts: plan.emergency_contacts.filter((c) => c.id !== id),
    });
  }

  function updateContact(id, field, value) {
    const contacts = plan.emergency_contacts.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setPlan({ ...plan, emergency_contacts: contacts });
  }

  function addLocation() {
    const locations = plan.safe_locations || [];
    locations.push({ id: generateId(), name: "", address: "", phone: "" });
    setPlan({ ...plan, safe_locations: locations });
  }

  function removeLocation(id) {
    setPlan({
      ...plan,
      safe_locations: plan.safe_locations.filter((l) => l.id !== id),
    });
  }

  function updateLocation(id, field, value) {
    const locations = plan.safe_locations.map((l) =>
      l.id === id ? { ...l, [field]: value } : l
    );
    setPlan({ ...plan, safe_locations: locations });
  }

  function addActivity() {
    const activities = plan.calming_activities || [];
    activities.push({ id: generateId(), activity: "", description: "" });
    setPlan({ ...plan, calming_activities: activities });
  }

  function removeActivity(id) {
    setPlan({
      ...plan,
      calming_activities: plan.calming_activities.filter((a) => a.id !== id),
    });
  }

  function updateActivity(id, field, value) {
    const activities = plan.calming_activities.map((a) =>
      a.id === id ? { ...a, [field]: value } : a
    );
    setPlan({ ...plan, calming_activities: activities });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  if (!partnership || !user) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center" style={{ background: C.offWhite }}>
        <AlertTriangle size={32} color={C.brown} className="mb-3" />
        <p style={{ color: C.darkGreen }}>Not authorized to access this plan</p>
        <Link to="/co-parent-portal" className="mt-4 text-sm font-bold" style={{ color: C.midGreen }}>
          Back to Co-Parent Portal
        </Link>
      </div>
    );
  }

  const isParent1 = user.email === partnership.parent_1_email;
  const parentHasAgreed = isParent1 ? plan.parent1_agreed : plan.parent2_agreed;
  const otherParentHasAgreed = isParent1 ? plan.parent2_agreed : plan.parent1_agreed;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <button
          onClick={() => navigate(`/co-parent-portal`)}
          className="rounded-lg p-1.5"
          style={{ background: "#ffffff18", border: "none", cursor: "pointer" }}
        >
          <ChevronLeft size={18} color={C.cream} />
        </button>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
            Co-Parent Safety Plan
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>
            {partnership.child_name}
          </p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Header info */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-xs font-bold mb-1" style={{ color: C.mutedText }}>
            AGREEMENT STATUS
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                {isParent1 ? partnership.parent_1_name : partnership.parent_2_name} (You)
              </p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>
                {parentHasAgreed ? "✓ Agreed" : "Pending review"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                {isParent1 ? partnership.parent_2_name : partnership.parent_1_name}
              </p>
              <p className="text-[10px]" style={{ color: C.mutedText }}>
                {otherParentHasAgreed ? "✓ Agreed" : "Pending review"}
              </p>
            </div>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
            🚨 Warning Signs
          </p>
          <textarea
            value={plan.warning_signs || ""}
            onChange={(e) => setPlan({ ...plan, warning_signs: e.target.value })}
            placeholder="Observable signs that child is becoming dysregulated (e.g., increased tone of voice, clenched fists, pacing)"
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            rows={3}
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* De-escalation Strategies */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="font-serif font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
            💬 De-escalation Strategies
          </p>
          <textarea
            value={plan.de_escalation_strategies || ""}
            onChange={(e) =>
              setPlan({ ...plan, de_escalation_strategies: e.target.value })
            }
            placeholder="Specific techniques both parents agree to use (e.g., give space, lower voice, offer choices, validate feelings)"
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            rows={4}
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
          />
        </div>

        {/* Emergency Contacts */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              📞 Emergency Contacts
            </p>
            <button
              onClick={addContact}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              style={{ background: C.midGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {plan.emergency_contacts?.map((contact) => (
            <div key={contact.id} className="mb-3 p-3 rounded-lg" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                placeholder="Name"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <input
                type="text"
                value={contact.role}
                onChange={(e) => updateContact(contact.id, "role", e.target.value)}
                placeholder="Role (e.g., Therapist, Caseworker)"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                placeholder="Phone"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <input
                type="text"
                value={contact.when_to_call}
                onChange={(e) => updateContact(contact.id, "when_to_call", e.target.value)}
                placeholder="When to call (e.g., Safety concerns, suicidal talk)"
                className="w-full text-xs px-2 py-1.5 rounded mb-2"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <button
                onClick={() => removeContact(contact.id)}
                className="text-[10px] font-bold text-destructive"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <Trash2 size={12} className="inline mr-1" /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Safe Locations */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              🏡 Safe Locations
            </p>
            <button
              onClick={addLocation}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              style={{ background: C.midGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {plan.safe_locations?.map((location) => (
            <div key={location.id} className="mb-3 p-3 rounded-lg" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                type="text"
                value={location.name}
                onChange={(e) => updateLocation(location.id, "name", e.target.value)}
                placeholder="Location name"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <input
                type="text"
                value={location.address}
                onChange={(e) => updateLocation(location.id, "address", e.target.value)}
                placeholder="Address"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <input
                type="text"
                value={location.phone}
                onChange={(e) => updateLocation(location.id, "phone", e.target.value)}
                placeholder="Contact phone"
                className="w-full text-xs px-2 py-1.5 rounded mb-2"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <button
                onClick={() => removeLocation(location.id)}
                className="text-[10px] font-bold text-destructive"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <Trash2 size={12} className="inline mr-1" /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Calming Activities */}
        <div className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
              🧘 Calming Activities
            </p>
            <button
              onClick={addActivity}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
              style={{ background: C.midGreen, color: C.white, border: "none", cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {plan.calming_activities?.map((activity) => (
            <div key={activity.id} className="mb-3 p-3 rounded-lg" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                type="text"
                value={activity.activity}
                onChange={(e) => updateActivity(activity.id, "activity", e.target.value)}
                placeholder="Activity (e.g., Deep breathing, coloring)"
                className="w-full text-xs px-2 py-1.5 rounded mb-1.5"
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <textarea
                value={activity.description}
                onChange={(e) => updateActivity(activity.id, "description", e.target.value)}
                placeholder="How to do this activity"
                className="w-full text-xs px-2 py-1.5 rounded resize-none"
                rows={2}
                style={{ border: `1px solid ${C.cream}`, background: C.white }}
              />
              <button
                onClick={() => removeActivity(activity.id)}
                className="text-[10px] font-bold text-destructive mt-2"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <Trash2 size={12} className="inline mr-1" /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Agreement button */}
        {!parentHasAgreed && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: C.midGreen,
              color: C.white,
              border: "none",
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Check size={16} /> {saving ? "Saving..." : "Review & Agree to Plan"}
          </button>
        )}

        {parentHasAgreed && (
          <div className="rounded-lg p-3 text-center" style={{ background: `${C.midGreen}20`, border: `1px solid ${C.midGreen}` }}>
            <p className="text-xs font-bold" style={{ color: C.midGreen }}>
              ✓ You have agreed to this plan
            </p>
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}
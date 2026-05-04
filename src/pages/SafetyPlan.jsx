import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  ChevronLeft, Save, Download, Printer, Plus, Trash2, X,
  CheckCircle2, AlertCircle
} from "lucide-react";
import SafetyPlanTemplate from "@/components/safety-plan/SafetyPlanTemplate";

let idCounter = 1;
function uid() { return `item_${Date.now()}_${idCounter++}`; }

const DEFAULT_PLAN = {
  child_name: "",
  child_age: "",
  parent_name: "",
  contacts: [],
  safe_locations: [],
  calming_activities: [],
  warning_signs: "",
  crisis_resources: "🚨 Call 988 (Suicide & Crisis Lifeline)\n📞 Call 911 for immediate danger\n💬 Text HOME to 741741 (Crisis Text Line)",
  important_notes: "",
  is_active: true,
};

export default function SafetyPlan() {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [saved, setSaved] = useState(null);
  const [existingPlan, setExistingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Form sections visibility
  const [showContactForm, setShowContactForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  // Form states
  const [contactForm, setContactForm] = useState({ name: "", role: "", phone: "", relationship: "" });
  const [locationForm, setLocationForm] = useState({ name: "", address: "", description: "" });
  const [activityForm, setActivityForm] = useState({ activity: "", description: "", emoji: "✨" });

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      const existing = await base44.entities.SafetyPlan.list("-created_date", 1);
      if (existing.length > 0) {
        setExistingPlan(existing[0]);
        setPlan(existing[0]);
      }
      setLoading(false);
    });
  }, []);

  // ── SAVE PLAN ──
  async function handleSave() {
    if (!plan.child_name.trim()) return;
    setSaving(true);
    const data = {
      ...plan,
      created_date: new Date().toISOString().split("T")[0],
    };
    let result;
    if (existingPlan?.id) {
      result = await base44.entities.SafetyPlan.update(existingPlan.id, data);
    } else {
      result = await base44.entities.SafetyPlan.create(data);
      setExistingPlan(result);
    }
    setPlan(result);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── ADD CONTACT ──
  function addContact() {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
    setPlan(p => ({
      ...p,
      contacts: [...p.contacts, { ...contactForm, id: uid() }],
    }));
    setContactForm({ name: "", role: "", phone: "", relationship: "" });
    setShowContactForm(false);
  }

  // ── ADD LOCATION ──
  function addLocation() {
    if (!locationForm.name.trim()) return;
    setPlan(p => ({
      ...p,
      safe_locations: [...p.safe_locations, { ...locationForm, id: uid() }],
    }));
    setLocationForm({ name: "", address: "", description: "" });
    setShowLocationForm(false);
  }

  // ── ADD ACTIVITY ──
  function addActivity() {
    if (!activityForm.activity.trim()) return;
    setPlan(p => ({
      ...p,
      calming_activities: [...p.calming_activities, { ...activityForm, id: uid() }],
    }));
    setActivityForm({ activity: "", description: "", emoji: "✨" });
    setShowActivityForm(false);
  }

  // ── DELETE ITEM ──
  function deleteContact(id) {
    setPlan(p => ({ ...p, contacts: p.contacts.filter(c => c.id !== id) }));
  }

  function deleteLocation(id) {
    setPlan(p => ({ ...p, safe_locations: p.safe_locations.filter(l => l.id !== id) }));
  }

  function deleteActivity(id) {
    setPlan(p => ({ ...p, calming_activities: p.calming_activities.filter(a => a.id !== id) }));
  }

  // ── PRINT ──
  function handlePrint() {
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("print-area").innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Safety Plan for ${plan.child_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
            h1 { color: #2F4B3A; margin: 0 0 20px 0; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .contact, .location, .activity { background: #f5f5f5; padding: 12px; margin: 8px 0; border-radius: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { margin-top: 4px; color: #555; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none !important; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  // ── GENERATE PDF ──
  async function handleDownloadPDF() {
    setGeneratingPDF(true);
    try {
      const element = document.getElementById("print-area");
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210 - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`SafetyPlan_${plan.child_name}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
    setGeneratingPDF(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // ── PREVIEW MODE ──
  if (showPreview) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
          <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={20} color={C.cream} />
          </button>
          <p className="font-serif font-bold text-sm flex-1" style={{ color: C.cream }}>
            Preview: {plan.child_name}'s Safety Plan
          </p>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
            style={{ background: C.gold, border: "none", color: C.darkGreen, cursor: "pointer" }}
          >
            <Printer size={13} /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
            style={{ background: C.midGreen, border: "none", color: "white", cursor: "pointer", opacity: generatingPDF ? 0.6 : 1 }}
          >
            <Download size={13} /> {generatingPDF ? "PDF..." : "PDF"}
          </button>
        </div>

        <div className="max-w-[800px] mx-auto px-4 py-6">
          <div id="print-area">
            <SafetyPlanTemplate plan={plan} printMode={true} />
          </div>
          <div className="pb-6" />
        </div>
      </div>
    );
  }

  // ── EDIT MODE ──
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Safety Plan</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>For {plan.child_name || "your child"}</p>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
          style={{ background: "#ffffff18", border: "none", color: C.lightGreen, cursor: "pointer" }}
        >
          Eye icon Preview
        </button>
        <button
          onClick={handleSave}
          disabled={!plan.child_name?.trim() || saving}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
          style={{
            background: saved ? C.midGreen : C.gold,
            border: "none",
            color: C.darkGreen,
            cursor: "pointer",
          }}
        >
          {saved ? (
            <><CheckCircle2 size={12} /> Saved</>
          ) : (
            <><Save size={12} /> {saving ? "Saving…" : "Save"}</>
          )}
        </button>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        {/* BASIC INFO */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>CHILD & FAMILY INFO</p>
          <input
            value={plan.child_name}
            onChange={e => setPlan(p => ({ ...p, child_name: e.target.value }))}
            placeholder="Child's name *"
            className="w-full rounded-xl px-3 py-2.5 text-sm font-bold"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", color: C.darkGreen }}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={plan.child_age}
              onChange={e => setPlan(p => ({ ...p, child_age: e.target.value }))}
              placeholder="Age"
              type="number"
              className="rounded-xl px-3 py-2.5 text-sm"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
            />
            <input
              value={plan.parent_name}
              onChange={e => setPlan(p => ({ ...p, parent_name: e.target.value }))}
              placeholder="Your name"
              className="rounded-xl px-3 py-2.5 text-sm"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none" }}
            />
          </div>
        </div>

        {/* WARNING SIGNS */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>⚠️ WARNING SIGNS</p>
          <p className="text-xs" style={{ color: C.mutedText }}>What does dysregulation look like for your child?</p>
          <textarea
            value={plan.warning_signs}
            onChange={e => setPlan(p => ({ ...p, warning_signs: e.target.value }))}
            placeholder="e.g. Increased crying, difficulty focusing, aggressive outbursts, withdrawn behavior..."
            className="w-full rounded-xl px-3 py-2.5 text-sm min-h-24"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* EMERGENCY CONTACTS */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>📞 EMERGENCY CONTACTS</p>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="flex items-center gap-1 text-[10px] font-bold"
              style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {showContactForm && (
            <div className="p-3 rounded-xl space-y-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                value={contactForm.name}
                onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Name"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <input
                value={contactForm.phone}
                onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Phone number"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <input
                value={contactForm.relationship}
                onChange={e => setContactForm(f => ({ ...f, relationship: e.target.value }))}
                placeholder="Relationship (e.g. therapist, grandparent)"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <input
                value={contactForm.role}
                onChange={e => setContactForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Role (optional)"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.cream, border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={addContact}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.midGreen, border: "none", color: "white", cursor: "pointer" }}
                >
                  Add Contact
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {plan.contacts.map(c => (
              <div key={c.id} className="p-2.5 rounded-lg flex items-start justify-between" style={{ background: `${C.midGreen}12` }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>{c.phone}</p>
                  {c.relationship && <p className="text-[9px]" style={{ color: C.mutedText }}>{c.relationship}</p>}
                </div>
                <button
                  onClick={() => deleteContact(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} color={C.mutedText} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SAFE LOCATIONS */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>📍 SAFE LOCATIONS</p>
            <button
              onClick={() => setShowLocationForm(!showLocationForm)}
              className="flex items-center gap-1 text-[10px] font-bold"
              style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {showLocationForm && (
            <div className="p-3 rounded-xl space-y-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                value={locationForm.name}
                onChange={e => setLocationForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Location name"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <input
                value={locationForm.address}
                onChange={e => setLocationForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Address"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <textarea
                value={locationForm.description}
                onChange={e => setLocationForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Why this is a safe place, how to get there, what to do"
                className="w-full rounded-lg px-2.5 py-2 text-xs min-h-16"
                style={{ border: `1px solid ${C.cream}`, outline: "none", fontFamily: "inherit" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLocationForm(false)}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.cream, border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={addLocation}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.midGreen, border: "none", color: "white", cursor: "pointer" }}
                >
                  Add Location
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {plan.safe_locations.map(l => (
              <div key={l.id} className="p-2.5 rounded-lg" style={{ background: `${C.brown}12` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{l.name}</p>
                    {l.address && <p className="text-[10px]" style={{ color: C.mutedText }}>{l.address}</p>}
                  </div>
                  <button
                    onClick={() => deleteLocation(l.id)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={12} color={C.mutedText} />
                  </button>
                </div>
                {l.description && <p className="text-xs mt-1" style={{ color: C.warmText }}>{l.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* CALMING ACTIVITIES */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>✨ CALMING ACTIVITIES</p>
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="flex items-center gap-1 text-[10px] font-bold"
              style={{ background: "none", border: "none", color: C.midGreen, cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {showActivityForm && (
            <div className="p-3 rounded-xl space-y-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <input
                value={activityForm.emoji}
                onChange={e => setActivityForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="Emoji"
                maxLength={2}
                className="w-full rounded-lg px-2.5 py-2 text-sm"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <input
                value={activityForm.activity}
                onChange={e => setActivityForm(f => ({ ...f, activity: e.target.value }))}
                placeholder="Activity name"
                className="w-full rounded-lg px-2.5 py-2 text-xs"
                style={{ border: `1px solid ${C.cream}`, outline: "none" }}
              />
              <textarea
                value={activityForm.description}
                onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                placeholder="How to do it, what it helps with..."
                className="w-full rounded-lg px-2.5 py-2 text-xs min-h-16"
                style={{ border: `1px solid ${C.cream}`, outline: "none", fontFamily: "inherit" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowActivityForm(false)}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.cream, border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={addActivity}
                  className="flex-1 py-1.5 rounded text-xs font-bold"
                  style={{ background: C.midGreen, border: "none", color: "white", cursor: "pointer" }}
                >
                  Add Activity
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {plan.calming_activities.map(a => (
              <div key={a.id} className="p-2.5 rounded-lg flex gap-2" style={{ background: `${C.gold}12` }}>
                <span className="text-lg flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{a.activity}</p>
                  {a.description && <p className="text-[10px] mt-0.5" style={{ color: C.warmText }}>{a.description}</p>}
                </div>
                <button
                  onClick={() => deleteActivity(a.id)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} color={C.mutedText} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CRISIS RESOURCES */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>🆘 CRISIS RESOURCES (always visible)</p>
          <textarea
            value={plan.crisis_resources}
            onChange={e => setPlan(p => ({ ...p, crisis_resources: e.target.value }))}
            placeholder="Emergency hotlines and resources..."
            className="w-full rounded-xl px-3 py-2.5 text-sm min-h-20"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* ADDITIONAL NOTES */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>📝 ADDITIONAL NOTES</p>
          <textarea
            value={plan.important_notes}
            onChange={e => setPlan(p => ({ ...p, important_notes: e.target.value }))}
            placeholder="Any other important information..."
            className="w-full rounded-xl px-3 py-2.5 text-sm min-h-20"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}
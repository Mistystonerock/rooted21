import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ChevronLeft, Download, Lock, Printer, Save, ShieldCheck } from "lucide-react";
import SafetyPlanBuilder from "@/components/safety-plan/SafetyPlanBuilder";
import SafetyPlanPrintView from "@/components/safety-plan/SafetyPlanPrintView";
import SurvivorModeSettings from "@/components/safety-plan/SurvivorModeSettings";
import { getSurvivorPin } from "@/lib/survivorMode";

const DEFAULT_PLAN = {
  child_name: "",
  child_age: "",
  parent_name: "",
  contacts: [],
  trusted_adults: [],
  safe_locations: [],
  code_words: [],
  emergency_escape_plan: "",
  transportation_backup: "",
  medication_list: [],
  important_documents: [],
  child_pickup_plan: "",
  pet_safety_plan: "",
  emergency_bag: [],
  shelter_plan: "",
  after_hours_numbers: [],
  crisis_resources: "Call 911 for immediate danger\nCall or text 988 for mental health crisis\nNational Domestic Violence Hotline: 1-800-799-7233 or text START to 88788",
  pin_enabled: false,
  pin_code: "",
  is_active: true,
};

export default function SafetyPlan() {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [existingPlan, setExistingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    base44.entities.SafetyPlan.list("-updated_date", 20).then(rows => {
      if (rows.length) {
        setExistingPlan(rows[0]);
        setPlan({ ...DEFAULT_PLAN, ...rows[0] });
        setLocked(!!rows[0].pin_enabled || !!getSurvivorPin());
      } else {
        setLocked(!!getSurvivorPin());
      }
      setLoading(false);
    });
  }, []);

  const requiredPin = plan.pin_code || getSurvivorPin();
  const unlock = () => {
    if (!requiredPin || pinInput === requiredPin) setLocked(false);
  };

  async function handleSave() {
    if (!plan.child_name.trim()) return;
    setSaving(true);
    const data = { ...plan, created_date: plan.created_date || new Date().toISOString().split("T")[0] };
    const result = existingPlan?.id ? await base44.entities.SafetyPlan.update(existingPlan.id, data) : await base44.entities.SafetyPlan.create(data);
    setExistingPlan(result);
    setPlan({ ...DEFAULT_PLAN, ...result });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function handlePrint() {
    const printContent = document.getElementById("safety-plan-print").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Safety Plan</title><style>body{font-family:Arial,sans-serif;margin:0}.break-inside-avoid{break-inside:avoid}</style></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  async function handlePDF() {
    setGeneratingPDF(true);
    const element = document.getElementById("safety-plan-print");
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= 277;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= 277;
    }
    pdf.save(`SafetyPlan_${new Date().toISOString().split("T")[0]}.pdf`);
    setGeneratingPDF(false);
  }

  if (loading) return <div className="min-h-screen" style={{ background: C.offWhite }} />;

  if (locked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" style={{ background: C.offWhite }}>
        <section className="w-full max-w-sm rounded-3xl p-5 text-center shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <Lock className="mx-auto mb-3" color={C.darkGreen} />
          <h1 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>Safety plan locked</h1>
          <p className="mt-2 text-sm" style={{ color: C.mutedText }}>Enter your PIN to view or update this plan.</p>
          <input value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="mt-4 w-full rounded-xl px-3 py-3 text-center text-lg font-black" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} placeholder="PIN" />
          <button onClick={unlock} className="mt-3 w-full rounded-xl py-3 font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}>Unlock</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[620px] items-center gap-3">
          <Link to="/dashboard" aria-label="Back"><ChevronLeft color="#fff" /></Link>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: "#fff" }}>Guided Safety Plan</h1>
            <p className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.82)" }}>Secure, editable, printable planning</p>
          </div>
          <button onClick={handleSave} disabled={saving || !plan.child_name.trim()} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.cream, color: C.darkGreen, border: "none", opacity: !plan.child_name.trim() ? 0.6 : 1 }}>
            <Save size={13} className="mr-1" /> {saved ? "Saved" : saving ? "Saving" : "Save"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[620px] space-y-4 px-4 py-5">
        <SurvivorModeSettings />

        <section className="rounded-3xl p-4 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} color={C.darkGreen} />
            <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Plan basics</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={plan.child_name} onChange={e => setPlan(p => ({ ...p, child_name: e.target.value }))} placeholder="Child / family name *" className="rounded-xl px-3 py-2 text-sm sm:col-span-1" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
            <input value={plan.child_age || ""} onChange={e => setPlan(p => ({ ...p, child_age: e.target.value }))} placeholder="Age" className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
            <input value={plan.parent_name || ""} onChange={e => setPlan(p => ({ ...p, parent_name: e.target.value }))} placeholder="Caregiver name" className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
          </div>
          <label className="mt-3 flex items-center justify-between rounded-xl p-3 text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>
            Lock this safety plan with PIN
            <input type="checkbox" checked={!!plan.pin_enabled} onChange={e => setPlan(p => ({ ...p, pin_enabled: e.target.checked }))} />
          </label>
          {plan.pin_enabled && (
            <input value={plan.pin_code || ""} onChange={e => setPlan(p => ({ ...p, pin_code: e.target.value.replace(/\D/g, "").slice(0, 6) }))} inputMode="numeric" placeholder="Plan PIN" className="mt-3 w-full rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.cream}`, background: C.offWhite }} />
          )}
        </section>

        <SafetyPlanBuilder plan={plan} setPlan={setPlan} />

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handlePrint} className="rounded-2xl py-3 text-sm font-black" style={{ background: C.cream, color: C.darkGreen, border: "none" }}><Printer size={16} className="mr-2" /> Print</button>
          <button onClick={handlePDF} disabled={generatingPDF} className="rounded-2xl py-3 text-sm font-black" style={{ background: C.darkGreen, color: "#fff", border: "none" }}><Download size={16} className="mr-2" /> {generatingPDF ? "PDF..." : "Export PDF"}</button>
        </div>
      </div>

      <div id="safety-plan-print" className="fixed -left-[9999px] top-0 w-[800px]">
        <SafetyPlanPrintView plan={plan} />
      </div>
    </main>
  );
}
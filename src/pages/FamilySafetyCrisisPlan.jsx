import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Download, FileText, Loader2, ShieldAlert } from "lucide-react";

const FIELDS = [
  { key: "childName", label: "Child / family member name", placeholder: "Name to place on the plan" },
  { key: "childAge", label: "Date of birth / age", placeholder: "DOB or age" },
  { key: "caregiverName", label: "Primary caregiver", placeholder: "Name and phone number" },
  { key: "safeLocation", label: "Address / safe location", placeholder: "Home, school, or meeting location" },
  { key: "primaryContact", label: "Primary emergency contact", placeholder: "Name, relationship, phone" },
  { key: "secondaryContact", label: "Secondary emergency contact", placeholder: "Name, relationship, phone" },
  { key: "doctorContact", label: "Doctor / pediatrician", placeholder: "Provider name and phone" },
  { key: "therapistContact", label: "Therapist / counselor", placeholder: "Provider name and phone" },
  { key: "caseworkerContact", label: "Caseworker / agency contact", placeholder: "Name, agency, phone/email" },
  { key: "medicalConditions", label: "Diagnoses / medical conditions", multiline: true, placeholder: "Medical, developmental, behavioral, or mental health needs" },
  { key: "medications", label: "Medications", multiline: true, placeholder: "Medication names, doses, timing, and prescriber" },
  { key: "allergies", label: "Allergies", multiline: true, placeholder: "Food, medication, environmental, or sensory allergies/sensitivities" },
  { key: "medicalInstructions", label: "Medical equipment or special instructions", multiline: true, placeholder: "Rescue meds, seizure plan, inhaler, diabetes care, etc." },
  { key: "triggers", label: "Medical / behavioral triggers", multiline: true, placeholder: "Loud voices, transitions, touch, hunger, trauma reminders, pain, sleep loss" },
  { key: "warningSigns", label: "Early warning signs", multiline: true, placeholder: "Pacing, hiding, clenched hands, shutdown, rapid speech, crying" },
  { key: "crisisBehaviors", label: "Behaviors adults may see during crisis", multiline: true, placeholder: "Running, aggression, self-harm statements, freezing, refusal, panic" },
  { key: "calmingTools", label: "Calming strategies that help", multiline: true, placeholder: "Quiet space, weighted item, breathing, music, sensory tool, trusted adult" },
  { key: "helpfulResponses", label: "Helpful adult responses", multiline: true, placeholder: "Use calm voice, give space, offer two choices, reduce demands" },
  { key: "avoidResponses", label: "Words or actions to avoid", multiline: true, placeholder: "Do not yell, crowd, shame, threaten, argue, or touch without consent" },
  { key: "deescalationSteps", label: "Safe de-escalation steps", multiline: true, placeholder: "Step-by-step plan for school, CPS, or emergency responders" },
  { key: "callCaregiverWhen", label: "When to call caregiver", multiline: true, placeholder: "Signs or situations when caregiver should be contacted immediately" },
  { key: "call911When", label: "When to call 911 / emergency services", multiline: true, placeholder: "Immediate danger, medical emergency, missing child, active self-harm risk" },
  { key: "restraintCautions", label: "Transport / restraint cautions", multiline: true, placeholder: "Trauma history, sensory needs, medical risks, safest transport guidance" },
  { key: "additionalNotes", label: "Other critical notes", multiline: true, placeholder: "Anything responders, school, or CPS should know" },
];

export default function FamilySafetyCrisisPlan() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function downloadBase64Pdf(base64, fileName) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleGenerate() {
    setLoading(true);
    setMessage("");
    const response = await base44.functions.invoke("generateFamilySafetyCrisisPlan", form);
    downloadBase64Pdf(response.data.base64, response.data.fileName);
    setMessage("Your Family Safety and Crisis Plan downloaded successfully.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Family Safety Plan" subtitle="Ready-to-present crisis document" backTo="/dashboard" />

      <div className="max-w-[620px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <div className="flex items-start gap-3">
            <ShieldAlert size={26} color="#fff" />
            <div>
              <p className="font-serif font-bold text-lg" style={{ color: "#fff" }}>Family Safety and Crisis Plan</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>
                Create a clear document for school, CPS, medical providers, or emergency responders with contacts, triggers, calming strategies, and safety instructions.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <FileText size={16} color="#B84C2A" className="mt-0.5 flex-shrink-0" />
          <p className="text-[11px] leading-relaxed" style={{ color: "#7a2d00" }}>
            This plan is not a replacement for emergency, medical, legal, or mental health advice. In immediate danger, call 911. For crisis support, call or text 988.
          </p>
        </div>

        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          {FIELDS.map(field => (
            <div key={field.key}>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1" style={{ color: C.mutedText }}>
                {field.label}
              </label>
              {field.multiline ? (
                <textarea
                  value={form[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-xl px-3 py-2 text-xs border outline-none resize-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              ) : (
                <input
                  value={form[field.key] || ""}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl px-3 py-2 text-xs border outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
              )}
            </div>
          ))}
        </div>

        {message && (
          <div className="rounded-xl p-3 text-xs font-bold" style={{ background: "#F0F6F0", color: C.darkGreen, border: `1px solid ${C.midGreen}` }}>
            {message}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: loading ? `${C.midGreen}80` : C.darkGreen, color: "#fff", border: "none", cursor: loading ? "default" : "pointer" }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating Plan…</> : <><Download size={16} /> Download Family Safety and Crisis Plan</>}
        </button>

        <div className="pb-8" />
      </div>
    </div>
  );
}
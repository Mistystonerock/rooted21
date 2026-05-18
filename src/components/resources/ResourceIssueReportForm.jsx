import { useState } from "react";
import { base44 } from "@/api/base44Client";

const REPORT_TYPES = [
  ["disconnected_phone", "Disconnected phone number"],
  ["wrong_address", "Wrong address"],
  ["closed_agency", "Closed agency"],
  ["unsafe_experience", "Unsafe experience"],
  ["not_accepting_clients", "No longer accepting clients"],
  ["long_waitlist", "Long waitlist"],
  ["incorrect_eligibility", "Incorrect eligibility"],
  ["other_concern", "Other concern"]
];

export default function ResourceIssueReportForm({ resource, colors, onClose }) {
  const [reportType, setReportType] = useState("disconnected_phone");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submitReport() {
    setSaving(true);
    await base44.functions.invoke("reportResourceIssue", {
      resource_id: resource.id || "",
      resource_name: resource.name || resource.resource_name,
      resource_county: resource.county || "",
      resource_category: resource.category || resource.resource_type || resource.type || "other",
      report_type: reportType,
      details: details.trim()
    });
    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return (
      <div style={{ background: colors.panel, borderTop: `1px solid ${colors.border}`, padding: 14 }}>
        <p style={{ color: colors.accent, fontSize: 12, fontWeight: 800 }}>Thank you. This private report was sent for admin review.</p>
        <button type="button" onClick={onClose} style={{ marginTop: 10, border: "none", borderRadius: 10, padding: "8px 12px", background: colors.button, color: colors.buttonText, fontSize: 12, fontWeight: 800 }}>Close</button>
      </div>
    );
  }

  return (
    <div style={{ background: colors.panel, borderTop: `1px solid ${colors.border}`, padding: 14 }}>
      <p style={{ color: colors.accent, fontSize: 11, fontWeight: 900, marginBottom: 8, letterSpacing: "0.08em" }}>PRIVATE RESOURCE REPORT</p>
      <select value={reportType} onChange={event => setReportType(event.target.value)} style={{ width: "100%", borderRadius: 10, padding: "9px 10px", marginBottom: 8, border: `1px solid ${colors.border}` }}>
        {REPORT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <textarea value={details} onChange={event => setDetails(event.target.value)} rows={3} placeholder="Optional details for the admin team. Do not include private information unless needed." style={{ width: "100%", borderRadius: 10, padding: "9px 10px", resize: "none", border: `1px solid ${colors.border}` }} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="button" onClick={submitReport} disabled={saving} style={{ flex: 1, border: "none", borderRadius: 10, padding: "9px 10px", background: colors.button, color: colors.buttonText, fontSize: 12, fontWeight: 800 }}>{saving ? "Sending..." : "Send private report"}</button>
        <button type="button" onClick={onClose} style={{ borderRadius: 10, padding: "9px 12px", background: "transparent", color: colors.muted, border: `1px solid ${colors.border}`, fontSize: 12 }}>Cancel</button>
      </div>
    </div>
  );
}
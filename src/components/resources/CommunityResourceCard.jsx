import { useState } from "react";
import { Heart, Phone, Globe, MapPin, ChevronDown, ChevronUp, Plus, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GREEN = "#3db870";
const GOLD = "#c9973a";
const TEXT = "#f0e8d8";
const MUTED = "rgba(240,232,216,0.55)";
const CARD = "#12271a";
const BORDER = "rgba(255,255,255,0.08)";

const TYPE_COLORS = {
  therapist: { bg: "rgba(122,170,238,0.15)", color: "#7aaaee", label: "Therapist" },
  support_group: { bg: "rgba(61,184,112,0.15)", color: GREEN, label: "Support Group" },
  food_pantry: { bg: "rgba(201,151,58,0.15)", color: GOLD, label: "Food Pantry" },
  mental_health: { bg: "rgba(160,158,240,0.15)", color: "#a09ef0", label: "Mental Health" },
  crisis: { bg: "rgba(224,112,112,0.15)", color: "#e07070", label: "Crisis" },
  legal_aid: { bg: "rgba(201,151,58,0.15)", color: GOLD, label: "Legal Aid" },
  other: { bg: "rgba(255,255,255,0.08)", color: MUTED, label: "Resource" },
};

const METHOD_OPTIONS = ["called", "visited", "emailed", "left_voicemail", "other"];

export default function CommunityResourceCard({ resource, saved, onSave, onUnsave, onContactLogged }) {
  const [expanded, setExpanded] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ date: new Date().toISOString().split("T")[0], method: "called", outcome: "", notes: "", follow_up_date: "" });
  const [saving, setSaving] = useState(false);

  const typeStyle = TYPE_COLORS[resource.resource_type || resource.type] || TYPE_COLORS.other;
  const contactLog = saved?.contact_log || [];

  async function handleSaveToggle() {
    if (saved) {
      await base44.entities.SavedResource.delete(saved.id);
      onUnsave(resource);
    } else {
      onSave(resource);
    }
  }

  async function submitLog() {
    if (!saved || !logForm.outcome.trim()) return;
    setSaving(true);
    const newEntry = { id: Date.now().toString(), ...logForm };
    const updatedLog = [...contactLog, newEntry];
    await base44.entities.SavedResource.update(saved.id, { contact_log: updatedLog });
    onContactLogged(saved.id, updatedLog);
    setLogForm({ date: new Date().toISOString().split("T")[0], method: "called", outcome: "", notes: "", follow_up_date: "" });
    setShowLogForm(false);
    setSaving(false);
  }

  const inp = { width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 14px 12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20 }}>
                {typeStyle.label}
              </span>
              {contactLog.length > 0 && (
                <span style={{ background: "rgba(61,184,112,0.1)", color: GREEN, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                  {contactLog.length} contact{contactLog.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p style={{ fontWeight: 800, fontSize: 14, color: TEXT, lineHeight: 1.3, marginBottom: 4 }}>{resource.name || resource.resource_name}</p>
            {resource.address && (
              <p style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={10} /> {resource.address}
              </p>
            )}
          </div>
          <button onClick={handleSaveToggle} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: saved ? "rgba(201,151,58,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${saved ? GOLD + "50" : BORDER}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={15} color={saved ? GOLD : MUTED} fill={saved ? GOLD : "none"} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "rgba(240,232,216,0.75)", lineHeight: 1.6, marginTop: 6 }}>{resource.description}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {resource.phone && (
            <a href={`tel:${resource.phone.replace(/\D/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(61,184,112,0.1)", border: `1px solid ${GREEN}30`, borderRadius: 8, padding: "6px 10px", textDecoration: "none" }}>
              <Phone size={11} color={GREEN} />
              <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>{resource.phone}</span>
            </a>
          )}
          {resource.website && (
            <a href={resource.website.startsWith("http") ? resource.website : `https://${resource.website}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(122,170,238,0.1)", border: "1px solid rgba(122,170,238,0.3)", borderRadius: 8, padding: "6px 10px", textDecoration: "none" }}>
              <Globe size={11} color="#7aaaee" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7aaaee" }}>Website</span>
            </a>
          )}
          {saved && (
            <button onClick={() => setShowLogForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(201,151,58,0.1)", border: `1px solid ${GOLD}30`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
              <Plus size={11} color={GOLD} />
              <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>Log Contact</span>
            </button>
          )}
          {contactLog.length > 0 && (
            <button onClick={() => setExpanded(v => !v)} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
              <Clock size={11} color={MUTED} />
              <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>History</span>
              {expanded ? <ChevronUp size={11} color={MUTED} /> : <ChevronDown size={11} color={MUTED} />}
            </button>
          )}
        </div>
      </div>

      {showLogForm && (
        <div style={{ background: "rgba(201,151,58,0.06)", borderTop: `1px solid ${GOLD}25`, padding: "14px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, marginBottom: 10, letterSpacing: "0.1em" }}>LOG A CONTACT</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: MUTED, display: "block", marginBottom: 4 }}>Date</label>
              <input type="date" value={logForm.date} onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: MUTED, display: "block", marginBottom: 4 }}>Method</label>
              <select value={logForm.method} onChange={e => setLogForm(f => ({ ...f, method: e.target.value }))} style={{ ...inp, color: "#fff" }}>
                {METHOD_OPTIONS.map(m => <option key={m} value={m} style={{ color: "#000" }}>{m.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, color: MUTED, display: "block", marginBottom: 4 }}>Outcome *</label>
            <input type="text" value={logForm.outcome} onChange={e => setLogForm(f => ({ ...f, outcome: e.target.value }))} placeholder="e.g. Left voicemail, scheduled appt for June 3" style={inp} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, color: MUTED, display: "block", marginBottom: 4 }}>Notes (optional)</label>
            <textarea value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any details…" style={{ ...inp, resize: "none" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: MUTED, display: "block", marginBottom: 4 }}>Follow-up date (optional)</label>
            <input type="date" value={logForm.follow_up_date} onChange={e => setLogForm(f => ({ ...f, follow_up_date: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submitLog} disabled={saving || !logForm.outcome.trim()} style={{ flex: 1, padding: "9px", background: logForm.outcome.trim() ? GOLD : `${GOLD}40`, border: "none", borderRadius: 10, color: "#0b1f12", fontWeight: 800, fontSize: 12, cursor: logForm.outcome.trim() ? "pointer" : "default" }}>
              {saving ? "Saving…" : "Save Contact Log"}
            </button>
            <button onClick={() => setShowLogForm(false)} style={{ padding: "9px 14px", background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 10, color: MUTED, fontSize: 12, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {expanded && contactLog.length > 0 && (
        <div style={{ background: "rgba(61,184,112,0.04)", borderTop: `1px solid ${GREEN}20`, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: GREEN, letterSpacing: "0.12em", marginBottom: 10 }}>CONTACT HISTORY</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...contactLog].reverse().map(entry => (
              <div key={entry.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>{entry.date}</span>
                  <span style={{ fontSize: 10, color: MUTED, background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 10 }}>{entry.method?.replace("_", " ")}</span>
                </div>
                <p style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{entry.outcome}</p>
                {entry.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{entry.notes}</p>}
                {entry.follow_up_date && <p style={{ fontSize: 10, color: GOLD, marginTop: 4 }}>📅 Follow up: {entry.follow_up_date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
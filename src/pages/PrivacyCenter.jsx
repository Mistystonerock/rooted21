import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { AlertTriangle, Check, Download, Eye, MessageCircle, Shield, Trash2 } from "lucide-react";
import SurvivorSafetyPanel from "@/components/privacy/SurvivorSafetyPanel";
import TrustIndicatorGrid from "@/components/privacy/TrustIndicatorGrid";
import ConsentManagementPanel from "@/components/privacy/ConsentManagementPanel";
import ReleaseInfoTracker from "@/components/privacy/ReleaseInfoTracker";
import PrivacySafetyExplainer from "@/components/privacy/PrivacySafetyExplainer";

const DATA_ENTITIES = [
  "ChildProfile", "BehaviorLog", "CheckIn", "Goal", "LessonProgress", "SafetyPlan", "DailySchedule",
  "ParentJournal", "SecureMessage", "ProfessionalNote", "FamilyEvent", "CareCalendarEvent", "SecureDocument",
  "MedicationRecord", "MedicationDoseLog", "VisitationLog", "IncidentReport", "CaseFile", "CaseNote",
  "Consent", "Notification", "LifeStoryEntry"
];

const OPTIONS = {
  behavior_log_visibility: [
    ["private", "Only me"],
    ["connected_professionals", "Connected professionals"],
    ["care_team", "Care team"],
  ],
  notes_visibility: [
    ["private", "Only me"],
    ["connected_professionals", "Connected professionals"],
    ["care_team", "Care team"],
  ],
  legal_data_visibility: [
    ["private", "Only me"],
    ["connected_professionals", "Connected professionals"],
    ["court_team", "Court team"],
  ],
  profile_comment_permission: [
    ["nobody", "Nobody"],
    ["connected_professionals", "Connected professionals"],
    ["care_team", "Care team"],
  ],
};

function SelectRow({ icon: Icon, label, value, options, onChange }) {
  return (
    <label className="block rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <span className="mb-2 flex items-center gap-2 text-sm font-black" style={{ color: C.darkGreen }}>
        <Icon size={16} color={C.midGreen} /> {label}
      </span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl px-3 py-2.5 text-sm"
        style={{ background: C.offWhite, border: `1.5px solid ${C.cream}`, color: C.darkGreen }}
      >
        {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </label>
  );
}

export default function PrivacyCenter() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    behavior_log_visibility: "private",
    notes_visibility: "private",
    legal_data_visibility: "private",
    profile_comment_permission: "connected_professionals",
    allow_profile_comments: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [vault, setVault] = useState(null);
  const [exportRequestMessage, setExportRequestMessage] = useState("");

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      setSettings(prev => ({
        ...prev,
        behavior_log_visibility: me?.behavior_log_visibility || "private",
        notes_visibility: me?.notes_visibility || "private",
        legal_data_visibility: me?.legal_data_visibility || "private",
        profile_comment_permission: me?.profile_comment_permission || "connected_professionals",
        allow_profile_comments: me?.allow_profile_comments !== false,
      }));
      const vaultRows = await base44.entities.PrivacyVaultSetting.filter({ user_email: me.email }, "-updated_date", 1);
      setVault(vaultRows[0] || null);
    });
  }, []);

  async function saveSettings() {
    setSaving(true);
    await base44.auth.updateMe({ ...settings, privacy_updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function exportData() {
    setExporting(true);
    const records = {};
    await Promise.all(DATA_ENTITIES.map(async entityName => {
      records[entityName] = await base44.entities[entityName].list("-created_date", 500).catch(() => []);
    }));
    const exportPayload = {
      exported_at: new Date().toISOString(),
      account: { email: user?.email, full_name: user?.full_name, role: user?.role },
      privacy_settings: settings,
      records,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rooted21-Data-Export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function requestDataExport() {
    await base44.entities.DataExportRequest.create({
      user_email: user.email,
      status: "submitted",
      request_type: "full_account",
      requested_at: new Date().toISOString(),
      notes: "User requested a full account export from the Privacy & Safety Center"
    });
    setExportRequestMessage("Your data export request was submitted. You can also download an immediate copy below.");
  }

  async function clearLocalData() {
    sessionStorage.clear();
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  }

  async function deleteAccount() {
    if (deleteText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await base44.entities.AccountDeletionRequest.create({
        user_email: user.email,
        status: "submitted",
        reason: "User requested account deletion from Privacy Center",
        safe_contact_method: "in_app",
        requested_at: new Date().toISOString()
      });
      setDeleteError("Your deletion request was submitted. We’ll handle it carefully and keep you updated in-app.");
      setDeleting(false);
    } catch (error) {
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Privacy & Safety" subtitle="Plain-language privacy controls" backTo="/profile" />
      <div className="mx-auto max-w-[520px] space-y-4 px-4 py-5">
        <section className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <Shield size={24} color={C.gold} />
          <p className="mt-3 font-serif text-lg font-bold" style={{ color: C.cream }}>You deserve privacy that feels clear and safe.</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.lightGreen }}>Learn how Rooted 21 protects your information, then choose the settings that feel right for you.</p>
        </section>

        <PrivacySafetyExplainer />
        <TrustIndicatorGrid />
        {user && <SurvivorSafetyPanel user={user} vault={vault} onVaultChange={setVault} />}
        {user && <ConsentManagementPanel user={user} />}
        {user && <ReleaseInfoTracker user={user} />}

        <a href="/consent-dashboard" className="flex items-center justify-between rounded-2xl p-4 no-underline" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <span>
            <span className="block text-sm font-black" style={{ color: C.darkGreen }}>Consent Dashboard</span>
            <span className="block text-xs" style={{ color: C.mutedText }}>Choose exactly what each professional role can see.</span>
          </span>
          <span className="text-xs font-black" style={{ color: C.midGreen }}>Open</span>
        </a>

        <SelectRow icon={Eye} label="Behavior logs visibility" value={settings.behavior_log_visibility} options={OPTIONS.behavior_log_visibility} onChange={value => setSettings(prev => ({ ...prev, behavior_log_visibility: value }))} />
        <SelectRow icon={Eye} label="Notes and reflections visibility" value={settings.notes_visibility} options={OPTIONS.notes_visibility} onChange={value => setSettings(prev => ({ ...prev, notes_visibility: value }))} />
        <SelectRow icon={Shield} label="Legal records visibility" value={settings.legal_data_visibility} options={OPTIONS.legal_data_visibility} onChange={value => setSettings(prev => ({ ...prev, legal_data_visibility: value }))} />
        <SelectRow icon={MessageCircle} label="Who can comment on profiles" value={settings.profile_comment_permission} options={OPTIONS.profile_comment_permission} onChange={value => setSettings(prev => ({ ...prev, profile_comment_permission: value }))} />

        <button
          type="button"
          onClick={() => setSettings(prev => ({ ...prev, allow_profile_comments: !prev.allow_profile_comments }))}
          aria-pressed={settings.allow_profile_comments}
          className="flex w-full items-center justify-between rounded-2xl p-4 text-left"
          style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
        >
          <span>
            <span className="block text-sm font-black" style={{ color: C.darkGreen }}>Profile comments</span>
            <span className="block text-xs" style={{ color: C.mutedText }}>{settings.allow_profile_comments ? "Allowed for selected people" : "Turned off"}</span>
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: settings.allow_profile_comments ? C.midGreen : C.cream, color: settings.allow_profile_comments ? C.white : C.mutedText }}>
            {settings.allow_profile_comments ? "On" : "Off"}
          </span>
        </button>

        <button onClick={saveSettings} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black" style={{ background: saved ? C.midGreen : C.darkGreen, color: C.white, border: "none", opacity: saving ? 0.7 : 1 }}>
          {saved ? <><Check size={16} /> Saved</> : saving ? "Saving…" : "Save Privacy Settings"}
        </button>

        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Your Data</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>You can ask for a full copy of your data, download an immediate copy, or request account deletion. You stay in control.</p>
          <button onClick={requestDataExport} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}>
            <Download size={14} /> Request Full Data Export
          </button>
          {exportRequestMessage && <p className="mt-2 text-[11px] font-bold" style={{ color: C.midGreen }}>{exportRequestMessage}</p>}
          <button onClick={exportData} disabled={exporting} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black" style={{ background: C.gold, color: C.darkGreen, border: "none", opacity: exporting ? 0.7 : 1 }}>
            <Download size={14} /> {exporting ? "Preparing export…" : "Download Immediate Copy"}
          </button>
        </section>

        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="flex w-full items-center gap-2 rounded-2xl p-4 text-xs font-black" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8", color: "#B84C2A" }}>
            <Trash2 size={14} /> Request Account Deletion
          </button>
        ) : (
          <section className="rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1.5px solid #F4C9B8" }}>
            <div className="flex gap-2">
              <AlertTriangle size={16} color="#B84C2A" className="mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: "#B84C2A" }}>This sends a careful account deletion request. We do this as a request so your records can be handled safely. Type DELETE to confirm.</p>
            </div>
            <input value={deleteText} onChange={event => setDeleteText(event.target.value)} placeholder="DELETE" className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-bold" style={{ border: "1px solid #F4C9B8", background: C.white }} />
            {deleteError && <p className="mt-1 text-[11px] font-bold" style={{ color: "#B42318" }}>{deleteError}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => { setShowDelete(false); setDeleteText(""); setDeleteError(""); }} className="rounded-xl py-2 text-xs font-black" style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}` }}>Cancel</button>
              <button onClick={deleteAccount} disabled={deleting || deleteText !== "DELETE"} className="rounded-xl py-2 text-xs font-black" style={{ background: "#B84C2A", color: C.white, border: "none", opacity: deleting || deleteText !== "DELETE" ? 0.65 : 1 }}>{deleting ? "Submitting…" : "Submit Request"}</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
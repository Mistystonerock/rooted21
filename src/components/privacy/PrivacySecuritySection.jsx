import { useEffect, useState } from "react";
import { BellOff, Clock, EyeOff, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import {
  enablePrivateMode,
  setHiddenNotificationPreviews,
  setSecureSessionTimeoutMinutes
} from "@/lib/survivorMode";

const DEFAULTS = {
  encrypted_storage_enabled: true,
  sensitive_push_notifications_enabled: false,
  hidden_notification_previews: true,
  private_mode_enabled: true,
  secure_session_timeout_minutes: 10,
  secure_deletion_status: "not_requested"
};

function SafetyRow({ icon: Icon, title, text, active, onToggle, locked }) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onToggle}
      className="flex w-full items-start gap-3 rounded-2xl p-4 text-left"
      style={{ background: C.offWhite, border: `1px solid ${C.cream}`, cursor: locked ? "default" : "pointer" }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: active ? C.darkGreen : C.cream }}>
        <Icon size={18} color={active ? "#fff" : C.darkGreen} />
      </div>
      <span className="flex-1">
        <span className="block text-sm font-black" style={{ color: C.darkGreen }}>{title}</span>
        <span className="mt-1 block text-xs leading-relaxed" style={{ color: C.mutedText }}>{text}</span>
      </span>
      <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: active ? C.midGreen : C.cream, color: active ? "#fff" : C.darkGreen }}>
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}

export default function PrivacySecuritySection() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const rows = await base44.entities.PrivacyVaultSetting.filter({ user_email: me.email }, "-updated_date", 1);
      const current = rows[0] || null;
      setRecord(current);
      const merged = { ...DEFAULTS, ...(current || {}) };
      setSettings(merged);
      applyLocalSafetySettings(merged);
    });
  }, []);

  function applyLocalSafetySettings(next) {
    setHiddenNotificationPreviews(next.hidden_notification_previews !== false);
    enablePrivateMode(next.private_mode_enabled !== false);
    setSecureSessionTimeoutMinutes(Number(next.secure_session_timeout_minutes || 10));
  }

  async function save(nextSettings) {
    setSettings(nextSettings);
    applyLocalSafetySettings(nextSettings);
    const payload = { ...nextSettings, user_email: user.email };
    const savedRecord = record
      ? await base44.entities.PrivacyVaultSetting.update(record.id, payload)
      : await base44.entities.PrivacyVaultSetting.create(payload);
    setRecord(savedRecord);
    await base44.entities.SecurityEvent.create({
      user_email: user.email,
      event_type: "vault_unlock",
      severity: "info",
      details: "Privacy and survivor safety settings updated."
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function toggle(key) {
    save({ ...settings, [key]: !settings[key] });
  }

  async function requestSecureDeletion() {
    await save({
      ...settings,
      secure_deletion_status: "requested",
      secure_deletion_requested_at: new Date().toISOString(),
      sensitive_push_notifications_enabled: false,
      hidden_notification_previews: true,
      private_mode_enabled: true
    });
  }

  return (
    <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
          <ShieldCheck size={28} color="#fff" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: C.midGreen }}>Privacy & security</p>
          <h2 className="mt-1 font-serif text-xl font-black leading-tight" style={{ color: C.darkGreen }}>Survivor-first safety settings</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>You deserve safety. These defaults reduce exposure, keep previews hidden, and prioritize privacy over convenience. You can move at your own pace.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <SafetyRow icon={Lock} title="Encrypted private storage" text="Sensitive files are kept in private storage with temporary secure download links." active={settings.encrypted_storage_enabled} locked />
        <SafetyRow icon={BellOff} title="No sensitive push notifications" text="Sensitive alerts stay off by default. Support is available without exposing private details on a lock screen." active={!settings.sensitive_push_notifications_enabled} onToggle={() => toggle("sensitive_push_notifications_enabled")} />
        <SafetyRow icon={EyeOff} title="Hidden notification previews" text="Notification previews use neutral wording when private mode is active." active={settings.hidden_notification_previews} onToggle={() => toggle("hidden_notification_previews")} />
        <SafetyRow icon={ShieldCheck} title="Private mode" text="Private mode keeps survivor tools discreet and supports quick exit behavior." active={settings.private_mode_enabled} onToggle={() => toggle("private_mode_enabled")} />
      </div>

      <label className="mt-4 block rounded-2xl p-4" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
        <span className="flex items-center gap-2 text-sm font-black" style={{ color: C.darkGreen }}><Clock size={16} /> Secure session timeout</span>
        <span className="mt-1 block text-xs leading-relaxed" style={{ color: C.mutedText }}>Leaving can be dangerous, and planning matters. Shorter timeouts help protect privacy if a device is left open.</span>
        <select value={settings.secure_session_timeout_minutes} onChange={e => save({ ...settings, secure_session_timeout_minutes: Number(e.target.value) })} className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-bold" style={{ border: `1px solid ${C.cream}`, background: "#fff" }}>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
      </label>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
        <div className="flex items-start gap-2">
          <Trash2 size={16} color="#B84C2A" className="mt-0.5" />
          <div>
            <p className="text-sm font-black" style={{ color: "#8A321B" }}>Secure deletion workflow</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "#8A321B" }}>You are not alone. A deletion request can be started without pressure; safety and careful handling come first.</p>
          </div>
        </div>
        <button type="button" onClick={requestSecureDeletion} disabled={settings.secure_deletion_status === "requested"} className="mt-3 w-full rounded-xl py-3 text-xs font-black" style={{ background: settings.secure_deletion_status === "requested" ? C.cream : "#B84C2A", color: settings.secure_deletion_status === "requested" ? C.darkGreen : "#fff", border: "none" }}>
          {settings.secure_deletion_status === "requested" ? "Deletion request started" : "Start secure deletion request"}
        </button>
      </div>
      {saved && <p className="mt-3 text-center text-xs font-black" style={{ color: C.darkGreen }}>Saved safely.</p>}
    </section>
  );
}
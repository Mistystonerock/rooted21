import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import PreferenceToggle from "@/components/notifications/PreferenceToggle";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

const DEFAULTS = {
  email_enabled: true,
  sms_enabled: false,
  push_enabled: false,
  in_app_enabled: true,
  welcome_emails: true,
  password_reset_emails: true,
  verification_emails: true,
  resource_updates: true,
  court_reminders: true,
  appointment_reminders: true,
  case_plan_reminders: true,
  visitation_reminders: true,
  benefits_recertification_reminders: true,
  iep_meeting_reminders: true,
  medication_reminders: true,
  safety_plan_reminders: true,
  resource_verification_reminders: true,
  beta_updates: true,
  mute_sensitive_notifications: false,
  hide_notification_previews: true,
  trauma_informed_tone: true,
  quiet_hours_start: "21:00",
  quiet_hours_end: "08:00",
  preferred_language: "en"
};

const groups = [
  { key: "email_enabled", label: "Email notifications", description: "Send gentle reminders and updates to your email.", icon: Mail },
  { key: "sms_enabled", label: "SMS-ready reminders", description: "Prepare your account for future text message reminders.", icon: MessageSquare },
  { key: "push_enabled", label: "Push-ready reminders", description: "Prepare your devices for future push notifications.", icon: Smartphone },
  { key: "in_app_enabled", label: "In-app notifications", description: "Show reminders inside Rooted 21.", icon: Bell }
];

const reminderOptions = [
  ["welcome_emails", "Welcome emails", "Warm onboarding notes when someone joins."],
  ["password_reset_emails", "Password reset emails", "Account-access emails stay available for safety."],
  ["verification_emails", "Verification emails", "Confirm important account or resource changes."],
  ["court_reminders", "Court reminders", "Example: Reminder: You have a hearing tomorrow."],
  ["case_plan_reminders", "Case-plan reminders", "Gentle next-step support: You’re making progress."],
  ["visitation_reminders", "Visitation reminders", "Calm visit reminders without pressure."],
  ["benefits_recertification_reminders", "Benefits recertification reminders", "SNAP, WIC, Medicaid, housing, and childcare paperwork reminders."],
  ["iep_meeting_reminders", "IEP meeting reminders", "School meeting reminders with supportive wording."],
  ["medication_reminders", "Medication reminders", "Medication refill and care routine reminders."],
  ["resource_verification_reminders", "Resource verification reminders", "Prompts to review trusted community resources."],
  ["appointment_reminders", "Appointment reminders", "Upcoming care, school, and service appointments."],
  ["safety_plan_reminders", "Safety plan reminders", "Prompts to review plans before they are needed."],
  ["resource_updates", "Resource updates", "Know when saved or statewide resources need review."],
  ["beta_updates", "Beta tester updates", "Product changes and beta feedback notices."],
  ["trauma_informed_tone", "Trauma-informed wording", "Use supportive, non-shaming language whenever possible."],
  ["mute_sensitive_notifications", "Mute sensitive notifications", "Pause court, visitation, medication, IEP, benefits, and safety reminders."],
  ["hide_notification_previews", "Hide sensitive previews", "Show a private placeholder instead of sensitive details."]
];

export default function NotificationPreferences() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      const existing = await base44.entities.NotificationPreference.filter({ user_email: me.email }, "-updated_date", 1);
      if (existing[0]) {
        setRecordId(existing[0].id);
        setPrefs({ ...DEFAULTS, ...existing[0] });
      } else {
        const created = await base44.entities.NotificationPreference.create({ ...DEFAULTS, user_email: me.email });
        setRecordId(created.id);
        setPrefs({ ...DEFAULTS, ...created });
      }
    }
    load();
  }, []);

  const channelSummary = useMemo(() => groups.filter(g => prefs[g.key]).map(g => g.label).join(" · "), [prefs]);

  async function save(nextPrefs) {
    setPrefs(nextPrefs);
    if (!recordId || !user) return;
    setSaving(true);
    await base44.entities.NotificationPreference.update(recordId, nextPrefs);
    setSaving(false);
  }

  function setField(key, value) {
    save({ ...prefs, [key]: value, user_email: user.email });
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <MobileHeader title="Notification Preferences" subtitle="You choose how Rooted 21 reaches you" backTo="/notifications" />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-28">
        <section className="rounded-3xl bg-green-900 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-100">Trauma-informed notification engine</p>
          <h1 className="mt-2 text-2xl font-black">Stay informed, without overwhelm.</h1>
          <p className="mt-2 text-sm text-white/80">Reminders use calm phrases like “Reminder: You have a hearing tomorrow,” “You’re making progress,” and “One step at a time.”</p>
          <p className="mt-3 text-xs text-white/70">Active channels: {channelSummary || "None selected"}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-black">Delivery channels</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map(group => <PreferenceToggle key={group.key} label={group.label} description={group.description} checked={prefs[group.key]} onChange={value => setField(group.key, value)} />)}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-black">Reminder types</h2>
          {reminderOptions.map(([key, label, description]) => <PreferenceToggle key={key} label={label} description={description} checked={prefs[key]} onChange={value => setField(key, value)} />)}
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="font-black">Quiet hours</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">Start<input type="time" value={prefs.quiet_hours_start} onChange={e => setField("quiet_hours_start", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
            <label className="text-sm font-bold">End<input type="time" value={prefs.quiet_hours_end} onChange={e => setField("quiet_hours_end", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          </div>
          <p className="mt-3 text-xs text-stone-500">{saving ? "Saving..." : "Preferences saved automatically."}</p>
        </section>
      </main>
    </div>
  );
}
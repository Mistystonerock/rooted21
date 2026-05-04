import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Phone, Bell, BellOff, Check } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [smsReminders, setSmsReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setPhone(u?.phone || "");
      setSmsReminders(u?.sms_reminders !== false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await base44.auth.updateMe({ phone, sms_reminders: smsReminders });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>My Profile</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Account & notification settings</p>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">
        {/* User info */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
            style={{ background: C.darkGreen, color: C.cream }}>
            {user?.full_name?.[0] || "?"}
          </div>
          <div>
            <p className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>{user?.full_name || "—"}</p>
            <p className="text-xs" style={{ color: C.mutedText }}>{user?.email}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block capitalize"
              style={{ background: `${C.midGreen}20`, color: C.midGreen }}>
              {user?.role || "user"}
            </span>
          </div>
        </div>

        {/* SMS Reminders */}
        <div className="rounded-2xl p-4 space-y-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Phone size={16} color={C.midGreen} />
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>SMS Reminders</p>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: C.mutedText }}>
              MOBILE PHONE NUMBER
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="w-full rounded-xl px-3 py-2.5 text-sm font-sans"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, color: C.darkText }}
            />
            <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>
              Enter in E.164 format, e.g. +15551234567 (include country code)
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between rounded-xl px-3.5 py-3"
            style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <div className="flex items-center gap-2.5">
              {smsReminders
                ? <Bell size={15} color={C.midGreen} />
                : <BellOff size={15} color={C.mutedText} />}
              <div>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Event reminders</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>
                  Text reminder the day before calendar events
                </p>
              </div>
            </div>
            <button
              onClick={() => setSmsReminders(v => !v)}
              className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: smsReminders ? C.midGreen : C.cream, border: "none", cursor: "pointer" }}
            >
              <div className="w-4 h-4 rounded-full absolute top-1 transition-all"
                style={{
                  background: C.white,
                  left: smsReminders ? "calc(100% - 20px)" : "4px",
                }}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: saved ? C.midGreen : C.darkGreen,
            color: C.white,
            border: "none",
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? <><Check size={16} /> Saved!</> : saving ? "Saving…" : "Save Settings"}
        </button>

        <p className="text-[11px] text-center" style={{ color: C.mutedText }}>
          Reminders are sent at 9am the day before each calendar event.
        </p>
        {/* LEGAL LINK */}
        <Link
          to="/legal"
          className="block rounded-xl p-3.5 text-xs font-bold transition-all hover:shadow-sm"
          style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none", color: C.darkGreen }}
        >
          📋 Legal Documents & Consent Forms
        </Link>
      </div>
    </div>
  );
}
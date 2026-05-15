import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, Phone, Bell, BellOff, Check, AlertTriangle, Trash2 } from "lucide-react";
import FontSizeControl from "@/components/accessibility/FontSizeControl";
import LogoutButton from "@/components/auth/LogoutButton";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [smsReminders, setSmsReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  async function clearLocalData() {
    localStorage.setItem("account_deleted_message", "Your account has been permanently deleted.");
    sessionStorage.clear();
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }

    setDeletingAccount(true);
    setDeleteError("");
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      await base44.functions.invoke("deleteSupabaseAccount", {
        confirmText: deleteConfirmText,
        supabaseUserId: supabaseUser?.id || null,
      });
      await supabase.auth.signOut();
      await clearLocalData();
      localStorage.setItem("account_deleted_message", "Your account has been permanently deleted.");
      await base44.auth.logout("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeletingAccount(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #0a3d20 0%, #0d5c2a 100%)", borderBottom: "1px solid rgba(201,151,58,0.3)", boxShadow: "0 8px 24px rgba(61,40,23,0.12)", paddingTop: "max(14px, env(safe-area-inset-top))" }}>
        <Link to="/dashboard" className="rounded-xl" style={{ background: "rgba(245,230,200,0.12)", border: "1px solid rgba(245,230,200,0.18)" }}><ChevronLeft size={20} color={C.cream} /></Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>My Profile</p>
          <p className="text-[10px]" style={{ color: "rgba(245,230,200,0.75)" }}>Account & notification settings</p>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">
        {/* User info */}
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
            style={{ background: C.darkGreen, color: C.cream, border: `2px solid ${C.gold}` }}>
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

        {/* Founder/Admin links */}
        {user?.role === "founder" && (
          <Link
            to="/founder-dashboard"
            className="flex items-center justify-between rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #0a3d20 0%, #0d5c2a 100%)", border: `1.5px solid ${C.gold}`, boxShadow: "0 8px 24px rgba(61,40,23,0.12)", textDecoration: "none" }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: C.cream }}>📊 Founder Dashboard</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(245,230,200,0.75)" }}>Users · Waitlist · Surveys · Analytics</p>
            </div>
            <span className="text-lg" style={{ color: C.gold }}>→</span>
          </Link>
        )}

        {["founder", "admin"].includes(user?.role) && (
          <Link
            to="/founder-admin-management"
            className="flex items-center justify-between rounded-2xl p-4"
            style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)", textDecoration: "none" }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>🛡️ Admin Management</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>Role hierarchy · Codes · Permissions</p>
            </div>
            <span className="text-lg" style={{ color: C.gold }}>→</span>
          </Link>
        )}

        {/* SMS Reminders */}
        <div className="rounded-2xl p-4 space-y-4" style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
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
              style={{ border: `1.5px solid ${C.cream}`, background: '#ffffff', color: '#1a1a1a' }}
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

        {/* Font Size Control */}
        <FontSizeControl />

        <p className="text-[11px] text-center" style={{ color: C.mutedText }}>
          Reminders are sent at 9am the day before each calendar event.
        </p>
        {/* LEGAL LINK */}
        <Link
          to="/legal"
          className="block rounded-xl p-3.5 text-xs font-bold transition-all hover:shadow-sm"
          style={{ background: "#ffffff", border: "1.5px solid rgba(120,85,60,0.2)", boxShadow: "0 8px 24px rgba(61,40,23,0.08)", textDecoration: "none", color: C.darkGreen }}
        >
          📋 Legal Documents & Consent Forms
        </Link>

        <LogoutButton variant="large" />

        {/* DELETE ACCOUNT */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-xl p-3.5 text-xs font-bold flex items-center gap-2 transition-all hover:shadow-sm"
            style={{ background: "#FEF3EE", border: `1px solid #F4C9B8`, textDecoration: "none", color: "#B84C2A", cursor: "pointer" }}
          >
            <Trash2 size={13} /> Delete My Account
          </button>
        ) : (
          <div className="rounded-xl p-4" style={{ background: "#FEF3EE", border: `1.5px solid #F4C9B8` }}>
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={16} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: "#B84C2A" }}>Are you absolutely sure?</p>
                <p className="text-[11px]" style={{ color: "#B84C2A" }}>
                  This will permanently delete your account and all your data including behavior logs, check-ins, safety plans, child profiles, and messages. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] font-bold" style={{ color: "#B84C2A" }}>Type DELETE to confirm</label>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg px-3 py-2 text-sm font-bold"
                style={{ border: "1px solid #F4C9B8", background: "#ffffff", color: "#1a1a1a" }}
              />
              {deleteError && <p className="mt-1 text-[11px] font-bold" style={{ color: "#B42318" }}>{deleteError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(""); }}
                className="flex-1 py-2 rounded-lg text-xs font-bold"
                style={{ background: C.white, color: C.darkGreen, border: `1px solid ${C.cream}`, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText !== "DELETE"}
                className="flex-1 py-2 rounded-lg text-xs font-bold"
                style={{ background: "#B84C2A", color: C.white, border: "none", cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed", opacity: deletingAccount || deleteConfirmText !== "DELETE" ? 0.7 : 1 }}
              >
                {deletingAccount ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
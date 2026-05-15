import { useEffect, useState } from "react";
import { MailCheck, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BG = "#faf6f1";
const CARD = "#ffffff";
const DARK = "#5a3d28";
const MUTED = "#8b6f54";
const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const RED = "#B42318";

export default function VerifyEmailPending({ user }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);


  useEffect(() => {
    if (user?.is_verified) {
      window.location.href = "/home";
    }
  }, [user]);

  async function resendVerification() {
    setSending(true);
    await base44.auth.resendOtp(user.email);
    setSent(true);
    setSending(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
      <div className="w-full max-w-md rounded-3xl p-6 text-center shadow-xl" style={{ background: CARD, border: `1.5px solid ${CREAM}` }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: CREAM }}>
          <MailCheck size={30} color={GREEN} />
        </div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: DARK }}>Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
          We sent a verification link to your email address. Click the link in the email to activate your account. Check your spam folder if you do not see it.
        </p>
        {user?.email && (
          <p className="mt-3 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: BG, color: DARK }}>
            {user.email}
          </p>
        )}
        <button
          onClick={resendVerification}
          disabled={sending || !user?.email}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-bold"
          style={{ background: RED, color: "#ffffff", border: "none", opacity: sending ? 0.7 : 1 }}
        >
          <RefreshCw size={16} className={sending ? "animate-spin" : ""} />
          {sending ? "Sending…" : "Resend Verification Email"}
        </button>
        {sent && <p className="mt-3 text-xs font-bold" style={{ color: GREEN }}>Verification email sent. Please check your inbox.</p>}
        <p className="mt-5 text-xs leading-relaxed" style={{ color: MUTED }}>
          Please verify your email before logging in. Check your inbox for the verification link. Need a new link? Click here to resend.
        </p>
      </div>
    </div>
  );
}
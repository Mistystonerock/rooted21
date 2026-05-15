import { C } from "@/lib/rooted-constants";
import { Lock, Calendar } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-10T09:00:00-04:00");

export default function FeatureLockGate({ children, user }) {
  const isLaunched = new Date() >= LAUNCH_DATE;
  const isFounder = user?.role === "founder";
  const isAdmin = user?.role === "admin";
  const isAllowedBeta = user?.email === "fish_hunter15@hotmail.com";
  const hasActiveBetaAccess = user?.beta_access_expires_at && new Date(user.beta_access_expires_at) >= new Date();

  if (isFounder || isAdmin || isAllowedBeta || hasActiveBetaAccess || isLaunched) {
    return children;
  }

  // Preview mode — show locked message
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: C.offWhite }}>
      <div className="max-w-[380px] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: C.cream }}>
          <Lock size={28} color={C.brown} />
        </div>
        
        <div>
          <h1 className="font-serif font-bold text-2xl mb-2" style={{ color: C.darkGreen }}>
            Coming Soon
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
            This feature is in preview mode and will be fully available on launch day.
          </p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.cream }}>
          <div className="flex items-center gap-2 justify-center mb-1">
            <Calendar size={14} color={C.brown} />
            <span className="font-bold text-sm" style={{ color: C.brown }}>June 10, 2026</span>
          </div>
          <p className="text-xs" style={{ color: C.mutedText }}>
            Official launch — all features unlock at 9:00 AM ET
          </p>
        </div>

        <p className="text-xs" style={{ color: C.mutedText }}>
          Explore the <a href="/" style={{ color: C.midGreen, textDecoration: "underline", fontWeight: "bold" }}>
            Launch page
          </a> to learn more about Rooted 21.
        </p>
      </div>
    </div>
  );
}
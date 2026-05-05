import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Check, CreditCard, X } from "lucide-react";

const SKIP_KEY = "rooted21_billing_skip";

export default function SubscriptionGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | needed | done
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  // Also re-check when returning from Stripe (URL has ?success=true)
  useEffect(() => {
    if (window.location.search.includes("success=true")) {
      checkSubscription();
    }
  }, [window.location.search]);

  async function checkSubscription() {
    try {
      const user = await base44.auth.me();
      if (!user) { setStatus("needed"); return; }

      const subs = await base44.entities.Subscription.filter(
        { user_email: user.email }, "-created_date", 1
      );
      const sub = subs[0];

      // Active paid subscription — let them in
      if (sub && (sub.status === "active" || sub.status === "trial")) {
        setStatus("done");
        return;
      }

      // They previously skipped — let them in but don't store permanently
      if (sessionStorage.getItem(SKIP_KEY)) {
        setStatus("done");
        return;
      }

      setStatus("needed");
    } catch {
      setStatus("needed");
    }
  }

  async function handleStartTrial() {
    setStarting(true);
    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        successUrl: window.location.origin + "/dashboard?success=true",
        cancelUrl: window.location.origin + "/dashboard",
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  }

  function handleSkip() {
    sessionStorage.setItem(SKIP_KEY, "true");
    setStatus("done");
  }

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  if (status === "done") return children;

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col overflow-y-auto" style={{ background: C.offWhite }}>
      <div className="max-w-[480px] mx-auto w-full px-4 py-10 space-y-5">

        {/* Header */}
        <div className="rounded-2xl p-6 text-center" style={{ background: C.darkGreen }}>
          <p className="text-4xl mb-3">🌳</p>
          <p className="font-serif font-bold text-xl" style={{ color: C.cream }}>
            Start Your Free Trial
          </p>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: C.lightGreen }}>
            7 days free, then just $14.99/month. Cancel anytime — no questions asked.
          </p>
        </div>

        {/* What's included */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
          <p className="font-bold text-xs tracking-wider" style={{ color: C.mutedText }}>EVERYTHING INCLUDED</p>
          {[
            ["📚", "Full 21-Lesson TBRI® Curriculum"],
            ["💬", "AI Parenting Support Chat (unlimited)"],
            ["📊", "Behavior Logs & Analytics"],
            ["👥", "Professional Team Messaging"],
            ["🗓️", "Family Calendar & Care Coordination"],
            ["🛡️", "Safety Plan Builder"],
            ["🏅", "Milestones, Habits & Progress Tracking"],
            ["📄", "Monthly PDF Report for Court/Care Team"],
          ].map(([emoji, label]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-base">{emoji}</span>
              <p className="text-xs font-medium" style={{ color: C.darkGreen }}>{label}</p>
              <Check size={12} color={C.midGreen} className="ml-auto flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Pricing card */}
        <div className="rounded-2xl p-5 text-center" style={{ background: C.cream }}>
          <p className="text-3xl font-extrabold" style={{ color: C.darkGreen }}>$14.99<span className="text-sm font-normal">/month</span></p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>after your 7-day free trial · cancel anytime</p>
          <p className="text-[11px] mt-2 font-bold" style={{ color: C.midGreen }}>No charge today.</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStartTrial}
          disabled={starting}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: C.darkGreen,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            opacity: starting ? 0.7 : 1,
          }}
        >
          <CreditCard size={18} />
          {starting ? "Redirecting to checkout…" : "Start 7-Day Free Trial"}
        </button>

        <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
          You won't be charged until your trial ends. Cancel before then and pay nothing.
        </p>

        {/* Skip for now */}
        <button
          onClick={handleSkip}
          className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          style={{ background: "transparent", color: C.mutedText, border: `1px solid ${C.cream}`, cursor: "pointer" }}
        >
          <X size={12} /> Skip for now — explore first
        </button>

        <div className="pb-6" />
      </div>
    </div>
  );
}
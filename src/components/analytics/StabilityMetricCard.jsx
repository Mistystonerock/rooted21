import { C } from "@/lib/rooted-constants";

export default function StabilityMetricCard({ label, value, helper, tone = "default" }) {
  const colors = {
    default: { bg: C.white, fg: C.darkGreen },
    warm: { bg: "#fff7ed", fg: "#9a3412" },
    calm: { bg: "#eaf4ea", fg: C.darkGreen },
  }[tone] || { bg: C.white, fg: C.darkGreen };

  return (
    <div className="rounded-2xl border p-4 text-center shadow-sm" style={{ background: colors.bg, borderColor: C.cream }}>
      <p className="font-serif text-2xl font-black" style={{ color: colors.fg }}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wide" style={{ color: C.darkGreen }}>{label}</p>
      {helper && <p className="mt-2 text-[11px] leading-5" style={{ color: C.mutedText }}>{helper}</p>}
    </div>
  );
}
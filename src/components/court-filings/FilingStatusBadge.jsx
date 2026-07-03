import { C } from "@/lib/rooted-constants";

const STATUS_STYLES = {
  draft: { label: "Draft", bg: "#FEF3EE", color: "#B84C2A", border: "#F4C9B8" },
  ready_for_review: { label: "Ready for Review", bg: "#FEF9EC", color: C.brown, border: `${C.gold}55` },
  final_signed: { label: "Final / Signed", bg: "#EAF4EA", color: C.darkGreen, border: C.midGreen },
};

export default function FilingStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {style.label}
    </span>
  );
}
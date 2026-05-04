import { C } from "@/lib/rooted-constants";

export default function BadgeCard({ badge, earned = false }) {
  return (
    <div
      className="rounded-2xl p-4 text-center flex flex-col items-center gap-2 transition-all"
      style={{
        background: earned ? C.white : `${C.cream}80`,
        border: `1.5px solid ${earned ? C.midGreen : C.cream}`,
        opacity: earned ? 1 : 0.6,
      }}
    >
      <div className="text-4xl">{badge.emoji}</div>
      <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
        {badge.name}
      </p>
      <p className="text-[10px]" style={{ color: C.mutedText }}>
        {badge.description}
      </p>
      {earned && (
        <p className="text-[9px] font-bold mt-1" style={{ color: C.midGreen }}>
          ✓ Earned
        </p>
      )}
    </div>
  );
}
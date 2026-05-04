import { C, BEHAVIORS } from "@/lib/rooted-constants";

export default function BehaviorGrid({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BEHAVIORS.map((b) => (
        <button
          key={b.label}
          onClick={() => onSelect(b.q)}
          className="flex items-center gap-2.5 text-left rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: C.white,
            border: `1.5px solid ${C.cream}`,
          }}
        >
          <span className="text-xl">{b.e}</span>
          <span className="text-xs font-bold" style={{ color: C.darkText }}>
            {b.label}
          </span>
        </button>
      ))}
    </div>
  );
}
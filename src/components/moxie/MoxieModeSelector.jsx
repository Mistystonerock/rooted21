import { MOXIE_MODES, visibleMoxieModes } from "@/lib/moxie-ai-config";
import { C } from "@/lib/rooted-constants";

export default function MoxieModeSelector({ mode, onChange, user }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-3 py-2" style={{ background: C.white, borderBottom: `1px solid ${C.cream}` }}>
      {visibleMoxieModes(user).map(key => {
        const item = MOXIE_MODES[key];
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={item.description}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black"
            style={{
              background: active ? C.gold : C.cream,
              color: active ? C.darkGreen : C.mutedText,
              border: "none",
            }}
          >
            {item.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
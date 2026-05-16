import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ChildDataSelector({ children = [], selectedChild, onChange }) {
  const [open, setOpen] = useState(false);

  if (!children.length) return null;

  const child = selectedChild || children[0];

  function choose(item) {
    onChange?.(item);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left"
        style={{ background: C.white, border: `1.5px solid ${C.cream}`, color: C.darkGreen }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: C.cream, color: C.darkGreen }}>
          {child.avatar || child.name?.[0] || "🧒"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{child.name}</p>
          <p className="text-[10px]" style={{ color: C.mutedText }}>{children.length} child{children.length === 1 ? "" : "ren"} in this family</p>
        </div>
        <ChevronDown size={16} color={C.mutedText} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl shadow-xl" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          {children.map(item => (
            <button key={item.id} type="button" onClick={() => choose(item)} className="flex w-full items-center gap-3 px-3 py-3 text-left" style={{ background: item.id === child?.id ? C.offWhite : C.white, border: "none" }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: C.cream, color: C.darkGreen }}>
                {item.avatar || item.name?.[0] || "🧒"}
              </span>
              <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{item.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
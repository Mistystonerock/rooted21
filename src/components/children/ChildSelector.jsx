import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { getChildAvatar, getChildDisplayName, rememberSelectedChild, selectInitialChild } from "@/lib/child-selection";

export default function ChildSelector({ selectedChild, onChange, compact = false }) {
  const [children, setChildren] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    base44.entities.ChildProfile.list("-created_date", 200).then(list => {
      setChildren(list);
      if (!selectedChild && list.length) {
        const initial = selectInitialChild(list);
        rememberSelectedChild(initial);
        onChange?.(initial, list);
      } else {
        onChange?.(selectedChild, list);
      }
    });
  }, []);

  function choose(child) {
    rememberSelectedChild(child);
    onChange?.(child, children);
    setOpen(false);
  }

  if (!children.length) {
    return (
      <Link to="/child-profiles" className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: C.white, border: `1.5px dashed ${C.midGreen}`, color: C.darkGreen, textDecoration: "none" }}>
        <Plus size={15} /> Add child profile
      </Link>
    );
  }

  const child = selectedChild || children[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left"
        style={{ background: C.white, border: `1.5px solid ${C.cream}`, color: C.darkGreen }}
      >
        {child?.photo_url ? (
          <img src={child.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ background: C.cream }}>{getChildAvatar(child)}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{getChildDisplayName(child)}</p>
          {!compact && <p className="text-[10px]" style={{ color: C.mutedText }}>{children.length} child{children.length === 1 ? "" : "ren"} on account</p>}
        </div>
        <ChevronDown size={16} color={C.mutedText} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl shadow-xl" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          {children.map(item => (
            <button key={item.id} type="button" onClick={() => choose(item)} className="flex w-full items-center gap-3 px-3 py-3 text-left" style={{ background: item.id === child?.id ? C.offWhite : C.white, border: "none" }}>
              {item.photo_url ? <img src={item.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ background: C.cream }}>{getChildAvatar(item)}</span>}
              <div>
                <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{getChildDisplayName(item)}</p>
                {item.age && <p className="text-[10px]" style={{ color: C.mutedText }}>Age {item.age}</p>}
              </div>
            </button>
          ))}
          <Link to="/child-profiles" className="flex items-center gap-2 px-3 py-3 text-sm font-bold" style={{ color: C.midGreen, textDecoration: "none", borderTop: `1px solid ${C.cream}` }}>
            <Plus size={14} /> Add another child
          </Link>
        </div>
      )}
    </div>
  );
}
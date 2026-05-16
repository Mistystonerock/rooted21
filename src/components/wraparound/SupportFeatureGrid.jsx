import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function SupportFeatureGrid({ items }) {
  return (
    <div className="grid gap-3">
      {items.map(item => (
        <Link key={item.to || item.title} to={item.to} className="rounded-2xl p-4 no-underline" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl" style={{ background: C.offWhite }}>{item.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black" style={{ color: C.darkGreen }}>{item.title}</p>
                {item.tag && <span className="rounded-full px-2 py-0.5 text-[9px] font-black" style={{ background: `${C.gold}20`, color: C.brown }}>{item.tag}</span>}
              </div>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.description}</p>
            </div>
            <ArrowRight size={15} color={C.gold} className="mt-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}
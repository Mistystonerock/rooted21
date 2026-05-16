import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function OhioSystemCard({ item }) {
  const content = (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl" style={{ background: C.offWhite }}>{item.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black" style={{ color: C.darkGreen }}>{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.description}</p>
          {item.phone && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black" style={{ background: `${C.midGreen}18`, color: C.darkGreen }}>
              <Phone size={11} /> {item.phone}
            </p>
          )}
        </div>
        {item.to && <ArrowRight size={15} color={C.gold} className="mt-1" />}
      </div>
    </div>
  );

  if (item.to) return <Link to={item.to} className="block no-underline">{content}</Link>;
  return content;
}
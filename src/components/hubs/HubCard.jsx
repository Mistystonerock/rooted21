import { Link } from "react-router-dom";
import { ExternalLink, ChevronRight } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function HubCard({ item }) {
  const isExternal = item.url?.startsWith("http") || item.url?.startsWith("tel:") || item.url?.startsWith("sms:");
  const content = (
    <>
      <div className="text-2xl flex-shrink-0">{item.emoji || "🌿"}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
          {item.tag && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color || C.midGreen}18`, color: item.color || C.midGreen }}>{item.tag}</span>}
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{item.description}</p>
        {item.meta && <p className="text-[10px] mt-1 font-bold" style={{ color: item.color || C.brown }}>{item.meta}</p>}
      </div>
      {isExternal ? <ExternalLink size={14} color={C.mutedText} /> : <ChevronRight size={14} color={C.mutedText} />}
    </>
  );

  const className = "flex items-start gap-3 rounded-2xl p-4 transition-all hover:shadow-md";
  const style = { background: C.white, border: `1.5px solid ${C.cream}`, textDecoration: "none" };

  return isExternal ? (
    <a href={item.url} target={item.url?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={className} style={style}>{content}</a>
  ) : (
    <Link to={item.url} className={className} style={style}>{content}</Link>
  );
}
import { ExternalLink } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ProtectiveOrderInfoCard({ icon: Icon, title, text, bullets = [], links = [] }) {
  return (
    <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${C.midGreen}22` }}>
          <Icon size={21} color={C.darkGreen} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-lg font-black leading-tight" style={{ color: C.darkGreen }}>{title}</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>{text}</p>
          {bullets.length > 0 && (
            <ul className="mt-3 space-y-2 pl-4 text-sm" style={{ color: C.darkText }}>
              {bullets.map(item => <li key={item} className="list-disc leading-relaxed">{item}</li>)}
            </ul>
          )}
          {links.length > 0 && (
            <div className="mt-4 grid gap-2">
              {links.map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-2xl px-3 py-3 text-xs font-black no-underline" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>
                  {link.label}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
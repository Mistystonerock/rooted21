import { ExternalLink, Phone } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function HousingResourceCard({ icon, title, description, phone, phoneLabel, website, address, services, qualifies, actions = [] }) {
  return (
    <article className="rounded-3xl p-4 shadow-sm" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: C.offWhite }}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-black leading-tight" style={{ color: C.darkGreen }}>{title}</h3>
          {description && <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>{description}</p>}
          {address && <p className="mt-2 text-xs font-bold" style={{ color: C.darkText }}>Address: {address}</p>}
          {services && <p className="mt-2 text-xs leading-relaxed" style={{ color: C.mutedText }}><strong>Services:</strong> {services}</p>}
          {qualifies && <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}><strong>Who qualifies:</strong> {qualifies}</p>}
          {phone && <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="mt-2 inline-flex items-center gap-1 text-sm font-black no-underline" style={{ color: C.darkGreen }}><Phone size={15} /> {phoneLabel || phone}</a>}
          {website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-black no-underline" style={{ color: C.gold }}><ExternalLink size={15} /> Website</a>}
        </div>
      </div>
      {actions.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {actions.map((action) => {
            const className = "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black no-underline";
            const style = { background: action.color || C.darkGreen, color: "#fff" };
            if (action.href?.startsWith("tel:")) {
              return <a key={action.label} href={action.href} className={className} style={style}><Phone size={17} /> {action.label}</a>;
            }
            return <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" className={className} style={style}><ExternalLink size={17} /> {action.label}</a>;
          })}
        </div>
      )}
    </article>
  );
}
import { ChevronDown } from "lucide-react";

export default function FounderSection({ title, subtitle, icon: Icon, open, onToggle, children }) {
  return (
    <section className="rounded-3xl overflow-hidden bg-white shadow-sm" style={{ border: "1.5px solid #f5ede2" }}>
      <button
        onClick={onToggle}
        className="w-full min-h-[64px] px-4 py-4 flex items-center gap-3 text-left"
        style={{ background: "#ffffff", borderBottom: open ? "1.5px solid #f5ede2" : "none" }}
      >
        {Icon && (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#f5ede2", border: "1px solid rgba(107,157,110,0.25)" }}>
            <Icon size={18} color="#6b9d6e" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif font-bold text-base text-[#5a3d28]">{title}</h2>
          {subtitle && <p className="text-xs mt-0.5 text-[#8b6f54]">{subtitle}</p>}
        </div>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} size={19} color="#8b6f54" />
      </button>
      {open && <div className="p-4 space-y-4" style={{ background: "#ffffff" }}>{children}</div>}
    </section>
  );
}
import { ChevronDown } from "lucide-react";

export default function FounderSection({ title, subtitle, icon: Icon, open, onToggle, children }) {
  return (
    <section className="rounded-3xl overflow-hidden border border-emerald-900/35 bg-white/95 shadow-xl shadow-black/10">
      <button
        onClick={onToggle}
        className="w-full min-h-[64px] px-4 py-4 flex items-center gap-3 text-left"
        style={{ background: "linear-gradient(135deg, #0b2f1b 0%, #123f27 100%)" }}
      >
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-amber-200/15 border border-amber-200/25 flex items-center justify-center flex-shrink-0">
            <Icon size={18} color="#f5e6c8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif font-bold text-base text-[#f5e6c8]">{title}</h2>
          {subtitle && <p className="text-xs mt-0.5 text-[#d7c7aa]">{subtitle}</p>}
        </div>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} size={19} color="#f5e6c8" />
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </section>
  );
}
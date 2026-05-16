import { HeartHandshake } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function WraparoundHero({ title, subtitle, icon = "🌿" }) {
  return (
    <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: "rgba(255,255,255,0.14)" }}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold leading-tight" style={{ color: C.cream }}>{title}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.lightGreen }}>{subtitle}</p>
        </div>
        <HeartHandshake size={22} color={C.gold} />
      </div>
    </section>
  );
}
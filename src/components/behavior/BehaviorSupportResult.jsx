import { AlertTriangle, Heart, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { C } from "@/lib/rooted-constants";

function ListBlock({ icon: Icon, title, items, tone = "green" }) {
  const color = tone === "gold" ? C.gold : C.darkGreen;
  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="mb-3 flex items-center gap-2 font-serif text-base font-bold" style={{ color }}>
        <Icon size={18} /> {title}
      </p>
      <div className="space-y-2">
        {(items || []).map((item, index) => (
          <div key={index} className="rounded-2xl p-3 text-sm leading-relaxed" style={{ background: C.offWhite, color: C.darkText }}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BehaviorSupportResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl p-4 shadow-sm" style={{ background: C.darkGreen }}>
        <p className="flex items-center gap-2 text-sm font-black" style={{ color: C.cream }}>
          <Heart size={18} /> Trauma-informed read
        </p>
        <p className="mt-2 text-sm leading-7" style={{ color: C.lightGreen }}>{result.trauma_lens_summary}</p>
      </section>

      <ListBlock icon={MessageCircle} title="Calm scripts to try now" items={result.deescalation_scripts} />
      <ListBlock icon={Search} title="Possible unmet needs behind the behavior" items={result.possible_unmet_needs} tone="gold" />
      <ListBlock icon={ShieldCheck} title="Next gentle steps" items={result.next_steps} />

      {result.safety_note && (
        <section className="rounded-3xl border p-4" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}>
          <p className="flex items-center gap-2 text-sm font-black"><AlertTriangle size={18} /> Safety note</p>
          <p className="mt-2 text-sm leading-relaxed">{result.safety_note}</p>
        </section>
      )}
    </div>
  );
}
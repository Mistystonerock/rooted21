import { C } from "@/lib/rooted-constants";

export default function GeneratorStats({ stats }) {
  if (!stats) return null;

  const items = [
    { label: "Journal entries", value: stats.communications || 0 },
    { label: "Visit logs", value: stats.visits || 0 },
    { label: "Incident flags", value: stats.incidents || 0 },
    { label: "Child names", value: stats.children || 0 },
  ];

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: C.mutedText }}>Available records</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map(item => (
          <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: C.offWhite }}>
            <p className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>{item.value}</p>
            <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
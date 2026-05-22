import { CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function GeneratorResult({ result }) {
  if (!result) return null;

  return (
    <section className="rounded-2xl border p-4 shadow-sm" style={{ background: "#EAF4EA", borderColor: C.midGreen }}>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={17} color={C.midGreen} />
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>PDF generated and downloaded</p>
      </div>
      <p className="mt-2 text-[11px] font-bold" style={{ color: C.mutedText }}>Report ID: {result.reportId}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Object.entries(result.summary || {}).map(([key, value]) => (
          <div key={key} className="rounded-xl bg-white p-2 text-center">
            <p className="text-base font-black" style={{ color: C.darkGreen }}>{value}</p>
            <p className="text-[9px] capitalize" style={{ color: C.mutedText }}>{key.replace(/([A-Z])/g, " $1")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
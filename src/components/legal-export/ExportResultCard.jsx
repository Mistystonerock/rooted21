import { CheckCircle2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function ExportResultCard({ result }) {
  if (!result) return null;

  return (
    <section className="rounded-2xl p-4" style={{ background: "#EAF4EA", border: `1.5px solid ${C.midGreen}` }}>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={17} color={C.midGreen} />
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>Certified packet downloaded</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ background: C.white }}>
          <p className="text-[9px] font-black uppercase" style={{ color: C.mutedText }}>Export ID</p>
          <p className="mt-1 break-all text-xs font-black" style={{ color: C.darkGreen }}>{result.exportId}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.white }}>
          <p className="text-[9px] font-black uppercase" style={{ color: C.mutedText }}>Auth code</p>
          <p className="mt-1 text-xs font-black" style={{ color: C.darkGreen }}>{result.authenticationCode}</p>
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: C.mutedText }}>The export log was saved to your account with the packet hash and hash-chain root.</p>
    </section>
  );
}
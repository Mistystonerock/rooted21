import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

export default function ProfessionalAccessApprovalPanel({ requests = [], onChanged }) {
  const [workingId, setWorkingId] = useState("");
  if (!requests.length) return null;

  async function decide(request, approve) {
    setWorkingId(request.id);
    await base44.functions.invoke("approveProfessionalAccess", { request_id: request.id, approve });
    await onChanged?.();
    setWorkingId("");
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.gold}` }}>
      <div className="flex items-start gap-3">
        <ShieldCheck size={19} color={C.gold} className="mt-0.5" />
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Professional access requests</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>QR scans only request access. You approve each professional, and approved access expires automatically.</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {requests.map(request => (
          <div key={request.id} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{request.professional_name || request.professional_email}</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>{request.professional_role || "Professional"}{request.child_name ? ` · ${request.child_name}` : ""}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => decide(request, false)} disabled={workingId === request.id} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.cream, color: C.mutedText, border: "none" }}><XCircle size={13} className="mr-1" /> Decline</button>
              <button onClick={() => decide(request, true)} disabled={workingId === request.id} className="rounded-xl px-3 py-2 text-xs font-black" style={{ background: C.darkGreen, color: C.white, border: "none" }}><CheckCircle2 size={13} className="mr-1" /> Approve</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
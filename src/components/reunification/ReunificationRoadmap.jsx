import { useMemo, useState } from "react";
import { C } from "@/lib/rooted-constants";
import { CheckCircle, Circle, Calendar, FileText, Link as LinkIcon, Plus, X } from "lucide-react";

const STATUS = {
  not_started: { label: "Not Started", color: C.mutedText, bg: C.cream },
  in_progress: { label: "In Progress", color: C.brown, bg: "#FFF3E0" },
  completed: { label: "Completed", color: C.midGreen, bg: "#EAF4EA" },
};

function proofLabel(item) {
  if (item.type === "behavior_log") return "Behavior log";
  if (item.type === "therapy_certificate") return "Therapy certificate";
  if (item.type === "document") return "Document";
  return "Proof";
}

export default function ReunificationRoadmap({ plan, behaviorLogs, documents, onUpdateServices }) {
  const [linkingIdx, setLinkingIdx] = useState(null);
  const [proofType, setProofType] = useState("behavior_log");
  const [sourceId, setSourceId] = useState("");
  const [notes, setNotes] = useState("");

  const services = plan.services || [];
  const sortedServices = useMemo(() => services.map((svc, idx) => ({ ...svc, originalIdx: idx })), [services]);
  const completed = services.filter(s => s.status === "completed").length;
  const proofCount = services.reduce((sum, svc) => sum + (svc.proof_items?.length || 0), 0);
  const pct = services.length ? Math.round((completed / services.length) * 100) : 0;

  const proofOptions = useMemo(() => {
    if (proofType === "behavior_log") {
      return behaviorLogs.map(log => ({
        id: log.id,
        title: `${log.entry_date || "Behavior log"} — ${log.behavior_description?.slice(0, 60) || "Behavior progress"}`,
        url: "",
      }));
    }
    if (proofType === "therapy_certificate") {
      return documents
        .filter(doc => doc.category === "therapy" || doc.tags?.some(t => /cert|therapy|counsel/i.test(t)))
        .map(doc => ({ id: doc.id, title: doc.title, url: doc.file_url }));
    }
    return documents.map(doc => ({ id: doc.id, title: doc.title, url: doc.file_url }));
  }, [proofType, behaviorLogs, documents]);

  function resetLinker() {
    setLinkingIdx(null);
    setProofType("behavior_log");
    setSourceId("");
    setNotes("");
  }

  function addProof(serviceIdx) {
    const selected = proofOptions.find(p => p.id === sourceId);
    if (!selected) return;

    const updated = [...services];
    const current = updated[serviceIdx] || {};
    const type = proofType === "therapy_certificate" ? "therapy_certificate" : proofType;
    updated[serviceIdx] = {
      ...current,
      status: current.status === "not_started" ? "in_progress" : current.status,
      proof_items: [
        ...(current.proof_items || []),
        {
          id: `${Date.now()}`,
          type,
          title: selected.title,
          source_id: selected.id,
          url: selected.url || "",
          linked_date: new Date().toISOString().slice(0, 10),
          notes,
        },
      ],
    };
    onUpdateServices(updated);
    resetLinker();
  }

  function removeProof(serviceIdx, proofId) {
    const updated = [...services];
    updated[serviceIdx] = {
      ...updated[serviceIdx],
      proof_items: (updated[serviceIdx].proof_items || []).filter(p => p.id !== proofId),
    };
    onUpdateServices(updated);
  }

  function markComplete(serviceIdx) {
    const updated = [...services];
    updated[serviceIdx] = {
      ...updated[serviceIdx],
      status: "completed",
      completion_date: updated[serviceIdx].completion_date || new Date().toISOString().slice(0, 10),
    };
    onUpdateServices(updated);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Proof of Progress Roadmap</p>
            <p className="text-[11px]" style={{ color: C.mutedText }}>Court-ordered services + linked proof trajectory</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold" style={{ color: C.midGreen }}>{pct}%</p>
            <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>COMPLETE</p>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: C.cream }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.midGreen }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl p-2 text-center" style={{ background: C.offWhite }}>
            <p className="font-extrabold" style={{ color: C.darkGreen }}>{services.length}</p>
            <p className="text-[9px]" style={{ color: C.mutedText }}>Milestones</p>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: "#EAF4EA" }}>
            <p className="font-extrabold" style={{ color: C.midGreen }}>{completed}</p>
            <p className="text-[9px]" style={{ color: C.mutedText }}>Completed</p>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: "#FFFBEE" }}>
            <p className="font-extrabold" style={{ color: C.brown }}>{proofCount}</p>
            <p className="text-[9px]" style={{ color: C.mutedText }}>Proof Items</p>
          </div>
        </div>
      </div>

      <div className="relative space-y-3">
        <div className="absolute left-5 top-6 bottom-6 w-0.5" style={{ background: C.cream }} />
        {sortedServices.map((svc, orderIdx) => {
          const st = STATUS[svc.status] || STATUS.not_started;
          const serviceIdx = svc.originalIdx;
          const proofs = svc.proof_items || [];
          return (
            <div key={svc.id || orderIdx} className="relative flex gap-3">
              <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: st.bg, border: `2px solid ${st.color}` }}>
                {svc.status === "completed" ? <CheckCircle size={18} color={st.color} /> : <Circle size={18} color={st.color} />}
              </div>

              <div className="flex-1 rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm" style={{ color: C.darkGreen }}>{svc.name || "Court-ordered service"}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      {svc.completion_date && <span className="text-[9px] font-bold" style={{ color: C.mutedText }}>Completed {svc.completion_date}</span>}
                    </div>
                  </div>
                  <button onClick={() => markComplete(serviceIdx)} className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                    Complete
                  </button>
                </div>

                {(svc.provider || svc.milestone_date || svc.notes) && (
                  <div className="space-y-1">
                    {svc.provider && <p className="text-[11px]" style={{ color: C.mutedText }}>Provider: {svc.provider}</p>}
                    {svc.milestone_date && <p className="text-[11px] flex items-center gap-1" style={{ color: C.mutedText }}><Calendar size={11} /> Milestone: {svc.milestone_date}</p>}
                    {svc.notes && <p className="text-[11px]" style={{ color: C.mutedText }}>{svc.notes}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>LINKED PROOF</p>
                  {proofs.length > 0 ? proofs.map(proof => (
                    <div key={proof.id} className="flex items-start gap-2 rounded-xl p-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                      <FileText size={13} color={C.midGreen} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold" style={{ color: C.darkGreen }}>{proof.title}</p>
                        <p className="text-[9px]" style={{ color: C.mutedText }}>{proofLabel(proof)} · linked {proof.linked_date}</p>
                        {proof.notes && <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>{proof.notes}</p>}
                      </div>
                      {proof.url && <a href={proof.url} target="_blank" rel="noreferrer" className="p-1" style={{ color: C.midGreen }}><LinkIcon size={12} /></a>}
                      <button onClick={() => removeProof(serviceIdx, proof.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={12} color={C.mutedText} /></button>
                    </div>
                  )) : (
                    <p className="text-[11px]" style={{ color: C.mutedText }}>No proof linked yet.</p>
                  )}
                </div>

                {linkingIdx === serviceIdx ? (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                    <select value={proofType} onChange={e => { setProofType(e.target.value); setSourceId(""); }} className="w-full rounded-lg px-2 py-2 text-xs border outline-none" style={{ borderColor: C.cream }}>
                      <option value="behavior_log">Completed behavior log</option>
                      <option value="therapy_certificate">Therapy certificate</option>
                      <option value="document">Document upload</option>
                    </select>
                    <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="w-full rounded-lg px-2 py-2 text-xs border outline-none" style={{ borderColor: C.cream }}>
                      <option value="">Choose proof to link</option>
                      {proofOptions.map(option => <option key={option.id} value={option.id}>{option.title}</option>)}
                    </select>
                    <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional note for court/team" className="w-full rounded-lg px-2 py-2 text-xs border outline-none" style={{ borderColor: C.cream }} />
                    <div className="flex gap-2">
                      <button onClick={() => addProof(serviceIdx)} disabled={!sourceId} className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: sourceId ? C.darkGreen : C.cream, color: sourceId ? "#fff" : C.mutedText, border: "none" }}>Link Proof</button>
                      <button onClick={resetLinker} className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setLinkingIdx(serviceIdx)} className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2" style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
                    <Plus size={12} /> Link behavior log, certificate, or document
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
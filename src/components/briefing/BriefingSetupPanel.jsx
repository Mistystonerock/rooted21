import { C } from "@/lib/rooted-constants";
import { Sparkles } from "lucide-react";

const PACKETS = ["General Court Filing", "Shared Parenting", "Emergency Custody / Ex Parte", "Visitation / Parenting Time Change", "Protection Order", "CPS Case Plan / Court Preparation", "Child Support", "Housing Court / Eviction Support"];

export default function BriefingSetupPanel({ briefingType, setBriefingType, packetTitle, setPacketTitle, focus, setFocus, onGenerate, loading }) {
  return (
    <section className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <p className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Draft briefing details</p>
      <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Choose the filing-friendly format and any focus you want the AI to prioritize.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select value={briefingType} onChange={e => setBriefingType(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          <option>Statement of Facts</option>
          <option>Case Chronology</option>
        </select>
        <select value={packetTitle} onChange={e => setPacketTitle(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
          {PACKETS.map(packet => <option key={packet}>{packet}</option>)}
        </select>
      </div>

      <textarea value={focus} onChange={e => setFocus(e.target.value)} placeholder="Optional focus, e.g. missed visits, safety incidents, compliance progress, communication patterns..." className="mt-3 min-h-24 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} />

      <button type="button" onClick={onGenerate} disabled={loading} className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-black" style={{ background: loading ? C.cream : C.gold, color: C.darkGreen, border: "none" }}>
        <Sparkles size={16} className="mr-2" /> {loading ? "Drafting briefing..." : "Generate Automated Briefing"}
      </button>
    </section>
  );
}
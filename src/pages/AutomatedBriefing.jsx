import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import BriefingSetupPanel from "@/components/briefing/BriefingSetupPanel";
import BriefingResult from "@/components/briefing/BriefingResult";
import { C } from "@/lib/rooted-constants";
import { FileText, GitBranch } from "lucide-react";

export default function AutomatedBriefing() {
  const [briefingType, setBriefingType] = useState("Statement of Facts");
  const [packetTitle, setPacketTitle] = useState("General Court Filing");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateBriefing() {
    setLoading(true);
    const response = await base44.functions.invoke("generateAutomatedBriefing", { briefingType, packetTitle, focus });
    setResult(response.data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Automated Briefing" subtitle="Statement of Facts + Case Chronology" backTo="/evidence-timeline" />
      <main className="mx-auto max-w-[720px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>AI Automated Briefing</p>
          <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>Draft a neutral, plain-language Statement of Facts or Case Chronology using your Evidence Timeline and court/document records.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/evidence-timeline" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.gold, color: C.darkGreen }}><GitBranch size={14} className="mr-1" /> Evidence Timeline</Link>
            <Link to="/court-packet-helper" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: "rgba(255,255,255,0.12)", color: C.cream, border: `1px solid ${C.gold}` }}><FileText size={14} className="mr-1" /> Court Packet Helper</Link>
          </div>
        </section>

        <section className="rounded-3xl border p-4 text-xs leading-6" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}>
          This draft is organization support only and is not legal advice. Review all facts, exhibits, wording, and filing requirements with the court clerk, legal aid, an attorney, or the official court website before filing.
        </section>

        <BriefingSetupPanel briefingType={briefingType} setBriefingType={setBriefingType} packetTitle={packetTitle} setPacketTitle={setPacketTitle} focus={focus} setFocus={setFocus} onGenerate={generateBriefing} loading={loading} />
        <BriefingResult briefing={result?.briefing} evidenceCount={result?.evidence_count || 0} documentCount={result?.document_count || 0} />
      </main>
    </div>
  );
}
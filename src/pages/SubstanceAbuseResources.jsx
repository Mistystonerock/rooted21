import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import ZipResourceNotice from "@/components/hubs/ZipResourceNotice";
import { C } from "@/lib/rooted-constants";

const RESOURCES = [
  { title: "SAMHSA Treatment Locator", description: "Search detox, inpatient, outpatient, medication-assisted treatment, and mental health services by ZIP code.", url: "https://findtreatment.gov/", emoji: "🔎", tag: "ZIP SEARCH", color: "#1A5FAD" },
  { title: "SAMHSA National Helpline", description: "Free, confidential treatment referral and information service: 1-800-662-HELP (4357).", url: "tel:18006624357", emoji: "☎️", tag: "24/7", color: "#B84C2A" },
  { title: "BrightView Chillicothe Addiction Treatment Center", description: "Outpatient addiction treatment, medication-assisted treatment, counseling, and Medicaid-friendly care in Chillicothe.", url: "https://www.brightviewhealth.com/locations/chillicothe-addiction-treatment-center/", emoji: "🏥", meta: "Chillicothe / 45601" },
  { title: "Chillicothe Treatment Services", description: "Opioid treatment program with methadone, Suboxone, and counseling services.", url: "https://pinnacletreatment.com/location/ohio/chillicothe/chillicothe-treatment-services/", emoji: "💊", meta: "Chillicothe / 45601" },
  { title: "Hope Partnership Project — Peer Recovery", description: "Peer recovery support and community connections for people navigating substance-use recovery.", url: "https://www.hopepartnershipproject.com/peer-recovery/", emoji: "🤝", meta: "Ross County area" },
  { title: "Ross County Drug Court Program", description: "Treatment-based court alternative for eligible non-violent offenses involving substance abuse.", url: "https://www.rosscountycommonpleas.org/services/ross-county-drug-court-program.html", emoji: "⚖️", meta: "Ross County Common Pleas" },
  { title: "Ohio CareLine", description: "Emotional support and behavioral health navigation from the State of Ohio: 1-800-720-9616.", url: "tel:18007209616", emoji: "💙", tag: "OHIO" },
  { title: "988 Suicide & Crisis Lifeline", description: "Call or text 988 for immediate mental health or substance-use crisis support.", url: "tel:988", emoji: "🚨", tag: "CRISIS", color: "#B84C2A" },
];

export default function SubstanceAbuseResources() {
  const [zip, setZip] = useState("45601");

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Substance Abuse Resources" subtitle="Detox, rehab, MAT, and recovery support" backTo="/resources" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">🫶</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Recovery Support Near You</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Start with your ZIP code. Ross County / Chillicothe resources are listed first, with statewide search tools for any Ohio ZIP.</p>
        </div>
        <ZipResourceNotice onZipChange={setZip} />
        <div className="rounded-2xl p-4" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>If someone may overdose or is in immediate danger</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#B84C2A" }}>Call 911 now. For crisis support, call or text 988.</p>
        </div>
        <p className="text-[11px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>RESOURCES FOR ZIP {zip || "YOUR AREA"}</p>
        <div className="space-y-3">{RESOURCES.map(item => <HubCard key={item.title} item={item} />)}</div>
        <div className="pb-8" />
      </div>
    </div>
  );
}
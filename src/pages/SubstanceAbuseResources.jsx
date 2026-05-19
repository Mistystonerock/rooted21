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
  { title: "Juvenile Family Treatment Court", description: "A family-centered court support program for parents with CPS or juvenile court involvement when substance use is part of the case. It can help connect parents with treatment, recovery support, accountability, parenting support, visits, case-plan progress, and regular court check-ins. Parents may qualify when there is an open child welfare or juvenile court case, substance use is affecting family safety or reunification, and the parent is willing to participate in treatment and court reviews. Ask your CPS caseworker, attorney, GAL/CASA, probation officer, treatment provider, or juvenile court clerk if your county has Family Treatment Court and request a referral.", url: "https://ojjdp.ojp.gov/programs/family-treatment-court-program", emoji: "👨‍👩‍👧", tag: "COURT SUPPORT", meta: "Ask Juvenile Court or CPS for referral" },
  { title: "Ohio START Program", description: "Ohio START stands for Sobriety, Treatment, and Reducing Trauma. It supports families involved with children services when parental substance use is affecting child safety. A START team usually includes a CPS caseworker and a family peer mentor with lived recovery experience who help parents connect to treatment, recovery supports, family services, and trauma-informed care. Families may qualify when there is an open children services case, substance use is a concern, and the family is willing to work with the START team. To sign up, ask your county children services agency, CPS caseworker, attorney, or treatment provider if Ohio START is available in your county and request a START referral.", url: "https://www.ohiostart.org/", emoji: "🌱", tag: "OHIO START", meta: "Children Services / CPS referral" },
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
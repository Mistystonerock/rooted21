import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileHeader";
import HubCard from "@/components/hubs/HubCard";
import { C } from "@/lib/rooted-constants";
import LegalRightsInformationPanel from "@/components/legal/LegalRightsInformationPanel";

const STATES = [
  { code: "OH", name: "Ohio", court: "https://www.supremecourt.ohio.gov/forms/all-forms/", legal: "https://www.ohiolegalhelp.org/", rights: "https://education.ohio.gov/Topics/Special-Education/A-Guide-to-Parent-Rights-in-Special-Education", child: "https://jfs.ohio.gov/" },
  { code: "KY", name: "Kentucky", court: "https://kycourts.gov/Legal-Forms/Pages/default.aspx", legal: "https://www.kyjustice.org/", rights: "https://www.education.ky.gov/specialed/excep/Pages/Parent-Rights.aspx" },
  { code: "WV", name: "West Virginia", court: "https://www.courtswv.gov/legal-community/court-forms", legal: "https://legalaidwv.org/", rights: "https://wvde.us/special-education/" },
  { code: "PA", name: "Pennsylvania", court: "https://www.pacourts.us/forms", legal: "https://www.palawhelp.org/", rights: "https://www.education.pa.gov/K-12/Special%20Education/Pages/Parental-Rights.aspx" },
  { code: "MI", name: "Michigan", court: "https://www.courts.michigan.gov/SCAO-forms/", legal: "https://michiganlegalhelp.org/", rights: "https://www.michigan.gov/mde/services/special-education" },
  { code: "IN", name: "Indiana", court: "https://www.in.gov/courts/selfservice/", legal: "https://indianalegalhelp.org/", rights: "https://www.in.gov/doe/students/special-education/" },
];

export default function CourtRightsEducation() {
  const [stateCode, setStateCode] = useState("OH");
  const state = STATES.find(s => s.code === stateCode) || STATES[0];

  const items = [
    { title: `${state.name} court forms`, description: "Official court forms and paperwork for your selected state.", url: state.court, emoji: "📄", tag: "FORMS" },
    { title: `${state.name} legal help`, description: "Plain-language legal education, self-help articles, and legal aid connections.", url: state.legal, emoji: "⚖️", tag: "SELF HELP" },
    { title: `${state.name} special education rights`, description: "Parent rights, IEP safeguards, and school support information.", url: state.rights, emoji: "🎓", tag: "IEP" },
    ...(state.child ? [{ title: `${state.name} child & family services`, description: "State child welfare, benefits, and family services information.", url: state.child, emoji: "🏛️", tag: "FAMILY" }] : []),
    { title: "National LawHelp state finder", description: "Find legal help and court education in any U.S. state.", url: "https://www.lawhelp.org/", emoji: "🗺️", tag: "ALL STATES" },
    { title: "LawHelp Interactive forms", description: "Guided court and legal-document interviews for participating states.", url: "https://lawhelpinteractive.org/Home/SelfHelper", emoji: "📝", tag: "GUIDED" },
    { title: "Court Preparation Checklist", description: "In-app checklist to organize paperwork, questions, and next steps before court.", url: "/court-preparation-checklist", emoji: "✅" },
    { title: "Know Your Rights", description: "Quick in-app reference for CPS, IEP, and court conversations.", url: "/rights-card", emoji: "🪪" },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Court Prep & Rights" subtitle="State-based education and paperwork links" backTo="/resources" />
      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-4">
        <div className="rounded-2xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-3xl mb-2">⚖️</p>
          <p className="font-serif font-bold text-base" style={{ color: C.cream }}>Learn before you file or attend court</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.lightGreen }}>Choose your state for official court forms, parent rights, IEP safeguards, and legal-help education.</p>
        </div>

        <div className="rounded-2xl p-4 space-y-2" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <label className="text-[10px] font-extrabold tracking-wider" style={{ color: C.mutedText }}>SELECT STATE</label>
          <select value={stateCode} onChange={e => setStateCode(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }}>
            {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>More states can still use the national LawHelp links below.</p>
        </div>

        <div className="space-y-3">{items.map(item => <HubCard key={item.title} item={item} />)}</div>

        <LegalRightsInformationPanel />

        <div className="rounded-2xl p-4" style={{ background: "#FFFBEE", border: "1px solid #F4DFA0" }}>
          <p className="text-xs font-bold" style={{ color: "#7A5200" }}>Important</p>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#7A5200" }}>These links are education and forms only, not legal advice. If you have an active case, talk with an attorney or legal aid when possible.</p>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}
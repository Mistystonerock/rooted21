import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ClipboardList, Download, FileText, Gavel, HeartHandshake, Phone, Scale, Shield, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import ProtectiveOrderInfoCard from "@/components/legal/ProtectiveOrderInfoCard";

const TOPICS = [
  {
    icon: Shield,
    title: "Protection orders in Ohio",
    text: "Protection orders are court orders that may help create safety boundaries when someone is experiencing domestic violence, dating violence, stalking, sexually oriented offenses, or related threats.",
    bullets: ["Ohio has different protection order types depending on the situation and court involved.", "A local court, legal aid office, or advocate can help explain options that may fit your circumstances.", "If danger feels immediate, emergency support is available through 911 before using any app resource."],
    links: [{ label: "Ohio Legal Help: Protection Orders", href: "https://www.ohiolegalhelp.org/topic/protection-orders-ohio" }]
  },
  {
    icon: AlertTriangle,
    title: "Emergency custody and child safety concerns",
    text: "If children may be at risk, support is available. When it feels safe, you can document safety concerns and connect with a qualified attorney, legal aid, child advocacy professional, or local court self-help center.",
    bullets: ["You can write down facts: dates, locations, what happened, who witnessed it, and any child impact.", "If it is safe for you, you can keep school, medical, CPS, police, or counseling records organized.", "A legal professional can explain emergency custody procedures in your county."],
  },
  {
    icon: FileText,
    title: "Documenting abuse safely",
    text: "Documentation can help advocates and legal professionals understand a pattern of harm. You can choose what feels safe, and it is okay to move slowly.",
    bullets: ["If it is safe, you can save screenshots, voicemails, photos, police reports, medical records, and witness names.", "Factual notes can include what happened, when, where, and who was present.", "A private, secure place for copies may help protect your information."],
  },
  {
    icon: ClipboardList,
    title: "Court preparation",
    text: "Court can feel overwhelming. You are not alone; a survivor advocate, legal aid office, or attorney can help you prepare at your own pace.",
    bullets: ["If it is helpful, you can gather ID, completed forms, incident notes, evidence copies, and any current court orders.", "Transportation, childcare, safe arrival/departure, and support person options may be part of your plan.", "A court or advocate may be able to explain separate waiting areas or courthouse safety planning options."],
  },
  {
    icon: Download,
    title: "Downloadable Ohio forms and resources",
    text: "These are official or statewide educational resources. You can review filing instructions when you are ready, and local court staff or legal aid may be able to offer procedural help.",
    links: [
      { label: "Supreme Court of Ohio: Protection Order Forms", href: "https://www.supremecourt.ohio.gov/forms/all-forms/protection-order/2" },
      { label: "Ohio DV Protection Order Forms", href: "https://www.supremecourt.ohio.gov/courts/services-to-courts/domestic-violence-program/domestic-violence-protection-order-forms/" },
      { label: "Ohio Legal Help Forms and Guides", href: "https://www.ohiolegalhelp.org/" }
    ]
  },
  {
    icon: HeartHandshake,
    title: "Evidence collection reminders",
    text: "Evidence can be gathered in the safest way available to you. An advocate or attorney can help explain what may be useful and how it can be shared.",
    bullets: ["When possible and safe, originals and copies may both be helpful.", "Unedited screenshots or documents with visible dates and sender information may be easier for others to understand.", "If digital monitoring is possible, a safer device may help before accessing sensitive files."],
  },
  {
    icon: Scale,
    title: "Legal aid contacts",
    text: "Free or reduced-cost legal help may be available depending on income, county, and case type. Support is available, and you can choose what feels right for your situation.",
    links: [
      { label: "Ohio Domestic Violence Network Legal Services", href: "https://www.odvn.org/legal-services/" },
      { label: "Ohio Legal Help: Find Legal Help", href: "https://www.ohiolegalhelp.org/" },
      { label: "Legal Aid Society of Columbus: Family Law", href: "https://www.lasco.org/familylaw" },
      { label: "Legal Aid Society of Cleveland: DV Options", href: "https://lasclev.org/what-legal-options-are-available-for-protection-from-domestic-violence/" }
    ]
  },
  {
    icon: Users,
    title: "Survivor rights information",
    text: "Survivors may be able to ask for safety planning support, advocacy, interpretation, accessibility accommodations, victim services, and information about court processes.",
    bullets: ["You can ask an advocate to help you understand options and referrals.", "You can ask courts or service providers about language access and disability accommodations.", "You deserve support that is respectful, trauma-informed, and culturally responsive."],
  }
];

export default function ProtectiveOrderHelp() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <header className="sticky top-0 z-20 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.18)", border: "none" }}>
            <ChevronLeft size={22} color="#fff" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.78)" }}>Educational support only</p>
            <h1 className="font-serif text-lg font-black" style={{ color: "#fff" }}>Protective Order Help</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[640px] space-y-4 px-4 py-5">
        <section className="rounded-3xl p-5 shadow-lg" style={{ background: C.white, border: `2px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: C.cream }}>
              <Gavel size={24} color={C.darkGreen} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-black leading-tight" style={{ color: C.darkGreen }}>Ohio legal safety guidance and referrals</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>
                This page explains common legal safety topics in plain language and points you to Ohio resources. It does not provide legal advice, and it will not pressure you toward any choice.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl p-4" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <p className="text-sm font-bold leading-relaxed" style={{ color: "#9a3412" }}>
              Not legal advice: When you are ready, an attorney, legal aid, court self-help center, or trained survivor advocate can help you understand options for your situation.
            </p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href="tel:18007997233" className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline" style={{ background: C.darkGreen, color: "#fff" }}><Phone size={17} /> National DV Hotline</a>
            <Link to="/sos" className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black no-underline" style={{ background: C.cream, color: C.darkGreen }}>Back to SOS</Link>
          </div>
        </section>

        {TOPICS.map(topic => <ProtectiveOrderInfoCard key={topic.title} {...topic} />)}
      </div>
    </main>
  );
}
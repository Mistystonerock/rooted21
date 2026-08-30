import { Link } from "react-router-dom";
import { AlertTriangle, Phone, HeartPulse, Send, MapPin, Scale, ShieldCheck, Home, Stethoscope, Info } from "lucide-react";
import { C } from "@/lib/rooted-constants";
import TraffickingHeader from "@/components/trafficking/TraffickingHeader";
import HotlineCard from "@/components/trafficking/HotlineCard";

const ROSS_COUNTY_RESOURCES = [
  {
    category: "Ross County Core Partners",
    color: "#1a3a4a",
    items: [
      {
        name: "ROSE House / DV Crisis Line",
        desc: "Domestic-violence crisis, safety planning, and shelter pathway.",
        phone: "740-637-1610",
        hours: "24/7 call or text",
      },
      {
        name: "The Garden Family Advocacy Center",
        desc: "Child abuse & trafficking assessment, advocacy, therapy, multidisciplinary coordination. Formerly Child Protection Center.",
        phone: "740-779-7431",
        address: "138 Marietta Rd., Ste. E, Chillicothe",
        hours: "Call to confirm hours",
      },
      {
        name: "South Central Ohio Job & Family Services",
        desc: "Children and adult protective services; Medicaid, food, childcare, transportation programs. Use 911 for immediate danger.",
        phone: "855-726-5237 opt. 1",
        address: "475 Western Ave., Chillicothe",
        hours: "Mon–Fri 8:00–4:30",
      },
      {
        name: "Adena Regional Medical Center",
        desc: "Emergency medical care. Ask specifically for sexual-assault/forensic and advocacy pathway.",
        phone: "740-779-7500",
        address: "272 Hospital Rd., Chillicothe",
        hours: "Hospital/ED open 24/7",
      },
      {
        name: "Hopewell Health Centers",
        desc: "Behavioral health, substance-use, primary care, crisis, and integrated services. Use crisis line for urgent needs.",
        phone: "740-773-4366 or 800-686-4366",
        crisis: "888-475-8484 or 740-593-3344",
        address: "1049 Western Ave., Chillicothe",
        hours: "Crisis line 24/7; clinic hours vary",
      },
      {
        name: "Ross County Community Action",
        desc: "Housing/shelter, domestic violence, food, utilities, early childhood, recovery, peer recovery support, CARES navigation, women's recovery housing.",
        phone: "740-702-7222",
        address: "250 Woodbridge Ave., Chillicothe",
        hours: "Business hours; DV crisis line separate",
      },
      {
        name: "Ross County Prosecutor Victim/Witness Assistance",
        desc: "Free felony and juvenile crime-victim advocacy, court support, safe-housing referrals, VINE and compensation assistance.",
        phone: "740-702-3190 or 877-702-3190",
        address: "28 N. Paint St., Chillicothe",
        hours: "Mon–Fri 8:00–4:00",
      },
      {
        name: "Legal Aid of Southeast and Central Ohio (LASCO)",
        desc: "Free civil legal help for eligible low-income people, seniors, and veterans. Ask about protection orders, housing, benefits, employment, immigration.",
        phone: "888-246-4420",
        address: "73 E. Water St., Chillicothe",
        hours: "Mon–Fri; online application anytime",
        website: "https://www.lasco.org",
      },
      {
        name: "Ross County Sheriff",
        desc: "County law-enforcement response. Business/non-emergency: 740-773-1186.",
        phone: "740-773-1185",
        hours: "24-hour dispatch",
      },
      {
        name: "Ross County 211 / United Way",
        desc: "Free, confidential help for food, housing, clothing, transportation, medical costs, childcare, utilities, and more.",
        phone: "Dial 211",
        hours: "24/7",
      },
    ],
  },
  {
    category: "Ohio & National Hotlines",
    color: "#3a1a1a",
    items: [
      {
        name: "Ohio Human Trafficking Hotline",
        desc: "Non-emergency trafficking tips go directly to Ohio BCI/law enforcement for review and referral.",
        phone: "844-363-6448 (844-END-OHHT)",
        hours: "24/7",
      },
      {
        name: "Ohio Sexual Violence Helpline",
        desc: "Confidential support and local sexual-violence resource connection.",
        phone: "844-644-6435 (844-OHIO-HELP)",
        hours: "24/7",
      },
      {
        name: "Child Abuse / Neglect Reporting",
        desc: "Report suspected child abuse or neglect. Use 911 for immediate danger.",
        phone: "855-642-4453 (855-OH-CHILD)",
        hours: "Statewide; confirm after-hours routing locally",
      },
      {
        name: "National Center for Missing & Exploited Children",
        desc: "Missing/exploited child reports and CyberTipline pathway.",
        phone: "1-800-843-5678 (1-800-THE-LOST)",
        hours: "24/7",
      },
      {
        name: "Domestic Violence National Hotline",
        desc: "Safety planning and connection to local domestic-violence programs.",
        phone: "800-799-7233 (800-799-SAFE)",
        sms: "Text START to 88788",
        hours: "24/7",
        website: "https://thehotline.org",
      },
      {
        name: "Sexual Assault — RAINN",
        desc: "Free confidential sexual-violence support and local referral.",
        phone: "800-656-4673 (800-656-HOPE)",
        hours: "24/7",
        website: "https://rainn.org/hotline",
      },
      {
        name: "Runaway / Homeless Youth",
        desc: "Free, confidential youth crisis support and local resources.",
        phone: "800-786-2929 (800-RUNAWAY)",
        hours: "24/7",
      },
      {
        name: "Veterans Crisis Line",
        desc: "Veterans, service members, National Guard/Reserve, and their loved ones.",
        phone: "Call 988, press 1",
        sms: "Text 838255",
        hours: "24/7",
      },
      {
        name: "SAMHSA National Helpline",
        desc: "Treatment referral and information for mental-health and substance-use needs.",
        phone: "800-662-4357 (800-662-HELP)",
        hours: "24/7",
        website: "https://findtreatment.gov",
      },
    ],
  },
  {
    category: "Treatment & Recovery (Ross County)",
    color: "#1a3a1a",
    items: [
      {
        name: "The Recovery Council — Southern Ohio",
        desc: "Central entry point for treatment: withdrawal management (24/7 staffing), residential, outpatient/IOP, trauma-informed track for trafficking survivors, family stabilization housing, and transitional/recovery housing in Pike and Ross counties.",
        phone: "740-835-8485 (admissions)",
        detail: "Chillicothe outpatient: 740-851-5307 · Waverly outpatient: 740-947-7581",
        hours: "Call for screening and availability",
        website: "https://therecoverycouncil.org",
      },
      {
        name: "Hope Valley Recovery — Circleville",
        desc: "Medical detox, residential/PHP, IOP, outpatient, co-occurring mental-health, case management, peer support, transitional housing. Website lists same-day admission and transportation assistance; verify current beds and eligibility.",
        phone: "740-500-1391",
        address: "2065 Stoneridge Dr., Circleville",
        hours: "Call admissions; verify after-hours",
        website: "https://hopevalleyrecovery.com",
      },
      {
        name: "Integrated Services for Behavioral Health — Ross",
        desc: "Behavioral-health care, homelessness assistance, housing-first support, employment, education, primary-care connections. Confirm which programs are available in Ross County.",
        phone: "740-772-6191 or 800-321-8293",
        address: "531 E. Main St., Chillicothe",
        hours: "Ross office Mon–Fri 8–4",
        website: "https://isbh.org",
      },
    ],
  },
];

function ResourceCard({ item }) {
  const bg = "#fff";
  const borderColor = `${C.midGreen}30`;
  return (
    <div className="rounded-2xl p-4" style={{ background: bg, border: `1.5px solid ${borderColor}` }}>
      <p className="font-bold text-sm leading-snug" style={{ color: C.darkGreen }}>{item.name}</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.desc}</p>
      {item.hours && <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.midGreen }}>{item.hours}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {item.phone && (
          <a href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline"
            style={{ background: C.darkGreen, color: "#fff" }}>
            <Phone size={13} /> {item.phone}
          </a>
        )}
        {item.crisis && (
          <a href={`tel:${item.crisis.replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline"
            style={{ background: "#7a2020", color: "#fff" }}>
            <Phone size={13} /> Crisis: {item.crisis}
          </a>
        )}
        {item.sms && (
          <span className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold"
            style={{ background: `${C.midGreen}20`, color: C.darkGreen }}>
            💬 {item.sms}
          </span>
        )}
        {item.website && (
          <a href={item.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold no-underline"
            style={{ background: `${C.midGreen}15`, color: C.darkGreen, border: `1px solid ${C.midGreen}40` }}>
            🌐 Website
          </a>
        )}
      </div>
      {item.address && <p className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: C.mutedText }}><MapPin size={11} /> {item.address}</p>}
      {item.detail && <p className="mt-1 text-[11px] italic" style={{ color: C.mutedText }}>{item.detail}</p>}
    </div>
  );
}

export default function TraffickingEmergency() {
  return (
    <div className="min-h-screen pb-28" style={{ background: C.offWhite }}>
      <TraffickingHeader title="Get Help Now" subtitle="Ross County & national resources" backTo="/human-trafficking-support" />

      <main className="mx-auto max-w-[560px] space-y-4 px-4 py-5">
        {/* Immediate danger */}
        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.midGreen }}>
            <AlertTriangle size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-2xl font-black" style={{ color: C.darkGreen }}>If anyone is in immediate danger</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>Call emergency services now. Do not wait for an app response.</p>
          <a href="tel:911" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: C.midGreen, color: "#fff" }}>
            <Phone size={22} /> Call 911
          </a>
        </section>

        {/* National Trafficking Hotline */}
        <HotlineCard />

        {/* SOS alert */}
        <section className="rounded-3xl p-5 shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <Send size={30} color="#fff" />
          </div>
          <h2 className="text-center font-serif text-xl font-black" style={{ color: C.darkGreen }}>Alert your support team</h2>
          <p className="mt-2 text-center text-sm leading-relaxed" style={{ color: C.mutedText }}>
            Send a private SOS to the people you have chosen. You control who is notified, who sees your location, and who reads your message.
          </p>
          <Link to="/sos" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black no-underline shadow-lg"
            style={{ background: C.darkGreen, color: "#fff" }}>
            <Send size={20} /> Open secure SOS
          </Link>
        </section>

        {/* 988 */}
        <section className="rounded-3xl p-5 text-center shadow-lg" style={{ background: "#fff", border: `2px solid ${C.midGreen}40` }}>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.darkGreen }}>
            <HeartPulse size={32} color="#fff" />
          </div>
          <h2 className="font-serif text-xl font-black" style={{ color: C.darkGreen }}>Mental-health or crisis support</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: C.mutedText }}>For panic, fear, or emotional crisis, call or text 988 anytime.</p>
          <a href="tel:988" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black no-underline shadow-lg" style={{ background: C.darkGreen, color: "#fff" }}>
            <Phone size={22} /> Call or Text 988
          </a>
        </section>

        {/* Resource Directory */}
        <div className="rounded-2xl px-4 py-3" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}30` }}>
          <div className="flex items-center gap-2">
            <Info size={16} color={C.darkGreen} />
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
              Ross County verified resources — Updated August 30, 2026. Verify contacts before each use.
            </p>
          </div>
        </div>

        {ROSS_COUNTY_RESOURCES.map((section) => (
          <div key={section.category}>
            <h3 className="mb-2 px-1 font-serif text-base font-black" style={{ color: C.darkGreen }}>{section.category}</h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <ResourceCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        ))}

        <p className="px-2 text-center text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
          Source: Ross County Human Trafficking Community Response &amp; Resource Guide, August 30, 2026. You are always in control of what you share and when.
        </p>
      </main>
    </div>
  );
}
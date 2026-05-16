import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ExternalLink, MapPin, ShieldAlert } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const ZIP_KEY = "rooted21_medical_zip";

const CATEGORIES = [
  { icon: "🩺", title: "Primary Care Doctors", desc: "Find a primary care physician or family doctor who accepts your insurance including Medicaid and CHIP", type: "doctor", query: "primary care doctor" },
  { icon: "👶", title: "Pediatricians", desc: "Find a pediatrician for your child. Filter by age range and insurance accepted", type: "doctor", query: "pediatrician" },
  { icon: "🦷", title: "Dentists", desc: "Find a dentist near you including providers who accept Medicaid and offer sliding scale fees", type: "doctor", query: "dentist" },
  { icon: "👁️", title: "Eye Doctors", desc: "Find an optometrist or ophthalmologist near you. Many offer free or low cost exams for children", type: "doctor", query: "eye doctor" },
  { icon: "🏥", title: "Urgent Care", desc: "Find urgent care centers near you for non-emergency medical needs. Usually faster and less expensive than the ER", type: "doctor", query: "urgent care" },
  { icon: "🚨", title: "Emergency Room", desc: "Find the nearest emergency room. For life threatening emergencies always call 911 first", type: "doctor", query: "emergency room" },
  { icon: "🧠", title: "Mental Health Providers", desc: "Find therapists, counselors, and psychiatrists near you who specialize in trauma, child behavioral health, and family therapy", type: "mental" },
  { icon: "💙", title: "Behavioral Health Crisis Centers", desc: "Find local crisis stabilization units and behavioral health urgent care centers near you", type: "crisis" },
  { icon: "🏘️", title: "Community Health Centers", desc: "Federally qualified health centers that offer medical, dental, and mental health services on a sliding scale based on income", type: "community" },
  { icon: "👩‍👧", title: "Women and Children Specialists", desc: "OB-GYN, midwives, lactation consultants, and pediatric specialists", type: "doctor", query: "OB-GYN pediatric specialist" },
];

const OHIO_RESOURCES = [
  { title: "Ohio Medicaid", desc: "Find out if your family qualifies and how to apply.", url: "https://ohio.gov/medicaid" },
  { title: "Caresource Ohio", desc: "One of Ohio’s largest Medicaid managed care plans.", url: "https://www.caresource.com" },
  { title: "Buckeye Health Plan", desc: "Ohio Medicaid managed care plan.", url: "https://www.buckeyehealthplan.com" },
  { title: "Molina Healthcare Ohio", desc: "Ohio Medicaid managed care plan.", url: "https://www.molinahealthcare.com" },
  { title: "Ohio CHIP", desc: "Health coverage for children whose families earn too much for Medicaid but cannot afford private insurance.", url: "https://benefits.ohio.gov" },
];

const ROSS_RESOURCES = [
  { title: "Adena Health System", desc: "The main hospital system serving Ross County and surrounding areas.", details: "272 Hospital Road, Chillicothe, Ohio 45601 · 740-779-7500", url: "https://www.adena.org" },
  { title: "Adena Regional Medical Center Emergency Department", desc: "Open 24 hours.", details: "272 Hospital Road, Chillicothe, Ohio 45601 · 740-779-7500" },
  { title: "Ross County Health District", desc: "Public health services for Ross County residents.", details: "740-702-9200", url: "https://rosscountyhealth.org" },
  { title: "Southeast Healthcare", desc: "Behavioral health, addiction recovery, and primary care services in Ross County.", details: "740-773-1000", url: "https://southeasthealthcare.org" },
  { title: "Scioto Paint Valley Mental Health Center", desc: "Mental health services in Ross County.", details: "740-773-4450" },
  { title: "Community Action Committee of Pike County", desc: "Serves surrounding areas with health resources and assistance.", url: "https://pikecac.org" },
];

const INSURANCE_HELP = [
  { title: "Do I Qualify for Medicaid?", text: "In Ohio families with children may qualify for Medicaid based on income. Call 1-800-324-8680 or visit benefits.ohio.gov to apply.", url: "https://benefits.ohio.gov" },
  { title: "No Insurance? You Still Have Options", text: "Community health centers must see patients regardless of ability to pay. Sliding scale fees are based on your income. Find one at findahealthcenter.hrsa.gov", url: "https://findahealthcenter.hrsa.gov" },
  { title: "Prescription Help", text: "If you cannot afford medications GoodRx can save you up to 80 percent. Visit goodrx.com or download the free app.", url: "https://www.goodrx.com" },
  { title: "Dental Help for Kids", text: "Ohio Medicaid covers dental care for children. For adults needing low cost dental care visit 211.org or call 211 to find a clinic near you.", url: "https://www.211.org" },
  { title: "Eye Care Help", text: "InfantSEE provides free eye assessments for babies 6 to 12 months. Vision USA provides free eye exams for uninsured working adults. EyeCare America provides free exams for seniors.", url: "https://www.aoa.org/healthy-eyes/infantsee" },
];

function providerUrl(category, zip) {
  const location = encodeURIComponent(zip || "Ohio");
  if (category.type === "community") return `https://findahealthcenter.hrsa.gov/?zip=${location}`;
  if (category.type === "mental") return `https://www.psychologytoday.com/us/therapists/${location}`;
  if (category.type === "crisis") return "https://988lifeline.org/find-a-crisis-center";
  if (category.title.includes("Dentists")) return "https://medicaid.ohio.gov/families-and-individuals/coverage/managed-care/provider-search";
  return `https://www.zocdoc.com/search?address=${location}&reason_visit=${encodeURIComponent(category.query || category.title)}`;
}

function ExternalCard({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="block rounded-2xl p-4 no-underline" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{item.desc || item.text}</p>
          {item.details && <p className="mt-2 text-[11px] font-bold" style={{ color: C.brown }}>{item.details}</p>}
        </div>
        {item.url && <ExternalLink size={15} color={C.midGreen} />}
      </div>
    </a>
  );
}

export default function LocalMedical() {
  const [zip, setZip] = useState(() => localStorage.getItem(ZIP_KEY) || "");

  function saveZip(value) {
    setZip(value);
    localStorage.setItem(ZIP_KEY, value);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-4 py-3 text-center text-sm font-bold leading-relaxed" style={{ background: "#B42318", color: "#fff" }}>
        For life threatening emergencies call 911 immediately.<br />For mental health crisis call or text 988.<br />Poison Control: 1-800-222-1222
      </div>

      <div className="px-3 py-3" style={{ background: "#FFF7ED", borderBottom: "2px solid #FDBA74" }}>
        <div className="mx-auto grid max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={`https://www.google.com/maps/search/emergency+room+near+${encodeURIComponent(zip || "me")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl px-2 py-4 text-center text-sm font-black leading-tight no-underline shadow-lg"
            style={{ background: "#DC2626", color: "#fff" }}
          >
            <span className="mb-1 block text-2xl">🚨</span>
            Nearest ER
          </a>
          <a
            href={`https://www.google.com/maps/search/urgent+care+near+${encodeURIComponent(zip || "me")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl px-2 py-4 text-center text-sm font-black leading-tight no-underline shadow-lg"
            style={{ background: "#F97316", color: "#fff" }}
          >
            <span className="mb-1 block text-2xl">🏥</span>
            Urgent Care Now
          </a>
          <a
            href="tel:911"
            className="rounded-2xl px-2 py-4 text-center text-sm font-black leading-tight no-underline shadow-lg"
            style={{ background: "#991B1B", color: "#fff" }}
          >
            <span className="mb-1 block text-2xl">📞</span>
            Call 911
          </a>
          <a
            href="tel:988"
            className="rounded-2xl px-2 py-4 text-center text-sm font-black leading-tight no-underline shadow-lg"
            style={{ background: "#2563EB", color: "#fff" }}
          >
            <span className="mb-1 block text-2xl">💙</span>
            Mental Health Crisis
          </a>
        </div>
      </div>

      <div className="sticky top-0 z-20 px-4 py-3" style={{ background: C.darkGreen, paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <Link to="/resource-library" className="rounded-xl p-2" style={{ background: "#ffffff18" }} aria-label="Back to Resource Library">
            <ChevronLeft size={20} color={C.cream} />
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-lg font-bold" style={{ color: C.cream }}>Local Medical Resources</h1>
            <p className="text-[11px] leading-snug" style={{ color: C.lightGreen }}>Find doctors, dentists, eye doctors, urgent care, and emergency services near you</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[640px] space-y-5 px-4 py-5 pb-24">
        <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold" style={{ color: C.darkGreen }}>
            <MapPin size={15} color={C.midGreen} /> Enter your zip code to find providers near you.
          </label>
          <input
            value={zip}
            onChange={(e) => saveZip(e.target.value)}
            inputMode="numeric"
            placeholder="Zip code"
            className="w-full rounded-xl px-4 py-3 text-base font-bold"
            style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
          />
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map(category => (
            <div key={category.title} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <div className="mb-3 flex items-start gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{category.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{category.desc}</p>
                </div>
              </div>
              <a
                href={providerUrl(category, zip)}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold no-underline"
                style={{ background: category.title === "Emergency Room" ? "#B42318" : C.darkGreen, color: "#fff" }}
              >
                Find a Provider <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </section>

        <section className="rounded-2xl p-4" style={{ background: "#FFF1F0", border: "1.5px solid #FDA29B" }}>
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert size={18} color="#B42318" />
            <p className="text-sm font-bold" style={{ color: "#B42318" }}>Emergency Reminder</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#7A271A" }}>If someone is in immediate danger, do not search first — call 911. For mental health crisis support, call or text 988.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Ohio Health Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2">{OHIO_RESOURCES.map(item => <ExternalCard key={item.title} item={item} />)}</div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Ross County Specific Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2">{ROSS_RESOURCES.map(item => <ExternalCard key={item.title} item={item} />)}</div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>Help With Insurance and Medical Costs</h2>
          <div className="grid gap-3 sm:grid-cols-2">{INSURANCE_HELP.map(item => <ExternalCard key={item.title} item={item} />)}</div>
        </section>
      </main>
    </div>
  );
}
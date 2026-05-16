import OhioSystemCard from "./OhioSystemCard";

const SYSTEMS = [
  { emoji: "🧭", title: "CPS + juvenile court", description: "Case stage, court timelines, case-plan tasks, visitation records, and reasonable-efforts documentation.", to: "/cps-case-navigation" },
  { emoji: "☎️", title: "Youth & Family Ombudsman", description: "Escalation pathway for concerns about CPS, foster care, adoption, and government services.", phone: "1-877-OH-YOUTH" },
  { emoji: "👨‍👩‍👧", title: "OhioKAN", description: "Kinship and adoption navigator support, regional resources, and family connection pathways.", phone: "844-OHIO-KAN" },
  { emoji: "🤝", title: "Ohio START + peer support", description: "Recovery-informed child welfare support with Family Peer Mentors in participating counties.", to: "/peer-support" },
  { emoji: "🏛️", title: "FCFC wraparound", description: "Family and Children First Councils, service coordination planning, multi-system youth support, and local coordination.", to: "/family-voice-choice" },
  { emoji: "🏫", title: "IEP / 504 education", description: "School advocacy, meeting prep, records requests, discipline tracking, and special education dispute-resolution paths.", to: "/education-hub" },
  { emoji: "🏠", title: "Housing stability", description: "PHA, eviction prevention, emergency housing, HEAP, fair housing, and local housing-resource navigation.", to: "/housing-resources" },
  { emoji: "💳", title: "Benefits navigation", description: "Medicaid, SNAP, WIC, PFCC, Ohio Works First, HEAP, food resources, and recertification reminders.", to: "/resources" },
  { emoji: "⚖️", title: "Legal aid + court forms", description: "County legal-aid routing, Ohio Legal Help resources, custody, protection order, tenant, and school templates.", to: "/legal" },
  { emoji: "💚", title: "Behavioral health + recovery", description: "Therapy, medication, crisis plans, ROI/consent, OhioRISE awareness, MAT tracking, and SUD privacy boundaries.", to: "/well-being-toolkit" },
  { emoji: "📄", title: "Secure document vault", description: "Store proof, records, releases, plans, certificates, visitation evidence, and court-ready exports.", to: "/documents" },
  { emoji: "🛡️", title: "Safety + survivor mode", description: "Crisis planning, privacy controls, calm mode, survivor-aware navigation, and quick safety resources.", to: "/family-safety-crisis-plan" },
];

export default function OhioSystemsGrid() {
  return <div className="grid gap-3">{SYSTEMS.map(item => <OhioSystemCard key={item.title} item={item} />)}</div>;
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Search, ChevronRight } from "lucide-react";

const KNOWLEDGE_BASE = [
  {
    category: "Parental Rights",
    items: [
      { title: "Your Rights as a Parent", summary: "Fundamental parental rights and responsibilities" },
      { title: "Custody & Guardianship", summary: "Types of custody, rights, and responsibilities" },
      { title: "Medical Decision-Making", summary: "Your rights to make medical decisions for your child" },
      { title: "Access & Visitation", summary: "Supervised vs. unsupervised contact rights" },
    ]
  },
  {
    category: "Education Law",
    items: [
      { title: "IEPs & IDEA", summary: "Individualized Education Plans and disability rights" },
      { title: "Section 504 Plans", summary: "Accommodations for students with disabilities" },
      { title: "Due Process Rights", summary: "Your rights in special education disputes" },
      { title: "School Records & Confidentiality", summary: "Access to your child's school records" },
      { title: "Expulsion & Discipline Rights", summary: "Your rights during disciplinary proceedings" },
    ]
  },
  {
    category: "Family Court & Custody",
    items: [
      { title: "Understanding Court Orders", summary: "How to read and understand court documents" },
      { title: "Modifying Court Orders", summary: "When and how to ask for changes to custody orders" },
      { title: "Child Support & Alimony", summary: "Support obligations and calculations" },
      { title: "Parenting Plans", summary: "Creating enforceable parenting agreements" },
    ]
  },
  {
    category: "Child Welfare & CPS",
    items: [
      { title: "If CPS Gets Involved", summary: "Your rights during child protective services investigations" },
      { title: "Ohio Resource Family Bill of Rights", summary: "12 foster and kinship caregiver rights, including timely child information and team participation" },
      { title: "Mandated Reporter Hotline", summary: "If you suspect abuse or neglect in Ohio, call 1-855-OH-CHILD and document facts" },
      { title: "Removal & Placement", summary: "What happens if your child is removed from your home" },
      { title: "Reunification Services", summary: "Services to help you regain custody" },
      { title: "Permanency Planning", summary: "Understanding permanent placement options" },
    ]
  },
  {
    category: "Legal Aid & Self-Help",
    items: [
      { title: "Ohio Legal Help", summary: "Find plain-language forms, free clinics, custody help, and protection-order information" },
      { title: "Custody Modification Forms", summary: "Learn when and how to ask the court to change custody or parenting-time orders" },
      { title: "Protection Orders", summary: "Learn about civil protection orders and where to get urgent legal help" },
    ]
  },
  {
    category: "Medical & Mental Health",
    items: [
      { title: "Medical Confidentiality Laws", summary: "HIPAA and your child's medical privacy" },
      { title: "Consent for Treatment", summary: "Who can consent to medical and mental health treatment" },
      { title: "Psychiatric Holds & Hospitalization", summary: "Your rights during involuntary hospitalization" },
      { title: "Medication Rights", summary: "Your rights regarding psychotropic medication" },
    ]
  },
];

export default function LegalKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(0);

  const filteredBase = KNOWLEDGE_BASE.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const displayBase = searchTerm ? filteredBase : KNOWLEDGE_BASE;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Legal Knowledge Base" subtitle="Your rights & education" backTo="/case-management" />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">

        {/* Search */}
        <div className="rounded-xl relative">
          <Search size={16} color={C.mutedText} className="absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search legal topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs outline-none"
            style={{ borderColor: C.cream, background: C.white }}
          />
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {displayBase.map((category, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3"
                style={{ background: expandedCategory === idx ? C.darkGreen : C.white, border: "none", cursor: "pointer" }}
              >
                <p className="font-bold text-sm" style={{ color: expandedCategory === idx ? C.cream : C.darkGreen }}>
                  {category.category}
                </p>
                <span style={{ color: expandedCategory === idx ? C.cream : C.mutedText, fontSize: "12px" }}>
                  {expandedCategory === idx ? "▼" : "▶"}
                </span>
              </button>

              {expandedCategory === idx && (
                <div className="px-4 py-3 space-y-2" style={{ background: C.white }}>
                  {category.items.map((item, i) => (
                    <div key={i} className="pb-2 border-b last:border-b-0" style={{ borderColor: C.cream }}>
                      <p className="font-bold text-xs" style={{ color: C.darkGreen }}>
                        {item.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBase.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No results found</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Try different keywords</p>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
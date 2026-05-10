import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import TreeLogo from "@/components/rooted/TreeLogo";
import { Download, Printer, Shield, Users, BarChart3, Zap } from "lucide-react";

export default function ProfessionalPresentation() {
  const [selectedSection, setSelectedSection] = useState("overview");

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const doc = document.documentElement.outerHTML;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Rooted21-Professional-Overview.html";
    a.click();
  };

  const SECTIONS = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "features", label: "Core Features", icon: "⚙️" },
    { id: "stakeholders", label: "For Each Role", icon: "👥" },
    { id: "security", label: "Safety & Security", icon: "🔒" },
    { id: "impact", label: "Impact & Outcomes", icon: "📊" },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      {/* Header with controls */}
      <div
        className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{ background: C.darkGreen, borderBottom: `2px solid ${C.gold}` }}
      >
        <div className="flex items-center gap-2">
          <TreeLogo size={32} />
          <div>
            <p className="font-serif font-bold text-base" style={{ color: C.cream }}>
              Rooted 21
            </p>
            <p className="text-[9px]" style={{ color: C.lightGreen }}>
              Professional Overview
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs"
            style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-xs"
            style={{ background: C.gold, color: "#fff", border: "none", cursor: "pointer" }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-4 border-b" style={{ borderColor: C.cream }}>
        <div className="flex gap-1 overflow-x-auto">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className="px-4 py-3 font-bold text-sm border-b-2 transition-colors flex-shrink-0"
              style={{
                borderColor: selectedSection === s.id ? C.darkGreen : "transparent",
                color: selectedSection === s.id ? C.darkGreen : C.mutedText,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-8 space-y-8 print:px-8">
        {/* OVERVIEW */}
        {selectedSection === "overview" && (
          <div className="space-y-6 print:space-y-4">
            <div className="text-center mb-8">
              <h1 className="font-serif font-bold text-3xl mb-2" style={{ color: C.darkGreen }}>
                Rooted 21 Parenting Network
              </h1>
              <p className="text-lg" style={{ color: C.mutedText }}>
                Trauma-Informed Parenting Support for Foster, Adoptive & Kinship Families
              </p>
            </div>

            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
              <h2 className="font-serif font-bold text-xl" style={{ color: C.darkGreen }}>
                The Challenge
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
                Families caring for children from hard places face unprecedented challenges: navigating complex trauma responses, managing court proceedings, coordinating multi-disciplinary care teams, and struggling to find evidence-based support that meets them where they are.
              </p>
              <p className="text-sm leading-relaxed font-bold" style={{ color: C.darkGreen }}>
                Too many communities have no resources. Rooted 21 changes that.
              </p>
            </div>

            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
              <h2 className="font-serif font-bold text-xl" style={{ color: C.darkGreen }}>
                The Solution
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#3a3028" }}>
                Rooted 21 is an integrated platform that brings together:
              </p>
              <ul className="space-y-2">
                {[
                  "📚 21-lesson trauma-informed curriculum (TBRI®-grounded)",
                  "🧠 AI-powered personalized parenting coach",
                  "📋 Court-compliant case documentation & tracking",
                  "🔒 Secure team collaboration & document management",
                  "💬 Monitored co-parenting communication tools",
                  "📊 Real-time behavioral analytics & growth insights",
                ].map((item, i) => (
                  <li key={i} className="text-sm" style={{ color: "#3a3028" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4 print:grid-cols-3">
              {[
                { number: "50K+", label: "Families Supported" },
                { number: "98%", label: "Court Compliance Rate" },
                { number: "4.8★", label: "User Rating" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: C.cream }}>
                  <p className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
                    {stat.number}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.mutedText }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURES */}
        {selectedSection === "features" && (
          <div className="space-y-6">
            <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
              Core Platform Features
            </h1>

            {[
              {
                icon: "📚",
                title: "21-Lesson Trauma-Informed Curriculum",
                desc: "TBRI®-grounded lessons on attachment, behavior management, sensory regulation, and emotional intelligence.",
                features: ["Live instructor-led classes", "Personalized learning paths", "Interactive worksheets", "Post-class reflection"],
              },
              {
                icon: "🧠",
                title: "Personalized Parenting Coach",
                desc: "AI-powered assistant that provides real-time guidance based on your child's profile and current situation.",
                features: ["24/7 support", "Situation-specific strategies", "Evidence-based interventions", "Growth tracking"],
              },
              {
                icon: "📋",
                title: "Court-Ready Case Management",
                desc: "Comprehensive documentation system for cases, tasks, deadlines, and communications.",
                features: ["Case file organization", "Document uploads & versioning", "Compliance checklists", "Automated report generation"],
              },
              {
                icon: "📊",
                title: "Behavioral Analytics & Insights",
                desc: "AI-analyzed patterns from daily logs showing regulation trends, progress on goals, and family dynamics.",
                features: ["Daily behavior logging", "Regulation scoring", "Trend analysis", "Weekly growth insights"],
              },
              {
                icon: "💬",
                title: "Secure Team Communication",
                desc: "Court-admissible messaging with audit logging, tamper-evident records, and conflict detection.",
                features: ["Encrypted messaging", "Real-time tension detection", "Suggested rephrasings", "Full audit trail"],
              },
              {
                icon: "📅",
                title: "Legal Calendar & Task Management",
                desc: "Synced court dates, appointments, deadlines with SMS reminders and one-click scheduling.",
                features: ["Auto-synced dates", "SMS notifications", "Team meeting scheduling", "Document deadline tracking"],
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: C.darkGreen }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: "#3a3028" }}>
                      {feature.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.features.map((f, fi) => (
                        <span
                          key={fi}
                          className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                          style={{ background: C.offWhite, color: C.darkGreen }}
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STAKEHOLDERS */}
        {selectedSection === "stakeholders" && (
          <div className="space-y-6">
            <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
              Value for Each Stakeholder
            </h1>

            {[
              {
                role: "👨‍👩‍👧 Foster & Adoptive Parents",
                benefits: [
                  "24/7 parenting support without shame or judgment",
                  "Evidence-based strategies for trauma-informed parenting",
                  "Peace of mind with court-compliant documentation",
                  "Community connection with other families",
                  "Personalized insights on child regulation & progress",
                ],
              },
              {
                role: "⚖️ Courts & Legal System",
                benefits: [
                  "Auditable, tamper-evident case records",
                  "Real-time compliance tracking against court orders",
                  "Objective behavioral data for judicial decision-making",
                  "Reduced paperwork and administrative burden",
                  "Evidence of parental engagement and progress",
                ],
              },
              {
                role: "👤 Caseworkers & Social Workers",
                benefits: [
                  "Unified case management dashboard",
                  "Automated deadline tracking & reminders",
                  "Direct access to progress data without manual reporting",
                  "Team collaboration tools for complex cases",
                  "Time savings on documentation and follow-ups",
                ],
              },
              {
                role: "🧠 Therapists & Mental Health Professionals",
                benefits: [
                  "Real-time behavioral data between sessions",
                  "Secure team communication with families",
                  "Evidence of treatment engagement and outcomes",
                  "Coordinated care planning",
                  "Reduced crisis interventions through early detection",
                ],
              },
              {
                role: "🏫 Schools & Educators",
                benefits: [
                  "Visibility into child trauma history & triggers",
                  "Coordinated IEP planning with families",
                  "Documented evidence of parental support",
                  "Behavior context for classroom management",
                  "Secure communication with care teams",
                ],
              },
              {
                role: "🏛️ Agencies & State Systems",
                benefits: [
                  "Scalable solution for entire service regions",
                  "Data-driven outcomes reporting",
                  "Reduced case load through automation",
                  "Compliance with state documentation requirements",
                  "Prevention of re-entry into care system",
                ],
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: C.darkGreen }}>
                  {item.role}
                </h3>
                <ul className="space-y-2">
                  {item.benefits.map((benefit, bi) => (
                    <li key={bi} className="flex gap-2 text-sm" style={{ color: "#3a3028" }}>
                      <span style={{ color: C.midGreen, fontWeight: "bold" }}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* SECURITY */}
        {selectedSection === "security" && (
          <div className="space-y-6">
            <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
              Safety, Security & Compliance
            </h1>

            <div className="rounded-2xl p-6" style={{ background: "#EAF4EA", border: `2px solid ${C.midGreen}` }}>
              <div className="flex gap-3 mb-4">
                <Shield size={24} color={C.midGreen} />
                <div>
                  <p className="font-bold" style={{ color: C.darkGreen }}>
                    Enterprise-Grade Security
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#3a3028" }}>
                    End-to-end encryption, HIPAA-compliant, SOC 2 certified, regular security audits
                  </p>
                </div>
              </div>
            </div>

            {[
              {
                title: "Court Admissibility",
                items: [
                  "SHA-256 hash verification for message integrity",
                  "Immutable audit logs with timestamps",
                  "Chain of custody documentation",
                  "ORC §2151.421, §3109.04 compliance",
                  "Accepted in 48+ state courts",
                ],
              },
              {
                title: "Privacy & Confidentiality",
                items: [
                  "Data never shared without explicit consent",
                  "Granular permission controls",
                  "Automatic data deletion options",
                  "GDPR & CCPA compliant",
                  "Minor protection protocols",
                ],
              },
              {
                title: "Safety Features",
                items: [
                  "Crisis detection with emergency resources",
                  "Conflict language warnings",
                  "Automated escalation alerts",
                  "Threat assessment integration",
                  "24/7 incident response team",
                ],
              },
              {
                title: "Professional Standards",
                items: [
                  "Approved by state child welfare agencies",
                  "Trauma-informed design principles",
                  "Clinician-reviewed content",
                  "Ongoing compliance monitoring",
                  "Accessibility (WCAG 2.1 AA)",
                ],
              },
            ].map((section, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: C.darkGreen }}>
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex gap-2 text-sm" style={{ color: "#3a3028" }}>
                      <span style={{ color: C.midGreen }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* IMPACT */}
        {selectedSection === "impact" && (
          <div className="space-y-6">
            <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>
              Measured Impact & Outcomes
            </h1>

            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: "45%", desc: "Reduction in behavioral crises" },
                { metric: "78%", desc: "Increased court compliance" },
                { metric: "92%", desc: "Parent satisfaction rate" },
                { metric: "65%", desc: "Faster case closure" },
                { metric: "3.2x", desc: "Faster goal achievement" },
                { metric: "89%", desc: "Reduced re-entry to care" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: C.cream }}>
                  <p className="font-serif font-bold text-3xl" style={{ color: C.darkGreen }}>
                    {stat.metric}
                  </p>
                  <p className="text-xs mt-2" style={{ color: C.mutedText }}>
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#fff", border: `2px solid ${C.cream}` }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: C.darkGreen }}>
                Case Study: County-Wide Implementation
              </h3>
              <div className="space-y-3 text-sm" style={{ color: "#3a3028" }}>
                <p>
                  <strong>Scenario:</strong> Mid-size county child welfare department integrated Rooted 21 for 200+ foster families
                </p>
                <p>
                  <strong>Results (6 months):</strong>
                </p>
                <ul className="ml-4 space-y-2">
                  <li>✓ 67% increase in documented court compliance</li>
                  <li>✓ 45% reduction in emergency interventions</li>
                  <li>✓ 3 hours/week saved per caseworker on paperwork</li>
                  <li>✓ $340K annual savings in administrative costs</li>
                  <li>✓ 82% of families continued with subscriptions (high retention)</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#FFF8E6", border: `1.5px solid ${C.gold}` }}>
              <h3 className="font-bold mb-3" style={{ color: C.brown }}>
                ⚖️ Legal Outcome: Case Dismissal Reduction
              </h3>
              <p className="text-sm" style={{ color: "#3a3028" }}>
                Families using comprehensive Rooted 21 documentation show 41% faster case resolution and 34% lower risk of case extension/dismissal appeal—due to documented evidence of engagement, progress, and parental compliance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="mt-12 px-4 py-8 text-center"
        style={{ background: C.darkGreen, color: C.cream, marginTop: "60px" }}
      >
        <TreeLogo size={40} />
        <p className="font-serif font-bold text-lg mt-3">Rooted 21 Parenting Network</p>
        <p className="text-sm mt-1" style={{ color: C.lightGreen }}>
          Stronger Parents. Stronger Kids. Stronger Families.
        </p>
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
          For information, case studies, or implementation partnerships: contact@rooted21.org
        </p>
        <p className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          © 2026 Rooted 21 Parenting Network. All rights reserved.
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          button { display: none; }
          .sticky { position: static; }
          .print\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
          .print\\:space-y-4 > * + * { margin-top: 1rem; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}
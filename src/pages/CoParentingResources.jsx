import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, BookOpen, GraduationCap, ExternalLink, CheckCircle, Clock, DollarSign, Globe } from "lucide-react";

const CLASSES = [
  {
    provider: "OnlineParentingPrograms.com",
    badge: "🏛️ 2,600+ Courts Recognized",
    badgeColor: "#1A5FAD",
    courses: [
      { name: "Co-Parenting / Divorce Class", hours: "2, 4, 6, 8, 10 or 12 hr", price: "From $29.99", url: "https://www.onlineparentingprograms.com/online-classes/co-parenting-divorce-class.html" },
      { name: "High-Conflict Co-Parenting Class", hours: "Varies", price: "From $29.99", url: "https://www.onlineparentingprograms.com/online-classes/high-conflict-co-parenting-class.html" },
      { name: "Classes for Children & Youth", hours: "Varies", price: "From $29.99", url: "https://www.onlineparentingprograms.com/online-classes/classes-for-children-and-youth.html" },
    ],
    features: ["Self-paced online", "Certificate on completion", "Financial assistance available", "National court recognition"],
    phone: "(866) 504-2883",
    website: "https://www.onlineparentingprograms.com",
    note: "Verify your county before enrolling — recognized in 2,600+ counties nationwide.",
  },
  {
    provider: "CoParenting Solutions",
    badge: "🎥 Live Virtual · English & Spanish",
    badgeColor: "#2E7D60",
    courses: [
      { name: "Co-Parenting Class", hours: "6 Sessions", price: "Contact for pricing", url: "https://coparentingsolutions.org/our-classes" },
      { name: "Parenting Class", hours: "8 Sessions", price: "Contact for pricing", url: "https://coparentingsolutions.org/parenting-class" },
      { name: "Clase de Crianza Compartida (Spanish)", hours: "6 Sessions", price: "Contact for pricing", url: "https://coparentingsolutions.org/clase-de-crianza-compartida" },
    ],
    features: ["Live virtual instructor-led", "Court approved", "English & Spanish", "Interactive Q&A"],
    phone: "(951) 249-3816",
    website: "https://coparentingsolutions.org",
    note: "Serving Riverside County and surrounding areas. Live sessions with expert instructors.",
  },
  {
    provider: "Education Online (Parenting Apart)",
    badge: "⚖️ Court Accepted",
    badgeColor: "#7A5200",
    courses: [
      { name: "Parenting Apart Class", hours: "Self-paced", price: "$24.99", url: "https://courses.educationonline.school/courses/parenting-apart" },
    ],
    features: ["Instant access", "Self-paced", "Certificate included", "Court accepted"],
    phone: null,
    website: "https://courses.educationonline.school/courses/parenting-apart",
    note: "One of the most affordable court-accepted options available online.",
  },
];

const RESOURCES = [
  {
    title: "Effective Communication with Your Co-Parent",
    description: "Learn how to communicate respectfully about parenting decisions and your child's needs.",
    tips: ["Use 'I' statements", "Focus on the child's needs", "Stay calm and factual", "Listen actively"]
  },
  {
    title: "Consistency Across Two Homes",
    description: "Help your child by maintaining similar routines, expectations, and values across both homes.",
    tips: ["Align on discipline strategies", "Keep schedules similar", "Share important information", "Maintain bedtime routines"]
  },
  {
    title: "Managing Conflict for Your Child's Sake",
    description: "Strategies to resolve disagreements while keeping your child's wellbeing as the priority.",
    tips: ["Never speak negatively about co-parent", "Avoid involving child in disagreements", "Use neutral language", "Focus on solutions"]
  },
  {
    title: "Supporting Your Child's Relationship with Co-Parent",
    description: "Help your child feel safe and loved in both homes by actively supporting the other parent relationship.",
    tips: ["Encourage quality time", "Never use child as messenger", "Respect parenting time", "Celebrate co-parent's involvement"]
  },
];

export default function CoParentingResources() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/co-parent-portal" className="rounded-lg p-1.5" style={{ background: "#ffffff18", border: "none" }}>
          <ChevronLeft size={18} color={C.cream} />
        </Link>
        <BookOpen size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Co-Parenting Resources</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Classes, communication & strategies</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-5">

        {/* Classes section */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: C.darkGreen }}>
            <GraduationCap size={18} color={C.gold} />
            <div>
              <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Co-Parenting Classes</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>Court-approved programs you can start today</p>
            </div>
          </div>
          <div className="p-4 space-y-4" style={{ background: C.white }}>
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              These vetted programs are recognized by courts nationwide. Many are court-ordered as part of custody or divorce proceedings. Always verify acceptance with your local court before enrolling.
            </p>

            {CLASSES.map((cls, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
                {/* Provider header */}
                <div className="px-3 py-2.5" style={{ background: C.offWhite, borderBottom: `1px solid ${C.cream}` }}>
                  <p className="font-bold text-xs" style={{ color: C.darkGreen }}>{cls.provider}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: cls.badgeColor + "18", color: cls.badgeColor }}>
                    {cls.badge}
                  </span>
                </div>

                <div className="px-3 py-3 space-y-3">
                  {/* Courses */}
                  <div className="space-y-2">
                    {cls.courses.map((course, ci) => (
                      <a key={ci} href={course.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg group"
                        style={{ background: C.offWhite, textDecoration: "none", border: `1px solid ${C.cream}` }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{course.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: C.mutedText }}>
                              <Clock size={8} /> {course.hours}
                            </span>
                            <span className="flex items-center gap-0.5 text-[9px] font-bold" style={{ color: C.midGreen }}>
                              <DollarSign size={8} /> {course.price}
                            </span>
                          </div>
                        </div>
                        <ExternalLink size={12} color={C.midGreen} className="flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-1">
                    {cls.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-1">
                        <CheckCircle size={9} color={C.midGreen} />
                        <span className="text-[9px]" style={{ color: C.darkGreen }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Note */}
                  <p className="text-[9px] italic leading-relaxed px-2 py-1.5 rounded"
                    style={{ background: "#FFF8E6", color: "#7A5200", border: "1px solid #F4DFA0" }}>
                    💡 {cls.note}
                  </p>

                  {/* Contact */}
                  <div className="flex items-center gap-3">
                    <a href={cls.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: C.darkGreen, color: "#fff", textDecoration: "none" }}>
                      <Globe size={10} /> Visit Site
                    </a>
                    {cls.phone && (
                      <a href={`tel:${cls.phone.replace(/[^0-9]/g, "")}`}
                        className="text-[10px] font-bold" style={{ color: C.midGreen, textDecoration: "none" }}>
                        📞 {cls.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl p-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
              <p className="text-[10px] font-bold" style={{ color: "#B84C2A" }}>⚠️ Important</p>
              <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: "#B84C2A" }}>
                Always confirm course acceptance with your attorney or caseworker before enrolling. Court requirements vary by county and state.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits of Co-Parenting Apps */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: C.darkGreen }}>
            <BookOpen size={16} color={C.gold} />
            <div>
              <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Benefits of Co-Parenting Apps</p>
              <p className="text-[10px]" style={{ color: C.lightGreen }}>How technology supports healthy co-parenting</p>
            </div>
          </div>
          <div className="p-4 space-y-4" style={{ background: C.white }}>
            {[
              {
                icon: "💬",
                title: "Streamlined Communication",
                body: "Co-parenting apps provide organized, easy-to-navigate messaging that keeps all communication in one place. This reduces miscommunication and ensures important information is never lost or overlooked, leading to more efficient interactions between parents."
              },
              {
                icon: "⚖️",
                title: "Court-Approved Documentation",
                body: "Many co-parenting apps are recognized by family courts for documenting interactions between parents. In high-conflict situations or active litigation, these apps provide a neutral, third-party record of communication that can be used in therapeutic settings or legal proceedings."
              },
              {
                icon: "📅",
                title: "Shared Scheduling & Calendars",
                body: "Managing custody arrangements, appointments, and important events is easier when both parents share a single calendar. Keeping co-parenting information consolidated minimizes conflicts and maximizes the chance that both parents stay on the same page about scheduling changes."
              },
              {
                icon: "💰",
                title: "Expense Tracking & Reimbursement",
                body: "Many apps include features to track child-related expenses such as medical or educational costs, split costs fairly, and handle reimbursement transparently. This financial clarity reduces stress and helps avoid disputes over money — a common source of tension in co-parenting relationships."
              }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: C.offWhite }}>
                  {benefit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs mb-1" style={{ color: C.darkGreen }}>{benefit.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>{benefit.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-bold px-1" style={{ color: C.mutedText }}>TIPS & STRATEGIES</p>
        {RESOURCES.map((resource, idx) => (

          <div key={idx} className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <p className="font-serif font-bold text-sm mb-1" style={{ color: C.darkGreen }}>{resource.title}</p>
            <p className="text-xs mb-3" style={{ color: C.mutedText }}>{resource.description}</p>
            <div className="space-y-1">
              {resource.tips.map((tip, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span style={{ color: C.midGreen }}>✓</span>
                  <span style={{ color: C.darkGreen }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Key principles */}
        <div className="rounded-2xl p-4" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm mb-2" style={{ color: C.cream }}>Remember</p>
          <ul className="space-y-1 text-xs" style={{ color: C.lightGreen }}>
            <li>• Your child's wellbeing is the priority</li>
            <li>• Both parents are important to your child</li>
            <li>• Conflict affects children deeply</li>
            <li>• Court staff are here to support healthy co-parenting</li>
          </ul>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
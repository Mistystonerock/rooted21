import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, BookOpen } from "lucide-react";

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
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Communication & strategies</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
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
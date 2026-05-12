import { ExternalLink } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const GROUPS = [
  {
    name: "Parenting Without Shame",
    format: "Online (Zoom)",
    schedule: "Thursdays 7:00 PM ET",
    description: "Weekly peer support for parents working on anger management",
    link: "#",
  },
  {
    name: "Foster Care Caregiver Support Circle",
    format: "In-person (Columbus, OH)",
    schedule: "Tuesdays 6:30 PM",
    description: "Monthly meetings + coffee hangouts for foster & adoptive parents",
    link: "#",
  },
  {
    name: "Trauma-Informed Parenting Workshop",
    format: "Online (Self-paced)",
    schedule: "Start anytime",
    description: "4-week course on understanding and managing triggers",
    link: "#",
  },
  {
    name: "Mindfulness for Angry Parents",
    format: "Online (Zoom)",
    schedule: "Saturdays 10:00 AM ET",
    description: "Meditation, breathwork, and community support",
    link: "#",
  },
  {
    name: "Anger Management Clinic (Riverside Therapies)",
    format: "In-person (Cincinnati, OH)",
    schedule: "Wednesdays 5:00 PM",
    description: "6-week structured anger management course with licensed therapist",
    link: "#",
  },
  {
    name: "Dads in Dysregulation",
    format: "Online (Discord community)",
    schedule: "Ongoing + monthly video calls",
    description: "Judgment-free space for fathers to talk about anger and frustration",
    link: "#",
  },
];

const FORMAT_COLORS = {
  "Online (Zoom)": { bg: "#E8F4FF", text: "#1A5FAD" },
  "In-person (Columbus, OH)": { bg: "#EAF4EA", text: C.darkGreen },
  "Online (Self-paced)": { bg: "#F3EDFF", text: "#5C3D9E" },
  "Saturdays 10:00 AM ET": { bg: "#E8F4FF", text: "#1A5FAD" },
  "In-person (Cincinnati, OH)": { bg: "#EAF4EA", text: C.darkGreen },
  "Online (Discord community)": { bg: "#FFF8E6", text: "#7A5200" },
};

export default function GroupsDirectory() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold" style={{ color: C.mutedText }}>
        💡 Many groups are free or low-cost. Check your insurance — therapy and anger management classes may be covered.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {GROUPS.map((group, i) => {
          const colors = FORMAT_COLORS[group.format] || { bg: C.white, text: C.midGreen };
          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: C.white, border: `1.5px solid ${C.cream}` }}
            >
              <p className="font-bold text-sm mb-2" style={{ color: C.darkGreen }}>
                {group.name}
              </p>
              <p className="text-xs mb-2" style={{ color: C.mutedText }}>
                {group.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {group.format}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: C.offWhite, color: C.mutedText }}
                >
                  📅 {group.schedule}
                </span>
              </div>
              <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: C.midGreen, color: C.white }}
              >
                Join or Learn More
                <ExternalLink size={10} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
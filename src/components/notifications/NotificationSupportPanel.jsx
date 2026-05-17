import { C } from "@/lib/rooted-constants";
import { Heart, Megaphone, TrendingUp } from "lucide-react";

const CARDS = [
  {
    icon: TrendingUp,
    title: "Weekly progress summaries",
    body: "Moxie can highlight completed classes, appointments, check-ins, visits, and case-plan wins each week.",
    color: C.midGreen,
  },
  {
    icon: Heart,
    title: "Encouragement",
    body: "Periodic affirmations remind parents they are doing hard work and deserve care too.",
    color: "#B84C2A",
  },
  {
    icon: Megaphone,
    title: "Policy updates",
    body: "Important Ohio benefits, forms, hearing, and program changes can appear here with links to review next steps.",
    color: C.brown,
  },
];

export default function NotificationSupportPanel() {
  return (
    <section className="mb-4 space-y-2">
      {CARDS.map(({ icon: Icon, title, body, color }) => (
        <div key={title} className="rounded-2xl p-4" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <div className="rounded-xl p-2" style={{ background: `${color}20` }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: C.darkGreen }}>{title}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.mutedText }}>{body}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
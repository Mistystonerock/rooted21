import { Link } from "react-router-dom";
import { C } from "@/lib/rooted-constants";
import { ChevronLeft, ExternalLink, Phone } from "lucide-react";

const RESOURCES = [
  {
    section: "📄 Program Documents",
    items: [
      { title: "Parent Workbook", desc: "The full Rooted 21 parent guide and worksheets", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "download" },
      { title: "Facilitator Guide", desc: "For counselors and group leaders using this curriculum", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "download" },
      { title: "One-Page Program Summary", desc: "Quick overview to share with agencies and professionals", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "download" },
      { title: "Printable Worksheets", desc: "All 21 lesson reflection worksheets in printable format", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "download" },
    ]
  },
  {
    section: "🛠️ Parenting Tools",
    items: [
      { title: "I Can Do This Check-In", desc: "Daily parent self-check-in printable form", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "tool" },
      { title: "Rooted Parenting Network Feature Map", desc: "Full blueprint of how this platform works", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/rooted-parenting-network-feature-map.html", type: "tool" },
    ]
  },
  {
    section: "📞 Crisis & Support Lines",
    items: [
      { title: "988 Suicide & Crisis Lifeline", desc: "Call or text 988 — 24/7 mental health crisis support", url: "tel:988", type: "crisis" },
      { title: "National Parent Helpline", desc: "1-855-427-2736 — Support for stressed parents", url: "tel:18554272736", type: "crisis" },
      { title: "Childhelp National Child Abuse Hotline", desc: "1-800-422-4453 — 24/7 crisis support", url: "tel:18004224453", type: "crisis" },
      { title: "Crisis Text Line", desc: "Text HOME to 741741 — Free 24/7 crisis counseling", url: "sms:741741", type: "crisis" },
    ]
  },
  {
    section: "🏛️ Agency & Professional Info",
    items: [
      { title: "Professional Access Request", desc: "CPS, courts, counselors, schools: contact Misty Stonerock to request approved access", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/index.html", type: "agency" },
      { title: "Agency Implementation Guide", desc: "Information for organizations interested in adopting the Rooted 21 curriculum", url: "https://mistystonerock.github.io/Rooted-Parenting-Support/rooted-parenting-network-feature-map.html", type: "agency" },
    ]
  }
];

const TYPE_COLORS = {
  download: C.midGreen,
  tool: C.brown,
  crisis: "#B84C2A",
  agency: C.darkGreen,
};

export default function Resources() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <p className="font-serif font-bold" style={{ color: C.cream }}>Resources</p>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-5">
        {/* Crisis banner */}
        <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <Phone size={16} color="#B84C2A" className="flex-shrink-0" />
          <p className="text-xs font-bold" style={{ color: "#B84C2A" }}>
            In crisis? Call or text <strong>988</strong> anytime. In immediate danger, call <strong>911</strong>.
          </p>
        </div>

        {RESOURCES.map(section => (
          <div key={section.section}>
            <p className="text-[11px] font-extrabold tracking-wider mb-2" style={{ color: C.mutedText }}>
              {section.section}
            </p>
            <div className="space-y-2">
              {section.items.map(item => (
                <a
                  key={item.title}
                  href={item.url}
                  target={item.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-xl p-3.5 transition-all hover:shadow-md"
                  style={{ background: C.white, border: `1px solid ${C.cream}`, textDecoration: "none" }}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: TYPE_COLORS[item.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: C.darkGreen }}>{item.title}</p>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: C.mutedText }}>{item.desc}</p>
                  </div>
                  <ExternalLink size={13} color={C.mutedText} className="flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Created by Misty Stonerock</p>
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Community Behavioral Health Worker & Parent Advocate</p>
          <p className="text-xs mt-1" style={{ color: C.lightGreen }}>Rooted 21 — Stronger Parents. Stronger Kids. Stronger Families.</p>
        </div>
      </div>
    </div>
  );
}
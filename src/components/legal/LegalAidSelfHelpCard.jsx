import { C } from "@/lib/rooted-constants";
import { ExternalLink, Scale } from "lucide-react";

const LINKS = [
  { label: "Ohio Legal Help", url: "https://www.ohiolegalhelp.org/" },
  { label: "Find legal aid near me", url: "https://www.ohiolegalhelp.org/find-your-legal-aid" },
  { label: "Ohio court forms", url: "https://www.supremecourt.ohio.gov/forms/all-forms/" },
  { label: "Protection order help", url: "https://www.ohiolegalhelp.org/topic/protection-orders" },
];

export default function LegalAidSelfHelpCard() {
  return (
    <section className="space-y-3 rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <Scale size={20} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Legal Aid & Self-Help</h2>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Find free legal clinics, custody modification forms, protection-order help, and plain-language Ohio legal information.</p>
        </div>
      </div>
      <div className="grid gap-2">
        {LINKS.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl p-3 text-sm font-black no-underline" style={{ background: C.offWhite, color: C.darkGreen }}>
            {link.label}<ExternalLink size={15} />
          </a>
        ))}
      </div>
    </section>
  );
}
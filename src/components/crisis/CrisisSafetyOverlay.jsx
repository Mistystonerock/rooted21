import { X, Phone, ShieldCheck, Wind, Footprints, Eye } from "lucide-react";

const BG = "rgba(26, 26, 26, 0.72)";
const CARD = "#ffffff";
const CREAM = "#faf6f1";
const GREEN = "#6b9d6e";
const RED = "#B84C2A";
const GOLD = "#a67c52";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";

function childLabel(childProfile) {
  if (!childProfile?.first_name) return "your child";
  return childProfile.first_name;
}

function buildChecklist(childProfile) {
  const name = childLabel(childProfile);
  return [
    `Move ${name} and others away from immediate danger, sharp objects, weapons, traffic, or unsafe rooms.`,
    childProfile?.triggers ? `Reduce known triggers: ${childProfile.triggers}` : "Lower noise, lights, demands, and extra talking until everyone is calmer.",
    childProfile?.coping_tools ? `Use known calming tools: ${childProfile.coping_tools}` : "Use a calm voice, offer space, water, deep pressure only if safe and welcomed, or a quiet corner.",
    "Call 988 for mental health crisis support, or 911 if there is immediate physical danger.",
  ];
}

export default function CrisisSafetyOverlay({ open, onClose, childProfile, message }) {
  if (!open) return null;

  const name = childLabel(childProfile);
  const checklist = buildChecklist(childProfile);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: BG }}>
      <div className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-3xl" style={{ background: CARD, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", border: `2px solid ${RED}` }}>
        <div className="sticky top-0 px-4 py-3 flex items-center gap-3" style={{ background: "#FEF3EE", borderBottom: "1px solid #F4C9B8" }}>
          <ShieldCheck size={22} color={RED} />
          <div className="flex-1">
            <p className="font-serif font-black text-base" style={{ color: TEXT }}>Safety first support</p>
            <p className="text-[11px]" style={{ color: RED }}>Crisis language detected — stay with this plan.</p>
          </div>
          <button onClick={onClose} aria-label="Close safety overlay" className="rounded-xl p-2" style={{ background: CARD, border: "none" }}>
            <X size={16} color={TEXT} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <a href="tel:988" className="w-full rounded-2xl px-4 py-4 flex items-center justify-center gap-2 font-black text-base" style={{ background: RED, color: "#ffffff", textDecoration: "none" }}>
            <Phone size={18} /> Call or Text 988 Now
          </a>

          <section className="rounded-2xl p-4" style={{ background: CREAM, border: "1px solid rgba(120,85,60,0.2)" }}>
            <p className="font-serif font-bold text-base mb-3" style={{ color: TEXT }}>Ground yourself first</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Wind size={18} color={GREEN} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}><strong>Exhale longer than you inhale:</strong> breathe in for 4, out for 6. Repeat three times before speaking.</p>
              </div>
              <div className="flex gap-3">
                <Footprints size={18} color={GREEN} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}><strong>Plant your feet:</strong> press both feet into the floor and quietly say, “I am the calm adult.”</p>
              </div>
              <div className="flex gap-3">
                <Eye size={18} color={GREEN} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}><strong>Scan for safety:</strong> check exits, distance, objects nearby, and whether another safe adult is needed.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-4" style={{ background: CARD, border: "1px solid rgba(120,85,60,0.2)" }}>
            <p className="font-serif font-bold text-base mb-2" style={{ color: TEXT }}>Safety-first checklist for {name}</p>
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                  <p className="text-sm leading-relaxed" style={{ color: TEXT }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {message && (
            <p className="text-[11px] leading-relaxed rounded-xl p-3" style={{ background: "#FEF3EE", color: MUTED }}>
              Keep the chat open for support, but if anyone may be hurt, leave the chat and call 988 or 911 first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
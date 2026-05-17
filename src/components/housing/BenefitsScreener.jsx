import { useMemo, useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ClipboardCheck, ExternalLink, MapPin } from "lucide-react";

const PROGRAMS = {
  snap: { label: "SNAP food help", link: "https://benefits.ohio.gov", why: "food support for your household" },
  wic: { label: "WIC", link: "https://odh.ohio.gov/know-our-programs/women-infants-children", why: "pregnancy, babies, and young children" },
  tanf: { label: "Ohio Works First / TANF", link: "https://benefits.ohio.gov", why: "cash help for families with children" },
  medicaid: { label: "Medicaid", link: "https://benefits.ohio.gov", why: "health coverage" },
  childcare: { label: "Childcare subsidy", link: "https://jfs.ohio.gov/child-care", why: "help paying for childcare while working, school, or services" },
  housing: { label: "Housing help / 211", link: "https://www.211.org", why: "rent, shelter, rapid rehousing, or utility help" },
};

export default function BenefitsScreener({ zip, onSaveZip }) {
  const [answers, setAnswers] = useState({ zip: zip || "", children: "yes", income: "low", pregnantOrUnder5: "no", childcare: "no", housing: "no", medical: "yes" });

  const matches = useMemo(() => {
    const list = [];
    if (answers.income !== "stable") list.push(PROGRAMS.snap, PROGRAMS.medicaid);
    if (answers.children === "yes") list.push(PROGRAMS.tanf);
    if (answers.pregnantOrUnder5 === "yes") list.push(PROGRAMS.wic);
    if (answers.childcare === "yes") list.push(PROGRAMS.childcare);
    if (answers.housing === "yes") list.push(PROGRAMS.housing);
    return [...new Map(list.map(item => [item.label, item])).values()];
  }, [answers]);

  function update(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  async function saveZip() {
    if (answers.zip?.length === 5 && onSaveZip) await onSaveZip(answers.zip);
  }

  const questionClass = "rounded-2xl p-3";

  return (
    <section className="space-y-3 rounded-3xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: C.cream }}>
          <ClipboardCheck size={20} color={C.darkGreen} />
        </div>
        <div>
          <h2 className="font-serif text-lg font-black" style={{ color: C.darkGreen }}>Benefits Screener</h2>
          <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>Answer a few questions. Moxie will point you toward programs that may fit. This is not a final approval.</p>
        </div>
      </div>

      <div className={questionClass} style={{ background: C.offWhite }}>
        <label className="text-xs font-black" style={{ color: C.darkGreen }}>ZIP code for local links</label>
        <div className="mt-2 flex gap-2">
          <input value={answers.zip} onChange={e => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" placeholder={zip || "Enter ZIP"} className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <button onClick={saveZip} disabled={answers.zip.length < 5} className="rounded-xl px-3 text-xs font-black" style={{ background: answers.zip.length < 5 ? C.cream : C.darkGreen, color: answers.zip.length < 5 ? C.mutedText : "#fff", border: "none" }}>
            <MapPin size={14} className="mr-1" /> Save
          </button>
        </div>
      </div>

      {[
        ["children", "Do you have children in your home?", [["yes", "Yes"], ["no", "No"]]],
        ["income", "How does money feel this month?", [["low", "Not enough"], ["tight", "Very tight"], ["stable", "Stable"]]],
        ["pregnantOrUnder5", "Pregnant or caring for a child under 5?", [["yes", "Yes"], ["no", "No"]]],
        ["childcare", "Do you need childcare help?", [["yes", "Yes"], ["no", "No"]]],
        ["housing", "Are you behind on rent, facing inspection, or need emergency housing?", [["yes", "Yes"], ["no", "No"]]],
      ].map(([key, label, options]) => (
        <div key={key} className={questionClass} style={{ background: C.offWhite }}>
          <p className="mb-2 text-xs font-black" style={{ color: C.darkGreen }}>{label}</p>
          <div className="flex flex-wrap gap-2">
            {options.map(([value, text]) => (
              <button key={value} onClick={() => update(key, value)} className="rounded-full px-3 py-2 text-xs font-black" style={{ background: answers[key] === value ? C.darkGreen : C.white, color: answers[key] === value ? "#fff" : C.darkGreen, border: `1px solid ${C.cream}` }}>
                {text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl p-4" style={{ background: "#F0F7F2", border: `1px solid ${C.midGreen}` }}>
        <p className="text-sm font-black" style={{ color: C.darkGreen }}>You may want to check:</p>
        <div className="mt-2 space-y-2">
          {matches.map(program => (
            <a key={program.label} href={program.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl p-3 text-xs font-bold no-underline" style={{ background: C.white, color: C.darkGreen }}>
              <span><strong>{program.label}</strong><br /><span style={{ color: C.mutedText }}>May help with {program.why}</span></span>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
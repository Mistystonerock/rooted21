import { useState } from "react";
import { QUESTIONNAIRE_STEPS, packetSuggestions } from "@/lib/court-packet-data";
import { C } from "@/lib/rooted-constants";

export default function CourtPacketQuestionnaire({ onSelectPacket, packets }) {
  const [answers, setAnswers] = useState({});
  const suggestions = packetSuggestions(answers);

  return (
    <section className="space-y-4 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
      <div>
        <p className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>Not sure where to start?</p>
        <p className="mt-1 text-xs leading-5" style={{ color: C.mutedText }}>Answer a few plain-language questions. This does not choose a legal option for you; it helps narrow what to ask about.</p>
      </div>
      {QUESTIONNAIRE_STEPS.map(step => (
        <div key={step.key}>
          <p className="mb-2 text-sm font-bold" style={{ color: C.darkGreen }}>{step.question}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {step.options.map(option => (
              <button key={option} type="button" onClick={() => setAnswers(prev => ({ ...prev, [step.key]: option }))} className="rounded-2xl px-3 py-3 text-left text-xs font-bold" style={{ background: answers[step.key] === option ? C.darkGreen : C.offWhite, color: answers[step.key] === option ? C.cream : C.darkGreen, border: `1px solid ${C.cream}` }}>{option}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-3" style={{ background: C.offWhite }}>
        <p className="mb-2 text-xs font-black" style={{ color: C.darkGreen }}>You may want to review:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(title => {
            const packet = packets.find(item => item.title === title);
            return packet ? <button key={title} type="button" onClick={() => onSelectPacket(packet)} className="rounded-full px-3 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>{title}</button> : <a key={title} href="/family-safety-crisis-plan" className="rounded-full px-3 py-2 text-xs font-bold no-underline" style={{ background: C.cream, color: C.darkGreen }}>{title}</a>;
          })}
        </div>
      </div>
    </section>
  );
}
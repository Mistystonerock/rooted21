import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import FormHelperChat from "@/components/formhelper/FormHelperChat";
import FormHelperWizard from "@/components/formhelper/FormHelperWizard";

export default function FormHelper() {
  const [wizardDone, setWizardDone] = useState(false);
  const [answers, setAnswers] = useState(null);

  function handleWizardComplete(data) {
    setAnswers(data);
    setWizardDone(true);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.offWhite }}>
      <MobileHeader
        title="Form & Paperwork Helper"
        subtitle="Plain-language guidance for your situation"
        backTo="/dashboard"
      />

      <div className="flex-1 max-w-[520px] mx-auto w-full px-4 py-4">
        {!wizardDone ? (
          <FormHelperWizard onComplete={handleWizardComplete} />
        ) : (
          <FormHelperChat answers={answers} onReset={() => { setWizardDone(false); setAnswers(null); }} />
        )}
      </div>

      <div className="pb-20" />
    </div>
  );
}
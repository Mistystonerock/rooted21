import { useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import BehaviorSupportResult from "@/components/behavior/BehaviorSupportResult";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const responseSchema = {
  type: "object",
  properties: {
    trauma_lens_summary: { type: "string" },
    deescalation_scripts: { type: "array", items: { type: "string" } },
    possible_unmet_needs: { type: "array", items: { type: "string" } },
    next_steps: { type: "array", items: { type: "string" } },
    safety_note: { type: "string" }
  },
  required: ["trauma_lens_summary", "deescalation_scripts", "possible_unmet_needs", "next_steps", "safety_note"]
};

export default function BehaviorSupportTool() {
  const [childAge, setChildAge] = useState("");
  const [behavior, setBehavior] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyzeBehavior(event) {
    event.preventDefault();
    if (!behavior.trim()) return;

    setLoading(true);
    const output = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Moxie, a trauma-informed parenting support assistant. A parent needs immediate calm support, not judgment. Analyze the child's recent difficult behavior through a trauma-informed lens. Do not diagnose. Do not shame the child or parent. Give short, practical de-escalation scripts the parent can say out loud right now, possible unmet needs behind the action, and gentle next steps. Include emergency guidance only if there is danger.\n\nChild age: ${childAge || "not provided"}\nBehavior: ${behavior}\nContext before/after behavior: ${context || "not provided"}`,
      response_json_schema: responseSchema
    });
    setResult(output);
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Behavior Support" subtitle="Calm scripts and unmet-needs insight" backTo="/behavior-hub" />
      <main className="mx-auto max-w-[560px] space-y-4 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.14)" }}>
              <Brain size={24} color={C.cream} />
            </div>
            <div>
              <p className="font-serif text-xl font-black" style={{ color: C.cream }}>What just happened?</p>
              <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>
                Describe the behavior, and Moxie will suggest calm words to use now and what the child may be communicating underneath it.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={analyzeBehavior} className="space-y-3 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <label className="block">
            <span className="text-sm font-bold" style={{ color: C.darkGreen }}>Child age or stage</span>
            <Input value={childAge} onChange={event => setChildAge(event.target.value)} placeholder="Example: 7 years old, toddler, teenager" className="mt-2" />
          </label>

          <label className="block">
            <span className="text-sm font-bold" style={{ color: C.darkGreen }}>Describe the difficult behavior</span>
            <Textarea value={behavior} onChange={event => setBehavior(event.target.value)} placeholder="Example: My child screamed, threw toys, and hid under the table when it was time to leave." className="mt-2 min-h-32" required />
          </label>

          <label className="block">
            <span className="text-sm font-bold" style={{ color: C.darkGreen }}>What happened before or after?</span>
            <Textarea value={context} onChange={event => setContext(event.target.value)} placeholder="Example: They were tired, hungry, asked to stop a game, had school today, or saw a certain person." className="mt-2 min-h-24" />
          </label>

          <Button type="submit" disabled={loading || !behavior.trim()} className="w-full rounded-2xl py-6 text-sm font-black" style={{ background: C.darkGreen, color: C.cream }}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? "Moxie is thinking..." : "Get calm support"}
          </Button>
        </form>

        <BehaviorSupportResult result={result} />

        <section className="rounded-3xl border p-4 text-xs leading-6" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}>
          This tool is educational support, not medical, mental health, or emergency advice. If anyone is in immediate danger, call 911. For crisis support, call or text 988.
        </section>
      </main>
    </div>
  );
}
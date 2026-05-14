import { BookOpen, Download, FileText } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const MATERIALS = {
  parenting: [
    {
      title: "Positive Parenting Group Handout",
      type: "Class handout",
      description: "A plain-language guide for connection before correction, repair after conflict, and calm routines.",
      sections: [
        ["Core idea", "Children heal through repeated safe connection, predictable structure, and calm adult leadership."],
        ["Try this week", "Use one 10-minute connection ritual daily, name the feeling before correcting behavior, and end hard moments with repair."],
        ["Discussion prompts", "What behavior is hardest to stay calm through? What support would make that moment easier? What does repair look like in your home?"],
      ],
    },
    {
      title: "Caregiver Reflection Worksheet",
      type: "Worksheet",
      description: "Helps parents prepare for class discussion and identify patterns without shame.",
      sections: [
        ["Before class", "Write down one recent parenting win, one hard moment, and one question you want help with."],
        ["Pattern check", "What usually happens before escalation? What helps your child calm down? What helps you stay regulated?"],
        ["Next step", "Choose one small change to practice for 7 days and write how you will know it is helping."],
      ],
    },
    {
      title: "Parenting Class Agenda Template",
      type: "Facilitator material",
      description: "A simple structure for opening, teaching, discussion, practice, and take-home action steps.",
      sections: [
        ["Opening", "Grounding exercise, group agreements, and quick wins from the week."],
        ["Teaching topic", "Introduce one skill: co-regulation, repair, boundaries, routines, sensory needs, or advocacy."],
        ["Practice", "Roleplay a hard moment and rewrite the adult response using calm, clear language."],
        ["Take-home", "Each caregiver chooses one realistic practice step before the next session."],
      ],
    },
  ],
  anger: [
    {
      title: "Anger Warning Signs Worksheet",
      type: "Group worksheet",
      description: "Helps participants identify body cues, thoughts, triggers, and early interruption points.",
      sections: [
        ["Body signs", "Notice jaw tension, heat, pacing, clenched hands, fast talking, shallow breathing, or pressure in the chest."],
        ["Thought signs", "Watch for all-or-nothing thoughts like 'they never listen,' 'I have to win,' or 'I am being disrespected.'"],
        ["Interruption plan", "Step away safely, breathe for 90 seconds, lower your voice, drink water, or call a support person before responding."],
      ],
    },
    {
      title: "Pause Plan for Parents",
      type: "Safety handout",
      description: "A practical plan for stepping away before yelling, threats, unsafe driving, or physical escalation.",
      sections: [
        ["My pause phrase", "Use a short phrase such as: 'I need a calm minute. I will come back.'"],
        ["Safe reset actions", "Put space between you and the conflict, keep children supervised, avoid texting while angry, and return when calm."],
        ["Repair", "After cooling down, name what happened, take responsibility for your part, and state what you will do differently next time."],
      ],
    },
    {
      title: "Anger Group Session Guide",
      type: "Facilitator material",
      description: "A group outline for reflection, skills practice, accountability, and non-shaming behavior change.",
      sections: [
        ["Check-in", "Each participant names one trigger from the week and one moment they handled better than before."],
        ["Skill focus", "Teach one skill: pause plan, body cues, communication repair, boundaries, or stress load reduction."],
        ["Practice", "Roleplay a triggering moment and practice a safer response using a calm voice and clear limit."],
        ["Accountability", "Participants name one concrete action they will practice before the next group."],
      ],
    },
  ],
};

export default function ClassAndGroupMaterials({ category = "parenting" }) {
  const materials = MATERIALS[category] || MATERIALS.parenting;
  const isAnger = category === "anger";

  function downloadMaterial(material) {
    const content = `# ${material.title}\n\n${material.description}\n\n${material.sections.map(([heading, body]) => `## ${heading}\n${body}`).join("\n\n")}\n\n---\nRooted 21 material for education and support. This is not legal, medical, or mental health advice.`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${material.title.replace(/[^a-z0-9]+/gi, "-")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4" style={{ background: isAnger ? "#4a1c1c" : C.darkGreen }}>
        <div className="flex items-center gap-3">
          <BookOpen size={20} color="#fff" />
          <div>
            <p className="font-serif font-bold text-sm" style={{ color: "#fff" }}>
              {isAnger ? "Anger Management Group Materials" : "Parenting Class Materials"}
            </p>
            <p className="text-[11px] mt-1" style={{ color: isAnger ? "rgba(255,220,200,0.82)" : C.lightGreen }}>
              Handouts, worksheets, and facilitator guides for class and group support.
            </p>
          </div>
        </div>
      </div>

      {materials.map(material => (
        <div key={material.title} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isAnger ? "#FEF3EE" : "#F0F6F0" }}>
              <FileText size={17} color={isAnger ? "#B84C2A" : C.midGreen} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: isAnger ? "#B84C2A" : C.midGreen }}>{material.type}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: C.darkGreen }}>{material.title}</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.mutedText }}>{material.description}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {material.sections.map(([heading, body]) => (
              <div key={heading} className="rounded-xl p-3" style={{ background: C.offWhite }}>
                <p className="text-[11px] font-bold" style={{ color: C.darkGreen }}>{heading}</p>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#3a3028" }}>{body}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => downloadMaterial(material)}
            className="w-full mt-3 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold"
            style={{ background: isAnger ? "#4a1c1c" : C.midGreen, color: "#fff", border: "none", cursor: "pointer" }}
          >
            <Download size={14} /> Download Material
          </button>
        </div>
      ))}
    </div>
  );
}
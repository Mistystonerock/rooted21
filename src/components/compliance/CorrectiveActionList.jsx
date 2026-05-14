import { CheckSquare } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CorrectiveActionList({ actions = [] }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare size={17} color={C.midGreen} />
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Corrective action plan</p>
      </div>
      {actions.length === 0 ? (
        <p className="text-xs" style={{ color: C.mutedText }}>Run the AI scan to generate specific next steps.</p>
      ) : (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="rounded-xl p-3 flex gap-3" style={{ background: C.offWhite }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: C.darkGreen, color: "#fff" }}>{index + 1}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{action.action}</p>
                <p className="text-[11px] mt-1" style={{ color: C.mutedText }}>{action.deadline || "Complete as soon as possible"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
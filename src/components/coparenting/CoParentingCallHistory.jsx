import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Phone, Download, AlertCircle } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const CALL_TOPIC_COLORS = {
  schedule: { bg: "#E8F4FF", text: "#1A5FAD" },
  health: { bg: "#FFF0F0", text: "#B84C2A" },
  education: { bg: "#EAF4EA", text: "#2E7D60" },
  behavior: { bg: "#FFF8E6", text: "#7A5200" },
  finances: { bg: "#F3EDFF", text: "#5C3D9E" },
  general: { bg: "#F5F5F5", text: "#555555" },
};

export default function CoParentingCallHistory({ calls, onExport, exporting }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!calls || calls.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">☎️</p>
        <p className="font-bold text-sm" style={{ color: C.darkGreen }}>No calls yet</p>
        <p className="text-xs mt-1" style={{ color: C.mutedText }}>Start a call to begin recording</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {calls.map(call => {
        const isExpanded = expandedId === call.id;
        const tc = CALL_TOPIC_COLORS[call.topic] || CALL_TOPIC_COLORS.general;
        const duration = `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`;
        
        return (
          <div key={call.id} className="rounded-xl p-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : call.id)}
              className="w-full text-left flex items-start justify-between gap-2"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Phone size={12} color={C.midGreen} />
                  <p className="font-bold text-xs" style={{ color: C.darkGreen }}>
                    Call with {call.initiator_email === call.recipient_email ? "You" : call.recipient_name}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background: tc.bg, color: tc.text }}>
                    {call.topic || "general"}
                  </span>
                  <span className="text-[8px]" style={{ color: C.mutedText }}>
                    {duration} • {formatDistanceToNow(new Date(call.start_time), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {call.tension_detected && (
                  <AlertCircle size={12} color="#B84C2A" title="Tension detected" />
                )}
                <span className="text-[10px]" style={{ color: C.mutedText }}>{isExpanded ? "▼" : "▶"}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: C.cream }}>
                <div className="text-[10px] space-y-1">
                  <p style={{ color: C.mutedText }}>
                    <span className="font-bold">Started:</span> {new Date(call.start_time).toLocaleString()}
                  </p>
                  {call.end_time && (
                    <p style={{ color: C.mutedText }}>
                      <span className="font-bold">Ended:</span> {new Date(call.end_time).toLocaleString()}
                    </p>
                  )}
                </div>

                {call.tension_detected && call.tension_summary && (
                  <div className="rounded-lg p-2" style={{ background: "#FFF0F0", border: "1px solid #F4C9B8" }}>
                    <p className="text-[9px] font-bold" style={{ color: "#B84C2A" }}>⚠️ Tone Alert</p>
                    <p className="text-[8px] mt-1" style={{ color: "#8B3A1A" }}>{call.tension_summary}</p>
                  </div>
                )}

                {call.notes && (
                  <div>
                    <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>Notes</p>
                    <p className="text-[8px] mt-1" style={{ color: C.darkGreen }}>{call.notes}</p>
                  </div>
                )}

                {call.recording_url && (
                  <button
                    onClick={() => onExport?.(call.id)}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold"
                    style={{ background: C.lightGreen, color: C.darkGreen, border: "none", cursor: "pointer", opacity: exporting ? 0.6 : 1 }}
                  >
                    <Download size={10} />
                    {exporting ? "Exporting…" : "Export Recording"}
                  </button>
                )}

                {call.read_by_court && (
                  <div className="text-[8px] px-2 py-1 rounded" style={{ background: "#E8F5E9", color: C.midGreen }}>
                    ✓ Court reviewed
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
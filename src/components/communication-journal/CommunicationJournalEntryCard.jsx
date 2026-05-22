import { format } from "date-fns";
import { AlertTriangle, Lock, MessageCircle, Users } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const LABELS = {
  daily_update: "Daily update",
  milestone: "Milestone",
  challenge: "Challenge",
  schedule: "Schedule",
  school: "School",
  medical: "Medical",
  visitation: "Visitation",
  court_related: "Court-related",
  other: "Other",
};

export default function CommunicationJournalEntryCard({ entry, userEmail }) {
  const shared = entry.visibility !== "private";
  const highTension = entry.ai_risk_level === "high";

  return (
    <article className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: highTension ? "#fed7aa" : C.cream }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-bold" style={{ color: C.darkGreen }}>{entry.title}</p>
          <p className="mt-1 text-xs" style={{ color: C.mutedText }}>
            {entry.entry_date ? format(new Date(`${entry.entry_date}T12:00:00`), "MMM d, yyyy") : "No date"} · {LABELS[entry.interaction_type] || "Journal"}
          </p>
        </div>
        <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: shared ? "#eaf4ea" : C.offWhite, color: C.darkGreen }}>
          {shared ? <Users size={11} className="mr-1 inline" /> : <Lock size={11} className="mr-1 inline" />}{shared ? "Shared" : "Private"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6" style={{ color: C.darkText }}>{entry.neutral_summary}</p>
      {entry.milestone && <p className="mt-2 text-xs leading-5" style={{ color: C.darkGreen }}><strong>Milestone:</strong> {entry.milestone}</p>}
      {entry.challenge && <p className="mt-2 text-xs leading-5" style={{ color: C.mutedText }}><strong>Challenge:</strong> {entry.challenge}</p>}

      {(entry.ai_risk_level || entry.suggested_rewrite) && (
        <div className="mt-3 rounded-2xl p-3 text-xs leading-5" style={{ background: highTension ? "#fff7ed" : C.offWhite, color: highTension ? "#9a3412" : C.darkGreen }}>
          <p className="font-black">{highTension ? <AlertTriangle size={13} className="mr-1 inline" /> : <MessageCircle size={13} className="mr-1 inline" />} AI tone note: {entry.ai_tone || entry.ai_risk_level}</p>
          {entry.suggested_rewrite && <p className="mt-2"><strong>Suggested re-phrase:</strong> {entry.suggested_rewrite}</p>}
        </div>
      )}

      <p className="mt-3 text-[10px]" style={{ color: C.mutedText }}>
        Added by {entry.owner_email === userEmail ? "you" : entry.owner_email}
      </p>
    </article>
  );
}
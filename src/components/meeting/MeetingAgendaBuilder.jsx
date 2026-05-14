import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { CalendarDays, ClipboardList, Download, FileText, Loader2, MessageSquare, Sparkles, TriangleAlert } from "lucide-react";

function shortText(value, length = 120) {
  if (!value) return "Not provided";
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function MeetingAgendaBuilder({ user, selectedCase }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [meetingType, setMeetingType] = useState("case_meeting");
  const [meetingDate, setMeetingDate] = useState("");
  const [sources, setSources] = useState({ incidents: [], communications: [], checklistItems: [] });

  useEffect(() => {
    if (!user) return;
    loadSources();
  }, [user?.email, selectedCase?.id]);

  async function loadSources() {
    setLoading(true);
    const [incidents, coParentMessages, secureMessages, checklists] = await Promise.all([
      base44.entities.BehaviorLog.list("-entry_date", 25),
      base44.entities.CoParentingMessage.list("-created_date", 25),
      base44.entities.SecureMessage.filter({ family_email: user.email }, "-created_date", 25),
      base44.entities.CasePlanChecklist.filter({ parent_email: user.email }, "-created_date", 20),
    ]);

    const childName = selectedCase?.child_name?.toLowerCase();
    const relevantChecklists = checklists.filter(list => {
      if (selectedCase?.id && list.case_id === selectedCase.id) return true;
      if (childName && list.child_name?.toLowerCase() === childName) return true;
      return !selectedCase;
    });

    const unresolved = relevantChecklists.flatMap(list =>
      (list.items || [])
        .filter(item => !item.completed)
        .map(item => ({ ...item, checklistTitle: list.title, child_name: list.child_name }))
    ).slice(0, 12);

    const relevantIncidents = incidents.filter(log => {
      if (!selectedCase) return true;
      return !log.child_name || log.child_name?.toLowerCase() === childName;
    }).slice(0, 8);

    const communications = [...coParentMessages, ...secureMessages]
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, 10);

    setSources({ incidents: relevantIncidents, communications, checklistItems: unresolved });
    setLoading(false);
  }

  const agendaMarkdown = useMemo(() => {
    const title = meetingType === "court_hearing" ? "Court Hearing Agenda" : meetingType === "iep_school" ? "School / IEP Meeting Agenda" : "Case Meeting Agenda";
    return `# ${title}\n\n**Child / Case:** ${selectedCase?.child_name || "General meeting"}\n**Meeting Date:** ${meetingDate || "TBD"}\n**Prepared By:** ${user?.full_name || user?.email || "Rooted 21 user"}\n\n## 1. Opening Summary\n- Purpose of meeting: clarify current concerns, progress, and next steps.\n- Desired outcome: agree on specific supports, responsibilities, deadlines, and follow-up documentation.\n\n## 2. Recent Behavior Incidents to Discuss\n${sources.incidents.length ? sources.incidents.map(log => `- **${formatDate(log.entry_date)}${log.time ? ` at ${log.time}` : ""}:** ${shortText(log.behavior_description)} Trigger: ${shortText(log.trigger, 80)} Outcome: ${shortText(log.outcome, 80)}`).join("\n") : "- No recent behavior incidents found."}\n\n## 3. Relevant Communication Threads\n${sources.communications.length ? sources.communications.map(msg => `- **${formatDate(msg.created_date)} — ${msg.sender_name || msg.sender_email || "Sender"}:** ${shortText(msg.body)}`).join("\n") : "- No recent communication threads found."}\n\n## 4. Unresolved Checklist Items\n${sources.checklistItems.length ? sources.checklistItems.map(item => `- **${item.checklistTitle || "Checklist"}:** ${item.text}${item.due_date ? ` — Due ${formatDate(item.due_date)}` : ""}`).join("\n") : "- No unresolved checklist items found."}\n\n## 5. Questions to Ask\n- What decisions need to be made today?\n- What support or service is being offered, by whom, and by what date?\n- What documentation should be provided after the meeting?\n- Who is responsible for each follow-up action?\n\n## 6. Requested Next Steps\n- Confirm all agreements in writing.\n- Set dates for follow-up tasks and future review.\n- Identify any missing documents, referrals, or approvals needed.`;
  }, [meetingType, meetingDate, selectedCase, sources, user]);

  function downloadAgenda() {
    const element = document.createElement("a");
    const file = new Blob([agendaMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `Meeting-Agenda-${selectedCase?.child_name || "General"}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <section className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 text-left" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.cream }}>
          <Sparkles size={18} color={C.midGreen} />
        </div>
        <div className="flex-1">
          <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Auto Agenda Builder</p>
          <p className="text-[11px]" style={{ color: C.mutedText }}>Pulls incidents, communications, and open checklist items</p>
        </div>
        {loading && <Loader2 size={16} color={C.midGreen} className="animate-spin" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select value={meetingType} onChange={e => setMeetingType(e.target.value)} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.cream }}>
              <option value="case_meeting">Case meeting</option>
              <option value="court_hearing">Court hearing</option>
              <option value="iep_school">School / IEP</option>
            </select>
            <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.cream }} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <SourceStat icon={TriangleAlert} label="Incidents" value={sources.incidents.length} />
            <SourceStat icon={MessageSquare} label="Messages" value={sources.communications.length} />
            <SourceStat icon={ClipboardList} label="Open items" value={sources.checklistItems.length} />
          </div>

          <div className="rounded-xl p-3 max-h-72 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed" style={{ background: C.offWhite, color: C.darkText, border: `1px solid ${C.cream}` }}>
            {agendaMarkdown}
          </div>

          <button onClick={downloadAgenda} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold" style={{ background: C.midGreen, color: "#fff", border: "none" }}>
            <Download size={14} /> Download Agenda
          </button>
        </div>
      )}
    </section>
  );
}

function SourceStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
      <Icon size={15} color={C.midGreen} className="mx-auto mb-1" />
      <p className="text-base font-black" style={{ color: C.darkGreen }}>{value}</p>
      <p className="text-[9px] font-bold" style={{ color: C.mutedText }}>{label}</p>
    </div>
  );
}
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { FileText, MessageSquare, Paperclip, Download, Loader2, AlertTriangle } from "lucide-react";

const TYPE_CONFIG = {
  note:      { icon: FileText,      color: C.midGreen,  bg: "#EAF4EA", label: "Case Note" },
  document:  { icon: Paperclip,     color: C.brown,     bg: "#FEF3EE", label: "Document" },
  message:   { icon: MessageSquare, color: "#5C3D9E",   bg: "#F3EDFF", label: "Co-Parent Message" },
};

function TimelineEntry({ entry }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.note;
  const Icon = cfg.icon;
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: cfg.bg, border: `2px solid ${cfg.color}` }}>
          <Icon size={13} color={cfg.color} />
        </div>
        <div className="w-0.5 flex-1 mt-1" style={{ background: C.cream, minHeight: 16 }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>{dateStr}</p>
              <p className="text-[9px]" style={{ color: C.mutedText }}>{timeStr}</p>
            </div>
          </div>
          {entry.title && (
            <p className="text-xs font-bold mb-1" style={{ color: C.darkGreen }}>{entry.title}</p>
          )}
          <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{entry.body}</p>
          {entry.author && (
            <p className="text-[10px] mt-1.5" style={{ color: C.mutedText }}>— {entry.author}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourtCaseTimeline({ caseId, caseFile, user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Parallel fetch: notes, documents from case, co-parenting messages
      const [notes, partnerships] = await Promise.all([
        base44.entities.CaseNote.filter({ case_id: caseId }, "created_date", 200),
        base44.entities.CoParentingPartnership.filter({ child_name: caseFile.child_name }, "created_date", 10),
      ]);

      const timeline = [];

      // Case notes
      notes.forEach(n => {
        timeline.push({
          id: n.id,
          type: "note",
          date: n.created_date,
          title: n.title || `${n.note_type} Note`,
          body: n.body,
          author: n.author_name,
          subtype: n.note_type,
        });
      });

      // Documents (from case file array)
      (caseFile.documents || []).forEach(d => {
        timeline.push({
          id: d.id,
          type: "document",
          date: d.date_added || caseFile.created_date,
          title: d.title,
          body: `${d.type ? d.type.replace(/_/g, " ") : "Document"} uploaded${d.due_date ? ` · Due: ${new Date(d.due_date).toLocaleDateString()}` : ""}`,
          author: user?.full_name,
        });
      });

      // Co-parenting messages (summarized by day to avoid clutter)
      if (partnerships.length > 0) {
        for (const p of partnerships) {
          const msgs = await base44.entities.CoParentingMessage.filter(
            { partnership_id: p.id }, "created_date", 100
          );
          // Group messages by day and create summary entries
          const byDay = {};
          msgs.forEach(m => {
            const day = m.created_date.split("T")[0];
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push(m);
          });
          Object.entries(byDay).forEach(([day, dayMsgs]) => {
            const senders = [...new Set(dayMsgs.map(m => m.sender_name))].join(" & ");
            timeline.push({
              id: `msg-${day}-${p.id}`,
              type: "message",
              date: dayMsgs[0].created_date,
              title: `${dayMsgs.length} co-parent message${dayMsgs.length > 1 ? "s" : ""}`,
              body: `Exchange between ${senders} · Topics: ${[...new Set(dayMsgs.map(m => m.topic).filter(Boolean))].join(", ") || "general"}`,
              author: null,
            });
          });
        }
      }

      // Sort chronologically (oldest first)
      timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEntries(timeline);
      setLoading(false);
    }
    load();
  }, [caseId, caseFile]);

  async function handleExport() {
    setExporting(true);
    setExported(false);
    const noteIds = entries.filter(e => e.type === "note").map(e => e.id);
    const docIds = entries.filter(e => e.type === "document").map(e => e.id);

    const response = await base44.functions.invoke("generateCaseStatusReport", {
      caseId,
      childName: caseFile.child_name,
      caseType: caseFile.case_type,
      caseNumber: caseFile.case_number,
      selectedNoteIds: noteIds,
      selectedEventIds: [],
      selectedDocIds: docIds,
      includeTimeline: true,
      timelineEntries: entries.map(e => ({
        type: e.type,
        date: e.date,
        title: e.title,
        body: e.body,
        author: e.author,
      })),
    });

    if (response.data?.base64) {
      const { base64, fileName } = response.data;
      const byteChars = atob(base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
      setExported(true);
    }
    setExporting(false);
  }

  const filtered = filter === "all" ? entries : entries.filter(e => e.type === filter);
  const counts = { note: entries.filter(e => e.type === "note").length, document: entries.filter(e => e.type === "document").length, message: entries.filter(e => e.type === "message").length };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting || entries.length === 0}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
        style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.75 : 1 }}
      >
        {exporting
          ? <><Loader2 size={15} className="animate-spin" /> Building Court PDF…</>
          : <><Download size={15} /> Export Court Case Report (PDF)</>}
      </button>

      {exported && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "#EAF4EA", border: `1px solid ${C.midGreen}` }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <p className="text-xs font-bold" style={{ color: C.darkGreen }}>Report downloaded successfully.</p>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: `All (${entries.length})` },
          { key: "note", label: `Notes (${counts.note})` },
          { key: "document", label: `Docs (${counts.document})` },
          { key: "message", label: `Messages (${counts.message})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: filter === f.key ? C.darkGreen : C.cream,
              color: filter === f.key ? "#fff" : C.darkGreen,
              border: "none", cursor: "pointer",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", border: `1.5px dashed ${C.cream}` }}>
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No timeline entries yet</p>
          <p className="text-xs mt-1" style={{ color: C.mutedText }}>Add case notes, upload documents, or send co-parent messages to build the timeline.</p>
        </div>
      ) : (
        <div className="pt-2">
          {filtered.map(entry => (
            <TimelineEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Legal note */}
      <div className="rounded-xl p-3 flex gap-2" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
        <AlertTriangle size={13} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
        <p className="text-[10px]" style={{ color: "#B84C2A" }}>
          This timeline is for documentation purposes. Consult your attorney before submitting any report to court.
        </p>
      </div>
    </div>
  );
}
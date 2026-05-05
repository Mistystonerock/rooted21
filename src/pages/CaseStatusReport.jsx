import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { Check, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function CaseStatusReport() {
  const { caseId } = useParams();
  const [caseFile, setCaseFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({ notes: true, events: true, documents: true });

  useEffect(() => {
    Promise.all([
      base44.entities.CaseFile.filter({ id: caseId }),
      base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 100),
      base44.entities.CareCalendarEvent.filter({ family_email: "" }, "-created_date", 100), // Will filter by case later
    ]).then(([cases, caseNotes, calendarEvents]) => {
      if (cases.length > 0) setCaseFile(cases[0]);
      setNotes(caseNotes);
      setEvents(calendarEvents);
      setLoading(false);
    });
  }, [caseId]);

  const toggleNote = (noteId) => {
    const newSet = new Set(selectedNotes);
    if (newSet.has(noteId)) {
      newSet.delete(noteId);
    } else {
      newSet.add(noteId);
    }
    setSelectedNotes(newSet);
  };

  const toggleEvent = (eventId) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
    } else {
      newSet.add(eventId);
    }
    setSelectedEvents(newSet);
  };

  const toggleDoc = (docId) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedDocs(newSet);
  };

  const selectAll = (type) => {
    if (type === "notes") {
      if (selectedNotes.size === notes.length) {
        setSelectedNotes(new Set());
      } else {
        setSelectedNotes(new Set(notes.map(n => n.id)));
      }
    } else if (type === "events") {
      if (selectedEvents.size === events.length) {
        setSelectedEvents(new Set());
      } else {
        setSelectedEvents(new Set(events.map(e => e.id)));
      }
    } else if (type === "docs") {
      if (selectedDocs.size === caseFile?.documents?.length) {
        setSelectedDocs(new Set());
      } else {
        setSelectedDocs(new Set(caseFile?.documents?.map(d => d.id) || []));
      }
    }
  };

  async function handleGenerateReport() {
    if (selectedNotes.size === 0 && selectedEvents.size === 0 && selectedDocs.size === 0) {
      alert("Please select at least one note, event, or document");
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke("generateCaseStatusReport", {
        caseId,
        childName: caseFile?.child_name,
        caseType: caseFile?.case_type,
        caseNumber: caseFile?.case_number,
        selectedNoteIds: Array.from(selectedNotes),
        selectedEventIds: Array.from(selectedEvents),
        selectedDocIds: Array.from(selectedDocs),
      });

      if (response.data?.url) {
        const a = document.createElement("a");
        a.href = response.data.url;
        a.download = `${caseFile?.child_name}-Case-Status-Report.pdf`;
        a.click();
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Generate Case Report" backTo={`/case-detail/${caseId}`} />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!caseFile) return null;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Case Status Report" subtitle="Select items to include" backTo={`/case-detail/${caseId}`} />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Info */}
        <div className="rounded-2xl p-4 text-center" style={{ background: C.darkGreen }}>
          <p className="text-2xl mb-2">📋</p>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Case Status Report</p>
          <p className="text-[11px] mt-1" style={{ color: C.lightGreen }}>
            Select case notes, events, and documents to compile into a formatted PDF for legal professionals
          </p>
        </div>

        {/* Notes section */}
        {notes.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, notes: !prev.notes }))}
              className="w-full flex items-center justify-between px-4 py-3"
              style={{ background: C.darkGreen, border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "16px" }}>📝</span>
                <p className="font-bold text-sm" style={{ color: C.cream }}>Case Notes ({selectedNotes.size}/{notes.length})</p>
              </div>
              {expandedSections.notes ? (
                <ChevronUp size={18} color={C.cream} />
              ) : (
                <ChevronDown size={18} color={C.cream} />
              )}
            </button>

            {expandedSections.notes && (
              <div className="p-4 space-y-2" style={{ background: "#fff" }}>
                {notes.length > 0 && (
                  <button
                    onClick={() => selectAll("notes")}
                    className="text-xs font-bold mb-3 px-2 py-1 rounded"
                    style={{ background: C.offWhite, color: C.darkGreen, border: "none", cursor: "pointer" }}
                  >
                    {selectedNotes.size === notes.length ? "Deselect all" : "Select all"}
                  </button>
                )}
                {notes.map(note => (
                  <label key={note.id} className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80">
                    <input
                      type="checkbox"
                      checked={selectedNotes.has(note.id)}
                      onChange={() => toggleNote(note.id)}
                      style={{ accentColor: C.darkGreen, marginTop: 3 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{note.title}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>
                        {note.note_type.toUpperCase()} • {new Date(note.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events section */}
        {events.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, events: !prev.events }))}
              className="w-full flex items-center justify-between px-4 py-3"
              style={{ background: C.midGreen, border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "16px" }}>📅</span>
                <p className="font-bold text-sm" style={{ color: "#fff" }}>Events ({selectedEvents.size}/{events.length})</p>
              </div>
              {expandedSections.events ? (
                <ChevronUp size={18} color="#fff" />
              ) : (
                <ChevronDown size={18} color="#fff" />
              )}
            </button>

            {expandedSections.events && (
              <div className="p-4 space-y-2" style={{ background: "#fff" }}>
                {events.length > 0 && (
                  <button
                    onClick={() => selectAll("events")}
                    className="text-xs font-bold mb-3 px-2 py-1 rounded"
                    style={{ background: C.offWhite, color: C.darkGreen, border: "none", cursor: "pointer" }}
                  >
                    {selectedEvents.size === events.length ? "Deselect all" : "Select all"}
                  </button>
                )}
                {events.map(event => (
                  <label key={event.id} className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80">
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      style={{ accentColor: C.darkGreen, marginTop: 3 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{event.title}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>
                        {new Date(event.date).toLocaleDateString()} • {event.event_type}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents section */}
        {caseFile?.documents && caseFile.documents.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, documents: !prev.documents }))}
              className="w-full flex items-center justify-between px-4 py-3"
              style={{ background: C.brown, border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "16px" }}>📄</span>
                <p className="font-bold text-sm" style={{ color: "#fff" }}>Documents ({selectedDocs.size}/{caseFile.documents.length})</p>
              </div>
              {expandedSections.documents ? (
                <ChevronUp size={18} color="#fff" />
              ) : (
                <ChevronDown size={18} color="#fff" />
              )}
            </button>

            {expandedSections.documents && (
              <div className="p-4 space-y-2" style={{ background: "#fff" }}>
                {caseFile.documents.length > 0 && (
                  <button
                    onClick={() => selectAll("docs")}
                    className="text-xs font-bold mb-3 px-2 py-1 rounded"
                    style={{ background: C.offWhite, color: C.darkGreen, border: "none", cursor: "pointer" }}
                  >
                    {selectedDocs.size === caseFile.documents.length ? "Deselect all" : "Select all"}
                  </button>
                )}
                {caseFile.documents.map(doc => (
                  <label key={doc.id} className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80">
                    <input
                      type="checkbox"
                      checked={selectedDocs.has(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      style={{ accentColor: C.darkGreen, marginTop: 3 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{doc.title}</p>
                      <p className="text-[10px]" style={{ color: C.mutedText }}>
                        {doc.date_added && new Date(doc.date_added).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerateReport}
          disabled={generating || (selectedNotes.size === 0 && selectedEvents.size === 0 && selectedDocs.size === 0)}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: C.darkGreen,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            opacity: generating || (selectedNotes.size === 0 && selectedEvents.size === 0 && selectedDocs.size === 0) ? 0.6 : 1,
          }}
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={18} />
              Download Case Status Report
            </>
          )}
        </button>

        <p className="text-center text-[11px]" style={{ color: C.mutedText }}>
          {selectedNotes.size + selectedEvents.size + selectedDocs.size} item{selectedNotes.size + selectedEvents.size + selectedDocs.size !== 1 ? "s" : ""} selected
        </p>

        <div className="pb-8" />
      </div>
    </div>
  );
}
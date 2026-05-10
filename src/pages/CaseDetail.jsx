import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import { FileText, Users, MessageSquare, Calendar, AlertCircle, Plus, Trash2, X, Download } from "lucide-react";
import DocumentManager from "@/components/case/DocumentManager";
import TaskManager from "@/components/case/TaskManager";
import CourtCaseTimeline from "@/components/case/CourtCaseTimeline";
import EmergencyAlertButton from "@/components/emergency/EmergencyAlertButton";
import VoiceNoteRecorder from "@/components/case/VoiceNoteRecorder";

export default function CaseDetail() {
  const { caseId } = useParams();
  const [caseFile, setCaseFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", body: "", note_type: "update" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.CaseFile.filter({ id: caseId }),
      base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date", 100),
    ]).then(([u, cases, caseNotes]) => {
      setUser(u);
      if (cases.length > 0) setCaseFile(cases[0]);
      setNotes(caseNotes);
      setLoading(false);
    });
  }, [caseId]);

  async function handleAddNote() {
    if (!newNote.body.trim()) return;
    
    const created = await base44.entities.CaseNote.create({
      case_id: caseId,
      author_email: user.email,
      author_name: user.full_name,
      author_role: user.role,
      note_type: newNote.note_type,
      title: newNote.title || "Note",
      body: newNote.body,
      visible_to_team: true,
    });
    
    setNotes(prev => [created, ...prev]);
    setNewNote({ title: "", body: "", note_type: "update" });
    setShowNoteForm(false);
  }

  async function handleDeleteNote(noteId) {
    await base44.entities.CaseNote.delete(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }

  async function handleDeleteDocument(docId) {
    const updated = {
      ...caseFile,
      documents: caseFile.documents.filter(d => d.id !== docId),
    };
    await base44.entities.CaseFile.update(caseId, updated);
    setCaseFile(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Case Details" backTo="/case-management" />
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
        </div>
      </div>
    );
  }

  if (!caseFile) {
    return (
      <div className="min-h-screen" style={{ background: C.offWhite }}>
        <MobileHeader title="Case Details" backTo="/case-management" />
        <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
          <p className="text-sm font-bold" style={{ color: C.darkGreen }}>Case not found</p>
        </div>
      </div>
    );
  }

  const teamCount = caseFile.team_members?.length || 0;
  const docCount = caseFile.documents?.length || 0;
  const noteCount = notes.length;
  const daysUntilMilestone = caseFile.next_milestone_date
    ? Math.ceil((new Date(caseFile.next_milestone_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader
        title={caseFile.child_name}
        subtitle={caseFile.case_type.toUpperCase()}
        backTo="/case-management"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Case header */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.cream}` }}>
          <div className="px-4 py-3" style={{ background: C.darkGreen }}>
            <p className="font-serif font-bold" style={{ color: C.cream }}>{caseFile.child_name}'s Case</p>
            <p className="text-xs mt-1" style={{ color: C.lightGreen }}>{caseFile.case_type.charAt(0).toUpperCase() + caseFile.case_type.slice(1)} Case</p>
          </div>
          
          <div className="p-4 space-y-3" style={{ background: "#fff" }}>
            {caseFile.description && (
              <p className="text-xs leading-relaxed" style={{ color: "#3a3028" }}>{caseFile.description}</p>
            )}
            
            {caseFile.case_number && (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>📋</span>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Case #{caseFile.case_number}</p>
              </div>
            )}

            {caseFile.next_milestone && (
              <div className="rounded-xl p-2.5" style={{ background: C.cream }}>
                <p className="text-[10px] font-bold" style={{ color: C.brown }}>Next Milestone</p>
                <p className="text-xs mt-0.5" style={{ color: C.darkGreen }}>{caseFile.next_milestone}</p>
                {daysUntilMilestone && (
                  <p className="text-[10px] mt-1" style={{ color: C.midGreen }}>
                    {daysUntilMilestone > 0 ? `in ${daysUntilMilestone} days` : "TODAY"}
                  </p>
                )}
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
                <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{teamCount}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Team</p>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
                <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{docCount}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Documents</p>
              </div>
              <div className="rounded-lg p-2 text-center" style={{ background: C.offWhite }}>
                <p className="text-lg font-bold" style={{ color: C.darkGreen }}>{noteCount}</p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Notes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/case-status-report/${caseId}`}
            className="flex items-center justify-center gap-1 py-3 rounded-xl font-bold text-xs"
            style={{ background: C.gold, color: "#fff", textDecoration: "none" }}
          >
            <Download size={14} /> Report
          </Link>
          <Link
            to={`/schedule-family-meeting/${caseId}`}
            className="flex items-center justify-center gap-1 py-3 rounded-xl font-bold text-xs"
            style={{ background: C.midGreen, color: "#fff", textDecoration: "none" }}
          >
            <Users size={14} /> Meeting
          </Link>
        </div>

        {/* Emergency alert — full width */}
        <EmergencyAlertButton
          variant="compact"
          caseId={caseId}
          caseName={caseFile.child_name}
          childName={caseFile.child_name}
        />

        {/* Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: C.cream }}>
          {["overview", "timeline", "team", "documents", "tasks", "notes"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-xs font-bold capitalize border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? C.darkGreen : "transparent",
                color: activeTab === tab ? C.darkGreen : C.mutedText,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "timeline" && (
          <CourtCaseTimeline caseId={caseId} caseFile={caseFile} user={user} />
        )}

        {activeTab === "overview" && (
          <div className="space-y-4">
            {caseFile.status && (
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>STATUS</p>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full capitalize" style={{ 
                  background: caseFile.status === "active" ? "#EAF4EA" : C.cream,
                  color: caseFile.status === "active" ? C.midGreen : C.brown,
                }}>
                  {caseFile.status}
                </span>
              </div>
            )}
            
            {caseFile.key_issues && caseFile.key_issues.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
                <p className="text-[10px] font-bold mb-2" style={{ color: C.mutedText }}>KEY ISSUES</p>
                <div className="space-y-1">
                  {caseFile.key_issues.map((issue, idx) => (
                    <p key={idx} className="text-xs" style={{ color: C.darkGreen }}>• {issue}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "team" && (
          <div className="space-y-3">
            {caseFile.team_members && caseFile.team_members.length > 0 ? (
              caseFile.team_members.map(member => (
                <div key={member.id} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                  <p className="text-xs font-bold" style={{ color: C.darkGreen }}>{member.name}</p>
                  <p className="text-[10px]" style={{ color: C.mutedText }}>{member.role}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.mutedText }}>{member.email}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-center" style={{ color: C.mutedText }}>No team members assigned yet</p>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div key={refreshKey}>
            <DocumentManager 
              caseId={caseId} 
              caseFile={caseFile} 
              user={user}
              onRefresh={() => setRefreshKey(prev => prev + 1)}
            />
          </div>
        )}

        {activeTab === "tasks" && (
          <TaskManager 
            caseId={caseId} 
            caseFile={caseFile} 
            user={user}
            onRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            {!showNoteForm && !showVoiceRecorder ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
                >
                  <Plus size={16} /> Add Note
                </button>
                <button
                  onClick={() => setShowVoiceRecorder(true)}
                  className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "#FDECEC", color: "#C0392B", border: "2px solid #F5BEBE", cursor: "pointer" }}
                >
                  🎙️ Voice Note
                </button>
              </div>
            ) : showVoiceRecorder ? (
              <VoiceNoteRecorder
                onNoteReady={(ai) => {
                  setNewNote({ title: ai.title || "", body: ai.body || "", note_type: ai.note_type || "update" });
                  setShowVoiceRecorder(false);
                  setShowNoteForm(true);
                }}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            ) : (
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1.5px solid ${C.midGreen}` }}>
                <select
                  value={newNote.note_type}
                  onChange={e => setNewNote({ ...newNote, note_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs border mb-2 outline-none"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                >
                  <option value="update">Update</option>
                  <option value="concern">Concern</option>
                  <option value="win">Win</option>
                  <option value="action_item">Action Item</option>
                  <option value="meeting_notes">Meeting Notes</option>
                </select>
                
                <input
                  placeholder="Title (optional)"
                  value={newNote.title}
                  onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs border outline-none mb-2"
                  style={{ borderColor: C.cream, background: C.offWhite }}
                />
                
                <textarea
                  placeholder="Write your note here..."
                  value={newNote.body}
                  onChange={e => setNewNote({ ...newNote, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs border outline-none resize-none mb-2"
                  style={{ borderColor: C.cream, background: C.offWhite, minHeight: 100 }}
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 py-2 rounded-lg font-bold text-xs"
                    style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="py-2 px-4 rounded-lg font-bold text-xs"
                    style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {notes.map(note => (
              <div key={note.id} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: C.offWhite, color: C.darkGreen }}>
                      {note.note_type.toUpperCase()}
                    </span>
                    <p className="text-xs font-bold mt-1" style={{ color: C.darkGreen }}>{note.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded hover:opacity-70"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 size={14} color={C.mutedText} />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{note.body}</p>
                <p className="text-[10px] mt-2" style={{ color: C.mutedText }}>
                  {note.author_name} • {new Date(note.created_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
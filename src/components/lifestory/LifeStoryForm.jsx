import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { ENTRY_TYPES } from "@/pages/ChildLifeStory";
import { Image, Mic, NotebookText, Upload, X } from "lucide-react";

const TONES = ["joyful", "hopeful", "neutral", "bittersweet", "difficult", "scary"];

const BLANK = {
  entry_type: "milestone", title: "", date: "",
  age_at_event: "", location: "", people_involved: "",
  description: "", journal_entry: "", linked_milestone: "", emotional_tone: "neutral",
  photo_url: "", photo_urls: [], voice_note_url: "", voice_note_name: "", document_url: "", is_private: true,
  is_sensitive: false, caregiver_notes: "",
};

export default function LifeStoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function uploadFile(file, field, setUploading) {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    f(field, file_url);
    setUploading(false);
  }

  async function uploadPhoto(file) {
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_urls: [...(prev.photo_urls || []), file_url], photo_url: prev.photo_url || file_url }));
    setUploadingPhoto(false);
  }

  async function uploadVoiceNote(file) {
    setUploadingVoice(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, voice_note_url: file_url, voice_note_name: file.name }));
    setUploadingVoice(false);
  }

  function removePhoto(url) {
    setForm(prev => {
      const nextPhotos = (prev.photo_urls || []).filter(photo => photo !== url);
      return { ...prev, photo_urls: nextPhotos, photo_url: prev.photo_url === url ? nextPhotos[0] || "" : prev.photo_url };
    });
  }

  async function handleSubmit() {
    if (!form.title || !form.date) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
      <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
        {initial ? "Edit Event" : "New Life Event"}
      </p>

      {/* Type selector */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>EVENT TYPE</p>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(ENTRY_TYPES).map(([key, t]) => (
            <button key={key} onClick={() => f("entry_type", key)}
              className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold"
              style={{
                background: form.entry_type === key ? t.color + "20" : C.offWhite,
                color: form.entry_type === key ? t.color : C.darkGreen,
                border: `1.5px solid ${form.entry_type === key ? t.color : C.cream}`,
                cursor: "pointer",
              }}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <input placeholder="Event title *" value={form.title} onChange={e => f("title", e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DATE *</p>
          <input type="date" value={form.date} onChange={e => f("date", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
        </div>
        <input placeholder="Age at event" value={form.age_at_event} onChange={e => f("age_at_event", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none self-end" style={{ borderColor: C.cream, background: C.offWhite }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Location / City" value={form.location} onChange={e => f("location", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
        <input placeholder="People involved" value={form.people_involved} onChange={e => f("people_involved", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />
      </div>

      <input placeholder="Linked milestone or event (optional)" value={form.linked_milestone || ""} onChange={e => f("linked_milestone", e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: C.cream, background: C.offWhite }} />

      <textarea placeholder="Describe what happened, why it matters, how they felt..." value={form.description}
        onChange={e => f("description", e.target.value)} rows={3}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
        style={{ borderColor: C.cream, background: C.offWhite }} />

      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}><NotebookText size={12} className="inline mr-1" />PRIVATE JOURNAL ENTRY</p>
        <textarea placeholder="Add a fuller private story, memory, reflection, or note for future reference..." value={form.journal_entry || ""}
          onChange={e => f("journal_entry", e.target.value)} rows={4}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ borderColor: C.cream, background: C.offWhite }} />
      </div>

      {/* Emotional tone */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>EMOTIONAL TONE</p>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map(t => (
            <button key={t} onClick={() => f("emotional_tone", t)}
              className="px-3 py-1 rounded-full text-xs font-bold capitalize"
              style={{
                background: form.emotional_tone === t ? C.darkGreen : C.offWhite,
                color: form.emotional_tone === t ? "#fff" : C.darkGreen,
                border: `1px solid ${form.emotional_tone === t ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Photo gallery upload */}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}><Image size={12} className="inline mr-1" />PHOTOS</p>
        {(form.photo_urls?.length > 0 || form.photo_url) && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {Array.from(new Set([...(form.photo_urls || []), form.photo_url].filter(Boolean))).map(url => (
              <div key={url} className="relative">
                <img src={url} alt="Life story memory" className="w-full h-24 object-cover rounded-xl" />
                <button onClick={() => removePhoto(url)} className="absolute -top-1 -right-1 rounded-full p-1" style={{ background: "#B84C2A", border: "none" }}>
                  <X size={10} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold w-fit"
          style={{ background: C.offWhite, border: `1.5px dashed ${C.midGreen}`, color: C.midGreen }}>
          <Upload size={14} />
          {uploadingPhoto ? "Uploading…" : "Upload Photo"}
          <input type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files[0] && uploadPhoto(e.target.files[0])} />
        </label>
      </div>

      {/* Voice note upload */}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}><Mic size={12} className="inline mr-1" />VOICE NOTE</p>
        {form.voice_note_url ? (
          <div className="space-y-2 rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <audio controls src={form.voice_note_url} className="w-full" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold truncate" style={{ color: C.darkGreen }}>{form.voice_note_name || "Voice note attached"}</p>
              <button onClick={() => { f("voice_note_url", ""); f("voice_note_name", ""); }} className="text-[10px]" style={{ background: "none", border: "none", color: C.mutedText, cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold w-fit"
            style={{ background: C.offWhite, border: `1.5px dashed ${C.gold}`, color: C.brown }}>
            <Upload size={14} />
            {uploadingVoice ? "Uploading…" : "Upload Voice Note"}
            <input type="file" accept="audio/*,.m4a,.mp3,.wav,.webm" className="hidden"
              onChange={e => e.target.files[0] && uploadVoiceNote(e.target.files[0])} />
          </label>
        )}
      </div>

      {/* Document upload */}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DOCUMENT (optional)</p>
        {form.document_url ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>📄 Document attached</p>
            <button onClick={() => f("document_url", "")}
              className="text-[10px]" style={{ background: "none", border: "none", color: C.mutedText, cursor: "pointer" }}>
              Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold"
            style={{ background: C.offWhite, border: `1.5px dashed ${C.cream}`, color: C.mutedText }}>
            <Upload size={14} />
            {uploadingDoc ? "Uploading…" : "Attach Document / PDF"}
            <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden"
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], "document_url", setUploadingDoc)} />
          </label>
        )}
      </div>

      {/* Sensitive event warning */}
      {ENTRY_TYPES[form.entry_type]?.sensitive && (
        <div className="rounded-xl p-3" style={{ background: "#FEF3EE", border: "1px solid #F4C9B8" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#B84C2A" }}>🔒 Sensitive Event</p>
          <p className="text-[11px] leading-relaxed" style={{ color: "#B84C2A" }}>
            This entry type is marked sensitive. It will be flagged in the timeline and kept private by default. Use this space to document the child's history accurately — this record can support therapy, court proceedings, and future care planning.
          </p>
        </div>
      )}

      {/* Caregiver notes (private) */}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>PRIVATE CAREGIVER NOTES (not shown to child)</p>
        <textarea placeholder="Add private notes for your records, therapist, or caseworker..." value={form.caregiver_notes}
          onChange={e => f("caregiver_notes", e.target.value)} rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ borderColor: C.cream, background: C.offWhite }} />
      </div>

      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
          <input type="checkbox" checked={form.is_private} onChange={e => f("is_private", e.target.checked)} />
          Private (caregiver only)
        </label>
        <label className="flex items-center gap-2 text-xs" style={{ color: "#B84C2A" }}>
          <input type="checkbox" checked={form.is_sensitive} onChange={e => f("is_sensitive", e.target.checked)} />
          Mark as sensitive
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving || !form.title || !form.date}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
          {saving ? "Saving…" : "Save Event"}
        </button>
        <button onClick={onCancel}
          className="py-2.5 px-4 rounded-xl font-bold text-sm"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
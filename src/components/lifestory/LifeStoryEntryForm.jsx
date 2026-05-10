import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Upload, X } from "lucide-react";

const ENTRY_TYPES = [
  { value: "placement", label: "Placement", emoji: "🏠" },
  { value: "school", label: "School Change", emoji: "🏫" },
  { value: "milestone", label: "Milestone", emoji: "⭐" },
  { value: "medical", label: "Medical Event", emoji: "🏥" },
  { value: "family", label: "Family Moment", emoji: "❤️" },
  { value: "loss", label: "Loss / Grief", emoji: "🕯️" },
  { value: "achievement", label: "Achievement", emoji: "🏅" },
  { value: "other", label: "Other", emoji: "📌" },
];

const BLANK = {
  entry_type: "placement",
  title: "",
  date: "",
  date_approximate: false,
  age_at_event: "",
  description: "",
  location: "",
  people_involved: "",
  photo_url: "",
  document_url: "",
  document_name: "",
  is_positive: true,
  private_note: "",
};

export default function LifeStoryEntryForm({ entry, onSave, onCancel }) {
  const [form, setForm] = useState(entry ? {
    entry_type: entry.entry_type || "placement",
    title: entry.title || "",
    date: entry.date || "",
    date_approximate: entry.date_approximate || false,
    age_at_event: entry.age_at_event || "",
    description: entry.description || "",
    location: entry.location || "",
    people_involved: entry.people_involved || "",
    photo_url: entry.photo_url || "",
    document_url: entry.document_url || "",
    document_name: entry.document_name || "",
    is_positive: entry.is_positive !== false,
    private_note: entry.private_note || "",
  } : BLANK);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    f("photo_url", file_url);
    setUploadingPhoto(false);
  }

  async function handleDocUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    f("document_url", file_url);
    f("document_name", file.name);
    setUploadingDoc(false);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: `1.5px solid ${C.midGreen}` }}>
      <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>
        {entry ? "Edit Event" : "New Life Event"}
      </p>

      {/* Event type */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>EVENT TYPE</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ENTRY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => f("entry_type", t.value)}
              className="flex flex-col items-center gap-0.5 py-2 rounded-xl text-[9px] font-bold"
              style={{
                background: form.entry_type === t.value ? C.darkGreen : C.offWhite,
                color: form.entry_type === t.value ? "#fff" : C.darkGreen,
                border: `1px solid ${form.entry_type === t.value ? C.darkGreen : C.cream}`,
                cursor: "pointer",
              }}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <input
        placeholder="Event title *  (e.g. 'Moved to the Johnson family')"
        value={form.title}
        onChange={e => f("title", e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
        style={{ borderColor: C.cream, background: C.offWhite }}
      />

      {/* Date + age */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>DATE</p>
          <input
            type="date"
            value={form.date}
            onChange={e => f("date", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
          <label className="flex items-center gap-1.5 mt-1 text-[10px]" style={{ color: C.mutedText }}>
            <input type="checkbox" checked={form.date_approximate} onChange={e => f("date_approximate", e.target.checked)} />
            Approximate date
          </label>
        </div>
        <div>
          <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>AGE AT EVENT</p>
          <input
            placeholder="e.g. 3 years old"
            value={form.age_at_event}
            onChange={e => f("age_at_event", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: C.cream, background: C.offWhite }}
          />
        </div>
      </div>

      {/* Location + people */}
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Location / City"
          value={form.location}
          onChange={e => f("location", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ borderColor: C.cream, background: C.offWhite }}
        />
        <input
          placeholder="People involved"
          value={form.people_involved}
          onChange={e => f("people_involved", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ borderColor: C.cream, background: C.offWhite }}
        />
      </div>

      {/* Description */}
      <textarea
        placeholder="Tell the story of this moment — what happened, how it felt, what it meant..."
        value={form.description}
        onChange={e => f("description", e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
        style={{ borderColor: C.cream, background: C.offWhite }}
      />

      {/* Positive toggle */}
      <div className="flex gap-2">
        {[{ val: true, label: "✨ Positive / Celebratory" }, { val: false, label: "🕯️ Difficult / Loss" }].map(opt => (
          <button
            key={String(opt.val)}
            onClick={() => f("is_positive", opt.val)}
            className="flex-1 py-2 rounded-xl text-xs font-bold"
            style={{
              background: form.is_positive === opt.val ? (opt.val ? "#EAF4EA" : "#FEF3EE") : C.offWhite,
              color: form.is_positive === opt.val ? (opt.val ? C.midGreen : "#B84C2A") : C.mutedText,
              border: `1px solid ${form.is_positive === opt.val ? (opt.val ? C.midGreen : "#F4C9B8") : C.cream}`,
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Photo upload */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>PHOTO (OPTIONAL)</p>
        {form.photo_url ? (
          <div className="relative inline-block">
            <img src={form.photo_url} alt="Event" className="w-24 h-24 rounded-xl object-cover" />
            <button
              onClick={() => f("photo_url", "")}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#B84C2A", border: "none", cursor: "pointer" }}
            >
              <X size={10} color="#fff" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer w-fit"
            style={{ background: C.offWhite, border: `1.5px dashed ${C.cream}` }}>
            <Upload size={13} color={C.midGreen} />
            <span className="text-xs font-bold" style={{ color: C.midGreen }}>
              {uploadingPhoto ? "Uploading…" : "Upload Photo"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
          </label>
        )}
      </div>

      {/* Document upload */}
      <div>
        <p className="text-[10px] font-bold mb-1.5" style={{ color: C.mutedText }}>ATTACH DOCUMENT (OPTIONAL)</p>
        {form.document_url ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
            <span className="text-sm">📄</span>
            <span className="text-xs flex-1 truncate" style={{ color: C.darkGreen }}>{form.document_name}</span>
            <button onClick={() => { f("document_url", ""); f("document_name", ""); }}
              style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={12} color={C.mutedText} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer w-fit"
            style={{ background: C.offWhite, border: `1.5px dashed ${C.cream}` }}>
            <Upload size={13} color={C.brown} />
            <span className="text-xs font-bold" style={{ color: C.brown }}>
              {uploadingDoc ? "Uploading…" : "Attach Document"}
            </span>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleDocUpload} disabled={uploadingDoc} />
          </label>
        )}
      </div>

      {/* Private note */}
      <div>
        <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>🔒 PRIVATE CAREGIVER NOTE (NOT SHOWN TO CHILD)</p>
        <textarea
          placeholder="Notes for yourself — context, concerns, or things to discuss with a therapist later..."
          value={form.private_note}
          onChange={e => f("private_note", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ borderColor: "#F4C9B8", background: "#FEF3EE" }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={saving || !form.title}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: form.title ? C.darkGreen : C.cream, color: form.title ? "#fff" : C.mutedText, border: "none", cursor: form.title ? "pointer" : "default" }}
        >
          {saving ? "Saving…" : entry ? "Save Changes" : "Add to Story"}
        </button>
        <button
          onClick={onCancel}
          className="py-2.5 px-4 rounded-xl font-bold text-sm"
          style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
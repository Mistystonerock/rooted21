import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import MobileHeader from "@/components/mobile/MobileHeader";
import CommunicationAnalysisPanel from "@/components/communication-journal/CommunicationAnalysisPanel";
import CommunicationJournalEntryCard from "@/components/communication-journal/CommunicationJournalEntryCard";
import { C } from "@/lib/rooted-constants";
import { Loader2, MessageSquarePlus, ShieldCheck } from "lucide-react";

const ENTRY_TYPES = [
  ["daily_update", "Daily update"],
  ["milestone", "Milestone"],
  ["challenge", "Challenge"],
  ["schedule", "Schedule"],
  ["school", "School"],
  ["medical", "Medical"],
  ["visitation", "Visitation"],
  ["court_related", "Court-related"],
  ["other", "Other"],
];

const blankForm = {
  partnership_id: "none",
  child_name: "",
  entry_date: new Date().toISOString().slice(0, 10),
  interaction_type: "daily_update",
  title: "",
  neutral_summary: "",
  milestone: "",
  challenge: "",
  draft_message: "",
  visibility: "shared",
};

export default function CommunicationJournal() {
  const [user, setUser] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const me = await base44.auth.me();
    const [partnershipList, journalEntries] = await Promise.all([
      base44.entities.CoParentingPartnership.list("-created_date", 200),
      base44.entities.CommunicationJournalEntry.list("-entry_date", 300),
    ]);
    setUser(me);
    setPartnerships(partnershipList.filter(item => item.status !== "inactive"));
    setEntries(journalEntries);
    setLoading(false);
  }

  const selectedPartnership = useMemo(() => partnerships.find(item => item.id === form.partnership_id), [partnerships, form.partnership_id]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function analyzeTone() {
    const text = form.draft_message || form.neutral_summary || form.challenge;
    if (!text.trim()) return;
    setAnalyzing(true);
    const response = await base44.functions.invoke("analyzeCommunicationText", {
      text,
      context: "shared co-parent/caregiver Communication Journal entry",
    });
    setAnalysis(response.data);
    setAnalyzing(false);
  }

  async function saveEntry(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.neutral_summary.trim()) return;

    setSaving(true);
    const sharedEmails = selectedPartnership && form.visibility === "shared"
      ? [selectedPartnership.parent_1_email, selectedPartnership.parent_2_email].filter(Boolean)
      : [];

    const created = await base44.entities.CommunicationJournalEntry.create({
      ...form,
      partnership_id: form.partnership_id === "none" ? "" : form.partnership_id,
      owner_email: user.email,
      shared_with: sharedEmails,
      child_name: form.child_name || selectedPartnership?.child_name || "",
      ai_risk_level: analysis?.risk_level || "",
      ai_tone: analysis?.overall_tone || "",
      court_readiness_score: analysis?.court_readiness_score,
      ai_summary: analysis?.summary || "",
      flagged_phrases: analysis?.flagged_phrases || [],
      suggested_rewrite: analysis?.rewrite || "",
      communication_tips: analysis?.communication_tips || [],
    });

    setEntries(prev => [created, ...prev]);
    setForm(blankForm);
    setAnalysis(null);
    setSaving(false);
  }

  if (loading) {
    return <div className="min-h-screen" style={{ background: C.offWhite }}><MobileHeader title="Communication Journal" backTo="/dashboard" /><div className="flex justify-center py-12"><Loader2 className="animate-spin" color={C.darkGreen} /></div></div>;
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Communication Journal" subtitle="Neutral shared notes and AI conflict-reduction support" backTo="/dashboard" />
      <main className="mx-auto max-w-[620px] space-y-5 px-4 py-5 pb-32">
        <section className="rounded-3xl p-5 shadow-sm" style={{ background: C.darkGreen }}>
          <p className="font-serif text-2xl font-black" style={{ color: C.cream }}>Shared, neutral communication space</p>
          <p className="mt-2 text-sm leading-6" style={{ color: C.lightGreen }}>Log daily interactions, milestones, and challenges. AI flags tense wording and suggests child-focused re-phrasing.</p>
        </section>

        <section className="rounded-3xl border p-4 text-xs leading-6" style={{ background: "#fff", borderColor: C.cream, color: C.mutedText }}>
          <p className="mb-1 flex items-center gap-2 font-black" style={{ color: C.darkGreen }}><ShieldCheck size={15} /> Neutral-space reminder</p>
          Keep entries factual, brief, child-focused, and respectful. This tool supports communication and documentation; it does not provide legal advice.
        </section>

        <form onSubmit={saveEntry} className="space-y-3 rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <p className="flex items-center gap-2 font-serif text-lg font-bold" style={{ color: C.darkGreen }}><MessageSquarePlus size={18} /> New journal entry</p>

          <div className="grid gap-2 sm:grid-cols-2">
            <select value={form.partnership_id} onChange={e => update("partnership_id", e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>
              <option value="none">No linked co-parenting partnership</option>
              {partnerships.map(item => <option key={item.id} value={item.id}>{item.child_name} · {item.parent_1_name || item.parent_1_email} / {item.parent_2_name || item.parent_2_email}</option>)}
            </select>
            <input type="date" value={form.entry_date} onChange={e => update("entry_date", e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
            <select value={form.interaction_type} onChange={e => update("interaction_type", e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>{ENTRY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={form.visibility} onChange={e => update("visibility", e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}><option value="shared">Shared with linked caregiver</option><option value="private">Private note</option></select>
          </div>

          <input value={form.child_name} onChange={e => update("child_name", e.target.value)} placeholder="Child name" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input required value={form.title} onChange={e => update("title", e.target.value)} placeholder="Short title" className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <textarea required value={form.neutral_summary} onChange={e => update("neutral_summary", e.target.value)} placeholder="Neutral factual summary: what happened, when, and what the child needs next..." className="min-h-24 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <textarea value={form.milestone} onChange={e => update("milestone", e.target.value)} placeholder="Optional milestone or positive moment..." className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <textarea value={form.challenge} onChange={e => update("challenge", e.target.value)} placeholder="Optional challenge, stated calmly and factually..." className="min-h-20 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <textarea value={form.draft_message} onChange={e => update("draft_message", e.target.value)} placeholder="Optional: paste a message draft for AI tone check before sending..." className="min-h-24 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={analyzeTone} disabled={analyzing} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}>{analyzing ? "Checking…" : "Check tone with AI"}</button>
            <button type="submit" disabled={saving || !form.title.trim() || !form.neutral_summary.trim()} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}>{saving ? "Saving…" : "Save entry"}</button>
          </div>
        </form>

        <CommunicationAnalysisPanel analysis={analysis} />

        <section className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: C.mutedText }}>Journal entries</p>
          {entries.length === 0 ? <div className="rounded-3xl border bg-white p-6 text-center text-sm" style={{ borderColor: C.cream, color: C.mutedText }}>No communication journal entries yet.</div> : entries.map(entry => <CommunicationJournalEntryCard key={entry.id} entry={entry} userEmail={user.email} />)}
        </section>
      </main>
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { COURT_DOCUMENT_FOLDERS, COURT_REMINDER_TYPES } from "@/lib/court-packet-data";
import { C } from "@/lib/rooted-constants";
import { CalendarPlus, ExternalLink, FileText, FolderOpen, MessageCircle, PhoneCall, Printer, ShieldAlert } from "lucide-react";

function Section({ title, children, defaultOpen = false }) {
  return <details open={defaultOpen} className="rounded-3xl border bg-white p-4 shadow-sm" style={{ borderColor: C.cream }}><summary className="cursor-pointer font-serif text-base font-bold" style={{ color: C.darkGreen }}>{title}</summary><div className="mt-3 text-sm leading-6" style={{ color: C.darkText }}>{children}</div></details>;
}

function BulletList({ items }) {
  return <ul className="space-y-2">{items.map(item => <li key={item} className="rounded-2xl p-3 text-sm" style={{ background: C.offWhite }}>• {item}</li>)}</ul>;
}

function LinkList({ links = [] }) {
  if (!links.length) return <p className="text-xs" style={{ color: C.mutedText }}>No verified official form link has been added for this packet yet. Check the official court website or call the clerk.</p>;
  return <div className="space-y-2">{links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl p-3 text-sm font-bold no-underline" style={{ background: C.offWhite, color: C.darkGreen }}><span>{link.label}</span><ExternalLink size={14} /></a>)}</div>;
}

export default function CourtPacketGuide({ packet, user }) {
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState({ type: "court date", date: "", time: "", title: `${packet.title} reminder` });

  async function saveReminder() {
    if (!reminder.date || !user?.email) return;
    await base44.entities.CareCalendarEvent.create({
      title: reminder.title || `${packet.title} reminder`,
      event_type: "court_date",
      date: reminder.date,
      time: reminder.time,
      family_email: user.email,
      added_by_email: user.email,
      added_by_name: user.full_name || user.email,
      notes: `${reminder.type} · Created from Court Packet Helper for ${packet.title}`,
      status: "pending",
      source_type: "court_packet_helper",
      child_name: "",
    });
    alert("Reminder added to your Care Calendar.");
  }

  function printChecklist() {
    window.print();
  }

  const moxiePrompt = `I can explain court words and help you organize, but I am not an attorney and cannot give legal advice. Help me understand the ${packet.title} packet in plain language and make a document checklist.`;

  return (
    <div className="space-y-4 print:bg-white">
      {packet.emergency && <section className="rounded-3xl border p-4" style={{ background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" }}><p className="flex items-center gap-2 font-black"><ShieldAlert size={18} /> Emergency safety warning</p><p className="mt-2 text-sm leading-6">{packet.warning}</p><a href="/sos" className="mt-3 inline-flex rounded-xl px-3 py-2 text-xs font-bold no-underline" style={{ background: "#9a3412", color: "#fff" }}>Open SOS / safety resources</a></section>}

      <Section title="1. What this packet may be used for" defaultOpen><p>{packet.usedFor}</p></Section>
      <Section title="2. Required verification before filing" defaultOpen>
        <p>{packet.warning}</p>
        <div className="mt-3 rounded-2xl p-3 text-xs font-bold" style={{ background: "#fff7ed", color: "#9a3412" }}>
          This packet does not include every required filing form. Forms and steps vary by county, court, case type, and individual situation.
        </div>
      </Section>
      <Section title="3. Common forms that may apply" defaultOpen><BulletList items={packet.forms} /></Section>
      <Section title="4. Official court links when verified"><LinkList links={packet.officialLinks} /></Section>
      <Section title="5. Local county form requirements when available"><BulletList items={packet.localRequirements || []} /></Section>
      <Section title="6. Documents to gather"><BulletList items={packet.documents} /></Section>
      <Section title="7. Questions to ask the court clerk or legal aid"><BulletList items={packet.questions} /></Section>
      <Section title="8. Service/notice requirements reminder"><p>{packet.service}</p></Section>
      <Section title="9. Filing fee / fee waiver reminder"><p>{packet.fees}</p></Section>
      <Section title="10. Hearing preparation checklist"><BulletList items={packet.hearing} /></Section>
      <Section title="11. Document checklist"><BulletList items={packet.evidence} /></Section>
      <Section title="12. Call before filing reminder" defaultOpen>
        <div className="flex gap-3 rounded-2xl p-3" style={{ background: "#F0F7F2", color: C.darkGreen }}>
          <PhoneCall size={18} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-6 font-bold">{packet.callReminder}</p>
        </div>
      </Section>
      <Section title="13. Verification status and last verified date" defaultOpen>
        <p><strong>Status:</strong> {packet.verification_status || "needs verification"}</p>
        <p className="mt-2"><strong>Last verified:</strong> {packet.verified_at || "Not verified"}</p>
      </Section>

      <Section title="14. Deadline tracker and court date reminder" defaultOpen>
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={reminder.type} onChange={e => setReminder(prev => ({ ...prev, type: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }}>{COURT_REMINDER_TYPES.map(type => <option key={type}>{type}</option>)}</select>
          <input value={reminder.title} onChange={e => setReminder(prev => ({ ...prev, title: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input type="date" value={reminder.date} onChange={e => setReminder(prev => ({ ...prev, date: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
          <input placeholder="Time, if known" value={reminder.time} onChange={e => setReminder(prev => ({ ...prev, time: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} />
        </div>
        <button type="button" onClick={saveReminder} className="mt-3 rounded-xl px-4 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}><CalendarPlus size={14} className="mr-1" /> Add reminder</button>
      </Section>

      <Section title="15. Notes section" defaultOpen><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write calm notes, questions, deadlines, or next steps here..." className="min-h-32 w-full rounded-2xl border p-3 text-sm" style={{ borderColor: C.cream }} /></Section>

      <Section title="16. Document Vault folders and uploads" defaultOpen>
        <p className="mb-3 text-xs" style={{ color: C.mutedText }}>Only upload documents you feel safe storing here. Do not upload Social Security numbers or highly sensitive records unless secure storage is confirmed.</p>
        <div className="mb-3 flex flex-wrap gap-2">{COURT_DOCUMENT_FOLDERS.map(folder => <span key={folder} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.offWhite, color: C.darkGreen }}><FolderOpen size={12} className="mr-1" /> {folder}</span>)}</div>
        <a href="/documents" className="inline-flex rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.darkGreen, color: C.cream }}><FileText size={14} className="mr-1" /> Open Document Vault</a>
      </Section>

      <Section title="17. Print, ask Moxie, and connect to official resources" defaultOpen>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={printChecklist} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: C.cream, color: C.darkGreen, border: "none" }}><Printer size={14} className="mr-1" /> Print checklist</button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(moxiePrompt)} className="rounded-xl px-4 py-2 text-xs font-bold" style={{ background: C.darkGreen, color: C.cream, border: "none" }}><MessageCircle size={14} className="mr-1" /> Copy Moxie prompt</button>
          <a href="/resources" className="rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>Official resources</a>
          <a href="/family-safety-crisis-plan" className="rounded-xl px-4 py-2 text-xs font-bold no-underline" style={{ background: C.offWhite, color: C.darkGreen, border: `1px solid ${C.cream}` }}>Support plan</a>
        </div>
        <p className="mt-3 text-xs italic" style={{ color: C.mutedText }}>Moxie disclaimer: “I can explain court words and help you organize, but I am not an attorney and cannot give legal advice.”</p>
      </Section>
    </div>
  );
}
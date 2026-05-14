import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import CommunicationTimeline from "@/components/communications/CommunicationTimeline";
import CommunicationFilters from "@/components/communications/CommunicationFilters";
import AgencyEmailLogForm from "@/components/communications/AgencyEmailLogForm";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail, MessageSquare, NotebookPen } from "lucide-react";

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function normalizeDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export default function CommunicationsPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ search: "", type: "all", range: "all" });
  const [coParentMessages, setCoParentMessages] = useState([]);
  const [secureMessages, setSecureMessages] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [agencyEmails, setAgencyEmails] = useState([]);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async me => {
      setUser(me);
      const [caseList, partnerships, secureList, agencyList] = await Promise.all([
        base44.entities.CaseFile.filter({ parent_email: me.email }, "-created_date", 100),
        base44.entities.CoParentingPartnership.list("-created_date", 100),
        base44.entities.SecureMessage.filter({ family_email: me.email }, "created_date", 500),
        base44.entities.AgencyEmailCorrespondence.filter({ owner_email: me.email }, "-correspondence_date", 500),
      ]);

      const myPartnerships = partnerships.filter(p => p.parent_1_email === me.email || p.parent_2_email === me.email);
      const [messageGroups, noteGroups] = await Promise.all([
        Promise.all(myPartnerships.map(p => base44.entities.CoParentingMessage.filter({ partnership_id: p.id }, "created_date", 500).then(messages => ({ partnership: p, messages })))),
        Promise.all(caseList.map(c => base44.entities.CaseNote.filter({ case_id: c.id }, "created_date", 500).then(notes => ({ caseFile: c, notes })))),
      ]);

      setCases(caseList);
      setCoParentMessages(messageGroups.flatMap(group => group.messages.map(message => ({ ...message, partnership: group.partnership }))));
      setCaseNotes(noteGroups.flatMap(group => group.notes.filter(note => note.note_type === "meeting_notes").map(note => ({ ...note, caseFile: group.caseFile }))));
      setSecureMessages(secureList);
      setAgencyEmails(agencyList);
      setLoading(false);
    });
  }, []);

  const timelineItems = useMemo(() => {
    const items = [
      ...coParentMessages.map(msg => ({
        id: msg.id,
        type: "coparent",
        typeLabel: "Co-parent message",
        date: msg.created_date,
        dateLabel: formatDate(msg.created_date),
        title: msg.topic ? `${msg.topic} conversation` : "Co-parent message",
        participants: `${msg.partnership?.parent_1_name || msg.partnership?.parent_1_email || "Parent"} ↔ ${msg.partnership?.parent_2_name || msg.partnership?.parent_2_email || "Parent"}`,
        body: msg.body,
        meta: msg.partnership?.child_name ? `Child: ${msg.partnership.child_name}` : "",
      })),
      ...secureMessages.map(msg => ({
        id: msg.id,
        type: "secure_message",
        typeLabel: "Professional message",
        date: msg.created_date,
        dateLabel: formatDate(msg.created_date),
        title: `Secure message with ${msg.professional_email}`,
        participants: `${msg.sender_name || msg.sender_email} · ${msg.sender_role || "participant"}`,
        body: msg.body,
        meta: msg.read ? "Read" : "Unread",
      })),
      ...agencyEmails.map(email => ({
        id: email.id,
        type: "agency_email",
        typeLabel: "Agency email",
        date: email.correspondence_date || email.created_date,
        dateLabel: formatDate(email.correspondence_date || email.created_date),
        title: email.subject,
        participants: `${email.direction === "received" ? "From" : "To"}: ${email.contact_name || email.contact_email || email.agency_name}`,
        body: email.body,
        meta: [email.agency_name, email.child_name].filter(Boolean).join(" · "),
      })),
      ...caseNotes.map(note => ({
        id: note.id,
        type: "meeting_note",
        typeLabel: "Case meeting note",
        date: note.created_date,
        dateLabel: formatDate(note.created_date),
        title: note.title || "Meeting notes",
        participants: `${note.author_name || note.author_email} · ${note.author_role || "case team"}`,
        body: note.body,
        meta: note.caseFile?.child_name ? `Case: ${note.caseFile.child_name}` : "",
      })),
    ];
    return items.sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date));
  }, [coParentMessages, secureMessages, agencyEmails, caseNotes]);

  const filteredItems = useMemo(() => {
    const cutoff = filters.range === "all" ? null : new Date(Date.now() - Number(filters.range) * 86400000);
    const search = filters.search.toLowerCase();
    return timelineItems.filter(item => {
      const typeMatch = filters.type === "all" || item.type === filters.type;
      const dateMatch = !cutoff || normalizeDate(item.date) >= cutoff;
      const searchText = `${item.title} ${item.participants} ${item.body} ${item.meta}`.toLowerCase();
      const searchMatch = !search || searchText.includes(search);
      return typeMatch && dateMatch && searchMatch;
    });
  }, [timelineItems, filters]);

  async function exportPdf() {
    setExporting(true);
    const response = await base44.functions.invoke("exportCommunicationAuditThread", {
      items: filteredItems,
      filtersSummary: `${filters.type} · ${filters.range} · ${filters.search || "no search"}`,
    });
    const binary = atob(response.data.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = response.data.fileName;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const counts = {
    coparent: coParentMessages.length,
    agency: agencyEmails.length,
    secure: secureMessages.length,
    notes: caseNotes.length,
  };

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Communications Portal" subtitle="Court-ready audit trail" backTo="/dashboard" />

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        <section className="rounded-3xl p-5" style={{ background: C.darkGreen }}>
          <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: C.cream }}>Centralized communications</p>
          <h1 className="font-serif font-bold text-2xl mt-2" style={{ color: "#fff" }}>One timeline for every important interaction.</h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.cream }}>
            Co-parent messages, agency email logs, professional messages, and case meeting notes are combined into a single exportable thread for court documentation.
          </p>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Co-parent", value: counts.coparent, icon: MessageSquare }, { label: "Agency emails", value: counts.agency, icon: Mail }, { label: "Professional", value: counts.secure, icon: FileText }, { label: "Meeting notes", value: counts.notes, icon: NotebookPen }].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl p-4" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
                <Icon size={17} color={C.midGreen} />
                <p className="font-serif font-bold text-2xl mt-2" style={{ color: C.darkGreen }}>{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.mutedText }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
            <div className="space-y-4">
              <CommunicationFilters filters={filters} setFilters={setFilters} total={filteredItems.length} />
              <AgencyEmailLogForm user={user} cases={cases} onCreated={email => setAgencyEmails(prev => [email, ...prev])} />
              <Button onClick={exportPdf} disabled={exporting} className="w-full rounded-xl" style={{ background: C.darkGreen, color: "#fff" }}>
                <Download size={15} /> {exporting ? "Exporting…" : "Export audit PDF"}
              </Button>
            </div>
            <CommunicationTimeline items={filteredItems} />
          </div>
        )}

        <div className="pb-8" />
      </main>
    </div>
  );
}
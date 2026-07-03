import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { Phone, Mail, Pencil, Trash2, ShieldAlert, MapPin, MessageSquareText } from "lucide-react";

const METHOD_LABELS = { in_app: "In-App", phone: "Phone", text: "Text", email: "Email" };

function PermChip({ on, icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black"
      style={{ background: on ? `${C.midGreen}22` : C.cream, color: on ? C.darkGreen : C.warmText }}>
      <Icon size={12} /> {label}
    </span>
  );
}

export default function SupportContactCard({ contact, userId, onEdit, onChanged }) {
  async function toggleActive() {
    await base44.entities.SupportContact.update(contact.id, { active: !contact.active, updated_by: userId });
    onChanged();
  }

  async function handleDelete() {
    if (!window.confirm(`Remove ${contact.contact_name} from your support contacts?`)) return;
    await base44.entities.SupportContact.update(contact.id, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      updated_by: userId,
    });
    onChanged();
  }

  return (
    <div className="rounded-3xl p-4 shadow-sm" style={{ background: "#fff", border: `2px solid ${C.cream}`, opacity: contact.active ? 1 : 0.7 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-black leading-tight" style={{ color: C.darkGreen }}>{contact.contact_name}</p>
          {contact.contact_relationship && <p className="text-xs font-bold" style={{ color: C.mutedText }}>{contact.contact_relationship}</p>}
        </div>
        <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ background: `${C.gold}22`, color: C.brown }}>{METHOD_LABELS[contact.preferred_contact_method] || "In-App"}</span>
      </div>

      {(contact.phone_number || contact.email) && (
        <div className="mt-2 space-y-1">
          {contact.phone_number && <a href={`tel:${contact.phone_number}`} className="flex items-center gap-1.5 text-xs font-bold no-underline" style={{ color: C.darkGreen }}><Phone size={13} /> {contact.phone_number}</a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs font-bold no-underline" style={{ color: C.darkGreen }}><Mail size={13} /> {contact.email}</a>}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <PermChip on={contact.can_receive_sos_alerts} icon={ShieldAlert} label="SOS Alerts" />
        <PermChip on={contact.can_receive_gps} icon={MapPin} label="GPS Location" />
        <PermChip on={contact.can_receive_message_details} icon={MessageSquareText} label="Message Details" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: C.cream }}>
        <button type="button" onClick={toggleActive} className="flex items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className="flex items-center rounded-full" style={{ width: 42, height: 24, background: contact.active ? C.midGreen : "#cfc6ba", padding: 3 }}>
            <span className="rounded-full" style={{ width: 18, height: 18, background: "#fff", marginLeft: contact.active ? 18 : 0 }} />
          </span>
          <span className="text-xs font-black" style={{ color: C.mutedText }}>{contact.active ? "Active" : "Inactive"}</span>
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEdit(contact)} className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black"
            style={{ background: C.cream, color: C.darkGreen, border: "none", cursor: "pointer" }}><Pencil size={13} /> Edit</button>
          <button type="button" onClick={handleDelete} className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black"
            style={{ background: "#FEF3EE", color: "#C0392B", border: "none", cursor: "pointer" }}><Trash2 size={13} /> Delete</button>
        </div>
      </div>
    </div>
  );
}
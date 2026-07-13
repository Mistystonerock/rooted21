import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

const DARK = "#5a3d28";
const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const BG = "#faf6f1";
const MUTED = "#8b6f54";

const STATUSES = ["Not Started", "In Progress", "Complete", "Needs Review"];

const DEFAULT_ITEMS = [
  "Connect project to GitHub",
  "Confirm GitHub repository access",
  "Download local backup of code",
  "Save founder story and mission document",
  "Save all app prompts",
  "Save logo and brand assets",
  "Save tour video files",
  "Save voice narration files",
  "Save privacy policy",
  "Save terms of use",
  "Save resource database export",
  "Save user data export plan",
  "Save donation/funding records",
  "Save app screenshots",
  "Confirm domain ownership",
  "Confirm trademark filing status",
  "Confirm LLC/nonprofit status",
  "Confirm attorney review",
  "Confirm data backup schedule"
].map(title => ({
  title,
  item_key: title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
}));

const statusStyles = {
  "Not Started": { background: "#F6EFE5", color: MUTED },
  "In Progress": { background: "#EEF4FF", color: "#315E91" },
  "Complete": { background: "#EAF4EA", color: "#2F7D32" },
  "Needs Review": { background: "#FEF3EE", color: "#9A3412" }
};

export default function ProjectProtectionChecklist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadChecklist(); }, []);

  async function loadChecklist() {
    setLoading(true);
    try {
      const existing = await base44.entities.RootedProtectionChecklistItem.list("item_key", 100);
      const existingKeys = new Set(existing.map(item => item.item_key));
      const missing = DEFAULT_ITEMS.filter(item => !existingKeys.has(item.item_key));

      let created = [];
      if (missing.length) {
        created = await base44.entities.RootedProtectionChecklistItem.bulkCreate(missing.map(item => ({
          ...item,
          status: "Not Started",
          last_updated_date: new Date().toISOString().slice(0, 10)
        })));
      }

      setItems([...existing, ...created].sort((a, b) => DEFAULT_ITEMS.findIndex(item => item.item_key === a.item_key) - DEFAULT_ITEMS.findIndex(item => item.item_key === b.item_key)));
    } catch (_e) {
      setItems([]);
    }
    setLoading(false);
  }

  const completeCount = useMemo(() => items.filter(item => item.status === "Complete").length, [items]);

  async function updateItem(item, updates) {
    const updated = await base44.entities.RootedProtectionChecklistItem.update(item.id, {
      ...updates,
      last_updated_date: new Date().toISOString().slice(0, 10)
    });
    setItems(prev => prev.map(current => current.id === item.id ? updated : current));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl p-4 text-sm" style={{ background: BG, color: MUTED }}>
        <Loader2 size={16} className="animate-spin" /> Loading protection checklist…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4" style={{ background: "#FEF3EE", borderColor: "#F4C9B8", color: "#9A3412" }}>
        <div className="flex gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-bold leading-relaxed">
            Rooted 21 should never rely on one platform alone. Keep backups in Base44, GitHub, and a secure cloud folder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl p-4" style={{ background: BG, border: `1.5px solid ${CREAM}` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: MUTED }}>Total items</p>
          <p className="mt-1 text-2xl font-black" style={{ color: GREEN }}>{items.length}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: BG, border: `1.5px solid ${CREAM}` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: MUTED }}>Complete</p>
          <p className="mt-1 text-2xl font-black" style={{ color: GREEN }}>{completeCount}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: BG, border: `1.5px solid ${CREAM}` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: MUTED }}>Needs attention</p>
          <p className="mt-1 text-2xl font-black" style={{ color: GREEN }}>{items.length - completeCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="rounded-2xl border p-4" style={{ borderColor: CREAM, background: "#fff" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  {item.status === "Complete" && <CheckCircle2 size={17} color={GREEN} className="mt-0.5 flex-shrink-0" />}
                  <p className="font-bold leading-snug" style={{ color: DARK }}>{item.title}</p>
                </div>
                <p className="mt-1 text-[11px]" style={{ color: MUTED }}>
                  Last updated: {item.last_updated_date || "Not recorded"}
                </p>
              </div>
              <select
                value={item.status || "Not Started"}
                onChange={event => updateItem(item, { status: event.target.value })}
                className="rounded-xl border px-3 py-2 text-xs font-bold"
                style={{ ...statusStyles[item.status || "Not Started"], borderColor: CREAM }}
              >
                {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <input
                defaultValue={item.responsible_person || ""}
                onBlur={event => event.target.value !== (item.responsible_person || "") && updateItem(item, { responsible_person: event.target.value })}
                placeholder="Responsible person"
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: CREAM }}
              />
              <input
                defaultValue={item.storage_location || ""}
                onBlur={event => event.target.value !== (item.storage_location || "") && updateItem(item, { storage_location: event.target.value })}
                placeholder="Storage location"
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: CREAM }}
              />
              <input
                defaultValue={item.notes || ""}
                onBlur={event => event.target.value !== (item.notes || "") && updateItem(item, { notes: event.target.value })}
                placeholder="Notes"
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: CREAM }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
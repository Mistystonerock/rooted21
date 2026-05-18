import { AlertTriangle, Bell, CheckCircle2, Database, Map, Server, ShieldAlert } from "lucide-react";

const DARK = "#5a3d28";
const GREEN = "#6b9d6e";
const MUTED = "#8b6f54";
const CREAM = "#f5ede2";

function StatusPill({ children, tone = "good" }) {
  const styles = {
    good: { background: "#EAF4EA", color: "#2F7D32" },
    warn: { background: "#FFF4D8", color: "#8A5A00" },
    danger: { background: "#FDECEC", color: "#B42318" },
    neutral: { background: CREAM, color: DARK }
  }[tone];
  return <span className="rounded-full px-2 py-1 text-[10px] font-black" style={styles}>{children}</span>;
}

function MiniCard({ icon: Icon, label, value, detail, tone = "good" }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "#eadcc8" }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Icon size={18} color={tone === "danger" ? "#B42318" : tone === "warn" ? "#8A5A00" : GREEN} />
        <StatusPill tone={tone}>{tone === "danger" ? "Attention" : tone === "warn" ? "Review" : "Healthy"}</StatusPill>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
      <p className="mt-1 text-2xl font-black" style={{ color: DARK }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: MUTED }}>{detail}</p>
    </div>
  );
}

export default function EnterpriseOpsPanel({ stats, countyRows, resources, securityEvents, auditEvents, notifications }) {
  const outdatedResources = resources.filter(r => r.verification_status === "outdated" || r.verification_status === "needs_review");
  const failedLogins = securityEvents.filter(e => e.event_type === "failed_login");
  const criticalSecurity = securityEvents.filter(e => e.severity === "critical");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MiniCard icon={Server} label="Server status" value="Online" detail="Frontend and backend functions responding" />
        <MiniCard icon={Database} label="Database usage" value={stats.databaseRecords.toLocaleString()} detail="Tracked operational records" tone={stats.databaseRecords > 50000 ? "warn" : "good"} />
        <MiniCard icon={ShieldAlert} label="Security alerts" value={criticalSecurity.length} detail={`${failedLogins.length} failed login events`} tone={criticalSecurity.length ? "danger" : failedLogins.length ? "warn" : "good"} />
        <MiniCard icon={Bell} label="Notification reports" value={notifications.length} detail={`${notifications.filter(n => n.read).length} read in-app notifications`} tone="good" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: "#eadcc8" }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h3 className="font-serif text-lg font-black" style={{ color: DARK }}>Resource verification status</h3><p className="text-xs" style={{ color: MUTED }}>Statewide listings needing admin review</p></div>
            <StatusPill tone={outdatedResources.length ? "warn" : "good"}>{outdatedResources.length} need review</StatusPill>
          </div>
          <div className="space-y-2">
            {outdatedResources.slice(0, 6).map(resource => <div key={resource.id} className="flex items-center justify-between gap-3 rounded-2xl p-3" style={{ background: "#faf6f1" }}><div><p className="text-sm font-bold">{resource.name}</p><p className="text-xs" style={{ color: MUTED }}>{resource.county || "Statewide"} · {resource.category}</p></div><StatusPill tone="warn">{resource.verification_status}</StatusPill></div>)}
            {!outdatedResources.length && <p className="rounded-2xl p-4 text-sm" style={{ background: "#faf6f1", color: MUTED }}>All visible resources are currently verified or active.</p>}
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: "#eadcc8" }}>
          <div className="mb-4 flex items-center gap-2"><Map size={18} color={GREEN} /><div><h3 className="font-serif text-lg font-black" style={{ color: DARK }}>County usage heatmap</h3><p className="text-xs" style={{ color: MUTED }}>County presence based on users and resources</p></div></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {countyRows.slice(0, 12).map(row => <div key={row.county} className="rounded-2xl p-3" style={{ background: row.total > 5 ? "#EAF4EA" : "#faf6f1", border: `1px solid ${row.total > 5 ? "#b9d9bb" : "#eadcc8"}` }}><p className="text-xs font-black" style={{ color: DARK }}>{row.county}</p><p className="text-[10px]" style={{ color: MUTED }}>{row.total} signals</p></div>)}
            {!countyRows.length && <p className="col-span-full text-sm" style={{ color: MUTED }}>No county data has been captured yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: "#eadcc8" }}>
          <div className="mb-4 flex items-center gap-2"><AlertTriangle size={18} color="#B42318" /><h3 className="font-serif text-lg font-black" style={{ color: DARK }}>Security and failed-login monitoring</h3></div>
          <div className="space-y-2">{securityEvents.slice(0, 8).map(event => <div key={event.id} className="rounded-2xl p-3" style={{ background: event.severity === "critical" ? "#FDECEC" : "#faf6f1" }}><p className="text-sm font-bold">{event.event_type?.replaceAll("_", " ")}</p><p className="text-xs" style={{ color: MUTED }}>{event.user_email || "Unknown user"} · {event.created_date ? new Date(event.created_date).toLocaleString() : "—"}</p></div>)}</div>
        </div>

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: "#eadcc8" }}>
          <div className="mb-4 flex items-center gap-2"><CheckCircle2 size={18} color={GREEN} /><h3 className="font-serif text-lg font-black" style={{ color: DARK }}>Audit log viewer</h3></div>
          <div className="space-y-2">{auditEvents.slice(0, 8).map(event => <div key={event.id} className="rounded-2xl p-3" style={{ background: "#faf6f1" }}><p className="text-sm font-bold">{event.summary}</p><p className="text-xs" style={{ color: MUTED }}>{event.event_type} · {event.actor_email || "system"} · {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : "—"}</p></div>)}</div>
        </div>
      </div>
    </div>
  );
}
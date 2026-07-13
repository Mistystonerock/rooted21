import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, Database, Globe2, ShieldCheck, WifiOff } from 'lucide-react';

const CARD = 'rounded-2xl border border-rooted-cream bg-white p-4 shadow-sm';

export default function ScalabilityOperationsPanel() {
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [counties, setCounties] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (p, fallback = []) => p.catch(() => fallback);
    Promise.all([
      safe(base44.entities.SystemOperationalLog.list('-occurred_at', 100)),
      safe(base44.entities.ErrorReport.list('-reported_at', 100)),
      safe(base44.entities.IntegrationEndpoint.list('-updated_date', 100)),
      safe(base44.entities.StatewideCountyConfig.list('-updated_date', 100)),
      safe(base44.entities.OfflineDraft.list('-last_saved_at', 100)),
    ]).then(([logRows, errorRows, endpointRows, countyRows, draftRows]) => {
      setLogs(logRows);
      setErrors(errorRows);
      setEndpoints(endpointRows);
      setCounties(countyRows);
      setDrafts(draftRows);
      setLoading(false);
    });
  }, []);

  const metrics = useMemo(() => {
    const critical = errors.filter(error => ['high', 'critical'].includes(error.severity) && error.status !== 'resolved').length;
    const activeCounties = counties.filter(county => ['pilot', 'active'].includes(county.launch_status)).length;
    const approvedEndpoints = endpoints.filter(endpoint => endpoint.security_review_status === 'approved').length;
    const unsyncedDrafts = drafts.filter(draft => ['pending_sync', 'conflict'].includes(draft.sync_status)).length;
    return { critical, activeCounties, approvedEndpoints, unsyncedDrafts };
  }, [errors, counties, endpoints, drafts]);

  if (loading) {
    return <div className={CARD}>Loading statewide operations...</div>;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-rooted-dark-green">Scalability & Trust Operations</h2>
        <p className="text-sm text-muted-foreground">Production readiness for statewide growth, secure workflows, monitoring, and long-term adoption.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric icon={AlertTriangle} label="Open high-risk errors" value={metrics.critical} tone={metrics.critical ? 'critical' : 'safe'} />
        <Metric icon={Globe2} label="Pilot/active counties" value={metrics.activeCounties} tone="safe" />
        <Metric icon={ShieldCheck} label="Approved integrations" value={metrics.approvedEndpoints} tone="safe" />
        <Metric icon={WifiOff} label="Offline drafts pending" value={metrics.unsyncedDrafts} tone={metrics.unsyncedDrafts ? 'warning' : 'safe'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={CARD}>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-rooted-dark-green"><Activity className="h-4 w-4" /> Recent system logs</h3>
          <div className="space-y-2">
            {logs.slice(0, 6).map(log => <Row key={log.id} title={log.summary} meta={`${log.category} · ${log.severity}`} />)}
            {logs.length === 0 && <p className="text-sm text-muted-foreground">No operational logs yet.</p>}
          </div>
        </div>

        <div className={CARD}>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-rooted-dark-green"><Database className="h-4 w-4" /> Architecture readiness</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Secure API layer: backend functions + service-role audit boundaries.</p>
            <p>Scalable data model: county configs, integration registry, offline drafts, audit logs.</p>
            <p>Monitoring: client error reports, operational logs, scheduled health checks.</p>
            <p>Accessibility: global WCAG tap targets, focus states, reduced-motion support.</p>
            <p>Multilingual readiness: language preferences and resource translation fields.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const color = tone === 'critical' ? 'text-destructive' : tone === 'warning' ? 'text-rooted-brown' : 'text-rooted-dark-green';
  return (
    <div className={CARD}>
      <Icon className={`mb-2 h-5 w-5 ${color}`} />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ title, meta }) {
  return (
    <div className="rounded-xl bg-rooted-off-white p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const MUTED = '#8b6f54';

export default function AuditLogPanel() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.RootedAuditEvent.list('-occurred_at', 100).then(setEvents);
  }, []);

  return (
    <div className="space-y-2">
      {events.map(event => (
        <div key={event.id} className="rounded-2xl border p-3 text-sm" style={{ borderColor: '#d7c7aa', background: '#faf6f1' }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">{event.summary}</p>
            <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: event.severity === 'critical' ? '#FDECEC' : '#EAF4EA', color: event.severity === 'critical' ? '#B42318' : '#2F7D32' }}>{event.severity}</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: MUTED }}>{event.actor_email || 'System'} · {event.event_type} · {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : '—'}</p>
        </div>
      ))}
      {events.length === 0 && <p className="text-center text-sm" style={{ color: MUTED }}>No audit events yet.</p>}
    </div>
  );
}
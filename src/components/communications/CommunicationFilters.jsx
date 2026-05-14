import { Search } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export default function CommunicationFilters({ filters, setFilters, total }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Audit Trail</p>
        <p className="text-[10px] font-bold" style={{ color: C.mutedText }}>{total} records</p>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.mutedText} />
        <input
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search messages, notes, people, agencies..."
          className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm outline-none"
          style={{ borderColor: C.cream }}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="all">All types</option>
          <option value="coparent">Co-parent</option>
          <option value="agency_email">Agency emails</option>
          <option value="secure_message">Professional messages</option>
          <option value="meeting_note">Meeting notes</option>
        </select>
        <select className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.cream }} value={filters.range} onChange={e => setFilters({ ...filters, range: e.target.value })}>
          <option value="all">All dates</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>
  );
}
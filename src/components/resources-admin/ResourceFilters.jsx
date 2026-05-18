import { RESOURCE_CATEGORIES } from "./resourceAdminUtils";

export default function ResourceFilters({ filters, counties, onChange }) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search resources"
          className="rounded-xl border px-3 py-2 text-sm"
        />
        <select value={filters.county} onChange={e => onChange({ ...filters, county: e.target.value })} className="rounded-xl border px-3 py-2 text-sm">
          <option value="all">All counties</option>
          {counties.map(county => <option key={county} value={county}>{county}</option>)}
        </select>
        <select value={filters.category} onChange={e => onChange({ ...filters, category: e.target.value })} className="rounded-xl border px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {RESOURCE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className="rounded-xl border px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="needs_review">Needs review</option>
          <option value="outdated">Outdated</option>
          <option value="archived">Archived</option>
          <option value="crisis">Crisis priority</option>
        </select>
      </div>
    </div>
  );
}
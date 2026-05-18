export default function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm">
      <span>
        <span className="block text-sm font-bold text-stone-900">{label}</span>
        {description && <span className="mt-1 block text-xs leading-relaxed text-stone-600">{description}</span>}
      </span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 flex-shrink-0 accent-green-700"
      />
    </label>
  );
}
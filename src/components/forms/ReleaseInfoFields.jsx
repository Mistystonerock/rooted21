import { C } from "@/lib/rooted-constants";

export default function ReleaseInfoFields({ values, onChange }) {
  const update = (key, value) => onChange({ ...values, [key]: value });

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <p className="font-serif font-bold text-sm" style={{ color: C.darkGreen }}>Form details</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Parent / caregiver name" value={values.parentName} onChange={v => update("parentName", v)} />
        <Field label="Child name" value={values.childName} onChange={v => update("childName", v)} />
        <Field label="Agency / provider releasing info" value={values.releasingParty} onChange={v => update("releasingParty", v)} />
        <Field label="Recipient / authorized party" value={values.recipientParty} onChange={v => update("recipientParty", v)} />
        <Field label="Purpose" value={values.purpose} onChange={v => update("purpose", v)} placeholder="Court review, case planning, care coordination…" />
        <Field label="Expiration date" type="date" value={values.expirationDate} onChange={v => update("expirationDate", v)} />
      </div>
      <div>
        <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>Information authorized for release</label>
        <textarea
          value={values.authorizedInfo}
          onChange={e => update("authorizedInfo", e.target.value)}
          rows={3}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: C.cream }}
          placeholder="Case plan progress, attendance records, therapy summaries, school records, communication logs…"
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: C.cream }}
      />
    </div>
  );
}
import { Plus, Trash2 } from "lucide-react";
import { C } from "@/lib/rooted-constants";

export const GUIDED_SECTIONS = [
  { key: "contacts", title: "Emergency contacts", type: "list", fields: ["name", "phone", "relationship"] },
  { key: "trusted_adults", title: "Trusted adults", type: "list", fields: ["name", "phone", "safe_role"] },
  { key: "safe_locations", title: "Safe locations", type: "list", fields: ["name", "address", "notes"] },
  { key: "code_words", title: "Code words", type: "list", fields: ["word", "meaning", "who_knows"] },
  { key: "emergency_escape_plan", title: "Emergency escape plan", type: "text", prompt: "Where do you go first, what route do you use, and what should children do?" },
  { key: "transportation_backup", title: "Transportation backup", type: "text", prompt: "List backup rides, bus routes, rideshare options, and spare-key details." },
  { key: "medication_list", title: "Medication list", type: "list", fields: ["name", "dose", "instructions"] },
  { key: "important_documents", title: "Important documents checklist", type: "checklist", defaults: ["IDs / birth certificates", "Insurance cards", "Custody or court papers", "Medication list", "School records", "Bank cards / cash"] },
  { key: "child_pickup_plan", title: "Child pickup plan", type: "text", prompt: "Who can pick up children, from where, and what code word confirms safety?" },
  { key: "pet_safety_plan", title: "Pet safety plan", type: "text", prompt: "Where can pets go, who has supplies, and what vet records are needed?" },
  { key: "emergency_bag", title: "Emergency bag checklist", type: "checklist", defaults: ["Clothes", "Medications", "Chargers", "Documents", "Comfort items", "Cash", "Keys", "Snacks"] },
  { key: "shelter_plan", title: "Shelter plan", type: "text", prompt: "Preferred shelters, hotline numbers, safe arrival steps, and backup options." },
  { key: "after_hours_numbers", title: "After-hours crisis numbers", type: "list", fields: ["name", "phone", "when_to_call"] },
];

const uid = () => `item_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function SafetyPlanBuilder({ plan, setPlan }) {
  const update = (key, value) => setPlan(prev => ({ ...prev, [key]: value }));

  const addListItem = (section) => {
    const item = { id: uid() };
    section.fields.forEach(field => { item[field] = ""; });
    update(section.key, [...(plan[section.key] || []), item]);
  };

  const updateListItem = (key, id, field, value) => {
    update(key, (plan[key] || []).map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeListItem = (key, id) => update(key, (plan[key] || []).filter(item => item.id !== id));

  const toggleChecklist = (key, label) => {
    const existing = plan[key] || [];
    const found = existing.find(item => item.label === label);
    if (found) update(key, existing.map(item => item.label === label ? { ...item, checked: !item.checked } : item));
    else update(key, [...existing, { id: uid(), label, checked: true }]);
  };

  return (
    <div className="space-y-4">
      {GUIDED_SECTIONS.map(section => (
        <section key={section.key} className="rounded-2xl p-4 shadow-sm" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
          <h3 className="text-sm font-black" style={{ color: C.darkGreen }}>{section.title}</h3>

          {section.type === "text" && (
            <textarea
              value={plan[section.key] || ""}
              onChange={e => update(section.key, e.target.value)}
              placeholder={section.prompt}
              className="mt-3 min-h-24 w-full rounded-xl px-3 py-2.5 text-sm"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite, outline: "none", fontFamily: "inherit" }}
            />
          )}

          {section.type === "checklist" && (
            <div className="mt-3 grid gap-2">
              {section.defaults.map(label => {
                const checked = (plan[section.key] || []).some(item => item.label === label && item.checked);
                return (
                  <label key={label} className="flex items-center gap-3 rounded-xl p-3 text-sm font-bold" style={{ background: C.offWhite, color: C.darkGreen }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleChecklist(section.key, label)} />
                    {label}
                  </label>
                );
              })}
            </div>
          )}

          {section.type === "list" && (
            <div className="mt-3 space-y-3">
              {(plan[section.key] || []).map(item => (
                <div key={item.id} className="rounded-xl p-3" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
                  <div className="space-y-2">
                    {section.fields.map(field => (
                      <input
                        key={field}
                        value={item[field] || ""}
                        onChange={e => updateListItem(section.key, item.id, field, e.target.value)}
                        placeholder={field.replaceAll("_", " ")}
                        className="w-full rounded-lg px-3 py-2 text-xs"
                        style={{ border: `1px solid ${C.cream}`, outline: "none" }}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => removeListItem(section.key, item.id)} className="mt-2 text-xs font-bold" style={{ color: C.warmText, background: "none", border: "none" }}>
                    <Trash2 size={12} className="mr-1" /> Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addListItem(section)} className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-black" style={{ background: `${C.midGreen}18`, color: C.darkGreen, border: `1px solid ${C.midGreen}40` }}>
                <Plus size={14} /> Add {section.title.toLowerCase()}
              </button>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
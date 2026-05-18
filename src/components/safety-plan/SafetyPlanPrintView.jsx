import { GUIDED_SECTIONS } from "@/components/safety-plan/SafetyPlanBuilder";

export default function SafetyPlanPrintView({ plan }) {
  const renderValue = (section) => {
    const value = plan[section.key];
    if (section.type === "text") return value ? <p className="whitespace-pre-wrap text-sm">{value}</p> : null;
    if (section.type === "checklist") return (value || []).filter(i => i.checked).map(i => <li key={i.label}>{i.label}</li>);
    return (value || []).map((item, index) => (
      <div key={item.id || index} className="mb-2 rounded border border-gray-300 p-2 text-sm">
        {Object.entries(item).filter(([key, val]) => key !== "id" && val).map(([key, val]) => (
          <p key={key}><strong>{key.replaceAll("_", " ")}:</strong> {val}</p>
        ))}
      </div>
    ));
  };

  return (
    <div className="bg-white p-8 text-black">
      <h1 className="text-3xl font-bold">Safety Plan: {plan.child_name || "Family"}</h1>
      <p className="mt-1 text-sm text-gray-600">Updated {new Date().toLocaleDateString()}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <p><strong>Child / Family:</strong> {plan.child_name}</p>
        <p><strong>Caregiver:</strong> {plan.parent_name}</p>
      </div>
      {GUIDED_SECTIONS.map(section => {
        const content = renderValue(section);
        const empty = !content || (Array.isArray(content) && content.length === 0);
        if (empty) return null;
        return (
          <section key={section.key} className="mt-6 break-inside-avoid">
            <h2 className="mb-2 border-b border-gray-300 pb-1 text-lg font-bold">{section.title}</h2>
            {section.type === "checklist" ? <ul className="list-disc pl-5 text-sm">{content}</ul> : content}
          </section>
        );
      })}
    </div>
  );
}
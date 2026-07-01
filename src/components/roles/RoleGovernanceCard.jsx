import { Brain, Eye, FileText, Lock, Shield } from "lucide-react";
import { C } from "@/lib/rooted-constants";

const ROWS = [
  ["Purpose", "purpose", Shield],
  ["Dashboard Access", "dashboardAccess", Eye],
  ["Permissions", "permissions", Lock],
  ["AI Permissions", "aiPermissions", Brain],
  ["Data Visibility Rules", "dataVisibilityRules", Eye],
  ["Document Access Rules", "documentAccessRules", FileText],
  ["Future Features", "futureFeatures", Shield],
];

function Value({ value }) {
  if (Array.isArray(value)) {
    return <ul className="mt-2 grid list-disc gap-1 pl-5 text-xs leading-6" style={{ color: "#3a3028" }}>{value.map(item => <li key={item}>{item}</li>)}</ul>;
  }
  return <p className="mt-1 text-xs leading-6" style={{ color: "#3a3028" }}>{value}</p>;
}

export default function RoleGovernanceCard({ role }) {
  return (
    <article className="overflow-hidden rounded-2xl" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <div className="p-4" style={{ background: `${C.midGreen}12`, borderBottom: `1px solid ${C.cream}` }}>
        <p className="font-serif text-lg font-bold" style={{ color: C.darkGreen }}>{role.role}</p>
        <p className="mt-1 text-xs font-bold" style={{ color: C.brown }}>{role.securityLevel}</p>
      </div>
      <div className="divide-y" style={{ borderColor: C.cream }}>
        {ROWS.map(([label, key, Icon]) => (
          <div key={key} className="flex gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <Icon size={15} color={C.midGreen} />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: C.midGreen }}>{label}</p>
              <Value value={role[key]} />
            </div>
          </div>
        ))}
        {role.detailSections?.map(section => (
          <div key={section.title} className="p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: C.midGreen }}>{section.title}</p>
            <ul className="mt-2 grid gap-1 pl-5 text-xs leading-6" style={{ color: "#3a3028", listStyleType: "disc" }}>
              {section.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
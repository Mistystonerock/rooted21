export const RESOURCE_CATEGORIES = [
  ["housing", "Housing"],
  ["food", "Food assistance"],
  ["mental_health", "Mental health"],
  ["recovery", "Recovery"],
  ["domestic_violence", "Domestic violence"],
  ["legal_aid", "Legal aid"],
  ["parenting", "Parenting programs"],
  ["childcare", "Child care"],
  ["education", "Education support"],
  ["transportation", "Transportation"],
  ["utilities", "Utility assistance"],
  ["shelter", "Emergency shelters"],
  ["medicaid", "Medicaid"],
  ["snap_wic", "SNAP/WIC"],
  ["ohiokan", "OhioKAN"],
  ["ohiorise", "OhioRISE"],
  ["fcfc", "FCFC"],
  ["casa", "CASA"],
  ["other", "Other"]
];

export const STATUS_LABELS = {
  verified: "Verified",
  needs_review: "Needs review",
  outdated: "Outdated",
  closed: "Closed",
  emergency_only: "Emergency only",
  archived: "Archived"
};

export function daysSinceVerified(resource) {
  const date = resource.verified_at || resource.updated_date || resource.created_date;
  if (!date) return 9999;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return 9999;
  return Math.floor((Date.now() - time) / 86400000);
}

export function isVerifiedRecently(resource) {
  return resource.verification_status === "verified" && daysSinceVerified(resource) < 60;
}

export function emptyResource(adminEmail = "", adminPermissions = null) {
  return {
    name: "",
    category: "housing",
    county: adminPermissions?.assigned_counties?.[0] || "",
    state: "OH",
    crisis_priority: false,
    phone: "",
    website: "",
    address: "",
    description_en: "",
    description_es: "",
    description_so: "",
    eligibility_notes: "",
    source_url: "",
    admin_notes: "",
    verification_status: "needs_review",
    organization_id: adminPermissions?.organization_id || "",
    organization_name: adminPermissions?.organization_name || "",
    verified_by: adminEmail
  };
}
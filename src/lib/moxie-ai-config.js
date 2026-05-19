export const MOXIE_MODES = {
  parenting_support: {
    label: "Parenting Support",
    shortLabel: "Parenting",
    description: "Behavior, routines, repair, and caregiver calm.",
  },
  court_form_guidance: {
    label: "Court/Form Guidance",
    shortLabel: "Court",
    description: "Legal information, forms, documents, and hearing prep.",
  },
  crisis_sos: {
    label: "Crisis/SOS",
    shortLabel: "SOS",
    description: "Immediate safety, grounding, and crisis resources.",
  },
  resource_finder: {
    label: "Resource Finder",
    shortLabel: "Resources",
    description: "Verified Rooted 21, government, nonprofit, and legal aid resources.",
  },
  school_iep_support: {
    label: "School/IEP Support",
    shortLabel: "School",
    description: "IEP/504 prep, school communication, and behavior documentation.",
  },
  founder_admin: {
    label: "Founder/Admin",
    shortLabel: "Admin",
    description: "Platform operations, resource verification, feedback, and admin tasks.",
    restricted: true,
  },
};

export const MOXIE_MODE_ORDER = [
  "parenting_support",
  "court_form_guidance",
  "crisis_sos",
  "resource_finder",
  "school_iep_support",
  "founder_admin",
];

export function inferMoxieMode(pathname = "") {
  if (["/sos", "/emergency-toolbox", "/family-safety-crisis-plan", "/safe-screen"].some(path => pathname.startsWith(path))) return "crisis_sos";
  if (["/legal", "/court", "/case-plan", "/documents", "/form-helper", "/protective-order", "/rights-card"].some(path => pathname.startsWith(path))) return "court_form_guidance";
  if (["/resources", "/housing", "/local", "/community-resources", "/resource-matcher"].some(path => pathname.startsWith(path))) return "resource_finder";
  if (["/education", "/school", "/iep", "/child-profile"].some(path => pathname.startsWith(path))) return "school_iep_support";
  if (["/founder", "/resource-management", "/app-docs"].some(path => pathname.startsWith(path))) return "founder_admin";
  return "parenting_support";
}

export function visibleMoxieModes(user) {
  const canAdmin = ["admin", "founder"].includes(user?.role);
  return MOXIE_MODE_ORDER.filter(mode => !MOXIE_MODES[mode].restricted || canAdmin);
}
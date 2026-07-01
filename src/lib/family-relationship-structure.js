export const FAMILY_RELATIONSHIP_STRUCTURE = {
  title: "Shared Family Record",
  description: "One family record can connect multiple children, parents, caregivers, professionals, court contacts, and school contacts while keeping separate permission rules for each relationship.",
  exampleFamily: "Smith Family",
  exampleMembers: ["Mom", "Dad", "Child A", "Child B", "CPS Worker", "Therapist", "CASA", "School Counselor"],
  connectedEntities: [
    "FamilyRecord stores the shared family identity and member email groups.",
    "ChildProfile records can point back to the same FamilyRecord.",
    "FamilyRelationship stores each person, child, professional, court contact, school contact, or caregiver linked to the family.",
    "Each FamilyRelationship has its own permission level, data categories, document categories, and access status."
  ],
  permissionModel: [
    "Parents can own or co-manage family-owned records.",
    "Children are connected to the family record but do not receive automatic account access.",
    "Therapists and counselors are professional collaborators with read + limited upload access only after family approval.",
    "Professionals can be read-only, professional read + limited upload, document-limited, court-limited, school-limited, or revoked.",
    "Court and school contacts see only the categories approved for their relationship.",
    "Caregivers can be connected without receiving unrestricted professional or admin access.",
    "The Family remains the primary record; users connect through role-based FamilyRelationship permissions rather than owning isolated records."
  ]
};
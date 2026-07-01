import { base44 } from "@/api/base44Client";

function familyNameFor(user) {
  const first = user?.full_name?.split(" ")?.[0] || "My";
  return `${first} Family`;
}

export async function getOrCreatePrimaryFamily(user) {
  const existing = await base44.entities.FamilyRecord.filter({ primary_parent_email: user.email }, "-created_date", 1);
  if (existing.length > 0) return existing[0];

  return base44.entities.FamilyRecord.create({
    family_uid: `family_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    family_name: familyNameFor(user),
    primary_parent_email: user.email,
    parent_emails: [user.email],
    member_emails: [user.email],
    member_user_ids: [user.id],
    family_model: "family_hub",
    status: "active",
  });
}

export async function createFamilyLinkedChild(data, user) {
  const family = await getOrCreatePrimaryFamily(user);
  const child = await base44.entities.ChildProfile.create({
    ...data,
    owner_email: user.email,
    family_record_id: family.id,
    family_name: family.family_name,
    family_member_emails: family.member_emails?.length ? family.member_emails : [user.email],
    parent_emails: family.parent_emails?.length ? family.parent_emails : [user.email],
  });

  await linkChildToFamily(child, family, user);
  return child;
}

export async function linkChildToFamily(child, family, user) {
  const childIds = Array.from(new Set([...(family.child_profile_ids || []), child.id]));
  await base44.entities.FamilyRecord.update(family.id, { child_profile_ids: childIds });

  const existingRelationship = await base44.entities.FamilyRelationship.filter({ family_record_id: family.id, child_profile_id: child.id }, "-created_date", 1);
  if (existingRelationship.length === 0) {
    await base44.entities.FamilyRelationship.create({
      family_record_id: family.id,
      family_name: family.family_name,
      person_type: "child",
      display_name: [child.first_name, child.last_name].filter(Boolean).join(" "),
      child_profile_id: child.id,
      relationship_label: "child",
      permission_level: "owner",
      allowed_data_categories: ["child_profiles", "behavior_logs", "goals", "education", "safety"],
      access_status: "active",
      approved_by_email: user.email,
      created_by_email: user.email,
      visible_to_emails: family.member_emails?.length ? family.member_emails : [user.email],
      notes: "Child linked through Family Hub model",
    });
  }

  if (!child.family_record_id) {
    return base44.entities.ChildProfile.update(child.id, {
      family_record_id: family.id,
      family_name: family.family_name,
      family_member_emails: family.member_emails?.length ? family.member_emails : [user.email],
      parent_emails: family.parent_emails?.length ? family.parent_emails : [user.email],
    });
  }

  return child;
}

export async function ensureFamilyLinkedChild(child, user) {
  const family = child.family_record_id
    ? await base44.entities.FamilyRecord.get(child.family_record_id)
    : await getOrCreatePrimaryFamily(user);
  return linkChildToFamily(child, family, user);
}
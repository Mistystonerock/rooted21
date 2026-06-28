export const SELECTED_CHILD_KEY = "rooted21_selected_child_id";

export function getChildDisplayName(child) {
  if (!child) return "Child";
  return [child.first_name, child.last_name].filter(Boolean).join(" ") || child.child_name || "Child";
}

export function getChildAvatar(child) {
  return child?.photo_url || child?.photo_emoji || "🧒";
}

export function selectInitialChild(children = []) {
  if (!children.length) return null;
  const savedId = localStorage.getItem(SELECTED_CHILD_KEY);
  return children.find(child => child.id === savedId || child.child_uid === savedId) || children[0];
}

export function rememberSelectedChild(child) {
  if (child?.id) localStorage.setItem(SELECTED_CHILD_KEY, child.id);
}

export function filterRecordsForChild(records = [], child) {
  if (!child) return records;
  return records.filter(record => {
    if (!record.child_id && !record.child_profile_id && !record.child_name) return true;
    return record.child_id === child.id || record.child_id === child.child_uid || record.child_profile_id === child.id || record.child_profile_id === child.child_uid || record.child_name === child.first_name || record.child_name === getChildDisplayName(child);
  });
}

export function withChildLink(data, child) {
  if (!child) return data;
  return {
    ...data,
    child_id: child.id,
    child_name: getChildDisplayName(child),
  };
}
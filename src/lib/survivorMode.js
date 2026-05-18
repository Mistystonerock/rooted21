export const SURVIVOR_MODE_KEYS = {
  hideDvSection: "rooted_hide_dv_section",
  notificationsPausedUntil: "rooted_sensitive_notifications_paused_until",
  fakeScreenType: "rooted_fake_screen_type",
  survivorMode: "rooted_survivor_mode"
};

export function getFakeScreenPath(type = "weather") {
  return `/quick-exit-safe?mode=${encodeURIComponent(type)}`;
}

export function activateQuickExit(type = localStorage.getItem(SURVIVOR_MODE_KEYS.fakeScreenType) || "weather") {
  const pausedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  sessionStorage.setItem(SURVIVOR_MODE_KEYS.notificationsPausedUntil, pausedUntil);
  localStorage.setItem(SURVIVOR_MODE_KEYS.notificationsPausedUntil, pausedUntil);
  localStorage.setItem(SURVIVOR_MODE_KEYS.hideDvSection, "true");
  localStorage.setItem(SURVIVOR_MODE_KEYS.fakeScreenType, type);
  document.body.dataset.quickExit = "true";
  window.location.replace(getFakeScreenPath(type));
}
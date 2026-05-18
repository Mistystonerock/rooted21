const QUICK_EXIT_KEY = "rooted21_quick_exit_target";
const HIDE_DV_KEY = "rooted21_hide_dv_section";
const PAUSE_UNTIL_KEY = "rooted21_sensitive_notifications_paused_until";
const PIN_KEY = "rooted21_survivor_pin";
const HIDDEN_PREVIEWS_KEY = "rooted21_hidden_notification_previews";
const PRIVATE_MODE_KEY = "rooted21_private_mode_enabled";
const SESSION_TIMEOUT_KEY = "rooted21_secure_session_timeout_minutes";

export const quickExitTargets = {
  weather: "/safe-screen?type=weather",
  notes: "/safe-screen?type=notes",
  article: "/safe-screen?type=article",
};

export function getQuickExitTarget() {
  return localStorage.getItem(QUICK_EXIT_KEY) || "weather";
}

export function setQuickExitTarget(value) {
  localStorage.setItem(QUICK_EXIT_KEY, value);
}

export function isDvSectionHidden() {
  return localStorage.getItem(HIDE_DV_KEY) === "true";
}

export function setDvSectionHidden(value) {
  localStorage.setItem(HIDE_DV_KEY, value ? "true" : "false");
  window.dispatchEvent(new Event("rooted21-survivor-settings-changed"));
}

export function getSurvivorPin() {
  return localStorage.getItem(PIN_KEY) || "";
}

export function setSurvivorPin(pin) {
  if (pin) localStorage.setItem(PIN_KEY, pin);
  else localStorage.removeItem(PIN_KEY);
}

export function pauseSensitiveNotifications(hours = 24) {
  const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  localStorage.setItem(PAUSE_UNTIL_KEY, until);
  return until;
}

export function areSensitiveNotificationsPaused() {
  const until = localStorage.getItem(PAUSE_UNTIL_KEY);
  return !!until && new Date(until).getTime() > Date.now();
}

export function setHiddenNotificationPreviews(value) {
  localStorage.setItem(HIDDEN_PREVIEWS_KEY, value ? "true" : "false");
  window.dispatchEvent(new Event("rooted21-survivor-settings-changed"));
}

export function areNotificationPreviewsHidden() {
  return localStorage.getItem(HIDDEN_PREVIEWS_KEY) !== "false";
}

export function enablePrivateMode(value) {
  localStorage.setItem(PRIVATE_MODE_KEY, value ? "true" : "false");
  document.documentElement.classList.toggle("rooted-private-mode", value !== false);
  window.dispatchEvent(new Event("rooted21-survivor-settings-changed"));
}

export function isPrivateModeEnabled() {
  return localStorage.getItem(PRIVATE_MODE_KEY) !== "false";
}

export function setSecureSessionTimeoutMinutes(minutes) {
  localStorage.setItem(SESSION_TIMEOUT_KEY, String(minutes || 10));
  window.dispatchEvent(new Event("rooted21-session-timeout-changed"));
}

export function getSecureSessionTimeoutMinutes() {
  return Number(localStorage.getItem(SESSION_TIMEOUT_KEY) || 10);
}

export function activateQuickExit() {
  sessionStorage.clear();
  sessionStorage.setItem("rooted21_survivor_exit", "true");
  pauseSensitiveNotifications(24);

  const cover = document.createElement("div");
  cover.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#faf6f1;color:#1a1a1a;display:flex;align-items:center;justify-content:center;font:700 16px system-ui,sans-serif;";
  cover.textContent = "Loading...";
  document.body.replaceChildren(cover);

  const target = quickExitTargets[getQuickExitTarget()] || quickExitTargets.weather;
  window.location.replace(target);
}
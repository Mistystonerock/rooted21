const QUICK_EXIT_KEY = "rooted21_quick_exit_target";
const HIDE_DV_KEY = "rooted21_hide_dv_section";
const PAUSE_UNTIL_KEY = "rooted21_sensitive_notifications_paused_until";
const PIN_KEY = "rooted21_survivor_pin";

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
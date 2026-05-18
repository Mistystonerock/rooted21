import { base44 } from "@/api/base44Client";

function safeString(value, max = 1800) {
  if (!value) return "";
  return String(value).slice(0, max);
}

export async function logClientEvent({ message, severity = "info", source = "frontend", route, componentStack, metadata } = {}) {
  const payload = {
    message: safeString(message || "Client event"),
    severity,
    source,
    route: route || window.location.pathname,
    component_stack: safeString(componentStack),
    user_agent: safeString(navigator.userAgent, 500),
    metadata_json: metadata ? safeString(JSON.stringify(metadata), 1800) : ""
  };

  try {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      const user = await base44.auth.me();
      payload.user_email = user?.email || "";
    }
    await base44.entities.ClientErrorLog.create(payload);
  } catch {
    console.warn("Client monitoring unavailable", payload.message);
  }
}

export function trackPerformanceMetric(name, value, metadata = {}) {
  if (!name || value == null) return;
  logClientEvent({
    message: `Performance metric: ${name}`,
    severity: "info",
    source: "performance",
    metadata: { metric: name, value, ...metadata }
  });
}

export function initializePerformanceMonitoring() {
  if (typeof window === "undefined" || !window.performance) return;
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")?.[0];
      if (!nav) return;
      trackPerformanceMetric("page_load_ms", Math.round(nav.loadEventEnd), {
        dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd),
        transfer_size: nav.transferSize || 0
      });
    }, 0);
  }, { once: true });
}
import { base44 } from "@/api/base44Client";
import { logClientEvent } from "@/lib/monitoring";

export async function invokeSecureFunction(functionName, payload = {}, options = {}) {
  const authenticated = await base44.auth.isAuthenticated();
  if (!authenticated && options.requireAuth !== false) {
    await base44.auth.redirectToLogin(window.location.href);
    return null;
  }

  const started = performance.now();
  const response = await base44.functions.invoke(functionName, payload);
  const duration = Math.round(performance.now() - started);

  if (duration > 2500) {
    logClientEvent({
      message: `Slow function call: ${functionName}`,
      severity: "warning",
      source: "api_performance",
      metadata: { functionName, duration }
    });
  }

  return response;
}

export function sanitizePublicText(value, maxLength = 2000) {
  return String(value || "").replace(/[<>]/g, "").slice(0, maxLength).trim();
}
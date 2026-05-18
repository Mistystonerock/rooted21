import { base44 } from "@/api/base44Client";
import { logClientEvent } from "@/lib/monitoring";

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = error?.response?.status || error?.status;
  return !status || RETRYABLE_STATUSES.has(status);
}

async function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Request timed out. Please try again.")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function retryAsync(action, options = {}) {
  const retries = options.retries ?? 2;
  const baseDelay = options.baseDelay ?? 450;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !isRetryableError(error) || navigator.onLine === false) break;
      await wait(baseDelay * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

export async function invokeSecureFunction(functionName, payload = {}, options = {}) {
  const authenticated = await base44.auth.isAuthenticated();
  if (!authenticated && options.requireAuth !== false) {
    await base44.auth.redirectToLogin(window.location.href);
    return null;
  }

  const started = performance.now();
  const response = await retryAsync(
    () => withTimeout(base44.functions.invoke(functionName, payload), options.timeoutMs ?? 20000),
    { retries: options.retries ?? 2, baseDelay: options.baseDelay ?? 450 }
  );
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
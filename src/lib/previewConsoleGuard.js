const PREVIEW_ONLY_PARAMS = ["hide_badge", "base44_badge", "badge"];
const PREVIEW_HOST_MARKERS = ["preview--", "base44.app"];

function isPreviewHost() {
  return PREVIEW_HOST_MARKERS.every(marker => window.location.hostname.includes(marker));
}

function isPreviewSandboxRequest(target) {
  return isPreviewHost() && typeof target === "string" && target.includes("hide_badge=true");
}

export function installPreviewConsoleGuard() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  let cleaned = false;
  PREVIEW_ONLY_PARAMS.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      cleaned = true;
    }
  });

  if (cleaned) {
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const target = typeof input === "string" ? input : input?.url;
    if (isPreviewSandboxRequest(target)) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return originalFetch(input, init);
  };

  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    const message = args.map(String).join(" ");
    if (isPreviewHost() && message.includes("Datadog Browser SDK") && message.includes("No storage available")) return;
    originalWarn(...args);
  };

  const originalFbq = window.fbq;
  window.fbq = (...args) => {
    if (isPreviewHost()) return;
    if (args[0] === "track" && args[1] === "Page View") {
      return originalFbq?.("track", "PageView", ...args.slice(2));
    }
    return originalFbq?.(...args);
  };
}
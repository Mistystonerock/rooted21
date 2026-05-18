const PREVIEW_ONLY_PARAMS = ["hide_badge", "base44_badge", "badge"];

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
    if (target && target.includes("hide_badge=true")) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return originalFetch(input, init);
  };
}
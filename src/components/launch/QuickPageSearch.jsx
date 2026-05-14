import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

const ITEMS = [
  { id: "top", label: "Top of page", keywords: "home rooted 21 sign in launch opening countdown" },
  { id: "founders-note", label: "Founder’s note", keywords: "founder story misty mission why rooted 21" },
  { id: "donations", label: "Donations", keywords: "donate support monthly giving nonprofit funds money" },
  { id: "app-tour", label: "App tour", keywords: "features inside app tour tools preview" },
  { id: "what-we-help", label: "What we help with", keywords: "court cps behavior trauma case plans co parenting medical meds" },
  { id: "waitlist", label: "Join waitlist / beta code", keywords: "save spot email beta access code notify signup" },
  { id: "footer-actions", label: "Sign in / access links", keywords: "sign in redeem access code admin feedback legal disclaimers" },
];

const GREEN = "#6b9d6e";
const CREAM = "#f5ede2";
const TEXT = "#5a3d28";
const MUTED = "#8b6f54";

export default function QuickPageSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter(item => `${item.label} ${item.keywords}`.toLowerCase().includes(q));
  }, [query]);

  function jumpTo(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search this page"
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(18px + env(safe-area-inset-bottom))",
          zIndex: 30,
          width: 54,
          height: 54,
          borderRadius: 18,
          border: `1.5px solid ${CREAM}`,
          background: GREEN,
          color: "#fff",
          boxShadow: "0 10px 28px rgba(90,61,40,0.22)",
          cursor: "pointer",
        }}
      >
        <Search size={22} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(90,61,40,0.35)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 520, margin: "0 auto", background: "#fff", borderRadius: "22px 22px 0 0", padding: 18, boxShadow: "0 -12px 40px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <div>
                <p style={{ fontFamily: "var(--font-serif)", fontWeight: 800, color: TEXT, fontSize: 18 }}>Search this page</p>
                <p style={{ color: MUTED, fontSize: 12 }}>Jump straight to what you need.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close search" style={{ border: "none", background: CREAM, color: TEXT, borderRadius: 12, width: 44, height: 44, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search donations, beta code, court, app tour..."
              style={{ width: "100%", border: `1.5px solid ${CREAM}`, borderRadius: 14, padding: "13px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />

            <div style={{ display: "grid", gap: 8, marginTop: 12, maxHeight: 280, overflowY: "auto" }}>
              {results.length ? results.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpTo(item.id)}
                  style={{ width: "100%", justifyContent: "flex-start", textAlign: "left", border: `1px solid ${CREAM}`, background: "#faf6f1", color: TEXT, borderRadius: 14, padding: "12px 14px", fontWeight: 700, cursor: "pointer" }}
                >
                  {item.label}
                </button>
              )) : (
                <p style={{ color: MUTED, textAlign: "center", fontSize: 13, padding: 14 }}>No matching section found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
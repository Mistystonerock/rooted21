import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";

const RED = "#B42318";
const RED_BG = "#FEF3F2";
const RED_BORDER = "#FDA29B";

export default function LogoutButton({ variant = "icon", className = "", style = {} }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const clearLocalData = async () => {
    queryClientInstance.clear();
    localStorage.clear();
    sessionStorage.clear();
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    await clearLocalData();
    await base44.auth.logout();
    base44.auth.redirectToLogin();
  };

  const isLarge = variant === "large";
  const isMenu = variant === "menu";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Log out"
        className={className}
        style={{
          background: isLarge || isMenu ? RED : RED_BG,
          color: isLarge || isMenu ? "#ffffff" : RED,
          border: `1.5px solid ${isLarge || isMenu ? RED : RED_BORDER}`,
          borderRadius: isLarge ? 14 : 12,
          padding: isLarge ? "14px 18px" : isMenu ? "10px 8px" : 0,
          width: isLarge ? "100%" : isMenu ? "100%" : 44,
          height: isLarge ? "auto" : isMenu ? "auto" : 44,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontWeight: 800,
          fontSize: isLarge ? 15 : isMenu ? 10 : 0,
          cursor: "pointer",
          boxShadow: isLarge ? "0 8px 20px rgba(180,35,24,0.18)" : "0 4px 14px rgba(180,35,24,0.18)",
          ...style,
        }}
      >
        <LogOut size={isLarge ? 18 : 20} />
        {(isLarge || isMenu) && <span>Log Out</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl" style={{ border: `1.5px solid ${RED_BORDER}` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl p-3" style={{ background: RED_BG }}>
                  <LogOut size={22} color={RED} />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold" style={{ color: "#5a3d28" }}>Log out?</h2>
                  <p className="mt-1 text-sm" style={{ color: "#8b6f54" }}>Are you sure you want to log out?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cancel logout"
                className="rounded-xl"
                style={{ width: 38, height: 38, background: "#F5EDE2", border: "none", color: "#5a3d28" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl py-3 text-sm font-bold"
                style={{ background: "#F5EDE2", color: "#5a3d28", border: "1px solid #d7c7aa" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="rounded-xl py-3 text-sm font-bold"
                style={{ background: RED, color: "#ffffff", border: "none", opacity: loggingOut ? 0.7 : 1 }}
              >
                {loggingOut ? "Logging out…" : "Yes Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
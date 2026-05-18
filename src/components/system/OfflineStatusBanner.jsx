import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[70] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <div className="mx-auto flex max-w-xl items-center justify-center gap-2 text-center">
        <WifiOff className="h-4 w-4 shrink-0" />
        You’re offline. Drafts will stay on this device until your connection returns.
      </div>
    </div>
  );
}
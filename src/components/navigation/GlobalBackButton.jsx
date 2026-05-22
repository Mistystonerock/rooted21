import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const HIDDEN_PATHS = new Set([
  "/",
  "/home",
  "/dashboard",
  "/coming-soon",
  "/welcome",
  "/welcome-to-rooted21",
]);

export default function GlobalBackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_PATHS.has(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="fixed left-3 z-50 rounded-full px-3 py-2 text-xs font-black shadow-lg md:left-5"
      style={{
        top: "calc(env(safe-area-inset-top) + 1rem)",
        background: "#ffffff",
        color: "#0f1f14",
        border: "2px solid #f5ede2",
      }}
    >
      <ArrowLeft size={16} className="mr-1" /> Back
    </button>
  );
}
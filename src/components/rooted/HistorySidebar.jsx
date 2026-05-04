import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { X, Clock, ChevronRight, Trash2 } from "lucide-react";

export default function HistorySidebar({ open, onClose, onRestore }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchSessions();
  }, [open]);

  async function fetchSessions() {
    setLoading(true);
    const data = await base44.entities.CrisisSession.list("-created_date", 50);
    setSessions(data);
    setLoading(false);
  }

  async function deleteSession(e, id) {
    e.stopPropagation();
    await base44.entities.CrisisSession.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: "min(340px, 92vw)",
          background: C.offWhite,
          transform: open ? "translateX(0)" : "translateX(100%)",
          boxShadow: open ? "-4px 0 32px rgba(47,75,58,.18)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: C.darkGreen }}
        >
          <div className="flex items-center gap-2">
            <Clock size={18} color={C.lightGreen} />
            <span className="font-serif font-bold text-base" style={{ color: C.cream }}>
              Past Sessions
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
            style={{ background: "#ffffff18", border: "none" }}
          >
            <X size={18} color={C.cream} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {loading && (
            <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>
              Loading…
            </p>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-sm" style={{ color: C.mutedText }}>
                No saved sessions yet.
              </p>
              <p className="text-xs mt-1" style={{ color: C.mutedText }}>
                Your crisis support sessions will appear here.
              </p>
            </div>
          )}

          {!loading &&
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => { onRestore(s); onClose(); }}
                className="w-full text-left rounded-xl p-3.5 mb-2 flex items-start gap-3 transition-all hover:shadow-md group"
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.cream}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-bold truncate mb-0.5"
                    style={{ color: C.darkGreen }}
                  >
                    {s.label || "Crisis Session"}
                  </p>
                  <p
                    className="text-[11px] leading-snug line-clamp-2"
                    style={{ color: C.mutedText }}
                  >
                    {s.prompt}
                  </p>
                  <p className="text-[10px] mt-1.5" style={{ color: C.lightGreen }}>
                    {formatDate(s.created_date)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="p-1 rounded-md transition-colors hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={13} color="#B84C2A" />
                  </button>
                  <ChevronRight size={14} color={C.midGreen} />
                </div>
              </button>
            ))}
        </div>

        <div className="px-4 py-3 text-center" style={{ borderTop: `1px solid ${C.cream}` }}>
          <p className="text-[11px]" style={{ color: C.mutedText }}>
            Sessions saved privately to your account
          </p>
        </div>
      </div>
    </>
  );
}
import ReactMarkdown from "react-markdown";
import { C } from "@/lib/rooted-constants";
import { Bookmark, BookmarkCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

function StatPill({ label, value, color }) {
  return (
    <div className="rounded-xl px-3 py-2 text-center flex-1" style={{ background: color || "#f5f0e8" }}>
      <p className="text-base font-extrabold" style={{ color: C.darkGreen }}>{value ?? "—"}</p>
      <p className="text-[10px]" style={{ color: C.mutedText }}>{label}</p>
    </div>
  );
}

function TrendIcon({ value, baseline = 3 }) {
  if (value == null) return null;
  if (value >= baseline + 0.3) return <TrendingUp size={14} color="#22a15a" />;
  if (value <= baseline - 0.3) return <TrendingDown size={14} color="#c05225" />;
  return <Minus size={14} color={C.mutedText} />;
}

export default function InsightCard({ insight, onBookmarkToggle }) {
  const [bookmarked, setBookmarked] = useState(insight.is_bookmarked || false);

  async function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    await base44.entities.GrowthInsight.update(insight.id, { is_bookmarked: next });
    onBookmarkToggle && onBookmarkToggle(insight.id, next);
  }

  const s = insight.stats || {};
  const weekLabel = insight.week_start
    ? `${new Date(insight.week_start + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(insight.week_end + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${C.cream}` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: C.darkGreen }}>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>
            {insight.child_name ? `${insight.child_name}'s Growth Insight` : "Weekly Growth Insight"}
          </p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>{weekLabel}</p>
        </div>
        <button
          onClick={toggleBookmark}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Bookmark"
        >
          {bookmarked
            ? <BookmarkCheck size={18} color={C.gold} />
            : <Bookmark size={18} color={C.lightGreen} />}
        </button>
      </div>

      {/* Stats row */}
      {(s.avg_child_regulation || s.avg_parent_calm || s.behavior_log_count != null) && (
        <div className="flex gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.cream}` }}>
          {s.avg_child_regulation != null && (
            <StatPill label="Child Reg." value={`${s.avg_child_regulation}/5`} color="#EAF4EA" />
          )}
          {s.avg_parent_calm != null && (
            <StatPill label="Parent Calm" value={`${s.avg_parent_calm}/5`} color="#FEF9EC" />
          )}
          {s.behavior_log_count != null && (
            <StatPill label="Incidents" value={s.behavior_log_count} color="#f5f0e8" />
          )}
          {s.journal_entries != null && (
            <StatPill label="Journal Days" value={s.journal_entries} color="#f0eefa" />
          )}
        </div>
      )}

      {/* Triggers */}
      {s.top_triggers?.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5" style={{ borderBottom: `1px solid ${C.cream}` }}>
          <p className="text-[10px] font-bold w-full" style={{ color: C.mutedText }}>TOP TRIGGERS</p>
          {s.top_triggers.map((t, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "#FEF3EE", color: "#B84C2A" }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Insight text */}
      <div className="px-4 py-4">
        <ReactMarkdown
          className="text-xs leading-relaxed prose prose-sm max-w-none"
          components={{
            h2: ({ children }) => (
              <h2 className="text-sm font-bold mt-4 mb-1.5 first:mt-0" style={{ color: C.darkGreen }}>{children}</h2>
            ),
            p: ({ children }) => (
              <p className="mb-2 text-xs leading-relaxed" style={{ color: "#3a3028" }}>{children}</p>
            ),
            li: ({ children }) => (
              <li className="mb-1 text-xs" style={{ color: "#3a3028" }}>{children}</li>
            ),
            strong: ({ children }) => (
              <strong style={{ color: C.darkGreen }}>{children}</strong>
            ),
          }}
        >
          {insight.insight_text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
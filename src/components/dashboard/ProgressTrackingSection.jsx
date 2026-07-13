import { Link } from "react-router-dom";
import { Award, CheckCircle2, ChevronRight, Trophy } from "lucide-react";

const BG = "#faf6f1";
const CARD = "#ffffff";
const BORDER = "rgba(120,85,60,0.2)";
const GOLD = "#a67c52";
const GREEN = "#6b9d6e";
const TEXT = "#1a1a1a";
const MUTED = "#8b6f54";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ProgressTrackingSection({ milestones, completedTasks }) {
  const milestoneCount = milestones.length;
  const taskCount = completedTasks.length;
  const hasContent = milestoneCount > 0 || taskCount > 0;

  return (
    <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: 18, boxShadow: "0 8px 24px rgba(61,40,23,0.08)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} color={GOLD} />
        <p className="font-serif font-bold" style={{ fontSize: 16, color: TEXT }}>Your Progress</p>
      </div>

      {!hasContent ? (
        <div className="text-center py-4">
          <p style={{ fontSize: 13, color: MUTED }}>No milestones or completed tasks yet.</p>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Complete lessons, check-ins, and case tasks to earn badges.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Milestones */}
          {milestoneCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: GOLD, textTransform: "uppercase" }}>
                  <Award size={12} style={{ display: "inline", marginRight: 4 }} />
                  Milestones Earned · {milestoneCount}
                </p>
                <Link to="/milestones" style={{ fontSize: 11, fontWeight: 700, color: GREEN, textDecoration: "none" }}>
                  View all →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {milestones.slice(0, 6).map(m => (
                  <div key={m.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}>
                    <span style={{ fontSize: 18 }}>{m.badge_emoji || "🏅"}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{m.badge_name}</p>
                      {m.milestone_level && <p style={{ fontSize: 10, color: MUTED }}>Tier {m.milestone_level}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Case Tasks */}
          {taskCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: GREEN, textTransform: "uppercase" }}>
                  <CheckCircle2 size={12} style={{ display: "inline", marginRight: 4 }} />
                  Completed Case Tasks · {taskCount}
                </p>
                <Link to="/case-management" style={{ fontSize: 11, fontWeight: 700, color: GREEN, textDecoration: "none" }}>
                  View all →
                </Link>
              </div>
              <div className="space-y-1.5">
                {completedTasks.slice(0, 4).map(t => (
                  <Link key={t.id} to={`/case-detail/${t.case_id}`} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, textDecoration: "none" }}>
                    <CheckCircle2 size={14} color={GREEN} style={{ flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</p>
                      <p style={{ fontSize: 10, color: MUTED }}>{t.case_name || "Case task"}{t.completed_date ? ` · ${formatDate(t.completed_date)}` : ""}</p>
                    </div>
                    <ChevronRight size={14} color={MUTED} style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
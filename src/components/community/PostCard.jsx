import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import { TOPICS } from "@/pages/PeerSupport";
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";

export default function PostCard({ post, currentUser, onLike, onCommentAdded }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadedComments, setLoadedComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [posting, setPosting] = useState(false);

  const topic = TOPICS[post.topic] || TOPICS.general;
  const timeAgo = (() => {
    const diff = Date.now() - new Date(post.created_date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  async function toggleComments() {
    if (!showComments && !loadedComments) {
      const data = await base44.entities.CommunityComment.filter({ post_id: post.id }, "created_date", 100);
      setComments(data);
      setLoadedComments(true);
    }
    setShowComments(v => !v);
  }

  async function handleComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    const created = await base44.entities.CommunityComment.create({
      post_id: post.id,
      author_email: currentUser.email,
      author_name: isAnon ? "Anonymous Parent" : currentUser.full_name,
      body: newComment.trim(),
      is_anonymous: isAnon,
    });
    setComments(prev => [...prev, created]);
    setNewComment("");
    setPosting(false);
    onCommentAdded(post.id);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
      {post.is_pinned && (
        <div className="px-4 py-1.5 text-[10px] font-bold" style={{ background: C.darkGreen, color: C.gold }}>
          📌 Pinned Post
        </div>
      )}
      <div className="p-4">
        {/* Topic badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: topic.color + "18", color: topic.color }}>
            {topic.emoji} {topic.label}
          </span>
          <span className="text-[10px]" style={{ color: C.mutedText }}>{timeAgo}</span>
        </div>

        <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>{post.title}</p>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#3a3028" }}>{post.body}</p>

        <p className="text-[10px] font-bold mb-3" style={{ color: C.mutedText }}>
          — {post.author_name || "Anonymous Parent"}
          {post.zip_code ? ` · ${post.zip_code}` : ""}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={() => onLike(post)}
            className="flex items-center gap-1.5 text-xs font-bold"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText }}>
            <Heart size={14} color={post.likes > 0 ? "#E07A5F" : C.mutedText}
              fill={post.likes > 0 ? "#E07A5F" : "none"} />
            {post.likes || 0}
          </button>
          <button onClick={toggleComments}
            className="flex items-center gap-1.5 text-xs font-bold"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mutedText }}>
            <MessageCircle size={14} />
            {post.comment_count || 0} {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-3 space-y-2 pt-3" style={{ borderTop: `1px solid ${C.cream}` }}>
            {comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: C.cream, color: C.darkGreen }}>
                  {(c.author_name || "A")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold" style={{ color: C.darkGreen }}>{c.author_name}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#3a3028" }}>{c.body}</p>
                </div>
              </div>
            ))}

            {/* Add comment */}
            <div className="flex gap-2 mt-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Reply with kindness..."
                className="flex-1 px-3 py-2 rounded-xl text-xs border outline-none"
                style={{ borderColor: C.cream, background: C.offWhite }}
              />
              <button onClick={handleComment} disabled={posting || !newComment.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: newComment.trim() ? C.darkGreen : C.cream, border: "none", cursor: "pointer" }}>
                <Send size={14} color={newComment.trim() ? "#fff" : C.mutedText} />
              </button>
            </div>
            <label className="flex items-center gap-1.5 text-[10px]" style={{ color: C.mutedText }}>
              <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} />
              Reply anonymously
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
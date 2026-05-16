import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { C } from "@/lib/rooted-constants";
import MobileHeader from "@/components/mobile/MobileHeader";
import PostCard from "@/components/community/PostCard";
import NewPostForm from "@/components/community/NewPostForm";
import PeerMatchPanel from "@/components/community/PeerMatchPanel";
import PeerConnectionModule from "@/components/community/PeerConnectionModule";
import { Plus, Users, Sparkles, Flame, MessageCircle, HeartHandshake } from "lucide-react";

const DAILY_PROMPTS = [
  "What's one thing your child did this week that surprised you in a good way? 💚",
  "What regulation strategy are you leaning on most right now? Share it — someone else needs it.",
  "What's something you wish your caseworker understood about your child?",
  "Drop one win from this week, no matter how small. We're celebrating all of them. 🎉",
  "What did you try this week that didn't work? (Sharing what fails helps others too.)",
  "If you could tell a brand-new foster parent one thing, what would it be?",
  "What's a resource, book, or technique that actually helped your family?",
];

function getDailyPrompt() {
  const day = new Date().getDay();
  return DAILY_PROMPTS[day % DAILY_PROMPTS.length];
}

export const TOPICS = {
  trauma_parenting: { label: "Trauma Parenting", emoji: "🧠", color: C.midGreen },
  foster_care: { label: "Foster Care", emoji: "🏠", color: "#4A90D9" },
  adoption: { label: "Adoption", emoji: "❤️", color: "#E07A5F" },
  kinship: { label: "Kinship Care", emoji: "👨‍👩‍👧", color: "#7B5EA7" },
  court_system: { label: "Court & Legal", emoji: "⚖️", color: C.brown },
  school_iep: { label: "School & IEP", emoji: "🏫", color: "#5B8C5A" },
  mental_health: { label: "Mental Health", emoji: "💙", color: "#4A90D9" },
  self_care: { label: "Caregiver Self-Care", emoji: "🌿", color: C.midGreen },
  wins: { label: "Wins & Celebrations", emoji: "🎉", color: C.gold },
  general: { label: "General", emoji: "💬", color: C.mutedText },
};

export default function PeerSupport() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTopic, setActiveTopic] = useState("all");
  const [activeTab, setActiveTab] = useState("feed"); // feed | match | connections
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [streak, setStreak] = useState(0);

  const dailyPrompt = getDailyPrompt();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadPosts();
      // Calculate streak from localStorage
      const lastVisit = localStorage.getItem("peer_last_visit");
      const streakCount = parseInt(localStorage.getItem("peer_streak") || "0");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastVisit === today) {
        setStreak(streakCount);
      } else if (lastVisit === yesterday) {
        const newStreak = streakCount + 1;
        localStorage.setItem("peer_streak", newStreak);
        localStorage.setItem("peer_last_visit", today);
        setStreak(newStreak);
      } else {
        localStorage.setItem("peer_streak", 1);
        localStorage.setItem("peer_last_visit", today);
        setStreak(1);
      }
    });
  }, []);

  async function loadPosts() {
    const data = await base44.entities.CommunityPost.list("-created_date", 100);
    setPosts(data);
    setLoading(false);
  }

  async function handleNewPost(postData) {
    const created = await base44.entities.CommunityPost.create({
      ...postData,
      author_email: user.email,
      author_name: postData.is_anonymous ? "Anonymous Parent" : user.full_name,
    });
    setPosts(prev => [created, ...prev]);
    setShowNewPost(false);
  }

  async function handleLike(post) {
    const updated = await base44.entities.CommunityPost.update(post.id, { likes: (post.likes || 0) + 1 });
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
  }

  const filtered = activeTopic === "all"
    ? posts
    : posts.filter(p => p.topic === activeTopic);

  const pinnedPosts = filtered.filter(p => p.is_pinned);
  const regularPosts = filtered.filter(p => !p.is_pinned);

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <MobileHeader title="Parent Community" subtitle="You are not alone" backTo="/dashboard" />

      <div className="max-w-[540px] mx-auto">

        {/* Tabs */}
        <div className="flex border-b px-4 pt-3" style={{ background: C.white, borderColor: C.cream }}>
          {[
            { id: "feed", label: "Community Feed", icon: <Users size={14} /> },
            { id: "match", label: "Find a Peer", icon: <Sparkles size={14} /> },
            { id: "connections", label: "Peer Connections", icon: <HeartHandshake size={14} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 pb-2.5 px-4 text-xs font-bold border-b-2 transition-all"
              style={{
                color: activeTab === tab.id ? C.darkGreen : C.mutedText,
                borderBottomColor: activeTab === tab.id ? C.darkGreen : "transparent",
                background: "none", cursor: "pointer",
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "feed" && (
          <div className="px-4 py-4 space-y-4">

            {/* Streak badge */}
            {streak > 0 && (
              <div className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "rgba(201,151,58,0.12)", border: "1px solid rgba(201,151,58,0.3)" }}>
                <div className="flex items-center gap-2">
                  <Flame size={16} color={C.gold} />
                  <p className="text-xs font-bold" style={{ color: C.gold }}>{streak}-day community streak</p>
                </div>
                <p className="text-[10px]" style={{ color: C.mutedText }}>Keep showing up 💚</p>
              </div>
            )}

            {/* Daily Prompt */}
            {!promptDismissed && (
              <div className="rounded-xl p-4" style={{ background: C.darkGreen, border: `1px solid ${C.gold}30` }}>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: C.gold }}>💬 TODAY'S COMMUNITY PROMPT</p>
                <p className="text-sm leading-relaxed" style={{ color: C.cream }}>{dailyPrompt}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setPromptDismissed(true); setShowNewPost(true); }}
                    className="flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                    style={{ background: C.gold, color: C.darkGreen, border: "none", cursor: "pointer" }}
                  >
                    <MessageCircle size={13} /> Respond
                  </button>
                  <button
                    onClick={() => setPromptDismissed(true)}
                    className="px-3 py-2.5 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.1)", color: C.lightGreen, border: "none", cursor: "pointer" }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* New post button */}
            {!showNewPost && (
              <button onClick={() => setShowNewPost(true)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: C.darkGreen, color: "#fff", border: "none", cursor: "pointer" }}>
                <Plus size={16} /> Share with the Community
              </button>
            )}

            {showNewPost && (
              <NewPostForm
                onSubmit={handleNewPost}
                onCancel={() => setShowNewPost(false)}
              />
            )}

            {/* Topic filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setActiveTopic("all")}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: activeTopic === "all" ? C.darkGreen : C.cream,
                  color: activeTopic === "all" ? "#fff" : C.darkGreen,
                  border: "none", cursor: "pointer",
                }}>
                All
              </button>
              {Object.entries(TOPICS).map(([key, t]) => (
                <button key={key} onClick={() => setActiveTopic(key)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: activeTopic === key ? C.darkGreen : C.cream,
                    color: activeTopic === key ? "#fff" : C.darkGreen,
                    border: "none", cursor: "pointer",
                  }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent` }} />
              </div>
            )}

            {/* Posts */}
            {[...pinnedPosts, ...regularPosts].map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onCommentAdded={(postId) => {
                  setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
                  ));
                }}
              />
            ))}

            {!loading && filtered.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: C.mutedText }}>
                No posts in this topic yet. Be the first to share! 💬
              </p>
            )}
          </div>
        )}

        {activeTab === "match" && user && (
          <PeerMatchPanel user={user} />
        )}

        {activeTab === "connections" && user && (
          <PeerConnectionModule user={user} />
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}